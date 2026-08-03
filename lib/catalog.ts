import type { Car, PublicCar } from "@/types/catalog";
import rawCars from "@/data/cars.json";
import { getCarBenefit } from "@/lib/car-benefit";
import { getProductionAiImage } from "@/lib/production-ai-images";

const VALID_BODY_TYPES = new Set([
  "Седан",
  "Кроссовер",
  "Внедорожник",
  "Пикап",
  "Хэтчбек",
]);
const VALID_COUNTRIES = new Set([
  "Китай",
  "Корея",
  "Япония",
  "США",
  "Европа",
  "ОАЭ",
  "Россия",
  "РФ",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseCars(value: unknown): Car[] {
  if (!Array.isArray(value)) {
    throw new Error("data/cars.json: корневое значение должно быть массивом");
  }

  const slugs = new Set<string>();
  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`data/cars.json: запись ${index + 1} должна быть объектом`);
    }

    const { slug, brand, model, bodyType, country, budgetMin, budgetMax, savingsUpTo, image } =
      item;
    const validStrings =
      typeof slug === "string" &&
      /^[a-z0-9_-]+$/.test(slug) &&
      typeof brand === "string" &&
      brand.trim().length > 0 &&
      typeof model === "string" &&
      model.trim().length > 0 &&
      typeof bodyType === "string" &&
      VALID_BODY_TYPES.has(bodyType) &&
      typeof country === "string" &&
      VALID_COUNTRIES.has(country);
    const validNumbers =
      typeof budgetMin === "number" &&
      Number.isFinite(budgetMin) &&
      budgetMin >= 0 &&
      typeof budgetMax === "number" &&
      Number.isFinite(budgetMax) &&
      budgetMax >= budgetMin &&
      typeof savingsUpTo === "number" &&
      Number.isFinite(savingsUpTo) &&
      savingsUpTo >= 0;
    const validImage =
      image === undefined ||
      (typeof image === "string" &&
        (/^\/cars\/[a-z0-9_-]+\.(?:jpe?g|png|webp)$/i.test(image) ||
          /^\/images\/catalog\/[a-z0-9_-]+\.webp$/i.test(image)));

    if (!validStrings || !validNumbers || !validImage) {
      throw new Error(`data/cars.json: некорректная запись ${index + 1}`);
    }
    if (slugs.has(slug)) {
      throw new Error(`data/cars.json: повторяющийся slug "${slug}"`);
    }
    slugs.add(slug);

    return item as unknown as Car;
  });
}

type CarImageData = Pick<Car, "slug" | "brand" | "model"> | PublicCar;

export type CarMedia = {
  src: string;
  alt: string;
  fit: "cover" | "contain";
  objectPosition: string;
  source: "production-ai";
};

export function getCarMedia(car: CarImageData): CarMedia | null {
  const image = getProductionAiImage(car.slug);
  if (!image) return null;
  return {
    src: image.src,
    alt: `${car.brand} ${car.model}`,
    fit: "contain",
    objectPosition: "50% 50%",
    source: "production-ai",
  };
}

/** Автомобили российского производства не показываем — только импорт из-за рубежа */
const RUSSIAN_BRANDS = ["Lada", "Лада", "Москвич", "УАЗ", "UAZ", "ГАЗ", "ВАЗ"];
function isImportOnly(car: Car): boolean {
  if (car.country === "Россия" || car.country === "РФ") return false;
  if (RUSSIAN_BRANDS.some((b) => car.brand.toLowerCase().includes(b.toLowerCase()))) return false;
  return true;
}

const cars = parseCars(rawCars).filter(isImportOnly);

export function getCars(): Car[] {
  return [...cars];
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
  if (params.savingsMin != null) result = result.filter((c) => getCarBenefit(c) >= params.savingsMin!);
  if (params.savingsMax != null) result = result.filter((c) => getCarBenefit(c) <= params.savingsMax!);
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
