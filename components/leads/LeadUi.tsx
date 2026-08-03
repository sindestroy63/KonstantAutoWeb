"use client";

import type { ReactNode } from "react";
import { Check, ChevronLeft, Loader2, X } from "lucide-react";
import type { LeadMode } from "@/lib/leads";
import { leadTokens } from "@/components/leads/design-tokens";

export const selectionSteps = [
  { title: "Контакты", caption: "Как с вами связаться" },
  { title: "Бюджет", caption: "Рамки поиска" },
  { title: "Срок покупки", caption: "Когда начинать подбор" },
  { title: "Тип автомобиля", caption: "Подходящий кузов" },
  { title: "Марка и модель", caption: "Ориентиры для поиска" },
  { title: "Состояние", caption: "Новый или с пробегом" },
  { title: "Коробка передач", caption: "Предпочтительный тип трансмиссии" },
  { title: "Привод", caption: "Подходящая схема привода" },
  { title: "Пожелания", caption: "Финальные детали заявки" },
] as const;

export const consultationSteps = [
  { title: "Контакты", caption: "Как с вами связаться" },
  { title: "Тема консультации", caption: "С чем нужна помощь" },
  { title: "Ваш вопрос", caption: "Коротко опишите ситуацию" },
  { title: "Итог", caption: "Проверьте данные заявки" },
] as const;

export function getLeadSteps(mode: LeadMode) {
  return mode === "selection" ? selectionSteps : consultationSteps;
}

export function LeadField({
  label,
  error,
  fieldKey,
  children,
}: {
  label: string;
  error?: string;
  fieldKey?: string;
  children: ReactNode;
}) {
  return (
    <label className="block" data-field={fieldKey}>
      <span className="mb-2.5 block text-[13px] font-medium text-white/72">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-xs font-medium text-[#ff5a60]">{error}</span> : null}
    </label>
  );
}

export function leadInputClass(hasError = false) {
  return `min-h-14 w-full rounded-[14px] border bg-white/[0.055] px-4 text-[16px] text-white outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-white/30 hover:bg-white/[0.075] focus:bg-white/[0.075] ${
    hasError
      ? "border-[#ff5a60] focus:ring-2 focus:ring-[#ff3b42]/20"
      : "border-white/[0.13] focus:border-white/35 focus:ring-2 focus:ring-white/[0.06]"
  }`;
}

export function ChoiceCard({
  active,
  children,
  onClick,
  disabled = false,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      data-choice-card="true"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`group relative flex min-h-[62px] items-center justify-between gap-3 rounded-[14px] border px-4 py-3.5 text-left text-sm font-medium ${leadTokens.transition} ${leadTokens.focus} disabled:cursor-not-allowed disabled:opacity-35 active:scale-[0.985] ${
        active
          ? "border-[#e31b23] bg-[#e31b23] text-white shadow-[0_12px_28px_rgba(227,27,35,0.2)]"
          : "border-white/[0.12] bg-white/[0.045] text-white/72 hover:border-white/25 hover:bg-white/[0.075] hover:text-white"
      }`}
    >
      <span>{children}</span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${leadTokens.transition} ${
          active ? "border-white bg-white text-[#e31b23]" : "border-white/20 text-transparent group-hover:border-white/40"
        }`}
        aria-hidden="true"
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    </button>
  );
}

export function ChoiceGrid({ children, columns = 2 }: { children: ReactNode; columns?: 2 | 3 }) {
  return (
    <div className={`grid gap-2.5 ${columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
      {children}
    </div>
  );
}

export function LeadSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="mb-3 text-[13px] font-medium text-white/62">{title}</h4>
      {children}
    </section>
  );
}

export function LeadSummary({
  items,
  context,
}: {
  items: Array<[string, string]>;
  context?: string;
}) {
  const visibleItems = items.filter(([, value]) => Boolean(value.trim()));

  return (
    <section className="rounded-[18px] border border-white/[0.1] bg-black/20 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-sm font-medium text-white">Ваш запрос</h4>
        <span className="text-xs text-white/38">{visibleItems.length} параметров</span>
      </div>
      {context ? (
        <p className="mt-4 rounded-[12px] bg-white/[0.05] px-3 py-2.5 text-sm text-white/68">
          Контекст: {context}
        </p>
      ) : null}
      <dl className="mt-2 grid gap-x-6 sm:grid-cols-2">
        {visibleItems.map(([label, value]) => (
          <div key={label} className="min-w-0 border-t border-white/[0.08] py-3">
            <dt className="text-[11px] text-white/35">{label}</dt>
            <dd className="mt-1 break-words text-sm leading-5 text-white/78">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function LeadHeader({
  mode,
  step,
  onModeChange,
  onClose,
}: {
  mode: LeadMode;
  step: number;
  onModeChange: (mode: LeadMode) => void;
  onClose: () => void;
}) {
  const steps = getLeadSteps(mode);

  return (
    <header className="lead-safe-top shrink-0 border-b border-white/[0.1] bg-[#111417]/95 px-4 pb-4 backdrop-blur-xl sm:px-7 sm:pb-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff3b42]">
            KONSTANT AUTO
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-white sm:text-2xl">
            {steps[step].title}
          </h3>
          <p className="mt-1 text-sm text-white/45">
            {steps[step].caption}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.045] text-white/58 hover:border-white/25 hover:bg-white/[0.08] hover:text-white ${leadTokens.transition} ${leadTokens.focus}`}
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="grid min-w-0 flex-1 grid-cols-2 rounded-full border border-white/[0.1] bg-black/20 p-1">
          {(["selection", "consultation"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onModeChange(item)}
              aria-pressed={mode === item}
              className={`min-h-9 rounded-full px-3 text-xs font-medium ${leadTokens.transition} ${leadTokens.focus} ${
                mode === item ? "bg-white text-[#111417]" : "text-white/45 hover:text-white/80"
              }`}
            >
              {item === "selection" ? "Подбор авто" : "Консультация"}
            </button>
          ))}
        </div>
        <span className="shrink-0 text-sm text-white/55" aria-label={`Шаг ${step + 1} из ${steps.length}`}>
          Шаг <span className="text-white">{step + 1}</span> из {steps.length}
        </span>
      </div>

      <div className="mt-4 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }} aria-hidden="true">
          {steps.map((item, index) => (
            <span
              key={item.title}
              className={`h-1 rounded-full ${leadTokens.transition} ${index <= step ? "bg-[#e31b23]" : "bg-white/[0.1]"}`}
            />
          ))}
      </div>
    </header>
  );
}

export function LeadFooter({
  mode,
  step,
  loading,
  onBack,
  onNext,
  onSubmit,
}: {
  mode: LeadMode;
  step: number;
  loading: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  const finalStep = step === getLeadSteps(mode).length - 1;

  return (
    <footer className="lead-safe-bottom shrink-0 border-t border-white/[0.1] bg-[#111417]/95 px-4 pt-4 backdrop-blur-xl sm:px-7 sm:pt-5">
      <div className="flex items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] border border-white/[0.14] bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white disabled:opacity-40 ${leadTokens.transition} ${leadTokens.focus}`}
            aria-label="Назад"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={!finalStep ? onNext : onSubmit}
          disabled={loading}
          className={`flex min-h-14 flex-1 items-center justify-center rounded-[14px] bg-[#e31b23] px-6 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(227,27,35,0.22)] hover:bg-[#f02028] active:scale-[0.99] disabled:cursor-wait disabled:opacity-60 ${leadTokens.transition} ${leadTokens.focus}`}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading
            ? "Отправляем"
            : finalStep
              ? "Отправить заявку"
              : "Продолжить"}
        </button>
      </div>
    </footer>
  );
}
