"use client";

import { useRef, useState, type PointerEvent } from "react";
import { Expand, ChevronLeft, ChevronRight } from "lucide-react";
import type { Car } from "@/types/catalog";
import { getProductionAiImages } from "@/lib/production-ai-images";
import { CarImage } from "@/components/CarImage";
import { Dialog, IconButton } from "@/components/ui-v2";
import styles from "./VehicleMediaViewerV2.module.css";

type ViewerCar = Pick<Car, "slug" | "brand" | "model" | "bodyType" | "country" | "image">;

export function VehicleMediaViewerV2({ car }: { car: ViewerCar }) {
  const imageCount = getProductionAiImages(car.slug).length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const pointerStart = useRef<number | null>(null);

  const select = (next: number) => {
    if (imageCount < 2) return;
    setActiveIndex((next + imageCount) % imageCount);
  };

  const handlePointerDown = (event: PointerEvent) => {
    pointerStart.current = event.clientX;
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(distance) > 48) select(activeIndex + (distance < 0 ? 1 : -1));
  };

  return (
    <section className={styles.viewer} aria-label={`Изображения ${car.brand} ${car.model}`}>
      <button
        type="button"
        className={styles.main}
        onClick={() => imageCount > 0 && setLightboxOpen(true)}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        aria-label={imageCount > 0 ? `Открыть ${car.brand} ${car.model} на весь экран` : undefined}
        disabled={imageCount === 0}
      >
        <CarImage car={car} mediaIndex={activeIndex} sizes="(max-width: 1023px) 100vw, 62vw" priority containPaddingClassName={styles.imagePadding} />
        {imageCount > 0 ? <span className={styles.expand}><Expand aria-hidden="true" />Увеличить</span> : null}
      </button>

      {imageCount > 1 ? (
        <div className={styles.thumbnails} aria-label="Выбор изображения">
          {Array.from({ length: imageCount }, (_, index) => (
            <button key={index} type="button" className={styles.thumbnail} aria-current={index === activeIndex ? "true" : undefined} onClick={() => setActiveIndex(index)}>
              <CarImage car={car} mediaIndex={index} sizes="112px" containPaddingClassName={styles.thumbPadding} />
              <span className={styles.srOnly}>Изображение {index + 1}</span>
            </button>
          ))}
        </div>
      ) : null}

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen} title={`${car.brand} ${car.model}`} closeLabel="Закрыть просмотр" className={styles.lightbox}>
        <div className={styles.lightboxMedia} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
          <CarImage car={car} mediaIndex={activeIndex} sizes="95vw" containPaddingClassName={styles.lightboxPadding} />
          {imageCount > 1 ? (
            <div className={styles.lightboxControls}>
              <IconButton label="Предыдущее изображение" icon={<ChevronLeft aria-hidden="true" />} onClick={() => select(activeIndex - 1)} />
              <span aria-live="polite">{activeIndex + 1} / {imageCount}</span>
              <IconButton label="Следующее изображение" icon={<ChevronRight aria-hidden="true" />} onClick={() => select(activeIndex + 1)} />
            </div>
          ) : null}
        </div>
      </Dialog>
    </section>
  );
}
