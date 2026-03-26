import type { Car } from "@/types/catalog";
import rawCars from "@/data/cars.json";

/** Дефолтные изображения по типу кузова (стоковые фото), если в данных нет car.image */
export const DEFAULT_CAR_IMAGES: Record<string, string> = {
  Седан: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80",
  Кроссовер: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80",
  Внедорожник: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80",
  Пикап: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80",
  Хэтчбек: "https://images.unsplash.com/photo-1551830820-330a71b99659?w=600&q=80",
};

export function getCarImageUrl(car: Car): string {
  if (car.image) return car.image;
  return DEFAULT_CAR_IMAGES[car.bodyType] ?? DEFAULT_CAR_IMAGES["Седан"];
}

/** Автомобили российского производства не показываем — только импорт из-за рубежа */
const RUSSIAN_BRANDS = ["Lada", "Лада", "Москвич", "УАЗ", "UAZ", "ГАЗ", "ВАЗ"];
function isImportOnly(car: Car): boolean {
  if (car.country === "Россия" || car.country === "РФ") return false;
  if (RUSSIAN_BRANDS.some((b) => car.brand.toLowerCase().includes(b.toLowerCase()))) return false;
  return true;
}

const cars = (rawCars as Car[]).filter(isImportOnly);

export function getCars(): Car[] {
  return cars;
}

export function getCarBySlug(slug: string): Car | undefined {
  return cars.find((c) => c.slug === slug);
}

export function getCarsFiltered(params: {
  brand?: string;
  bodyType?: string;
  country?: string;
  budgetMin?: number;
  budgetMax?: number;
  savingsMin?: number;
  savingsMax?: number;
  query?: string;
}): Car[] {
  let result = [...cars]; // уже без РФ-производства
  if (params.brand) result = result.filter((c) => c.brand === params.brand);
  if (params.bodyType) result = result.filter((c) => c.bodyType === params.bodyType);
  if (params.country) result = result.filter((c) => c.country === params.country);
  if (params.budgetMin != null) result = result.filter((c) => c.budgetMax >= params.budgetMin!);
  if (params.budgetMax != null) result = result.filter((c) => c.budgetMin <= params.budgetMax!);
  if (params.savingsMin != null) result = result.filter((c) => c.savingsUpTo >= params.savingsMin!);
  if (params.savingsMax != null) result = result.filter((c) => c.savingsUpTo <= params.savingsMax!);
  if (params.query?.trim()) {
    const q = params.query.toLowerCase();
    result = result.filter(
      (c) =>
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q)
    );
  }
  return result;
}

export function getBrands(): string[] {
  const set = new Set(cars.map((c) => c.brand));
  return Array.from(set).sort();
}

const HERO_CAR_COUNT = 8;

/** Машины для Hero-карусели: топ по выгоде, обязательно RAM и BMW X7 если есть в каталоге */
export function getHeroCars(): Car[] {
  const sorted = [...cars].sort((a, b) => b.savingsUpTo - a.savingsUpTo);
  const ram = cars.find((c) => c.brand.toUpperCase().includes("RAM"));
  const bmwX7 = cars.find(
    (c) => c.brand.toUpperCase().includes("BMW") && c.model.toUpperCase().includes("X7")
  );
  const mustHave = [ram, bmwX7].filter((c): c is Car => c != null);
  const rest = sorted.filter((c) => !mustHave.includes(c));
  const combined = [...mustHave, ...rest];
  return combined.slice(0, HERO_CAR_COUNT);
}
