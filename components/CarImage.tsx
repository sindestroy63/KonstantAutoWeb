import Image from "next/image";
import type { Car, PublicCar } from "@/types/catalog";
import { getProductionAiImages } from "@/lib/production-ai-images";
import { VehicleMediaPlaceholder } from "@/components/VehicleMediaPlaceholder";

type CarImageData = Pick<Car, "slug" | "brand" | "model" | "bodyType" | "country" | "image"> | PublicCar;

type CarImageProps = {
  car: CarImageData;
  sizes: string;
  priority?: boolean;
  className?: string;
  containPaddingClassName?: string;
  mediaIndex?: number;
};

export function CarImage({ car, sizes, priority = false, className = "", containPaddingClassName = "p-5", mediaIndex = 0 }: CarImageProps) {
  const media = getProductionAiImages(car.slug)[mediaIndex];
  if (!media) {
    return <VehicleMediaPlaceholder vehicleName={`${car.brand} ${car.model}`} />;
  }
  return (
    <Image
      src={media.src}
      alt={`${car.brand} ${car.model}`}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-contain ${containPaddingClassName} ${className}`}
      style={{ objectPosition: "50% 50%" }}
    />
  );
}
