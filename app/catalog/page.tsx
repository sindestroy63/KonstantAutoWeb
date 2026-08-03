import type { Metadata } from "next";
import { Suspense } from "react";
import { BODY_TYPES, COUNTRIES } from "@/lib/constants";
import { getBrands, getCarsFiltered } from "@/lib/catalog";
import { CatalogClient } from "./CatalogClient";
import { CatalogSkeleton } from "./CatalogSkeleton";
import { toPublicCar } from "@/lib/car-benefit";
import type { Car } from "@/types/catalog";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/structured-data";
import { CatalogPageV2 } from "@/components/catalog-v2/CatalogPageV2";
import type { CatalogCarV2 } from "@/components/catalog-v2/CatalogCardV2";
import { USE_UI_V2 } from "@/lib/ui-version";

const PER_PAGE = 12;

export const metadata: Metadata = {
  title: "Каталог — варианты под заказ",
  description:
    "Примеры моделей авто под заказ: Китай, Корея, Япония, США, Европа, ОАЭ. Не в наличии — подбираем и привозим по вашему запросу. KONSTANT AUTO, Самара.",
  alternates: { canonical: "/catalog" },
  openGraph: {
    title: "Каталог авто под заказ | KONSTANT AUTO",
    description: "Варианты под заказ из-за рубежа. Подбор и привоз под ключ.",
    url: "/catalog",
  },
};

type SearchParams = {
  brand?: string | string[];
  bodyType?: string | string[];
  country?: string | string[];
  page?: string | string[];
  q?: string | string[];
};

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toCatalogCarV2(car: Car): CatalogCarV2 {
  return {
    ...toPublicCar(car),
    budgetMin: car.budgetMin,
    budgetMax: car.budgetMax,
  };
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = searchParams;
  const brand = getSingleParam(params.brand);
  const bodyType = getSingleParam(params.bodyType);
  const country = getSingleParam(params.country);
  const query = getSingleParam(params.q);
  const page = Math.max(1, parseInt(getSingleParam(params.page) ?? "1", 10) || 1);
  const filtered = getCarsFiltered({
    brand,
    bodyType,
    country,
    query,
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / PER_PAGE) || 1;
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const pageCars = filtered.slice(start, start + PER_PAGE);
  const defaultFilters = {
    brand: brand ?? "",
    bodyType: bodyType ?? "",
    country: country ?? "",
    q: query ?? "",
  };
  const breadcrumbData = buildBreadcrumbJsonLd([
    { name: "Главная", path: "/" },
    { name: "Каталог", path: "/catalog" },
  ]);

  if (USE_UI_V2) {
    return (
      <>
        <JsonLd data={breadcrumbData} />
        <CatalogPageV2
          cars={pageCars.map(toCatalogCarV2)}
          total={total}
          currentPage={currentPage}
          totalPages={totalPages}
          brands={getBrands()}
          bodyTypes={[...BODY_TYPES]}
          countries={[...COUNTRIES]}
          defaultFilters={defaultFilters}
        />
      </>
    );
  }

  const cars = pageCars.map(toPublicCar);

  return (
    <div className="catalog-page section-light min-h-screen border-t border-slate-200/80">
      <JsonLd
        data={breadcrumbData}
      />
      <div className="site-container relative z-10 py-8 sm:py-10">
        <div className="catalog-hero">
          <div className="eyebrow-light">
            <span className="route-dot" />
            Каталог автомобилей
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Автомобили под заказ
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
            Выберите ориентир по марке, кузову и стране. Проверим рынок и вернёмся с актуальными вариантами и прозрачным расчётом под ваш запрос.
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
            defaultFilters={defaultFilters}
          />
        </Suspense>
      </div>
    </div>
  );
}
