import type {
  ConsultationPayload,
  ContactMethod,
  SelectionPayload,
} from "@/lib/leads";

export type LeadSource =
  | "header"
  | "hero"
  | "home-cta"
  | "catalog-card"
  | "vehicle-page"
  | "contacts";

export type LeadContext = {
  source: LeadSource;
  carSlug?: string;
  carName?: string;
  consultationTopic?: string;
};

export type SelectionAnswers = {
  name: string;
  phone: string;
  contactMethod: ContactMethod | null;
  telegram: string;
  budget: string | null;
  timeline: string | null;
  bodyType: string | null;
  brands: string[];
  requestedModel: string;
  condition: string | null;
  transmission: string | null;
  drivetrain: string | null;
  priorities: string[];
  comment: string;
  consent: boolean;
};

export type SelectionAnswerErrors = Partial<Record<keyof SelectionAnswers, string>>;

export const budgetOptions = [
  "до 2 млн ₽",
  "2–3 млн ₽",
  "3–5 млн ₽",
  "5–7 млн ₽",
  "от 7 млн ₽",
  "Пока не определился",
] as const;

export const timelineOptions = [
  "Как можно скорее",
  "В течение месяца",
  "1–3 месяца",
  "Позже",
  "Пока изучаю варианты",
] as const;

export const bodyTypeOptions = [
  "Кроссовер",
  "Внедорожник",
  "Седан",
  "Универсал",
  "Минивэн",
  "Пикап",
  "Хэтчбек",
  "Купе",
  "Не определился",
] as const;

export const brandOptions = [
  "Toyota",
  "Lexus",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Kia",
  "Hyundai",
  "Китайские марки",
  "Рассмотрю любые",
] as const;

export const conditionOptions = [
  "Новый",
  "С пробегом",
  "Оба варианта",
  "Не принципиально",
] as const;

export const transmissionOptions = [
  "Автоматическая",
  "Механическая",
  "Робот",
  "Вариатор",
  "Не принципиально",
] as const;

export const drivetrainOptions = [
  "Передний",
  "Задний",
  "Полный",
  "Не принципиально",
] as const;

export const priorityOptions = [
  "Минимальный пробег",
  "Богатая комплектация",
  "Левый руль",
  "Полный привод",
  "Минимальная стоимость",
  "Максимальная ликвидность",
  "Семейный автомобиль",
  "Динамичный автомобиль",
] as const;

export function createEmptySelectionAnswers(): SelectionAnswers {
  return {
    name: "",
    phone: "",
    contactMethod: null,
    telegram: "",
    budget: null,
    timeline: null,
    bodyType: null,
    brands: [],
    requestedModel: "",
    condition: null,
    transmission: null,
    drivetrain: null,
    priorities: [],
    comment: "",
    consent: false,
  };
}

const sourceLabels: Record<LeadSource, string> = {
  header: "Шапка сайта",
  hero: "Первый экран",
  "home-cta": "CTA на главной",
  "catalog-card": "Карточка каталога",
  "vehicle-page": "Страница автомобиля",
  contacts: "Страница контактов",
};

export function buildSelectionPayload(
  answers: SelectionAnswers,
  context?: LeadContext
): SelectionPayload {
  const modelParts = [answers.brands.join(", "), answers.requestedModel.trim()].filter(Boolean);
  const commentParts = [
    context?.carName
      ? `Контекст заявки: ${context.carName}${context.carSlug ? ` (${context.carSlug})` : ""}.`
      : null,
    context ? `Источник: ${sourceLabels[context.source]}.` : null,
    answers.priorities.length > 0
      ? `Приоритеты: ${answers.priorities.join(", ")}.`
      : null,
    answers.comment.trim() || null,
  ].filter((value): value is string => Boolean(value));

  return {
    name: answers.name,
    phone: answers.phone,
    contactMethod: answers.contactMethod ?? "",
    telegram: answers.telegram,
    budget: answers.budget ?? "",
    budgetCustom: "",
    carType: answers.bodyType ?? "",
    model: modelParts.join("; "),
    condition: answers.condition ?? "",
    transmission: answers.transmission ?? "",
    drive: answers.drivetrain ?? "",
    timeline: answers.timeline ?? "",
    comment: commentParts.join("\n").slice(0, 2_000),
    consent: answers.consent,
  };
}

export function createConsultationFromContext(context?: LeadContext): ConsultationPayload {
  return {
    name: "",
    phone: "",
    contactMethod: "",
    telegram: "",
    topic: context?.consultationTopic ?? "",
    question: "",
    consent: false,
  };
}
