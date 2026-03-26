export const HERO_CAR_SLIDES = [
  {
    key: "ram",
    brand: "RAM",
    model: "Trucks",
    imageSrc: "/hero-cars/ram.png",
    benefitText: "Выгода до 1 200 000 ₽",
  },
  {
    key: "bmw-x7",
    brand: "BMW",
    model: "X7",
    imageSrc: "/hero-cars/bmw-x7.png",
    benefitText: "Выгода до 1 500 000 ₽",
  },
  {
    key: "toyota-land-cruiser",
    brand: "Toyota",
    model: "Land Cruiser",
    imageSrc: "/hero-cars/toyota-land-cruiser.png",
    benefitText: "Выгода до 400 000 ₽",
  },
  {
    key: "toyota-camry",
    brand: "Toyota",
    model: "Camry",
    imageSrc: "/hero-cars/toyota-camry.png",
    benefitText: "Выгода до 150 000 ₽",
  },
] as const;

/** Fallback image when hero PNG fails to load (e.g. file not yet added) */
export const HERO_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80";
