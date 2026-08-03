export type Country =
  | "Китай"
  | "Корея"
  | "Япония"
  | "США"
  | "Европа"
  | "ОАЭ"
  | "Россия"
  | "РФ";

export type BodyType =
  | "Седан"
  | "Кроссовер"
  | "Внедорожник"
  | "Пикап"
  | "Хэтчбек";

export interface Car {
  slug: string;
  brand: string;
  model: string;
  bodyType: BodyType;
  country: Country;
  budgetMin: number;
  budgetMax: number;
  savingsUpTo: number;
  image?: string;
}

export type PublicCar = Omit<Car, "budgetMin" | "budgetMax" | "savingsUpTo"> & {
  benefit: number;
};
