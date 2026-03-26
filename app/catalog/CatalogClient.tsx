"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { Car } from "@/types/catalog";
import { CarCard } from "@/components/CarCard";

const SAVINGS_OPTIONS = [
  { value: "", label: "Любая выгода" },
  { value: "0-100", label: "До 100 000 ₽ выгоды" },
  { value: "100-200", label: "100 000 – 200 000 ₽ выгоды" },
  { value: "200-400", label: "200 000 – 400 000 ₽ выгоды" },
  { value: "400+", label: "От 400 000 ₽ выгоды" },
];

type Props = {
  cars: Car[];
  total: number;
  currentPage: number;
  totalPages: number;
  brands: string[];
  bodyTypes: string[];
  countries: string[];
  defaultFilters: {
    brand: string;
    bodyType: string;
    country: string;
    budget: string;
    savings: string;
    q: string;
  };
};

const controlClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-red-200 focus:ring-2 focus:ring-red-100";

export function CatalogClient({
  cars,
  total,
  currentPage,
  totalPages,
  brands,
  bodyTypes,
  countries,
  defaultFilters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");

      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });

      router.push(`/catalog?${params.toString()}`);
    },
    [router, searchParams]
  );

  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      router.push(`/catalog?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <>
      <div className="light-card mb-8 rounded-[30px] p-4 sm:p-5 lg:p-6">
        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const q = (form.querySelector('[name="q"]') as HTMLInputElement)?.value ?? "";
            setFilters({ q });
          }}
        >
          <label className="relative block xl:col-span-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={defaultFilters.q}
              placeholder="Поиск по марке или модели..."
              className={`${controlClassName} pl-11`}
            />
          </label>

          <select
            name="brand"
            defaultValue={defaultFilters.brand}
            onChange={(event) => setFilters({ brand: event.target.value })}
            className={controlClassName}
          >
            <option value="">Все марки</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <select
            name="bodyType"
            defaultValue={defaultFilters.bodyType}
            onChange={(event) => setFilters({ bodyType: event.target.value })}
            className={controlClassName}
          >
            <option value="">Тип кузова</option>
            {bodyTypes.map((bodyType) => (
              <option key={bodyType} value={bodyType}>
                {bodyType}
              </option>
            ))}
          </select>

          <select
            name="country"
            defaultValue={defaultFilters.country}
            onChange={(event) => setFilters({ country: event.target.value })}
            className={controlClassName}
          >
            <option value="">Страна</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>

          <select
            name="savings"
            defaultValue={defaultFilters.savings}
            onChange={(event) => setFilters({ savings: event.target.value })}
            className={controlClassName}
          >
            {SAVINGS_OPTIONS.map((option) => (
              <option key={option.value || "saving"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button type="submit" className="cta-primary text-sm xl:col-span-1">
            Найти
          </button>
        </form>
      </div>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Каталог KONSTANT AUTO</p>
        <p className="text-sm text-slate-500">
          Найдено: {total} {total === 1 ? "вариант" : total < 5 ? "варианта" : "вариантов"}
        </p>
      </div>

      {cars.length === 0 ? (
        <div className="light-card rounded-[30px] px-6 py-14 text-center">
          <p className="text-slate-950">По заданным фильтрам ничего не найдено.</p>
          <p className="mt-2 text-sm text-slate-500">Попробуйте изменить параметры.</p>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {cars.map((car) => (
              <CarCard key={car.slug} car={car} />
            ))}
          </ul>

          {totalPages > 1 ? (
            <nav className="mt-12 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Назад
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
                .map((page, index, visiblePages) => (
                  <span key={page} className="flex items-center gap-2">
                    {index > 0 && visiblePages[index - 1] !== page - 1 ? (
                      <span className="px-1 text-slate-400">…</span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setPage(page)}
                      className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                        page === currentPage
                          ? "bg-[linear-gradient(135deg,#ff4f4f_0%,#c40000_100%)] text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:text-red-600"
                      }`}
                    >
                      {page}
                    </button>
                  </span>
                ))}
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Вперёд
              </button>
            </nav>
          ) : null}
        </>
      )}
    </>
  );
}
