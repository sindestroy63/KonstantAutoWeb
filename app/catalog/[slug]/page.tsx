import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { getCarBySlug, getCarImageUrl, getCars } from "@/lib/catalog";
import { BRAND } from "@/lib/constants";
import { formatPrice, getDisplaySavings } from "@/lib/utils";
import { LeadModalTrigger } from "@/components/leads/LeadModalTrigger";
import { SectionRouteLayer } from "@/components/ui/SectionRouteLayer";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const cars = getCars();
  return cars.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const car = getCarBySlug(slug);

  if (!car) {
    return { title: "Модель не найдена" };
  }

  const title = `${car.brand} ${car.model} под заказ`;
  const description = `${car.brand} ${car.model} — пример варианта под заказ из ${car.country}. ${car.bodyType}. Выгода до ${formatPrice(getDisplaySavings(car))} ₽. Импорт под ключ от KONSTANT AUTO, Самара.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function CarPage({ params }: Props) {
  const { slug } = await params;
  const car = getCarBySlug(slug);

  if (!car) {
    notFound();
  }

  const savings = getDisplaySavings(car);

  return (
    <div className="section-light min-h-screen border-t border-slate-200/80">
      <SectionRouteLayer pattern="beta" />
      <div className="container relative z-10 mx-auto px-4 py-10 sm:py-12">
        <nav className="mb-8">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-red-200 hover:text-red-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Каталог
          </Link>
        </nav>

        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="light-card overflow-hidden rounded-[32px] p-4 sm:p-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#f2f4f8_0%,#e9eef5_100%)]">
              <Image
                src={getCarImageUrl(car)}
                alt={`${car.brand} ${car.model}`}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(15,23,42,0.42)_100%)]" />
              <div className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 backdrop-blur-xl">
                {car.country}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="light-card rounded-[32px] p-6 sm:p-8">
              <div className="eyebrow-light">
                <span className="route-dot" />
                Карточка автомобиля
              </div>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {car.brand} {car.model}
              </h1>
              <p className="mt-3 text-base text-slate-500">
                {car.bodyType} • {car.country}
              </p>

              <div className="mt-6 rounded-[24px] border border-red-100 bg-red-50 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-red-500">Выгода</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">до {formatPrice(savings)} ₽</p>
                <p className="mt-2 text-sm text-slate-600">по сравнению с рынком РФ</p>
              </div>

              <div className="mt-8 space-y-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                <p>
                  {car.brand} {car.model} — один из популярных вариантов под заказ при импорте из{" "}
                  {car.country}. Мы подбираем автомобиль под ваши критерии по бюджету и комплектации,
                  проверяем историю и состояние, организуем покупку, логистику и таможенное оформление.
                </p>
                <p>
                  Это не авто «в наличии»: мы привозим под заказ с полным сопровождением до выдачи
                  ключей. Оставьте заявку на сайте — подберём актуальные варианты и вернёмся с расчётом
                  под ваш запрос.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <LeadModalTrigger
                  mode="selection"
                  className="cta-primary"
                  prefill={{
                    selection: {
                      model: `${car.brand} ${car.model}`,
                      carType: car.bodyType,
                      comment: `Интересует модель ${car.brand} ${car.model} из каталога.`,
                    },
                  }}
                >
                  Хочу такую — оставить заявку
                </LeadModalTrigger>
                <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-500 sm:flex">
                  <Sparkles className="h-3.5 w-3.5 text-red-500" />
                  Под заказ
                </span>
              </div>
            </div>

            <div className="light-card flex items-center gap-4 rounded-[32px] p-5">
              <Image src={BRAND.signBlack} alt="" width={30} height={30} className="object-contain" />
              <p className="text-sm leading-relaxed text-slate-500">
                Маршрут сделки ведём под ключ: подбор, осмотр, документы, логистика, таможня,
                доставка и выдача автомобиля.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
