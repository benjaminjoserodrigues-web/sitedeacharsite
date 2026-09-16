export const CATEGORY_MAP: Record<string, string[]> = {
  barbearia: [
    `["shop"="hairdresser"]["hairdresser"="barber"]`,
    `["shop"="hairdresser"]["name"~"barbearia|barber",i]`,
  ],
  "pet shop": [`["shop"="pet"]`],
  restaurante: [`["amenity"="restaurant"]`],
  hamburgueria: [
    `["amenity"~"restaurant|fast_food"]["cuisine"~"burger",i]`,
    `["amenity"~"restaurant|fast_food"]["name"~"hamburg|burger",i]`,
  ],
  cafeteria: [`["amenity"="cafe"]`],
  academia: [`["leisure"="fitness_centre"]`],
  oficina: [`["shop"="car_repair"]`],
  "salão de beleza": [`["shop"="beauty"]`, `["shop"="hairdresser"]["hairdresser"!="barber"]`],
  pizzaria: [
    `["amenity"~"restaurant|fast_food"]["cuisine"~"pizza",i]`,
    `["amenity"~"restaurant|fast_food"]["name"~"pizz",i]`,
  ],
};

export const INITIAL_CATEGORIES = Object.keys(CATEGORY_MAP);

const escapeOverpass = (value: string) => value.replace(/["\\]/g, "");

export function categoryToFilters(category: string): string[] {
  const normalized = category.trim().toLocaleLowerCase("pt-BR");
  const mapped = CATEGORY_MAP[normalized];
  if (mapped) return mapped;
  const safe = escapeOverpass(normalized);
  return [`["name"~"${safe}",i]`];
}
