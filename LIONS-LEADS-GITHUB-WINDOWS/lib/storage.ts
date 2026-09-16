import type { Lead, LeadStatus, Settings } from "./types";

export const STORAGE_KEYS = {
  leads: "lions-leads:leads",
  results: "lions-leads:last-results",
  settings: "lions-leads:settings",
} as const;

export const DEFAULT_SETTINGS: Settings = {
  companyName: "Lions Corporation",
  defaultMessage: "Olá, {empresa}! Tenho uma ideia para fortalecer a presença digital de vocês em {cidade}. Podemos conversar?",
  defaultQuantity: 30,
  customCategories: [],
  theme: "light",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage?.getItem(key) ?? window.sessionStorage?.getItem(key);
    const cookie = document.cookie.split("; ").find((item) => item.startsWith(`${encodeURIComponent(key)}=`))?.split("=").slice(1).join("=");
    const raw = stored ?? (cookie ? decodeURIComponent(cookie) : null);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  const raw = JSON.stringify(value);
  try { if (window.localStorage) { window.localStorage.setItem(key, raw); return; } } catch { /* storage unavailable */ }
  try { if (window.sessionStorage) { window.sessionStorage.setItem(key, raw); return; } } catch { /* storage unavailable */ }
  document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(raw)};path=/;max-age=2592000;SameSite=Lax`;
}

export function getStoredLeads(): Lead[] { return read(STORAGE_KEYS.leads, []); }
export function getLastResults(): Lead[] { return read(STORAGE_KEYS.results, []); }
export function getSettings(): Settings { return { ...DEFAULT_SETTINGS, ...read(STORAGE_KEYS.settings, {}) }; }
export function saveLastResults(leads: Lead[]) { write(STORAGE_KEYS.results, leads); }
export function saveSettings(settings: Settings) { write(STORAGE_KEYS.settings, settings); }

export function leadKey(lead: Pick<Lead, "osmId" | "osmType" | "name" | "address">): string {
  if (lead.osmId) return `${lead.osmType}/${lead.osmId}`;
  return `${lead.name}|${lead.address}`.toLocaleLowerCase("pt-BR");
}

export function saveLead(lead: Lead): Lead[] {
  const leads = getStoredLeads();
  const key = leadKey(lead);
  const now = new Date().toISOString();
  const index = leads.findIndex((item) => leadKey(item) === key);
  const next = { ...lead, key, updatedAt: now, savedAt: lead.savedAt ?? now };
  if (index >= 0) leads[index] = { ...leads[index], ...next, history: leads[index].history };
  else leads.unshift({ ...next, history: [{ id: crypto.randomUUID(), at: now, action: "Lead salvo" }] });
  write(STORAGE_KEYS.leads, leads);
  return leads;
}

export function updateLeadStatus(key: string, status: LeadStatus): Lead[] {
  const now = new Date().toISOString();
  const leads = getStoredLeads().map((lead) => lead.key === key ? {
    ...lead,
    status,
    updatedAt: now,
    history: [{ id: crypto.randomUUID(), at: now, action: `Status alterado para ${status}` }, ...lead.history],
  } : lead);
  write(STORAGE_KEYS.leads, leads);
  return leads;
}
