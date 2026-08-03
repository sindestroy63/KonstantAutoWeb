import type { Car } from "@/types/catalog";

const MODEL_BENEFITS: Record<string, string[]> = {
  toyota_camry: ["Высокая ликвидность", "Доступное обслуживание", "Проверенная надёжность", "Комфорт в дальних поездках", "Большой выбор на рынке"],
  toyota_rav4: ["Практичный салон", "Удобная посадка", "Востребованность на вторичном рынке", "Универсальность в городе и поездках", "Широкий выбор комплектаций"],
  lexus_rx: ["Комфорт премиального класса", "Качественная отделка", "Плавность хода", "Стабильный спрос", "Подходит для города и путешествий"],
};

const BODY_BENEFITS: Record<Car["bodyType"], string[]> = {
  "Седан": ["Комфортная посадка", "Предсказуемые расходы", "Удобство в городе", "Сбалансированная управляемость", "Востребованный формат кузова"],
  "Кроссовер": ["Практичный салон", "Удобная посадка", "Универсальность", "Комфорт в городе", "Востребованность на рынке"],
  "Внедорожник": ["Просторный салон", "Высокая посадка", "Уверенность на разных покрытиях", "Вместительный багажник", "Подходит для дальних поездок"],
  "Пикап": ["Практичная грузовая платформа", "Прочная конструкция", "Высокая посадка", "Универсальность для работы и поездок", "Вместительная кабина"],
  "Хэтчбек": ["Компактные габариты", "Удобство в городе", "Практичный багажник", "Экономичность эксплуатации", "Манёвренность"],
};

export function getVehicleBenefits(car: Car): string[] {
  return MODEL_BENEFITS[car.slug] ?? BODY_BENEFITS[car.bodyType];
}

export function getRelatedCars(car: Car, cars: Car[], limit = 4): Car[] {
  return cars
    .filter((candidate) => candidate.slug !== car.slug)
    .map((candidate, index) => ({
      car: candidate,
      index,
      countryScore: candidate.country === car.country ? 1 : 0,
      bodyScore: candidate.bodyType === car.bodyType ? 1 : 0,
      priceDistance: Math.abs((candidate.budgetMin + candidate.budgetMax) / 2 - (car.budgetMin + car.budgetMax) / 2),
    }))
    .sort((a, b) =>
      b.countryScore - a.countryScore ||
      b.bodyScore - a.bodyScore ||
      a.priceDistance - b.priceDistance ||
      a.index - b.index,
    )
    .slice(0, limit)
    .map(({ car: related }) => related);
}
