import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PublicCar } from "@/types/catalog";
import { formatBenefit } from "@/lib/car-benefit";
import { LeadModalTrigger } from "@/components/leads/LeadModalTrigger";
import { CarImage } from "@/components/CarImage";

type CarCardProps = {
  car: PublicCar;
  className?: string;
  priority?: boolean;
};

export function CarCard({ car, className = "", priority = false }: CarCardProps) {
  return (
    <li className={`car-card group ${className}`}>
      <div className="car-card-media">
        <CarImage
          car={car}
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
          priority={priority}
          containPaddingClassName="p-0"
        />
        <div className="car-card-meta">
          <span>{car.country}</span>
          <span className="car-card-status"><i aria-hidden="true" />Под заказ</span>
        </div>
      </div>

      <div className="car-card-body">
        <div>
          <Link href={`/catalog/${car.slug}`} className="car-card-title">
            <h2>{car.brand} {car.model}</h2>
          </Link>
          <p className="mt-1.5 text-sm text-black/48">{car.bodyType}</p>
        </div>

        <p className="car-card-benefit">Выгода до {formatBenefit(car.benefit)} ₽</p>

        <div className="car-card-actions">
          <Link href={`/catalog/${car.slug}`} className="car-card-more">
            Подробнее <ArrowUpRight className="h-4 w-4" />
          </Link>
          <LeadModalTrigger
            mode="selection"
            className="cta-primary flex-1 px-4 py-3 text-sm"
            context={{
              source: "catalog-card",
              carSlug: car.slug,
              carName: `${car.brand} ${car.model}`,
            }}
          >
            Подобрать такую
          </LeadModalTrigger>
        </div>
      </div>
    </li>
  );
}
