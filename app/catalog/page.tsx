import type { Metadata } from "next";
import { Suspense } from "react";
import { BODY_TYPES, COUNTRIES } from "@/lib/constants";
import { getBrands, getCarsFiltered } from "@/lib/catalog";
import { SectionRouteLayer } from "@/components/ui/SectionRouteLayer";
import { CatalogClient } from "./CatalogClient";
import { CatalogSkeleton } from "./CatalogSkeleton";

const PER_PAGE = 12;

export const metadata: Metadata = {
  title: "Каталог — варианты под заказ",
  description:
    "Примеры моделей авто под заказ: Китай, Корея, Япония, США, Европа, ОАЭ. Не в наличии — подбираем и привозим по вашему запросу. KONSTANT AUTO, Самара.",
  openGraph: {
    title: "Каталог авто под заказ | KONSTANT AUTO",
    description: "Варианты под заказ из-за рубежа. Подбор и привоз под ключ.",
  },
};

type SearchParams = {
  brand?: string;
  bodyType?: string;
  country?: string;
  budget?: string;
  savings?: string;
  page?: string;
  q?: string;
};

function parseBudget(budget?: string): { budgetMin?: number; budgetMax?: number } {
  if (!budget) return {};

  const map: Record<string, [number, number]> = {
    "0-1.5": [0, 1_500_000],
    "1.5-2.5": [1_500_000, 2_500_000],
    "2.5-4": [2_500_000, 4_000_000],
    "4-6": [4_000_000, 6_000_000],
    "6+": [6_000_000, 999_999_999],
  };

  const [min, max] = map[budget] ?? [];
  return min != null ? { budgetMin: min, budgetMax: max } : {};
}

function parseSavings(savings?: string): { savingsMin?: number; savingsMax?: number } {
  if (!savings) return {};

  const map: Record<string, [number, number]> = {
    "0-100": [0, 100_000],
    "100-200": [100_000, 200_000],
    "200-400": [200_000, 400_000],
    "400+": [400_000, 999_999_999],
  };

  const [min, max] = map[savings] ?? [];
  return min != null ? { savingsMin: min, savingsMax: max } : {};
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const budget = parseBudget(params.budget);
  const savings = parseSavings(params.savings);

  const filtered = getCarsFiltered({
    brand: params.brand,
    bodyType: params.bodyType,
    country: params.country,
    ...budget,
    ...savings,
    query: params.q,
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / PER_PAGE) || 1;
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const cars = filtered.slice(start, start + PER_PAGE);

  return (
    <div className="section-light min-h-screen border-t border-slate-200/80">
      <SectionRouteLayer pattern="alpha" />
      <div className="container relative z-10 mx-auto px-4 py-10 sm:py-12">
        <div className="light-card mb-8 rounded-[32px] p-6 sm:p-8">
          <div className="eyebrow-light">
            <span className="route-dot" />
            Каталог вариантов под заказ
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Каталог вариантов под заказ
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
            Примеры моделей, которые мы подбираем и привозим под заказ. Это не склад с фиксированными
            ценниками: оставьте заявку по интересующей модели, и мы вернёмся с актуальными вариантами и
            расчётом выгоды.
          </p>
        </div>

        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogClient
            cars={cars}
            total={total}
            currentPage={currentPage}
            totalPages={totalPages}
            brands={getBrands()}
            bodyTypes={[...BODY_TYPES]}
            countries={[...COUNTRIES]}
            defaultFilters={{
              brand: params.brand ?? "",
              bodyType: params.bodyType ?? "",
              country: params.country ?? "",
              budget: params.budget ?? "",
              savings: params.savings ?? "",
              q: params.q ?? "",
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
