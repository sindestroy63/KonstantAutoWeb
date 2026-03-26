import Image from "next/image";
import Link from "next/link";
import type { Car } from "@/types/catalog";
import { getCarImageUrl } from "@/lib/catalog";
import { formatPrice, getDisplaySavings } from "@/lib/utils";
import { LeadModalTrigger } from "@/components/leads/LeadModalTrigger";

type CarCardProps = {
  car: Car;
  className?: string;
};

export function CarCard({ car, className = "" }: CarCardProps) {
  const imageUrl = getCarImageUrl(car);
  const savings = getDisplaySavings(car);

  return (
    <li className={`shine-overlay tilt-card light-card group overflow-hidden rounded-[28px] ${className}`}>
      <Link href={`/catalog/${car.slug}`} className="block">
        <div className="relative h-56 overflow-hidden bg-[linear-gradient(180deg,#f2f4f8_0%,#e9eef5_100%)]">
          <Image
            src={imageUrl}
            alt={`${car.brand} ${car.model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(15,23,42,0.4)_100%)]" />
          <div className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 backdrop-blur-xl">
            {car.country}
          </div>
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/catalog/${car.slug}`} className="block">
              <h2 className="text-xl font-semibold text-slate-950 transition-colors hover:text-red-600">
                {car.brand} {car.model}
              </h2>
            </Link>
            <p className="mt-1 text-sm text-slate-500">{car.bodyType}</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
            import
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Выгода до {formatPrice(savings)} ₽ по сравнению с рынком РФ
        </p>

        <div className="mt-5 flex gap-3">
          <Link
            href={`/catalog/${car.slug}`}
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-red-200 hover:text-red-600"
          >
            Подробнее
          </Link>
          <LeadModalTrigger
            mode="selection"
            className="cta-primary flex-1 px-4 py-3 text-sm"
            prefill={{
              selection: {
                model: `${car.brand} ${car.model}`,
                carType: car.bodyType,
                comment: `Интересует модель ${car.brand} ${car.model} из каталога.`,
              },
            }}
          >
            Оставить заявку
          </LeadModalTrigger>
        </div>
      </div>
    </li>
  );
}
