import Link from "next/link";
import type { Car, PublicCar } from "@/types/catalog";
import { getCarMedia } from "@/lib/catalog";
import { ResponsiveImage } from "@/components/ui-v2/media/ResponsiveImage";
import { buttonClassName } from "@/components/ui-v2/actions/Actions";
import { VehicleMediaPlaceholder } from "@/components/VehicleMediaPlaceholder";
import styles from "./CatalogCardV2.module.css";

export type CatalogCarV2 = PublicCar & Pick<Car, "budgetMin" | "budgetMax">;

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value);
}

export function CatalogCardV2({ car, priority = false }: { car: CatalogCarV2; priority?: boolean }) {
  const media = getCarMedia(car);
  const detailHref = `/catalog/${car.slug}`;

  return (
    <li className={styles.item}>
      <article className={styles.card}>
        {media ? (
          <ResponsiveImage
            src={media.src}
            alt={media.alt}
            sizes="(max-width: 39.99rem) 100vw, (max-width: 63.99rem) 50vw, (max-width: 79.99rem) 33vw, 25vw"
            priority={priority}
            fit="contain"
            frameClassName={styles.media}
            className={styles.image}
            style={{ objectPosition: media.objectPosition }}
          />
        ) : <VehicleMediaPlaceholder vehicleName={`${car.brand} ${car.model}`} mode="landscape" className={styles.media} />}
        <div className={styles.body}>
          <header className={styles.header}>
            <h2 className={styles.title}>{car.brand} {car.model}</h2>
          </header>
          <div>
            <span className={styles.priceLabel}>Ориентировочный бюджет</span>
            <strong className={styles.price}>{formatPrice(car.budgetMin)}–{formatPrice(car.budgetMax)} ₽</strong>
          </div>
          <ul className={styles.facts} aria-label="Краткие характеристики">
            <li className={styles.fact}>{car.bodyType}</li>
            <li className={styles.fact}>{car.country}</li>
          </ul>
          <Link href={detailHref} className={`${buttonClassName({ variant: "secondary" })} ${styles.link}`} aria-label={`Подробнее о ${car.brand} ${car.model}`}>Подробнее</Link>
        </div>
      </article>
    </li>
  );
}
