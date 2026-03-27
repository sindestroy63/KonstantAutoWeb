"use client";

import type { ReactNode } from "react";
import type { ContactMethod } from "@/lib/leads";
import { contactMethodOptions } from "@/lib/leads";

type ContactValues = {
  name: string;
  phone: string;
  contactMethod: ContactMethod | "";
  telegram: string;
};

type ContactErrors = Partial<Record<keyof ContactValues, string>>;

type ContactFieldsProps = {
  values: ContactValues;
  errors: ContactErrors;
  onChange: (field: keyof ContactValues, value: string) => void;
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
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

function MethodChip({
  label,
  active,
  onClick,
}: {
  label: ContactMethod;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${
        active
          ? "border-red-500 bg-red-50 text-red-700 shadow-[0_14px_30px_rgba(196,0,0,0.08)]"
          : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-slate-950"
      }`}
    >
      {label}
    </button>
  );
}

export function ContactFields({ values, errors, onChange }: ContactFieldsProps) {
  const showTelegramField = values.contactMethod === "Telegram";

  return (
    <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
          Контакты
        </p>
        <p className="text-sm leading-relaxed text-slate-500">
          Укажем номер телефона и удобный мессенджер, чтобы менеджер быстро с вами связался.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Имя" error={errors.name}>
          <input
            value={values.name}
            onChange={(event) => onChange("name", event.target.value)}
            className={inputClass(Boolean(errors.name))}
            placeholder="Как к вам обращаться"
          />
        </Field>

        <Field label="Телефон" error={errors.phone}>
          <input
            value={values.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            className={inputClass(Boolean(errors.phone))}
            placeholder="+7 999 000 00 00"
            inputMode="tel"
          />
        </Field>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-700">Предпочтительный способ связи</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {contactMethodOptions.map((method) => (
            <MethodChip
              key={method}
              label={method}
              active={values.contactMethod === method}
              onClick={() => onChange("contactMethod", method)}
            />
          ))}
        </div>
        {errors.contactMethod ? (
          <p className="mt-2 text-xs font-medium text-red-600">{errors.contactMethod}</p>
        ) : null}
      </div>

      {showTelegramField ? (
        <div className="mt-5">
          <Field label="Telegram username" error={errors.telegram}>
            <input
              value={values.telegram}
              onChange={(event) => onChange("telegram", event.target.value)}
              className={inputClass(Boolean(errors.telegram))}
              placeholder="@username"
            />
          </Field>
        </div>
      ) : null}
    </div>
  );
}
