import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCars } from "@/lib/catalog";
import { CarCard } from "@/components/CarCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionRouteLayer } from "@/components/ui/SectionRouteLayer";

const PER_PAGE = 12;

export function CatalogPreviewSection() {
  const items = getCars().slice(0, PER_PAGE);

  return (
    <section id="catalog-preview" className="section-light">
      <SectionRouteLayer pattern="gamma" />
      <div className="container relative z-10 mx-auto px-4 py-16 sm:py-20 lg:py-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <div className="eyebrow-light">
              <span className="route-dot" />
              Каталог вариантов под заказ
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Живой каталог с понятной логикой просмотра
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Модели, которые мы подбираем и привозим под ваш запрос. По каждой интересующей машине можно
              сразу оставить заявку и получить расчёт выгоды.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <Link href="/catalog" className="cta-light gap-2 self-start lg:self-auto">
              Открыть весь каталог
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((car, index) => (
            <Reveal key={car.slug} delay={index * 45}>
              <CarCard car={car} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
