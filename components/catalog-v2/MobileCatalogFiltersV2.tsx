"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui-v2/actions/Actions";
import { SelectField, TextField } from "@/components/ui-v2/forms/Fields";
import { Dialog } from "@/components/ui-v2/overlays/Dialog";
import styles from "./CatalogClientV2.module.css";

export type CatalogFilterState = {
  brand: string;
  bodyType: string;
  country: string;
  q: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultFilters: CatalogFilterState;
  brands: string[];
  bodyTypes: string[];
  countries: string[];
  onApply: (filters: CatalogFilterState) => void;
  onReset: () => void;
};

export function MobileCatalogFiltersV2({ open, onOpenChange, defaultFilters, brands, bodyTypes, countries, onApply, onReset }: Props) {
  const [draftFilters, setDraftFilters] = useState<CatalogFilterState>(defaultFilters);

  useEffect(() => {
    setDraftFilters({
      brand: defaultFilters.brand,
      bodyType: defaultFilters.bodyType,
      country: defaultFilters.country,
      q: defaultFilters.q,
    });
  }, [defaultFilters.brand, defaultFilters.bodyType, defaultFilters.country, defaultFilters.q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} variant="bottomSheet" title="Фильтры" description="Выберите параметры каталога" closeLabel="Закрыть фильтры" className={styles.filterSheet}>
      <form
        className={styles.mobileForm}
        onSubmit={(event) => {
          event.preventDefault();
          onApply(draftFilters);
          onOpenChange(false);
        }}
      >
        <TextField label="Поиск по марке или модели" type="search" value={draftFilters.q} onChange={(event) => setDraftFilters((current) => ({ ...current, q: event.target.value }))} placeholder="Например, Toyota Camry" />
        <SelectField label="Марка" value={draftFilters.brand} onChange={(event) => setDraftFilters((current) => ({ ...current, brand: event.target.value }))}>
          <option value="">Все марки</option>
          {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
        </SelectField>
        <SelectField label="Тип кузова" value={draftFilters.bodyType} onChange={(event) => setDraftFilters((current) => ({ ...current, bodyType: event.target.value }))}>
          <option value="">Все типы кузова</option>
          {bodyTypes.map((bodyType) => <option key={bodyType} value={bodyType}>{bodyType}</option>)}
        </SelectField>
        <SelectField label="Страна" value={draftFilters.country} onChange={(event) => setDraftFilters((current) => ({ ...current, country: event.target.value }))}>
          <option value="">Все страны</option>
          {countries.map((country) => <option key={country} value={country}>{country}</option>)}
        </SelectField>
        <div className={styles.mobileActions}>
          <Button type="button" variant="secondary" onClick={onReset}>Сбросить</Button>
          <Button type="submit">Показать результаты</Button>
        </div>
      </form>
    </Dialog>
  );
}
