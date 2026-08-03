"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Search, X } from "lucide-react";
import type { PublicCar } from "@/types/catalog";
import { CarCard } from "@/components/CarCard";

type Props = {
  cars: PublicCar[];
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterToggleRef = useRef<HTMLButtonElement>(null);
  const filterCloseRef = useRef<HTMLButtonElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filtersOpen) return;
    const filterToggle = filterToggleRef.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => filterCloseRef.current?.focus(), 0);
    const close = (event: KeyboardEvent) => event.key === "Escape" && setFiltersOpen(false);
    window.addEventListener("keydown", close);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", close);
      filterToggle?.focus();
    };
  }, [filtersOpen]);

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

  function trapFilterFocus(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab" || !filtersOpen || !filterPanelRef.current) return;
    const focusable = Array.from(
      filterPanelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.offsetParent !== null);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <button ref={filterToggleRef} type="button" className="catalog-filter-toggle" onClick={() => setFiltersOpen(true)} aria-expanded={filtersOpen} aria-controls="catalog-filters">
        <Filter className="h-4 w-4" /> Фильтры
      </button>
      {filtersOpen ? <button type="button" className="catalog-filter-backdrop" aria-label="Закрыть фильтры" onClick={() => setFiltersOpen(false)} /> : null}
      <div ref={filterPanelRef} id="catalog-filters" onKeyDown={trapFilterFocus} className={`catalog-filters ${filtersOpen ? "is-open" : ""}`} role={filtersOpen ? "dialog" : undefined} aria-modal={filtersOpen || undefined} aria-label="Фильтры каталога">
        <div className="catalog-filter-heading"><b>Фильтры</b><button ref={filterCloseRef} type="button" onClick={() => setFiltersOpen(false)} aria-label="Закрыть фильтры"><X /></button></div>
        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            const value = new FormData(event.currentTarget).get("q");
            const q = typeof value === "string" ? value : "";
            setFilters({ q });
          }}
        >
          <label className="relative block xl:col-span-2">
            <span className="sr-only">Поиск по марке или модели</span>
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
            aria-label="Марка"
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
            aria-label="Тип кузова"
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
            aria-label="Страна"
          >
            <option value="">Страна</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>

          <button type="submit" className="cta-primary text-sm xl:col-span-1" onClick={() => setFiltersOpen(false)}>
            Найти
          </button>
          <button type="button" className="catalog-reset" onClick={() => { router.push("/catalog"); setFiltersOpen(false); }}>Сбросить</button>
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
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cars.map((car, index) => (
              <CarCard key={car.slug} car={car} priority={index === 0} />
            ))}
          </ul>

          {totalPages > 1 ? (
            <nav aria-label="Пагинация каталога" className="mt-12 flex flex-wrap justify-center gap-2">
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
                      aria-label={`Страница ${page}`}
                      aria-current={page === currentPage ? "page" : undefined}
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
