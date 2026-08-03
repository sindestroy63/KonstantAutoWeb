export type LeadMode = "selection" | "consultation";
export type ContactMethod = "MAX" | "WhatsApp" | "Telegram";

export type SelectionPayload = {
  name: string;
  phone: string;
  contactMethod: ContactMethod | "";
  telegram: string;
  budget: string;
  budgetCustom: string;
  carType: string;
  model: string;
  condition: string;
  transmission: string;
  drive: string;
  timeline: string;
  comment: string;
  consent: boolean;
};

export type ConsultationPayload = {
  name: string;
  phone: string;
  contactMethod: ContactMethod | "";
  telegram: string;
  topic: string;
  question: string;
  consent: boolean;
};

export type LeadPrefill = {
  selection?: Partial<SelectionPayload>;
  consultation?: Partial<ConsultationPayload>;
};

export type LeadRequestBody =
  | { kind: "selection"; data: SelectionPayload }
  | { kind: "consultation"; data: ConsultationPayload };

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export const contactMethodOptions: ContactMethod[] = ["MAX", "WhatsApp", "Telegram"];

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(
  data: UnknownRecord,
  key: string,
  maxLength: number
): string | undefined {
  const value = data[key];
  return typeof value === "string" && value.length <= maxLength ? value : undefined;
}

function parseSelectionPayload(value: unknown): SelectionPayload | null {
  if (!isRecord(value)) return null;

  const data = {
    name: readString(value, "name", 100),
    phone: readString(value, "phone", 32),
    contactMethod: readString(value, "contactMethod", 16),
    telegram: readString(value, "telegram", 64),
    budget: readString(value, "budget", 100),
    budgetCustom: readString(value, "budgetCustom", 100),
    carType: readString(value, "carType", 100),
    model: readString(value, "model", 160),
    condition: readString(value, "condition", 80),
    transmission: readString(value, "transmission", 40),
    drive: readString(value, "drive", 40),
    timeline: readString(value, "timeline", 80),
    comment: readString(value, "comment", 2_000),
  };

  if (Object.values(data).some((field) => field === undefined)) return null;
  if (
    data.contactMethod !== "" &&
    !contactMethodOptions.includes(data.contactMethod as ContactMethod)
  ) {
    return null;
  }
  if (typeof value.consent !== "boolean") return null;

  return {
    ...(data as Omit<SelectionPayload, "consent" | "contactMethod">),
    contactMethod: data.contactMethod as ContactMethod | "",
    consent: value.consent,
  };
}

function parseConsultationPayload(value: unknown): ConsultationPayload | null {
  if (!isRecord(value)) return null;

  const data = {
    name: readString(value, "name", 100),
    phone: readString(value, "phone", 32),
    contactMethod: readString(value, "contactMethod", 16),
    telegram: readString(value, "telegram", 64),
    topic: readString(value, "topic", 160),
    question: readString(value, "question", 2_000),
  };

  if (Object.values(data).some((field) => field === undefined)) return null;
  if (
    data.contactMethod !== "" &&
    !contactMethodOptions.includes(data.contactMethod as ContactMethod)
  ) {
    return null;
  }
  if (typeof value.consent !== "boolean") return null;

  return {
    ...(data as Omit<ConsultationPayload, "consent" | "contactMethod">),
    contactMethod: data.contactMethod as ContactMethod | "",
    consent: value.consent,
  };
}

export function parseLeadRequestBody(value: unknown): LeadRequestBody | null {
  if (!isRecord(value)) return null;

  if (value.kind === "selection") {
    const data = parseSelectionPayload(value.data);
    return data ? { kind: "selection", data } : null;
  }

  if (value.kind === "consultation") {
    const data = parseConsultationPayload(value.data);
    return data ? { kind: "consultation", data } : null;
  }

  return null;
}

export const selectionBudgetOptions = [
  "до 2 млн ₽",
  "2–3 млн ₽",
  "3–5 млн ₽",
  "5+ млн ₽",
  "Свой вариант",
] as const;

export const selectionCarTypeOptions = [
  "Седан",
  "Кроссовер",
  "Внедорожник",
  "Пикап",
  "Минивэн",
  "Хэтчбек",
  "Не определился",
] as const;

export const selectionConditionOptions = [
  "Новый",
  "Можно с пробегом",
  "Не принципиально",
] as const;

export const selectionTransmissionOptions = [
  "АКПП",
  "МКПП",
  "Не принципиально",
] as const;

export const selectionDriveOptions = [
  "Передний",
  "Задний",
  "Полный",
  "Не принципиально",
] as const;

export const selectionTimelineOptions = [
  "Срочно",
  "В течение месяца",
  "В течение 2–3 месяцев",
  "Пока изучаю",
] as const;

export const consultationTopicOptions = [
  "Помочь с выбором авто",
  "Подобрать авто под бюджет",
  "Рассчитать выгоду",
  "Объяснить процесс привоза",
  "Сроки и логистика",
  "Таможня и документы",
  "Другое",
] as const;

export function createEmptySelectionPayload(): SelectionPayload {
  return {
    name: "",
    phone: "",
    contactMethod: "",
    telegram: "",
    budget: "",
    budgetCustom: "",
    carType: "",
    model: "",
    condition: "",
    transmission: "",
    drive: "",
    timeline: "",
    comment: "",
    consent: false,
  };
}

export function createEmptyConsultationPayload(): ConsultationPayload {
  return {
    name: "",
    phone: "",
    contactMethod: "",
    telegram: "",
    topic: "",
    question: "",
    consent: false,
  };
}

export function mergeSelectionPrefill(
  payload: SelectionPayload,
  prefill?: Partial<SelectionPayload>
): SelectionPayload {
  return {
    ...payload,
    ...prefill,
  };
}

export function mergeConsultationPrefill(
  payload: ConsultationPayload,
  prefill?: Partial<ConsultationPayload>
): ConsultationPayload {
  return {
    ...payload,
    ...prefill,
  };
}

function normalizeText(value: string | undefined | null): string {
  return value?.trim() ?? "";
}

export function getTelegramDisplay(value: string): string {
  const trimmed = normalizeText(value);
  if (!trimmed) return "Не указано";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed.replace(/^@+/, "")}`;
}

export function getLeadValue(value: string): string {
  const trimmed = normalizeText(value);
  return trimmed || "Не указано";
}

export function getBudgetLabel(data: Pick<SelectionPayload, "budget" | "budgetCustom">): string {
  if (data.budget === "Свой вариант") {
    return getLeadValue(data.budgetCustom);
  }

  return getLeadValue(data.budget);
}

export function validateSelectionPayload(data: SelectionPayload): FieldErrors<SelectionPayload> {
  const errors: FieldErrors<SelectionPayload> = {};

  if (normalizeText(data.name).length < 2) {
    errors.name = "Укажите имя";
  }

  if (normalizeText(data.phone).replace(/\D/g, "").length < 11) {
    errors.phone = "Укажите номер телефона";
  }

  if (!normalizeText(data.contactMethod)) {
    errors.contactMethod = "Выберите удобный способ связи";
  }

  if (!normalizeText(data.budget)) {
    errors.budget = "Выберите бюджет";
  }

  if (data.budget === "Свой вариант" && normalizeText(data.budgetCustom).length < 2) {
    errors.budgetCustom = "Укажите свой бюджет";
  }

  if (!normalizeText(data.carType)) {
    errors.carType = "Выберите тип автомобиля";
  }

  if (!normalizeText(data.timeline)) {
    errors.timeline = "Выберите срок покупки";
  }

  if (!data.consent) {
    errors.consent = "Нужно согласие с политикой конфиденциальности";
  }

  return errors;
}

export function validateConsultationPayload(
  data: ConsultationPayload
): FieldErrors<ConsultationPayload> {
  const errors: FieldErrors<ConsultationPayload> = {};

  if (normalizeText(data.name).length < 2) {
    errors.name = "Укажите имя";
  }

  if (normalizeText(data.phone).replace(/\D/g, "").length < 11) {
    errors.phone = "Укажите номер телефона";
  }

  if (!normalizeText(data.contactMethod)) {
    errors.contactMethod = "Выберите удобный способ связи";
  }

  if (!normalizeText(data.topic)) {
    errors.topic = "Выберите тематику";
  }

  if (normalizeText(data.question).length < 6) {
    errors.question = "Коротко опишите вопрос";
  }

  if (!data.consent) {
    errors.consent = "Нужно согласие с политикой конфиденциальности";
  }

  return errors;
}

export function formatSelectionLeadMessage(data: SelectionPayload): string {
  const lines = [
    "🚗 Заявка на подбор",
    "",
    `👤 Имя: ${getLeadValue(data.name)}`,
    `📞 Телефон: ${getLeadValue(data.phone)}`,
    `💬 Предпочтительный способ связи: ${getLeadValue(data.contactMethod)}`,
    `🔗 Telegram username: ${getTelegramDisplay(data.telegram)}`,
    "",
    `💰 Бюджет: ${getBudgetLabel(data)}`,
    `🚘 Тип авто: ${getLeadValue(data.carType)}`,
    `🏷 Марка / модель: ${getLeadValue(data.model)}`,
    `📅 Состояние: ${getLeadValue(data.condition)}`,
    `⚙ КПП: ${getLeadValue(data.transmission)}`,
    `🛞 Привод: ${getLeadValue(data.drive)}`,
    `⏳ Срок покупки: ${getLeadValue(data.timeline)}`,
    "",
    "📝 Комментарий:",
    getLeadValue(data.comment),
  ];

  return lines.join("\n");
}

export function formatConsultationLeadMessage(data: ConsultationPayload): string {
  const lines = [
    "📞 Консультация",
    "",
    `👤 Имя: ${getLeadValue(data.name)}`,
    `📞 Телефон: ${getLeadValue(data.phone)}`,
    `💬 Предпочтительный способ связи: ${getLeadValue(data.contactMethod)}`,
    `🔗 Telegram username: ${getTelegramDisplay(data.telegram)}`,
    "",
    `🧩 Тематика: ${getLeadValue(data.topic)}`,
    "",
    "❓ Вопрос:",
    getLeadValue(data.question),
  ];

  return lines.join("\n");
}
