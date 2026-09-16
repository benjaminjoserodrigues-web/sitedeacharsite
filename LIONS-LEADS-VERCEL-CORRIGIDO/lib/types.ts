export type LeadStatus =
  | "Novo"
  | "Mensagem preparada"
  | "Contatado"
  | "Respondeu"
  | "Interessado"
  | "Demo enviada"
  | "Cliente"
  | "Descartado";

export type ScoreLevel = "forte" | "médio" | "fraco";

export interface ScoreReason {
  label: string;
  points: number;
}

export interface Lead {
  key: string;
  osmId: string;
  osmType: "node" | "way" | "relation";
  name: string;
  category: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  email: string;
  openingHours: string;
  website: string;
  latitude: number;
  longitude: number;
  score: number;
  scoreLevel: ScoreLevel;
  scoreReasons: ScoreReason[];
  status: LeadStatus;
  savedAt?: string;
  updatedAt?: string;
  history: HistoryEntry[];
}

export interface HistoryEntry {
  id: string;
  at: string;
  action: string;
}

export interface SearchResponse {
  results: Lead[];
  meta: {
    total: number;
    withWebsite: number;
    withoutWebsite: number;
    cached: boolean;
    location?: string;
    attribution: string;
  };
}

export interface Settings {
  companyName: string;
  defaultMessage: string;
  defaultQuantity: number;
  customCategories: string[];
  theme: "light" | "dark";
}

export const LEAD_STATUSES: LeadStatus[] = [
  "Novo",
  "Mensagem preparada",
  "Contatado",
  "Respondeu",
  "Interessado",
  "Demo enviada",
  "Cliente",
  "Descartado",
];
