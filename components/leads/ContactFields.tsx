"use client";

import type { ContactMethod } from "@/lib/leads";
import { formatRuPhone } from "@/lib/utils";
import { ChoiceCard, ChoiceGrid, LeadField, leadInputClass, LeadSection } from "@/components/leads/LeadUi";

type ContactValues = {
  name: string;
  phone: string;
  contactMethod: ContactMethod | "" | null;
  telegram: string;
};

type ContactErrors = Partial<Record<keyof ContactValues, string>>;

type ContactFieldsProps = {
  values: ContactValues;
  errors: ContactErrors;
  onChange: (field: keyof ContactValues, value: string) => void;
};

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
    <ChoiceCard active={active} onClick={onClick}>{label}</ChoiceCard>
  );
}

export function ContactFields({ values, errors, onChange }: ContactFieldsProps) {
  const showTelegramField = values.contactMethod === "Telegram";
  const contactMethodOptions: ContactMethod[] = ["Telegram", "WhatsApp", "MAX"];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <LeadField label="Имя" error={errors.name} fieldKey="name">
          <input
            value={values.name}
            onChange={(event) => onChange("name", event.target.value)}
            className={leadInputClass(Boolean(errors.name))}
            placeholder="Как к вам обращаться"
            maxLength={100}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
          />
        </LeadField>

        <LeadField label="Телефон" error={errors.phone} fieldKey="phone">
          <input
            type="tel"
            value={values.phone}
            onChange={(event) => onChange("phone", formatRuPhone(event.target.value))}
            className={leadInputClass(Boolean(errors.phone))}
            placeholder="+7 (999) 000-00-00"
            inputMode="tel"
            autoComplete="tel"
            maxLength={32}
            aria-invalid={Boolean(errors.phone)}
          />
        </LeadField>
      </div>

      <LeadSection title="Предпочтительный способ связи">
        <div data-field="contactMethod">
          <ChoiceGrid columns={3}>
          {contactMethodOptions.map((method) => (
            <MethodChip
              key={method}
              label={method}
              active={values.contactMethod === method}
              onClick={() => onChange("contactMethod", method)}
            />
          ))}
          </ChoiceGrid>
        </div>
        {errors.contactMethod ? (
          <p className="mt-2 text-xs font-medium text-[#ff5a60]">{errors.contactMethod}</p>
        ) : null}
      </LeadSection>

      {showTelegramField ? (
        <div className="lead-step-enter">
          <LeadField label="Telegram username" error={errors.telegram} fieldKey="telegram">
            <input
              value={values.telegram}
              onChange={(event) => onChange("telegram", event.target.value)}
              className={leadInputClass(Boolean(errors.telegram))}
              placeholder="@username"
              maxLength={64}
              autoComplete="off"
              aria-invalid={Boolean(errors.telegram)}
            />
          </LeadField>
        </div>
      ) : null}
    </div>
  );
}
