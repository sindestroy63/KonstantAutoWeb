import { Suspense } from "react";
import { Container } from "@/components/ui-v2/layout/Layout";
import { DesignSystemProvider } from "@/components/ui-v2/core/DesignSystemProvider";
import { Eyebrow, Heading, Text } from "@/components/ui-v2/typography/Typography";
import { CatalogClientV2 } from "./CatalogClientV2";
import { CatalogResultsV2 } from "./CatalogResultsV2";
import type { CatalogCarV2 } from "./CatalogCardV2";
import styles from "./CatalogPageV2.module.css";

type Props = {
  cars: CatalogCarV2[];
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

function CatalogSkeletonV2() {
  return (
    <div aria-busy="true" aria-label="Загрузка каталога">
      <div className={styles.skeletonFilters} />
      <div className={styles.skeletonGrid}>{Array.from({ length: 8 }, (_, index) => <div key={index} className={styles.skeletonCard} />)}</div>
    </div>
  );
}

export function CatalogPageV2(props: Props) {
  return (
    <DesignSystemProvider className={styles.page}>
      <Container className={styles.content}>
        <header className={styles.hero}>
          <div className={styles.titleGroup}>
            <Eyebrow>Каталог автомобилей</Eyebrow>
            <Heading as="h1" variant="h2">Автомобили под заказ</Heading>
          </div>
          <Text className={styles.copy} tone="muted">Выберите ориентир по марке, кузову и стране. Проверим рынок и вернёмся с актуальными вариантами и прозрачным расчётом под ваш запрос.</Text>
        </header>
        <Suspense fallback={<CatalogSkeletonV2 />}>
          <CatalogClientV2
            total={props.total}
            hasResults={props.cars.length > 0}
            brands={props.brands}
            bodyTypes={props.bodyTypes}
            countries={props.countries}
            defaultFilters={props.defaultFilters}
          >
            <CatalogResultsV2
              cars={props.cars}
              currentPage={props.currentPage}
              totalPages={props.totalPages}
              filters={props.defaultFilters}
            />
          </CatalogClientV2>
        </Suspense>
      </Container>
    </DesignSystemProvider>
  );
}
