export type MessageTemplate = "profissional" | "curto" | "instagram";

export const MESSAGE_TEMPLATES: Record<MessageTemplate, string> = {
  profissional: "Olá, {empresa}! Tudo bem? Sou da Lions Corporation e encontrei o trabalho de vocês na categoria {categoria}, em {cidade}. Notei uma oportunidade de fortalecer a presença digital da empresa. Posso compartilhar uma ideia rápida, sem compromisso?",
  curto: "Olá, {empresa}! Vi o trabalho de vocês em {cidade} e tenho uma ideia para melhorar a presença digital da empresa. Posso te contar?",
  instagram: "Oi, {empresa}! Encontrei o perfil de vocês pesquisando {categoria} em {cidade}. Tenho uma sugestão rápida para ajudar a empresa a atrair mais clientes online. Posso enviar?",
};

export function personalizeMessage(template: string, data: { company: string; category: string; city: string }): string {
  return template
    .replaceAll("{empresa}", data.company)
    .replaceAll("{categoria}", data.category)
    .replaceAll("{cidade}", data.city);
}

