"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui-v2/actions/Actions";
import { SelectField, TextField } from "@/components/ui-v2/forms/Fields";
import styles from "./CatalogClientV2.module.css";
import type { CatalogFilterState } from "./MobileCatalogFiltersV2";

const MobileCatalogFiltersV2 = dynamic(
  () => import("./MobileCatalogFiltersV2").then((module) => module.MobileCatalogFiltersV2),
  { ssr: false },
);

type Props = {
  total: number;
  hasResults: boolean;
  brands: string[];
  bodyTypes: string[];
  countries: string[];
  defaultFilters: CatalogFilterState;
  children?: ReactNode;
};

function resultLabel(total: number) {
  if (total === 1) return "вариант";
  if (total > 1 && total < 5) return "варианта";
  return "вариантов";
}

export function CatalogClientV2({
  total,
  hasResults,
  brands,
  bodyTypes,
  countries,
  defaultFilters,
  children,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileFiltersLoaded, setMobileFiltersLoaded] = useState(false);
  const [desktopSearch, setDesktopSearch] = useState(defaultFilters.q);

  useEffect(() => {
    setDesktopSearch(defaultFilters.q);
  }, [defaultFilters.q]);

  const setFilters = useCallback(
    (updates: Partial<CatalogFilterState>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      router.push(`/catalog?${params.toString()}`);
    },
    [router, searchParams],
  );

  const resetFilters = useCallback(() => {
    const emptyFilters = { brand: "", bodyType: "", country: "", q: "" };
    setDesktopSearch("");
    setFiltersOpen(false);
    router.push("/catalog");
  }, [router]);

  const activeFilters = useMemo(
    () => [
      defaultFilters.brand ? { key: "brand" as const, label: "Марка", value: defaultFilters.brand } : null,
      defaultFilters.bodyType ? { key: "bodyType" as const, label: "Кузов", value: defaultFilters.bodyType } : null,
      defaultFilters.country ? { key: "country" as const, label: "Страна", value: defaultFilters.country } : null,
      defaultFilters.q ? { key: "q" as const, label: "Поиск", value: defaultFilters.q } : null,
    ].filter((filter): filter is NonNullable<typeof filter> => Boolean(filter)),
    [defaultFilters.brand, defaultFilters.bodyType, defaultFilters.country, defaultFilters.q],
  );

  return (
    <>
      <div className={styles.desktopFilters} aria-label="Фильтры каталога">
        <form
          className={styles.filterGrid}
          onSubmit={(event) => {
            event.preventDefault();
            setFilters({ q: desktopSearch });
          }}
        >
          <div className={styles.search}>
            <TextField label="Поиск по марке или модели" type="search" value={desktopSearch} onChange={(event) => setDesktopSearch(event.target.value)} placeholder="Например, Toyota Camry" />
          </div>
          <SelectField label="Марка" value={defaultFilters.brand} onChange={(event) => setFilters({ brand: event.target.value })}>
            <option value="">Все марки</option>
            {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
          </SelectField>
          <SelectField label="Тип кузова" value={defaultFilters.bodyType} onChange={(event) => setFilters({ bodyType: event.target.value })}>
            <option value="">Все типы кузова</option>
            {bodyTypes.map((bodyType) => <option key={bodyType} value={bodyType}>{bodyType}</option>)}
          </SelectField>
          <SelectField label="Страна" value={defaultFilters.country} onChange={(event) => setFilters({ country: event.target.value })}>
            <option value="">Все страны</option>
            {countries.map((country) => <option key={country} value={country}>{country}</option>)}
          </SelectField>
          <div className={styles.filterActions}>
            <Button type="submit">Найти</Button>
            <Button type="button" variant="quiet" onClick={resetFilters}>Сбросить</Button>
          </div>
        </form>
      </div>

      <div className={styles.mobileFilterButton}>
        <Button type="button" variant="secondary" fullWidth aria-expanded={filtersOpen} onClick={() => { setMobileFiltersLoaded(true); setFiltersOpen(true); }}>
          <span className={styles.filterButtonContent}><Filter aria-hidden="true" />Фильтры{activeFilters.length > 0 ? <span className={styles.count} aria-label={`Применено фильтров: ${activeFilters.length}`}>{activeFilters.length}</span> : null}</span>
        </Button>
      </div>

      {mobileFiltersLoaded ? (
        <MobileCatalogFiltersV2
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          defaultFilters={defaultFilters}
          brands={brands}
          bodyTypes={bodyTypes}
          countries={countries}
          onApply={setFilters}
          onReset={resetFilters}
        />
      ) : null}

      {activeFilters.length > 0 ? (
        <div className={styles.activeFilters} aria-label="Активные фильтры">
          <span className={styles.activeLabel}>Активные фильтры:</span>
          {activeFilters.map((filter) => (
            <button key={filter.key} type="button" className={styles.chip} aria-label={`Убрать фильтр ${filter.label}: ${filter.value}`} onClick={() => setFilters({ [filter.key]: "" })}>
              {filter.label}: {filter.value}<X aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.toolbar}>
        <p className={styles.resultCount} aria-live="polite" aria-atomic="true">Найдено: {total} {resultLabel(total)}</p>
        <span className={styles.sort}>Порядок: по умолчанию</span>
      </div>

      {!hasResults ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>По заданным фильтрам ничего не найдено</h2>
          <p className={styles.emptyText}>Измените параметры или вернитесь к полному каталогу.</p>
          <Button type="button" variant="secondary" onClick={resetFilters}>Сбросить фильтры</Button>
        </div>
      ) : (
        children
      )}
    </>
  );
}
