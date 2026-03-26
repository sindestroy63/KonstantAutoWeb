"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, MessageCircle, X } from "lucide-react";
import { BOT_START } from "@/lib/constants";
import {
  consultationTopicOptions,
  createEmptyConsultationPayload,
  createEmptySelectionPayload,
  mergeConsultationPrefill,
  mergeSelectionPrefill,
  selectionBudgetOptions,
  selectionCarTypeOptions,
  selectionConditionOptions,
  selectionDriveOptions,
  selectionTimelineOptions,
  selectionTransmissionOptions,
  validateConsultationPayload,
  validateSelectionPayload,
  type ConsultationPayload,
  type FieldErrors,
  type LeadMode,
  type LeadPrefill,
  type SelectionPayload,
} from "@/lib/leads";

type LeadModalProps = {
  isOpen: boolean;
  mode: LeadMode;
  prefill?: LeadPrefill;
  onClose: () => void;
};

const selectionSteps = [
  { title: "Контакт", caption: "Как к вам обратиться и где ответить" },
  { title: "Бюджет", caption: "Чтобы сразу держать подбор в рамках ожиданий" },
  { title: "Тип авто", caption: "Поможем сфокусировать подбор" },
  { title: "Предпочтения", caption: "Марка, состояние, коробка и привод" },
  { title: "Срок", caption: "Понимаем срочность и сценарий сделки" },
  { title: "Комментарий", caption: "Любые детали, которые важны вам" },
] as const;

type SubmitState = "idle" | "loading" | "success" | "error";

function StepBadge({ active, done, index }: { active: boolean; done: boolean; index: number }) {
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition-all ${
        active || done
          ? "border-red-500 bg-red-500 text-white shadow-[0_14px_30px_rgba(196,0,0,0.28)]"
          : "border-slate-200 bg-white text-slate-400"
      }`}
    >
      {done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
    </span>
  );
}

function OptionButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all ${
        active
          ? "border-red-500 bg-red-50 text-red-700 shadow-[0_14px_30px_rgba(196,0,0,0.08)]"
          : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-slate-950"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

function inputClass(hasError?: boolean) {
  return `w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 ${
    hasError
      ? "border-red-300 ring-2 ring-red-100"
      : "border-slate-200 focus:border-red-300 focus:ring-2 focus:ring-red-100"
  }`;
}

export function LeadModal({ isOpen, mode, prefill, onClose }: LeadModalProps) {
  const [activeMode, setActiveMode] = useState<LeadMode>(mode);
  const [selectionStep, setSelectionStep] = useState(0);
  const [selectionData, setSelectionData] = useState<SelectionPayload>(createEmptySelectionPayload);
  const [consultationData, setConsultationData] = useState<ConsultationPayload>(
    createEmptyConsultationPayload
  );
  const [selectionErrors, setSelectionErrors] = useState<FieldErrors<SelectionPayload>>({});
  const [consultationErrors, setConsultationErrors] = useState<FieldErrors<ConsultationPayload>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setActiveMode(mode);
    setSelectionStep(0);
    setSelectionErrors({});
    setConsultationErrors({});
    setSubmitState("idle");
    setSubmitMessage("");
    setSelectionData(mergeSelectionPrefill(createEmptySelectionPayload(), prefill?.selection));
    setConsultationData(
      mergeConsultationPrefill(createEmptyConsultationPayload(), prefill?.consultation)
    );
  }, [isOpen, mode, prefill]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const completion = useMemo(
    () => Math.round(((selectionStep + 1) / selectionSteps.length) * 100),
    [selectionStep]
  );

  if (!isOpen) {
    return null;
  }

  const isSelection = activeMode === "selection";
  const successBotLink = isSelection ? BOT_START.quiz : BOT_START.consult;

  function updateSelection<K extends keyof SelectionPayload>(key: K, value: SelectionPayload[K]) {
    setSelectionData((prev) => ({ ...prev, [key]: value }));
    setSelectionErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function updateConsultation<K extends keyof ConsultationPayload>(
    key: K,
    value: ConsultationPayload[K]
  ) {
    setConsultationData((prev) => ({ ...prev, [key]: value }));
    setConsultationErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validateSelectionStep(step: number) {
    const errors = validateSelectionPayload(selectionData);
    let partial: FieldErrors<SelectionPayload> = {};

    if (step === 0) {
      partial = { name: errors.name, contact: errors.contact };
    } else if (step === 1) {
      partial = { budget: errors.budget, budgetCustom: errors.budgetCustom };
    } else if (step === 2) {
      partial = { carType: errors.carType };
    } else if (step === 4) {
      partial = { timeline: errors.timeline };
    }

    const hasErrors = Object.values(partial).some(Boolean);
    setSelectionErrors((prev) => ({ ...prev, ...partial }));
    return !hasErrors;
  }

  async function handleSelectionSubmit() {
    const errors = validateSelectionPayload(selectionData);
    setSelectionErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorStep = [
        ["name", "contact"],
        ["budget", "budgetCustom"],
        ["carType"],
        [],
        ["timeline"],
        [],
      ].findIndex((fields) => fields.some((field) => errors[field as keyof SelectionPayload]));

      if (firstErrorStep >= 0) {
        setSelectionStep(firstErrorStep);
      }

      return;
    }

    try {
      setSubmitState("loading");
      setSubmitMessage("");

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "selection",
          data: selectionData,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Не удалось отправить заявку");
      }

      setSubmitState("success");
      setSubmitMessage("Заявка отправлена. Менеджер свяжется с вами в ближайшее время.");
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(
        error instanceof Error ? error.message : "Не удалось отправить заявку. Попробуйте ещё раз."
      );
    }
  }

  async function handleConsultationSubmit() {
    const errors = validateConsultationPayload(consultationData);
    setConsultationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setSubmitState("loading");
      setSubmitMessage("");

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "consultation",
          data: consultationData,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Не удалось отправить консультацию");
      }

      setSubmitState("success");
      setSubmitMessage("Заявка отправлена. Менеджер свяжется с вами в ближайшее время.");
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(
        error instanceof Error ? error.message : "Не удалось отправить заявку. Попробуйте ещё раз."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        aria-label="Закрыть окно"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={isSelection ? "Заявка на подбор авто" : "Консультация специалиста"}
        className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,249,252,0.96))] shadow-[0_40px_120px_rgba(15,23,42,0.24)]"
      >
        <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#101722_0%,#181f2d_100%)] p-6 text-white sm:p-8 lg:border-b-0 lg:border-r">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,86,86,0.22),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_24%)]" />
            <div className="relative">
              <div className="eyebrow">
                <span className="route-dot" />
                {isSelection ? "Заявка на подбор" : "Консультация специалиста"}
              </div>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight">
                {isSelection ? "Поможем подобрать автомобиль под ваш запрос" : "Ответим по процессу, выгоде и подбору"}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
                {isSelection
                  ? "Соберём короткий бриф, чтобы менеджер сразу написал по делу: с ориентиром по бюджету, типу автомобиля и срокам."
                  : "Короткий формат для вопросов по подбору, срокам, логистике, документам и расчёту выгоды."}
              </p>

              <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {isSelection ? "Форма в 6 шагов" : "Быстрый сценарий обращения"}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {isSelection
                        ? "Без длинной анкеты: только то, что нужно для первого расчёта."
                        : "Оставьте вопрос, и мы вернёмся с понятным ответом."}
                    </p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-red-200">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                </div>

                {isSelection ? (
                  <>
                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#ff6161,#c40000)] transition-all duration-500"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                    <div className="mt-5 space-y-3">
                      {selectionSteps.map((step, index) => {
                        const active = index === selectionStep;
                        const done = index < selectionStep;

                        return (
                          <div
                            key={step.title}
                            className={`flex items-start gap-3 rounded-[22px] border px-4 py-3 transition-all ${
                              active
                                ? "border-red-400/30 bg-white/[0.08]"
                                : "border-white/8 bg-white/[0.03]"
                            }`}
                          >
                            <StepBadge active={active} done={done} index={index} />
                            <div>
                              <p className={`text-sm font-medium ${active ? "text-white" : "text-slate-300"}`}>
                                {step.title}
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-slate-500">{step.caption}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="mt-6 space-y-3 text-sm text-slate-300">
                    <div className="rounded-[22px] border border-white/8 bg-white/[0.04] px-4 py-3">
                      Имя и удобный контакт
                    </div>
                    <div className="rounded-[22px] border border-white/8 bg-white/[0.04] px-4 py-3">
                      Тематика обращения
                    </div>
                    <div className="rounded-[22px] border border-white/8 bg-white/[0.04] px-4 py-3">
                      Короткий вопрос в свободной форме
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative bg-white p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode("selection");
                      setSubmitState("idle");
                      setSubmitMessage("");
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      isSelection
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Подбор авто
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode("consultation");
                      setSubmitState("idle");
                      setSubmitMessage("");
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      !isSelection
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Консультация
                  </button>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  {isSelection
                    ? `Шаг ${selectionStep + 1} из ${selectionSteps.length}`
                    : "Ответим по подбору, выгоде и процессу привоза"}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-red-200 hover:text-red-600"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitState === "success" ? (
              <div className="mt-8 rounded-[28px] border border-emerald-100 bg-emerald-50/80 p-6 sm:p-8">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-500 shadow-[0_18px_34px_rgba(16,185,129,0.18)]">
                  <CheckCircle2 className="h-7 w-7" />
                </span>
                <h3 className="mt-6 text-2xl font-semibold text-slate-950">Спасибо, запрос отправлен</h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
                  {submitMessage}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button type="button" className="cta-light" onClick={onClose}>
                    Закрыть окно
                  </button>
                  <a
                    href={successBotLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-primary text-sm"
                  >
                    Перейти в Telegram
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                {isSelection ? (
                  <>
                    {selectionStep === 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Имя" error={selectionErrors.name}>
                          <input
                            value={selectionData.name}
                            onChange={(event) => updateSelection("name", event.target.value)}
                            className={inputClass(Boolean(selectionErrors.name))}
                            placeholder="Как к вам обращаться"
                          />
                        </Field>
                        <Field label="Телефон или Telegram" error={selectionErrors.contact}>
                          <input
                            value={selectionData.contact}
                            onChange={(event) => updateSelection("contact", event.target.value)}
                            className={inputClass(Boolean(selectionErrors.contact))}
                            placeholder="+7 999 000 00 00 или @username"
                          />
                        </Field>
                        <Field label="Telegram username">
                          <input
                            value={selectionData.telegram}
                            onChange={(event) => updateSelection("telegram", event.target.value)}
                            className={inputClass()}
                            placeholder="@username"
                          />
                        </Field>
                      </div>
                    ) : null}

                    {selectionStep === 1 ? (
                      <div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {selectionBudgetOptions.map((option) => (
                            <OptionButton
                              key={option}
                              active={selectionData.budget === option}
                              onClick={() => updateSelection("budget", option)}
                            >
                              {option}
                            </OptionButton>
                          ))}
                        </div>
                        {selectionErrors.budget ? (
                          <p className="mt-2 text-xs font-medium text-red-600">{selectionErrors.budget}</p>
                        ) : null}
                        {selectionData.budget === "Свой вариант" ? (
                          <div className="mt-4">
                            <Field label="Свой вариант бюджета" error={selectionErrors.budgetCustom}>
                              <input
                                value={selectionData.budgetCustom}
                                onChange={(event) => updateSelection("budgetCustom", event.target.value)}
                                className={inputClass(Boolean(selectionErrors.budgetCustom))}
                                placeholder="Например: до 3.7 млн ₽"
                              />
                            </Field>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {selectionStep === 2 ? (
                      <div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {selectionCarTypeOptions.map((option) => (
                            <OptionButton
                              key={option}
                              active={selectionData.carType === option}
                              onClick={() => updateSelection("carType", option)}
                            >
                              {option}
                            </OptionButton>
                          ))}
                        </div>
                        {selectionErrors.carType ? (
                          <p className="mt-2 text-xs font-medium text-red-600">{selectionErrors.carType}</p>
                        ) : null}
                      </div>
                    ) : null}

                    {selectionStep === 3 ? (
                      <div className="space-y-5">
                        <Field label="Марка / модель">
                          <input
                            value={selectionData.model}
                            onChange={(event) => updateSelection("model", event.target.value)}
                            className={inputClass()}
                            placeholder="Например: Mazda CX-5 / BMW 3"
                          />
                        </Field>
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-slate-700">Состояние</p>
                          <div className="grid gap-3 sm:grid-cols-3">
                            {selectionConditionOptions.map((option) => (
                              <OptionButton
                                key={option}
                                active={selectionData.condition === option}
                                onClick={() => updateSelection("condition", option)}
                              >
                                {option}
                              </OptionButton>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-slate-700">Коробка передач</p>
                          <div className="grid gap-3 sm:grid-cols-3">
                            {selectionTransmissionOptions.map((option) => (
                              <OptionButton
                                key={option}
                                active={selectionData.transmission === option}
                                onClick={() => updateSelection("transmission", option)}
                              >
                                {option}
                              </OptionButton>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-slate-700">Привод</p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {selectionDriveOptions.map((option) => (
                              <OptionButton
                                key={option}
                                active={selectionData.drive === option}
                                onClick={() => updateSelection("drive", option)}
                              >
                                {option}
                              </OptionButton>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {selectionStep === 4 ? (
                      <div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {selectionTimelineOptions.map((option) => (
                            <OptionButton
                              key={option}
                              active={selectionData.timeline === option}
                              onClick={() => updateSelection("timeline", option)}
                            >
                              {option}
                            </OptionButton>
                          ))}
                        </div>
                        {selectionErrors.timeline ? (
                          <p className="mt-2 text-xs font-medium text-red-600">{selectionErrors.timeline}</p>
                        ) : null}
                      </div>
                    ) : null}

                    {selectionStep === 5 ? (
                      <Field label="Комментарий / пожелания">
                        <textarea
                          value={selectionData.comment}
                          onChange={(event) => updateSelection("comment", event.target.value)}
                          className={`${inputClass()} min-h-[160px] resize-none`}
                          placeholder="Например: нужен живой вариант без сюрпризов, приоритет Китай или Корея."
                        />
                      </Field>
                    ) : null}
                  </>
                ) : (
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Имя" error={consultationErrors.name}>
                        <input
                          value={consultationData.name}
                          onChange={(event) => updateConsultation("name", event.target.value)}
                          className={inputClass(Boolean(consultationErrors.name))}
                          placeholder="Как к вам обращаться"
                        />
                      </Field>
                      <Field label="Телефон или Telegram" error={consultationErrors.contact}>
                        <input
                          value={consultationData.contact}
                          onChange={(event) => updateConsultation("contact", event.target.value)}
                          className={inputClass(Boolean(consultationErrors.contact))}
                          placeholder="+7 999 000 00 00 или @username"
                        />
                      </Field>
                    </div>
                    <Field label="Telegram username">
                      <input
                        value={consultationData.telegram}
                        onChange={(event) => updateConsultation("telegram", event.target.value)}
                        className={inputClass()}
                        placeholder="@username"
                      />
                    </Field>
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-700">Тематика</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {consultationTopicOptions.map((option) => (
                          <OptionButton
                            key={option}
                            active={consultationData.topic === option}
                            onClick={() => updateConsultation("topic", option)}
                          >
                            {option}
                          </OptionButton>
                        ))}
                      </div>
                      {consultationErrors.topic ? (
                        <p className="text-xs font-medium text-red-600">{consultationErrors.topic}</p>
                      ) : null}
                    </div>
                    <Field label="Ваш вопрос" error={consultationErrors.question}>
                      <textarea
                        value={consultationData.question}
                        onChange={(event) => updateConsultation("question", event.target.value)}
                        className={`${inputClass(Boolean(consultationErrors.question))} min-h-[180px] resize-none`}
                        placeholder="Например: Ищу BMW 3 из Китая, бюджет до 3 млн. Реально ли найти живой вариант?"
                      />
                    </Field>
                  </div>
                )}

                {submitState === "error" ? (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submitMessage}
                  </div>
                ) : null}

                <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  {isSelection ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectionStep((prev) => Math.max(prev - 1, 0))}
                        className="cta-light px-5 py-3 text-sm"
                        disabled={selectionStep === 0 || submitState === "loading"}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад
                      </button>
                      {selectionStep < selectionSteps.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (validateSelectionStep(selectionStep)) {
                              setSelectionStep((prev) => Math.min(prev + 1, selectionSteps.length - 1));
                            }
                          }}
                          className="cta-primary px-5 py-3 text-sm"
                          disabled={submitState === "loading"}
                        >
                          Далее
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSelectionSubmit}
                          className="cta-primary px-5 py-3 text-sm"
                          disabled={submitState === "loading"}
                        >
                          {submitState === "loading" ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Отправляем
                            </>
                          ) : (
                            "Отправить заявку"
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConsultationSubmit}
                      className="cta-primary px-5 py-3 text-sm"
                      disabled={submitState === "loading"}
                    >
                      {submitState === "loading" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Отправляем
                        </>
                      ) : (
                        "Получить консультацию"
                      )}
                    </button>
                  )}

                  <p className="max-w-sm text-sm leading-relaxed text-slate-500">
                    Отправка идёт напрямую в рабочий Telegram-чат. Менеджер видит детали заявки сразу после отправки.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
