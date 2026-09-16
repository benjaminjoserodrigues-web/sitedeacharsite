import { categoryToFilters } from "./categories";
import { calculateLeadScore } from "./leadScore";
import { extractBrazilPhone } from "./phone";
import type { Lead } from "./types";

interface OverpassElement {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const tag = (tags: Record<string, string>, ...keys: string[]) => keys.map((key) => tags[key]).find(Boolean) ?? "";

export interface LocationBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export function buildOverpassQuery(bounds: LocationBounds, category: string, quantity: number): string {
  const filters = categoryToFilters(category);
  const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
  const searches = filters.flatMap((filter) => ["node", "way", "relation"].map((type) => `${type}${filter}(${bbox});`)).join("\n");
  return `[out:json][timeout:24];\n(${searches}\n);\nout center tags ${Math.min(quantity * 5, 400)};`;
}

function address(tags: Record<string, string>): string {
  const street = tag(tags, "addr:street");
  const number = tag(tags, "addr:housenumber");
  const district = tag(tags, "addr:suburb", "addr:neighbourhood");
  return [street && [street, number].filter(Boolean).join(", "), district].filter(Boolean).join(" — ");
}

export function parseOverpass(elements: OverpassElement[], input: { city: string; state: string; category: string; quantity: number }): Lead[] {
  const seen = new Set<string>();
  const businesses = new Set<string>();
  return elements.flatMap((element): Lead[] => {
    const tags = element.tags ?? {};
    const name = tag(tags, "name", "brand", "operator");
    if (!name) return [];
    const osmId = String(element.id);
    const key = `${element.type}/${osmId}`;
    if (seen.has(key)) return [];
    seen.add(key);
    const latitude = element.lat ?? element.center?.lat ?? 0;
    const longitude = element.lon ?? element.center?.lon ?? 0;
    const businessKey = `${name.toLocaleLowerCase("pt-BR")}|${latitude.toFixed(4)}|${longitude.toFixed(4)}`;
    if (businesses.has(businessKey)) return [];
    businesses.add(businessKey);
    const website = tag(tags, "website", "contact:website");
    const phone = extractBrazilPhone(tags["phone"], tags["contact:phone"], tags["mobile"], tags["contact:mobile"], tags["phone:mobile"]);
    const whatsapp = extractBrazilPhone(tags["contact:whatsapp"], tags["whatsapp"]);
    const leadBase = {
      website,
      phone,
      whatsapp,
      instagram: tag(tags, "contact:instagram", "instagram"),
      facebook: tag(tags, "contact:facebook", "facebook"),
      email: tag(tags, "email", "contact:email"),
      address: address(tags),
      openingHours: tag(tags, "opening_hours"),
    };
    const scored = calculateLeadScore(leadBase);
    return [{
      key,
      osmId,
      osmType: element.type,
      name,
      category: input.category,
      city: input.city,
      state: input.state,
      ...leadBase,
      latitude,
      longitude,
      score: scored.score,
      scoreLevel: scored.level,
      scoreReasons: scored.reasons,
      status: "Novo",
      history: [],
    }];
  }).sort((a, b) => b.score - a.score).slice(0, input.quantity);
}
