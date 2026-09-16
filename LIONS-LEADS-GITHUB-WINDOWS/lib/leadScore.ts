import type { Lead, ScoreLevel, ScoreReason } from "./types";

type ScoreInput = Pick<Lead, "website" | "phone" | "whatsapp" | "instagram" | "facebook" | "email" | "address" | "openingHours">;

export function getScoreLevel(score: number): ScoreLevel {
  if (score >= 80) return "forte";
  if (score >= 50) return "médio";
  return "fraco";
}

export function calculateLeadScore(lead: ScoreInput): { score: number; level: ScoreLevel; reasons: ScoreReason[] } {
  const reasons: ScoreReason[] = [];
  const add = (condition: boolean, label: string, points: number) => condition && reasons.push({ label, points });
  add(!lead.website, "Site não encontrado nos dados consultados", 40);
  add(Boolean(lead.phone), "Telefone disponível", 12);
  add(Boolean(lead.whatsapp), "WhatsApp disponível", 14);
  add(Boolean(lead.instagram), "Instagram disponível", 8);
  add(Boolean(lead.facebook), "Facebook disponível", 5);
  add(Boolean(lead.email), "E-mail disponível", 8);
  add(Boolean(lead.address), "Endereço disponível", 7);
  add(Boolean(lead.openingHours), "Horário disponível", 6);
  const score = Math.min(100, reasons.reduce((sum, reason) => sum + reason.points, 0));
  return { score, level: getScoreLevel(score), reasons };
}

