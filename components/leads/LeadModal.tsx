"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, MessageCircle } from "lucide-react";
import { BOT_START } from "@/lib/constants";
import { ConsultationStepView, SelectionStepView } from "@/components/leads/LeadForms";
import { consultationSteps, LeadFooter, LeadHeader, selectionSteps } from "@/components/leads/LeadUi";
import { leadTokens } from "@/components/leads/design-tokens";
import {
  buildSelectionPayload,
  createConsultationFromContext,
  createEmptySelectionAnswers,
  type LeadContext,
  type SelectionAnswerErrors,
  type SelectionAnswers,
} from "@/components/leads/lead-state";
import {
  validateConsultationPayload,
  validateSelectionPayload,
  type ConsultationPayload,
  type FieldErrors,
  type LeadMode,
  type SelectionPayload,
} from "@/lib/leads";

type LeadModalProps = {
  isOpen: boolean;
  mode: LeadMode;
  context?: LeadContext;
  onClose: () => void;
};

type SubmitState = "idle" | "loading" | "success" | "error";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LeadModal({ isOpen, mode, context, onClose }: LeadModalProps) {
  const [activeMode, setActiveMode] = useState<LeadMode>(mode);
  const [selectionStep, setSelectionStep] = useState(0);
  const [consultationStep, setConsultationStep] = useState(0);
  const [selectionData, setSelectionData] = useState<SelectionAnswers>(createEmptySelectionAnswers);
  const [consultationData, setConsultationData] = useState<ConsultationPayload>(() => createConsultationFromContext(context));
  const [selectionErrors, setSelectionErrors] = useState<SelectionAnswerErrors>({});
  const [consultationErrors, setConsultationErrors] = useState<FieldErrors<ConsultationPayload>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [scrollToField, setScrollToField] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setActiveMode(mode);
    setSelectionStep(0);
    setConsultationStep(0);
    setSelectionErrors({});
    setConsultationErrors({});
    setSubmitState("idle");
    setSubmitMessage("");
    setSelectionData(createEmptySelectionAnswers());
    setConsultationData(createConsultationFromContext(context));
  }, [isOpen, mode, context]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => titleRef.current?.focus(), 0);

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!scrollToField) return;
    const target = contentRef.current?.querySelector<HTMLElement>(`[data-field="${scrollToField}"]`);
    target?.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    setScrollToField(null);
  }, [scrollToField]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [activeMode, consultationStep, selectionStep]);

  if (!isOpen) return null;

  const isSelection = activeMode === "selection";
  const activeStep = isSelection ? selectionStep : consultationStep;

  function handleTrapKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const focusables = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
    ).filter((element) => element.offsetParent !== null);

    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function updateSelection(
    field: keyof SelectionAnswers,
    value: SelectionAnswers[keyof SelectionAnswers]
  ) {
    setSelectionData((current) => ({ ...current, [field]: value }));
    setSelectionErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateConsultation(field: keyof ConsultationPayload, value: string) {
    setConsultationData((current) => ({ ...current, [field]: value }));
    setConsultationErrors((current) => ({ ...current, [field]: undefined }));
  }

  const selectionStepGroups: Array<Array<keyof SelectionAnswers>> = [
    ["name", "phone", "contactMethod", "telegram"],
    ["budget"],
    ["timeline"],
    ["bodyType"],
    [],
    ["condition"],
    ["transmission"],
    ["drivetrain"],
    ["consent"],
  ];

  const consultationStepGroups: Array<Array<keyof ConsultationPayload>> = [
    ["name", "phone", "contactMethod", "telegram"],
    ["topic"],
    ["question"],
    ["consent"],
  ];

  function validateSelectionStep(step: number) {
    const fields = selectionStepGroups[step];
    const allErrors: SelectionAnswerErrors = {};
    if (selectionData.name.trim().length < 2) allErrors.name = "Укажите имя";
    if (selectionData.phone.replace(/\D/g, "").length < 11) allErrors.phone = "Укажите номер телефона";
    if (!selectionData.contactMethod) allErrors.contactMethod = "Выберите удобный способ связи";
    if (!selectionData.budget) allErrors.budget = "Выберите бюджет";
    if (!selectionData.timeline) allErrors.timeline = "Выберите срок покупки";
    if (!selectionData.bodyType) allErrors.bodyType = "Выберите тип автомобиля";
    if (!selectionData.condition) allErrors.condition = "Выберите состояние автомобиля";
    if (!selectionData.transmission) allErrors.transmission = "Выберите коробку передач";
    if (!selectionData.drivetrain) allErrors.drivetrain = "Выберите привод";
    if (!selectionData.consent) allErrors.consent = "Нужно согласие с политикой конфиденциальности";
    const stepErrors = fields.reduce<SelectionAnswerErrors>((result, field) => {
      if (allErrors[field]) result[field] = allErrors[field];
      return result;
    }, {});

    setSelectionErrors((current) => ({ ...current, ...stepErrors }));
    const firstError = fields.find((field) => stepErrors[field]);
    if (firstError) setScrollToField(firstError);
    return Object.keys(stepErrors).length === 0;
  }

  function validateConsultationStep(step: number) {
    const fields = consultationStepGroups[step];
    const allErrors = validateConsultationPayload(consultationData);
    const stepErrors = fields.reduce<FieldErrors<ConsultationPayload>>((result, field) => {
      if (allErrors[field]) result[field] = allErrors[field];
      return result;
    }, {});

    setConsultationErrors((current) => ({ ...current, ...stepErrors }));
    const firstError = fields.find((field) => stepErrors[field]);
    if (firstError) setScrollToField(firstError);
    return Object.keys(stepErrors).length === 0;
  }

  async function submitLead(kind: LeadMode, data: SelectionPayload | ConsultationPayload) {
    setSubmitState("loading");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, data }),
      });
      const responseData = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) throw new Error(responseData?.error || "Не удалось отправить заявку");

      setSubmitState("success");
      setSubmitMessage("Менеджер свяжется с вами в ближайшее время.");
      setSelectionData(createEmptySelectionAnswers());
      setConsultationData(createConsultationFromContext(context));
      setSelectionStep(0);
      setConsultationStep(0);
      setSelectionErrors({});
      setConsultationErrors({});
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(error instanceof Error ? error.message : "Не удалось отправить заявку. Попробуйте ещё раз.");
    }
  }

  async function handleSelectionSubmit() {
    if (!validateSelectionStep(selectionSteps.length - 1)) return;
    const payload = buildSelectionPayload(selectionData, context);
    const payloadErrors = validateSelectionPayload(payload);

    if (Object.keys(payloadErrors).length > 0) {
      const mappedErrors: SelectionAnswerErrors = {
        name: payloadErrors.name,
        phone: payloadErrors.phone,
        contactMethod: payloadErrors.contactMethod,
        budget: payloadErrors.budget,
        timeline: payloadErrors.timeline,
        bodyType: payloadErrors.carType,
        consent: payloadErrors.consent,
      };
      setSelectionErrors(mappedErrors);
      const errorStep = selectionStepGroups.findIndex((group) => group.some((field) => mappedErrors[field]));
      if (errorStep >= 0) {
        setSelectionStep(errorStep);
        const firstError = selectionStepGroups[errorStep].find((field) => mappedErrors[field]);
        if (firstError) setScrollToField(firstError);
      }
      return;
    }

    await submitLead("selection", payload);
  }

  async function handleConsultationSubmit() {
    const errors = validateConsultationPayload(consultationData);
    setConsultationErrors(errors);

    if (Object.keys(errors).length > 0) {
      const errorStep = consultationStepGroups.findIndex((group) => group.some((field) => errors[field]));
      if (errorStep >= 0) {
        setConsultationStep(errorStep);
        const firstError = consultationStepGroups[errorStep].find((field) => errors[field]);
        if (firstError) setScrollToField(firstError);
      }
      return;
    }

    await submitLead("consultation", consultationData);
  }

  function switchMode(nextMode: LeadMode) {
    setActiveMode(nextMode);
    if (nextMode === "selection") setSelectionStep(0);
    else setConsultationStep(0);
    setSubmitState("idle");
    setSubmitMessage("");
    window.setTimeout(() => titleRef.current?.focus(), 0);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center min-[769px]:p-5">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Закрыть окно"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        onKeyDown={handleTrapKeyDown}
        className={`relative z-10 flex h-[100dvh] w-full flex-col overflow-hidden ${leadTokens.surface} ${leadTokens.textPrimary} min-[769px]:h-[min(860px,94dvh)] min-[769px]:max-w-[820px] min-[769px]:rounded-[24px] min-[769px]:border min-[769px]:border-white/[0.14] ${leadTokens.shadow}`}
      >
        <h2 ref={titleRef} id="lead-modal-title" tabIndex={-1} className="sr-only">
          {isSelection ? "Заявка на подбор автомобиля" : "Консультация специалиста"}
        </h2>

        <LeadHeader mode={activeMode} step={activeStep} onModeChange={switchMode} onClose={onClose} />

        <div ref={contentRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-7 sm:py-7">
          {submitState === "success" ? (
            <div role="status" className="lead-step-enter flex min-h-full flex-col items-center justify-center py-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e31b23] text-white shadow-[0_18px_40px_rgba(227,27,35,0.28)]">
                <Check className="h-7 w-7" strokeWidth={2.5} />
              </span>
              <h3 className="mt-6 text-2xl font-semibold tracking-[-0.025em] text-white">Заявка отправлена</h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/50">{submitMessage}</p>
              <div className="mt-7 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  className={`min-h-13 flex-1 rounded-[14px] border border-white/[0.14] bg-white/[0.05] px-5 text-sm font-medium text-white hover:bg-white/[0.09] ${leadTokens.transition} ${leadTokens.focus}`}
                >
                  Закрыть
                </button>
                <a
                  href={isSelection ? BOT_START.quiz : BOT_START.consult}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex min-h-13 flex-1 items-center justify-center rounded-[14px] bg-[#e31b23] px-5 text-sm font-medium text-white hover:bg-[#f02028] ${leadTokens.transition} ${leadTokens.focus}`}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Telegram
                </a>
              </div>
            </div>
          ) : (
            <div key={`${activeMode}-${activeStep}`} className="lead-step-enter">
              {isSelection ? (
                <SelectionStepView
                  step={selectionStep}
                  data={selectionData}
                  context={context}
                  errors={selectionErrors}
                  onChange={updateSelection}
                />
              ) : (
                <ConsultationStepView
                  step={consultationStep}
                  data={consultationData}
                  errors={consultationErrors}
                  onChange={updateConsultation}
                  onConsentChange={(checked) => {
                    setConsultationData((current) => ({ ...current, consent: checked }));
                    setConsultationErrors((current) => ({ ...current, consent: undefined }));
                  }}
                />
              )}

              {submitState === "error" ? (
                <div role="alert" className="mt-6 rounded-[14px] border border-[#ff3b42]/35 bg-[#e31b23]/10 px-4 py-3 text-sm leading-6 text-[#ff8a8f]">
                  {submitMessage}{" "}
                  <a
                    href={isSelection ? BOT_START.quiz : BOT_START.consult}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-white underline decoration-white/30 underline-offset-2"
                  >
                    Написать в Telegram
                  </a>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {submitState !== "success" ? (
          <LeadFooter
            mode={activeMode}
            step={activeStep}
            loading={submitState === "loading"}
            onBack={() => {
              if (isSelection) setSelectionStep((current) => Math.max(0, current - 1));
              else setConsultationStep((current) => Math.max(0, current - 1));
            }}
            onNext={() => {
              if (isSelection && validateSelectionStep(selectionStep)) {
                setSelectionStep((current) => Math.min(selectionSteps.length - 1, current + 1));
              } else if (!isSelection && validateConsultationStep(consultationStep)) {
                setConsultationStep((current) => Math.min(consultationSteps.length - 1, current + 1));
              }
            }}
            onSubmit={isSelection ? handleSelectionSubmit : handleConsultationSubmit}
          />
        ) : null}
      </div>
    </div>
  );
}
