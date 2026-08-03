"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { DesignSystemProvider } from "@/components/ui-v2/core/DesignSystemProvider";
import { SegmentedControl } from "@/components/ui-v2/forms/Fields";
import type { BodyType, Country } from "@/types/catalog";
import styles from "./HomeShowcaseV2.module.css";

const countries = ["Япония", "Корея", "Китай", "США", "Европа", "ОАЭ"] as const;
type ShowcaseCountry = (typeof countries)[number];

const countryOptions = countries.map((country) => ({ value: country, label: country }));

export type HomeShowcaseCar = {
  slug: string;
  brand: string;
  model: string;
  bodyType: BodyType;
  country: Country;
  budgetMin: number;
  imageSrc: string;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value);
}

export function HomeShowcaseV2({ cars }: { cars: HomeShowcaseCar[] }) {
  const [country, setCountry] = useState<ShowcaseCountry>("Япония");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const countryCars = useMemo(() => cars.filter((car) => car.country === country).slice(0, 5), [cars, country]);
  const activeCar = countryCars.find((car) => car.slug === selectedSlug) ?? countryCars[0];
  const alternateCars = activeCar ? countryCars.filter((car) => car.slug !== activeCar.slug).slice(0, 4) : [];

  const changeCountry = (nextCountry: ShowcaseCountry) => {
    setCountry(nextCountry);
    setSelectedSlug(null);
  };

  return (
    <DesignSystemProvider as="section" id="about" className={styles.section} data-home-showcase-v2="true">
      <div className={`site-container ${styles.layout}`}>
        <div className={styles.leftColumn}>
          <header className={styles.intro} data-showcase-intro="true">
            <p className={styles.eyebrow}>Автомобили под заказ</p>
            <h2>Лучшие автомобили<br /><span><span className={styles.keepTogether}>из проверенных</span> стран</span></h2>
            <p className={styles.copy}>Выберите автомобиль из актуального каталога. Проверим рынок, рассчитаем стоимость и организуем поставку под ключ.</p>
            <Link href="/catalog" className={styles.catalogLink}>Перейти в каталог <ArrowRight aria-hidden="true" /></Link>
          </header>

          <div className={styles.controls} data-showcase-controls="true">
            <SegmentedControl label="Страна поставки" value={country} options={countryOptions} onChange={changeCountry} className={styles.segments} />
          </div>

          <p className={styles.geography}><strong>Работаем:</strong> Япония · Корея · Китай · США · Европа · ОАЭ</p>
        </div>

        <div className={styles.mainShowcase} aria-live="polite" data-showcase-main="true">
          {activeCar ? (
            <div key={activeCar.slug} className={styles.mainContent} data-showcase-car={activeCar.slug}>
              <div className={styles.heroImage}>
                <Image
                  src={activeCar.imageSrc}
                  alt={`${activeCar.brand} ${activeCar.model}`}
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1199px) 58vw, 52vw"
                  className={styles.image}
                  priority={activeCar.slug === "toyota_camry"}
                />
              </div>
              <div className={styles.details}>
                <div>
                  <p className={styles.country}>{activeCar.country}</p>
                  <h3>{activeCar.brand} {activeCar.model}</h3>
                  <p className={styles.bodyType}>{activeCar.bodyType}</p>
                </div>
                <div className={styles.purchase}>
                  <span>от {formatPrice(activeCar.budgetMin)} ₽</span>
                  <small>Под заказ</small>
                  <Link href={`/catalog/${activeCar.slug}`}>Подробнее <ArrowRight aria-hidden="true" /></Link>
                </div>
              </div>
            </div>
          ) : (
            <div key={country} className={styles.empty}>
              <p>Showcase для направления «{country}» готовится.</p>
              <span>Покажем автомобили только после появления одобренных production AI-изображений.</span>
              <Link href="/catalog">Открыть полный каталог <ArrowRight aria-hidden="true" /></Link>
            </div>
          )}
        </div>

        <div className={styles.thumbnails} aria-label={`Другие автомобили: ${country}`} data-showcase-thumbnails="true">
          {alternateCars.map((car) => (
            <button key={car.slug} type="button" className={styles.thumbnail} aria-label={`Показать ${car.brand} ${car.model}`} onClick={() => setSelectedSlug(car.slug)}>
              <span className={styles.thumbnailImage}>
                <Image src={car.imageSrc} alt="" fill sizes="180px" className={styles.image} />
              </span>
              <span className={styles.thumbnailName}>{car.brand} {car.model}</span>
            </button>
          ))}
          {countryCars.length === 0 ? <p className={styles.noThumbnails}>Нет одобренных AI-изображений для этого направления</p> : null}
        </div>

      </div>
    </DesignSystemProvider>
  );
}
