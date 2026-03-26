import type { Car } from "@/types/catalog";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export function formatPrice(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(n);
}

export function normalizeSavings(n: number): number {
  const clamped = Math.max(100_000, Math.min(600_000, n));
  return Math.round(clamped / 10_000) * 10_000;
}

export function getDisplaySavings(car: Pick<Car, "savingsUpTo" | "budgetMax">): number {
  let min = 180_000;
  let max = 350_000;

  if (car.budgetMax > 4_500_000) {
    min = 400_000;
    max = 900_000;
  } else if (car.budgetMax > 2_500_000) {
    min = 250_000;
    max = 500_000;
  }

  const clamped = Math.max(min, Math.min(max, car.savingsUpTo));
  return Math.round(clamped / 10_000) * 10_000;
}
