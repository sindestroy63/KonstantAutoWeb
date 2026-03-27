"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Car } from "@/types/catalog";
import { DEFAULT_CAR_IMAGES, getCarImageUrl } from "@/lib/catalog";
import { formatPrice, getDisplaySavings } from "@/lib/utils";
import { LeadModalTrigger } from "@/components/leads/LeadModalTrigger";

const AUTO_PLAY_MS = 4200;
const TRANSITION_MS = 520;

type HeroCarCarouselProps = {
  cars: Car[];
};

export function HeroCarCarousel({ cars }: HeroCarCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const [failedSlugs, setFailedSlugs] = useState<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = cars.length;

  const goNext = useCallback(() => {
    if (total === 0) return;
    setIsEntering(false);
    setCurrentIndex((index) => (index + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    if (total === 0) return;
    setIsEntering(false);
    setCurrentIndex((index) => (index - 1 + total) % total);
  }, [total]);

  const goTo = useCallback(
    (index: number) => {
      if (total === 0 || index === currentIndex) return;
      setIsEntering(false);
      setCurrentIndex(index);
    },
    [currentIndex, total]
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsEntering(true));
    return () => cancelAnimationFrame(frame);
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    intervalRef.current = setInterval(goNext, AUTO_PLAY_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [goNext, isPaused, total]);

  const handleImageError = useCallback(() => {
    const car = cars[currentIndex];
    if (!car) return;
    setFailedSlugs((prev) => new Set(prev).add(car.slug));
  }, [cars, currentIndex]);

  const car = cars[currentIndex];

  if (!car) {
    return (
      <div className="dark-card flex min-h-[420px] items-center justify-center p-8 text-slate-400">
        Нет данных для карусели
      </div>
    );
  }

  const imageUrl = failedSlugs.has(car.slug)
    ? (DEFAULT_CAR_IMAGES[car.bodyType] ?? DEFAULT_CAR_IMAGES["Седан"])
    : getCarImageUrl(car);
  const isLocalImage = imageUrl.startsWith("/");
  const benefitText = `Выгода до ${formatPrice(getDisplaySavings(car))} ₽`;

  return (
    <div
      className="group shine-overlay dark-card relative min-h-[470px] overflow-hidden rounded-[34px] p-4 sm:p-5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,76,76,0.1),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_30%)]" />

      <div
        key={currentIndex}
        className="relative h-[326px] overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] sm:h-[344px]"
        style={{
          opacity: isEntering ? 1 : 0,
          transform: isEntering ? "translateY(0)" : "translateY(12px)",
          transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
        }}
      >
        <Link href={`/catalog/${car.slug}`} className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,14,0.01)_0%,rgba(4,8,14,0.04)_72%,rgba(4,8,14,0.14)_100%)]" />
          {isLocalImage && !failedSlugs.has(car.slug) ? (
            <Image
              src={imageUrl}
              alt={`${car.brand} ${car.model}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain object-center transition-transform duration-700 group-hover:scale-[1.03]"
              onError={handleImageError}
              priority
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={`${car.brand} ${car.model}`}
              className="relative z-10 max-h-full w-auto object-contain"
              onError={handleImageError}
            />
          )}
        </Link>
      </div>

      <div className="mt-4 rounded-[24px] border border-white/10 bg-slate-950/[0.42] p-4 backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xl font-semibold text-white">
                {car.brand} {car.model}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {car.country} • {car.bodyType}
              </p>
            </div>
            <p className="text-sm font-medium text-red-200 sm:text-right">{benefitText}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/catalog/${car.slug}`}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.1]"
            >
              Подробнее
            </Link>
            <LeadModalTrigger
              mode="selection"
              className="cta-primary px-4 py-3 text-sm"
              prefill={{
                selection: {
                  model: `${car.brand} ${car.model}`,
                  carType: car.bodyType,
                  comment: `Интересует модель ${car.brand} ${car.model} с главного экрана.`,
                },
              }}
            >
              Оставить заявку
            </LeadModalTrigger>
          </div>
        </div>
      </div>

      {total > 1 ? (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              goPrev();
            }}
            className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-950/[0.48] text-white backdrop-blur-xl transition-colors hover:bg-slate-900/[0.72]"
            aria-label="Предыдущий слайд"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              goNext();
            }}
            className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-950/[0.48] text-white backdrop-blur-xl transition-colors hover:bg-slate-900/[0.72]"
            aria-label="Следующий слайд"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      ) : null}

      {total > 1 ? (
        <div className="mt-5 flex justify-center gap-2">
          {cars.map((item, index) => (
            <button
              key={item.slug}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                goTo(index);
              }}
              className={`h-2.5 rounded-full transition-all ${
                index === currentIndex ? "w-8 bg-red-400" : "w-2.5 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Слайд ${index + 1}`}
              aria-current={index === currentIndex ? "true" : undefined}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
