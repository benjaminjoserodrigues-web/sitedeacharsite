export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizeBrazilPhone(value: string): string | null {
  let digits = onlyDigits(value);
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return validNationalNumber(digits.slice(2)) ? digits : null;
  }
  if (digits.startsWith("0")) {
    if (digits.length === 11 || digits.length === 12) digits = digits.slice(1);
    else if (digits.length === 13 || digits.length === 14) digits = digits.slice(3);
  }
  return validNationalNumber(digits) ? `55${digits}` : null;
}

function validNationalNumber(value: string): boolean {
  return /^(?:[1-9]{2})(?:[2-9]\d{7}|9\d{8})$/.test(value);
}

function phoneCandidates(value: string): string[] {
  return value
    .replace(/(?:tel|phone|whatsapp):/gi, "")
    .split(/\s*(?:;|\||,|\s\/\s)\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatBrazilPhone(value: string): string | null {
  const normalized = normalizeBrazilPhone(value);
  if (normalized) {
    const number = normalized.slice(2);
    const area = number.slice(0, 2);
    const local = number.slice(2);
    return local.length === 9
      ? `+55 (${area}) ${local.slice(0, 5)}-${local.slice(5)}`
      : `+55 (${area}) ${local.slice(0, 4)}-${local.slice(4)}`;
  }
  const digits = onlyDigits(value);
  return /^0800\d{7}$/.test(digits) ? `0800 ${digits.slice(4, 7)} ${digits.slice(7)}` : null;
}

export function extractBrazilPhone(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (!value) continue;
    for (const candidate of phoneCandidates(value)) {
      const formatted = formatBrazilPhone(candidate);
      if (formatted) return formatted;
    }
  }
  return "";
}

export function whatsappUrl(phone: string, message: string): string | null {
  const normalized = normalizeBrazilPhone(phone);
  return normalized ? `https://wa.me/${normalized}?text=${encodeURIComponent(message)}` : null;
}
