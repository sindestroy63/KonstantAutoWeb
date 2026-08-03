"use client";

import { Car, CircleDot, Truck } from "lucide-react";
import { ContactFields } from "@/components/leads/ContactFields";
import { ConsentCheckbox } from "@/components/leads/ConsentCheckbox";
import {
  ChoiceCard,
  ChoiceGrid,
  LeadField,
  LeadSummary,
  LeadSection,
  leadInputClass,
} from "@/components/leads/LeadUi";
import {
  bodyTypeOptions,
  brandOptions,
  budgetOptions,
  conditionOptions,
  drivetrainOptions,
  priorityOptions,
  timelineOptions,
  transmissionOptions,
  type LeadContext,
  type SelectionAnswerErrors,
  type SelectionAnswers,
} from "@/components/leads/lead-state";
import { type ConsultationPayload, type FieldErrors } from "@/lib/leads";

type AnswerValue = SelectionAnswers[keyof SelectionAnswers];

type SelectionFormProps = {
  step: number;
  data: SelectionAnswers;
  context?: LeadContext;
  errors: SelectionAnswerErrors;
  onChange: (field: keyof SelectionAnswers, value: AnswerValue) => void;
};

function ErrorText({ children }: { children?: string }) {
  return children ? <p className="mt-2 text-xs font-medium text-[#ff5a60]">{children}</p> : null;
}

function Question({ children }: { children: string }) {
  return <h4 className="mb-5 text-lg font-medium tracking-[-0.015em] text-white sm:text-xl">{children}</h4>;
}

function Summary({ data, context }: { data: SelectionAnswers; context?: LeadContext }) {
  const items = [
    ["Бюджет", data.budget],
    ["Срок", data.timeline],
    ["Тип", data.bodyType],
    ["Марки", data.brands.join(", ")],
    ["Модель", data.requestedModel],
    ["Состояние", data.condition],
    ["Коробка", data.transmission],
    ["Привод", data.drivetrain],
    ["Приоритеты", data.priorities.join(", ")],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return <LeadSummary items={items} context={context?.carName} />;
}

function BodyTypeChoice({ option, active, onClick }: { option: string; active: boolean; onClick: () => void }) {
  const Icon = option === "Пикап" ? Truck : option === "Не определился" ? CircleDot : Car;
  return (
    <ChoiceCard active={active} onClick={onClick}>
      <span className="flex items-center gap-3"><Icon className="h-4 w-4 text-white/55" />{option}</span>
    </ChoiceCard>
  );
}

export function SelectionStepView({ step, data, context, errors, onChange }: SelectionFormProps) {
  function toggleList(field: "brands" | "priorities", option: string) {
    const current = data[field];
    if (field === "brands" && option === "Рассмотрю любые") {
      onChange(field, current.includes(option) ? [] : [option]);
      return;
    }
    const withoutAny = field === "brands" ? current.filter((item) => item !== "Рассмотрю любые") : current;
    onChange(field, withoutAny.includes(option) ? withoutAny.filter((item) => item !== option) : [...withoutAny, option]);
  }

  if (step === 0) {
    return (
      <div className="mx-auto max-w-[720px]">
        <ContactFields
          values={data}
          errors={errors}
          onChange={(field, value) => onChange(field, value)}
        />
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="mx-auto max-w-[720px]">
        <Question>В каком бюджете рассматриваете автомобиль?</Question>
        <div data-field="budget">
          <ChoiceGrid>
            {budgetOptions.map((option) => (
              <ChoiceCard key={option} active={data.budget === option} onClick={() => onChange("budget", option)}>
                {option}
              </ChoiceCard>
            ))}
          </ChoiceGrid>
        </div>
        <ErrorText>{errors.budget}</ErrorText>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="mx-auto max-w-[720px]">
        <Question>Когда планируете покупку?</Question>
        <div data-field="timeline">
          <ChoiceGrid>
            {timelineOptions.map((option) => (
              <ChoiceCard key={option} active={data.timeline === option} onClick={() => onChange("timeline", option)}>
                {option}
              </ChoiceCard>
            ))}
          </ChoiceGrid>
        </div>
        <ErrorText>{errors.timeline}</ErrorText>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="mx-auto max-w-[720px]">
        <Question>Какой тип автомобиля рассматриваете?</Question>
        <div data-field="bodyType">
          <ChoiceGrid>
            {bodyTypeOptions.map((option) => (
              <BodyTypeChoice key={option} option={option} active={data.bodyType === option} onClick={() => onChange("bodyType", option)} />
            ))}
          </ChoiceGrid>
        </div>
        <ErrorText>{errors.bodyType}</ErrorText>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="mx-auto max-w-[720px] space-y-7">
        {context?.carName ? (
          <div data-lead-car-context={context.carSlug ?? ""} className="flex items-center justify-between gap-4 rounded-[16px] border border-[#e31b23]/35 bg-[#e31b23]/10 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-xs text-white/42">Автомобиль перехода</p>
              <p className="mt-1 truncate text-sm font-medium text-white">Заявка по {context.carName}</p>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById("lead-requested-model")?.focus()}
              className="shrink-0 text-sm font-medium text-[#ff5a60] underline decoration-[#ff5a60]/35 underline-offset-4 hover:text-white"
            >
              Изменить
            </button>
          </div>
        ) : null}

        <LeadSection title="Подходящие марки — можно выбрать несколько">
          <ChoiceGrid columns={3}>
            {brandOptions.map((option) => (
              <ChoiceCard key={option} active={data.brands.includes(option)} onClick={() => toggleList("brands", option)}>
                {option}
              </ChoiceCard>
            ))}
          </ChoiceGrid>
        </LeadSection>

        <LeadField label="Конкретная модель — необязательно" fieldKey="requestedModel">
          <input
            id="lead-requested-model"
            value={data.requestedModel}
            onChange={(event) => onChange("requestedModel", event.target.value)}
            className={leadInputClass()}
            placeholder="Например: BMW X5"
            maxLength={160}
          />
        </LeadField>
      </div>
    );
  }

  if (step === 5) {
    return (
      <div className="mx-auto max-w-[720px]">
        <Question>Какое состояние автомобиля рассматриваете?</Question>
        <div data-field="condition">
          <ChoiceGrid>
            {conditionOptions.map((option) => (
              <ChoiceCard key={option} active={data.condition === option} onClick={() => onChange("condition", option)}>
                {option}
              </ChoiceCard>
            ))}
          </ChoiceGrid>
        </div>
        <ErrorText>{errors.condition}</ErrorText>
      </div>
    );
  }

  if (step === 6) {
    return (
      <div className="mx-auto max-w-[720px]">
        <Question>Какую коробку передач рассматриваете?</Question>
        <div data-field="transmission">
          <ChoiceGrid>
            {transmissionOptions.map((option) => (
              <ChoiceCard key={option} active={data.transmission === option} onClick={() => onChange("transmission", option)}>
                {option}
              </ChoiceCard>
            ))}
          </ChoiceGrid>
        </div>
        <ErrorText>{errors.transmission}</ErrorText>
      </div>
    );
  }

  if (step === 7) {
    return (
      <div className="mx-auto max-w-[720px]">
        <Question>Какой привод рассматриваете?</Question>
        <div data-field="drivetrain">
          <ChoiceGrid>
            {drivetrainOptions.map((option) => (
              <ChoiceCard key={option} active={data.drivetrain === option} onClick={() => onChange("drivetrain", option)}>
                {option}
              </ChoiceCard>
            ))}
          </ChoiceGrid>
        </div>
        <ErrorText>{errors.drivetrain}</ErrorText>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] space-y-7">
      <LeadSection title="Что для вас особенно важно — можно выбрать несколько">
        <ChoiceGrid>
          {priorityOptions.map((option) => (
            <ChoiceCard key={option} active={data.priorities.includes(option)} onClick={() => toggleList("priorities", option)}>
              {option}
            </ChoiceCard>
          ))}
        </ChoiceGrid>
      </LeadSection>

      <LeadField label="Комментарий" fieldKey="comment">
        <textarea
          value={data.comment}
          onChange={(event) => onChange("comment", event.target.value)}
          className={`${leadInputClass()} min-h-[116px] resize-y py-4`}
          placeholder="Дополнительные пожелания к автомобилю"
          maxLength={1800}
        />
      </LeadField>

      <Summary data={data} context={context} />

      <div data-field="consent">
        <ConsentCheckbox checked={data.consent} error={errors.consent} onChange={(checked) => onChange("consent", checked)} />
      </div>
    </div>
  );
}

const consultationTopicOptions = [
  "Покупка автомобиля",
  "Продажа автомобиля",
  "Подбор под бюджет",
  "Автокредит",
  "Trade-in",
  "Доставка",
  "Другое",
] as const;

type ConsultationStepProps = {
  step: number;
  data: ConsultationPayload;
  errors: FieldErrors<ConsultationPayload>;
  onChange: (field: keyof ConsultationPayload, value: string) => void;
  onConsentChange: (checked: boolean) => void;
};

export function ConsultationStepView({ step, data, errors, onChange, onConsentChange }: ConsultationStepProps) {
  if (step === 0) {
    return (
      <div className="mx-auto max-w-[720px]">
        <ContactFields values={data} errors={errors} onChange={onChange} />
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="mx-auto max-w-[720px]">
        <Question>По какому вопросу нужна консультация?</Question>
        <div data-field="topic">
          <ChoiceGrid>
            {consultationTopicOptions.map((option) => (
              <ChoiceCard key={option} active={data.topic === option} onClick={() => onChange("topic", option)}>
                {option}
              </ChoiceCard>
            ))}
          </ChoiceGrid>
        </div>
        <ErrorText>{errors.topic}</ErrorText>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="mx-auto max-w-[720px]">
        <Question>Кратко опишите ваш вопрос</Question>
        <LeadField label="Описание" error={errors.question} fieldKey="question">
          <textarea
            value={data.question}
            onChange={(event) => onChange("question", event.target.value)}
            className={`${leadInputClass(Boolean(errors.question))} min-h-[160px] resize-y py-4`}
            placeholder="Что важно учесть специалисту"
            maxLength={500}
            aria-invalid={Boolean(errors.question)}
          />
        </LeadField>
        <p className="mt-2 text-right text-xs text-white/35" aria-live="polite">{data.question.length} / 500</p>
      </div>
    );
  }

  const summaryItems: Array<[string, string]> = [
    ["Имя", data.name],
    ["Телефон", data.phone],
    ["Способ связи", data.contactMethod],
    ["Тема", data.topic],
    ["Вопрос", data.question],
  ];

  return (
    <div className="mx-auto max-w-[720px] space-y-7">
      <LeadSummary items={summaryItems} />
      <div data-field="consent">
        <ConsentCheckbox checked={data.consent} error={errors.consent} onChange={onConsentChange} />
      </div>
    </div>
  );
}
