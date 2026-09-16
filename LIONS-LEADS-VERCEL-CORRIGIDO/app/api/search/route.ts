import { buildOverpassQuery, parseOverpass, type LocationBounds } from "@/lib/overpass";

export const runtime = "edge";

const cache = new Map<string, { expires: number; value: unknown }>();
const locationCache = new Map<string, { expires: number; bounds: LocationBounds; label: string }>();
const ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
const NOMINATIM_URL = process.env.NOMINATIM_URL || "https://nominatim.openstreetmap.org";

const STATE_NAMES: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará",
  DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso",
  MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
  PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina",
  SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();

interface NominatimResult {
  display_name: string;
  boundingbox: [string, string, string, string];
  address?: Record<string, string>;
}

async function resolveLocation(city: string, state: string, referer: string) {
  const cacheKey = `${normalize(city)}|${normalize(state)}`;
  const cached = locationCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached;

  const stateName = STATE_NAMES[state.toUpperCase()] ?? state;
  const params = new URLSearchParams({
    q: `${city}, ${stateName}, Brasil`,
    format: "jsonv2",
    addressdetails: "1",
    countrycodes: "br",
    limit: "5",
    "accept-language": "pt-BR",
  });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(`${NOMINATIM_URL}/search?${params}`, {
      headers: { "User-Agent": "LionsLeads/1.1", Referer: referer },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Nominatim ${response.status}`);
    const candidates = await response.json() as NominatimResult[];
    const expectedState = normalize(stateName);
    const match = candidates.find((candidate) => {
      const candidateState = normalize(candidate.address?.state ?? "");
      const isoState = candidate.address?.["ISO3166-2-lvl4"]?.split("-").pop()?.toUpperCase();
      return candidateState === expectedState || isoState === state.toUpperCase();
    });
    if (!match) throw new Error("LOCATION_NOT_FOUND");
    const [south, north, west, east] = match.boundingbox.map(Number);
    if (![south, north, west, east].every(Number.isFinite) || south >= north || west >= east) throw new Error("LOCATION_NOT_FOUND");
    const resolved = { bounds: { south, west, north, east }, label: match.display_name, expires: Date.now() + 24 * 60 * 60 * 1000 };
    locationCache.set(cacheKey, resolved);
    return resolved;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { city?: string; state?: string; category?: string; quantity?: number };
    const city = body.city?.trim() ?? "";
    const state = body.state?.trim() ?? "";
    const category = body.category?.trim() ?? "";
    const quantity = Math.max(1, Math.min(Number(body.quantity) || 30, 100));
    if (!city || !state || !category) return Response.json({ error: "Preencha cidade, estado e categoria." }, { status: 400 });
    const key = `${city}|${state}|${category}|${quantity}`.toLocaleLowerCase("pt-BR");
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return Response.json({ ...(hit.value as object), meta: { ...((hit.value as { meta: object }).meta), cached: true } });
    const origin = request.headers.get("origin");
    const referer = origin?.startsWith("http") ? origin : "https://lions-leads.vercel.app";
    const location = await resolveLocation(city, state, referer);
    const query = buildOverpassQuery(location.bounds, category, quantity);
    let data: { elements?: unknown[] } | null = null;
    let lastError: unknown;
    for (const endpoint of ENDPOINTS) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 28000);
      try {
        const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8", "User-Agent": "LionsLeads/1.0" }, body: new URLSearchParams({ data: query }), signal: controller.signal });
        if (!response.ok) throw new Error(`Overpass ${response.status}`);
        data = await response.json() as { elements?: unknown[] };
        break;
      } catch (error) { lastError = error; } finally { clearTimeout(timer); }
    }
    if (!data) throw lastError ?? new Error("Serviço indisponível");
    const results = parseOverpass((data.elements ?? []) as never[], { city, state, category, quantity });
    const value = { results, meta: { total: results.length, withWebsite: results.filter((lead) => lead.website).length, withoutWebsite: results.filter((lead) => !lead.website).length, cached: false, location: location.label, attribution: "© OpenStreetMap contributors" } };
    cache.set(key, { expires: Date.now() + 15 * 60 * 1000, value });
    return Response.json(value);
  } catch (error) {
    const timeout = error instanceof Error && error.name === "AbortError";
    const locationNotFound = error instanceof Error && error.message === "LOCATION_NOT_FOUND";
    return Response.json({ error: locationNotFound ? "Cidade e estado não encontrados. Confira os dados e tente novamente." : timeout ? "A consulta demorou mais que o esperado. Tente novamente." : "Não foi possível consultar o OpenStreetMap agora. Tente novamente em instantes." }, { status: locationNotFound ? 404 : 502 });
  }
}
