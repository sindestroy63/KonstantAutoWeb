import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCarBySlug, getCarMedia, getCars } from "@/lib/catalog";
import { formatBenefit, getCarBenefit } from "@/lib/car-benefit";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbJsonLd, buildVehicleJsonLd } from "@/lib/structured-data";
import { getRelatedCars } from "@/lib/vehicle-detail";
import { VehicleDetailPageV2 } from "@/components/detail-v2/VehicleDetailPageV2";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  return getCars().map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = getCarBySlug(params.slug);
  if (!car) return { title: "Модель не найдена" };

  const title = `${car.brand} ${car.model} под заказ`;
  const description = `${car.brand} ${car.model} — пример варианта под заказ из ${car.country}. ${car.bodyType}. Потенциальная выгода до ${formatBenefit(getCarBenefit(car))} ₽ по сравнению с российским рынком. Импорт под ключ от KONSTANT AUTO, Самара.`;
  const media = getCarMedia(car);

  return {
    title,
    description,
    alternates: { canonical: `/catalog/${car.slug}` },
    openGraph: {
      title,
      description,
      url: `/catalog/${car.slug}`,
      ...(media ? { images: [{ url: media.src, alt: media.alt }] } : {}),
    },
  };
}

export default async function CarPage({ params }: Props) {
  const car = getCarBySlug(params.slug);
  if (!car) notFound();

  const media = getCarMedia(car);
  const relatedCars = getRelatedCars(car, getCars());

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Каталог", path: "/catalog" },
            { name: `${car.brand} ${car.model}`, path: `/catalog/${car.slug}` },
          ]),
          buildVehicleJsonLd(car, media?.src),
        ]}
      />
      <VehicleDetailPageV2 car={car} relatedCars={relatedCars} />
    </>
  );
}
