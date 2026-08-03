import type { Car, PublicCar } from "@/types/catalog";

/** Business-approved overrides take priority over the provisional formula. */
export const MANUAL_CAR_BENEFITS: Partial<Record<string, number>> = {
  toyota_camry: 250_000,
  toyota_rav4: 300_000,
  toyota_land_cruiser: 650_000,
  toyota_hilux: 350_000,
};

const MIN_BENEFIT = 200_000;
const MAX_BENEFIT = 1_000_000;
const ROUNDING_STEP = 50_000;

export function calculateCarBenefit(internalPrice: number): number {
  const rawBenefit = internalPrice * 0.1;
  const rounded = Math.round(rawBenefit / ROUNDING_STEP) * ROUNDING_STEP;
  return Math.max(MIN_BENEFIT, Math.min(MAX_BENEFIT, rounded));
}

export function getCarBenefit(car: Pick<Car, "slug" | "budgetMin">): number {
  return MANUAL_CAR_BENEFITS[car.slug] ?? calculateCarBenefit(car.budgetMin);
}

export function formatBenefit(value: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value);
}

export function toPublicCar(car: Car): PublicCar {
  const { budgetMin: _budgetMin, budgetMax: _budgetMax, savingsUpTo: _savingsUpTo, ...publicFields } = car;
  return { ...publicFields, benefit: getCarBenefit(car) };
}
