import Link from "next/link";
import { ResponsiveGrid } from "@/components/ui-v2/layout/Layout";
import { CatalogCardV2, type CatalogCarV2 } from "./CatalogCardV2";
import styles from "./CatalogClientV2.module.css";

type Props = {
  cars: CatalogCarV2[];
  currentPage: number;
  totalPages: number;
  filters: {
    brand: string;
    bodyType: string;
    country: string;
    q: string;
  };
};

function pageHref(page: number, filters: Props["filters"]) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  params.set("page", String(page));
  return `/catalog?${params.toString()}`;
}

export function CatalogResultsV2({ cars, currentPage, totalPages, filters }: Props) {
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2);

  return (
    <>
      <ResponsiveGrid as="ul" className={styles.grid} minItemWidth="standard" gap={5}>
        {cars.map((car, index) => <CatalogCardV2 key={car.slug} car={car} priority={index === 0} />)}
      </ResponsiveGrid>

      {totalPages > 1 ? (
        <nav aria-label="Пагинация каталога" className={styles.pagination}>
          <Link href={pageHref(Math.max(1, currentPage - 1), filters)} aria-disabled={currentPage <= 1} tabIndex={currentPage <= 1 ? -1 : undefined} className={`${styles.pageButton} ${currentPage <= 1 ? styles.pageButtonDisabled : ""}`}>Назад</Link>
          {visiblePages.map((page, index) => (
            <span key={page}>
              {index > 0 && visiblePages[index - 1] !== page - 1 ? <span className={styles.ellipsis} aria-hidden="true">…</span> : null}
              <Link href={pageHref(page, filters)} aria-label={`Страница ${page}`} aria-current={page === currentPage ? "page" : undefined} className={`${styles.pageButton} ${page === currentPage ? styles.pageCurrent : ""}`}>{page}</Link>
            </span>
          ))}
          <Link href={pageHref(Math.min(totalPages, currentPage + 1), filters)} aria-disabled={currentPage >= totalPages} tabIndex={currentPage >= totalPages ? -1 : undefined} className={`${styles.pageButton} ${currentPage >= totalPages ? styles.pageButtonDisabled : ""}`}>Вперёд</Link>
        </nav>
      ) : null}
    </>
  );
}
