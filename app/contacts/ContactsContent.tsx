"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  Phone,
  Radio,
  Send,
  Share2,
} from "lucide-react";
import {
  BOT_START,
  CHANNEL_DISPLAY,
  CHANNEL_URL,
  MAX_URL,
  PHONE,
  PHONE_DISPLAY,
  VK_URL,
} from "@/lib/constants";
import { LeadModalTrigger } from "@/components/leads/LeadModalTrigger";
import { SectionRouteLayer } from "@/components/ui/SectionRouteLayer";

function CopyButton({
  text,
  label,
  onCopy,
}: {
  text: string;
  label: string;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // noop
    }
  }, [onCopy, text]);

  return (
    <button
      type="button"
      onClick={copy}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:border-red-200 hover:text-red-600"
      title={label}
      aria-label={label}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

export function ContactsContent() {
  const [toast, setToast] = useState(false);

  const showToast = useCallback(() => {
    setToast(true);
    const timeout = setTimeout(() => setToast(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  const cards = [
    {
      icon: Radio,
      title: "Telegram-канал",
      action: "Открыть канал",
      href: CHANNEL_URL,
      copyText: CHANNEL_DISPLAY,
    },
    {
      icon: Phone,
      title: "Телефон",
      action: "Позвонить",
      href: `tel:${PHONE}`,
      copyText: PHONE_DISPLAY,
    },
    {
      icon: Share2,
      title: "ВКонтакте",
      action: "Открыть VK",
      href: VK_URL,
      copyText: null as string | null,
    },
    {
      icon: Send,
      title: "MAX",
      action: "Перейти в MAX",
      href: MAX_URL,
      copyText: null,
    },
  ];

  return (
    <div className="section-light min-h-screen border-t border-slate-200/80">
      <SectionRouteLayer pattern="gamma" />
      <div className="container relative z-10 mx-auto max-w-6xl px-4 py-12 sm:py-14 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <div className="eyebrow-light">
              <span className="route-dot" />
              Контакты
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Контакты
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Лучший способ связаться с нами — оставить заявку или вопрос на сайте: мы сразу отправим
              его в рабочий Telegram-чат. Также доступны Telegram-бот, телефон и соцсети.
            </p>

            <div className="light-card mt-8 rounded-[32px] p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Заявки и консультации
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Оставьте заявку на подбор или задайте вопрос специалисту. После отправки менеджер увидит
                запрос в рабочем чате Telegram и свяжется с вами по удобному контакту.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <LeadModalTrigger mode="selection" className="cta-primary text-sm">
                  Оставить заявку на подбор
                </LeadModalTrigger>
                <LeadModalTrigger mode="consultation" className="cta-light text-sm">
                  Консультация специалиста
                </LeadModalTrigger>
              </div>
              <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Если удобнее продолжить общение сразу в Telegram, можно перейти в{" "}
                <a
                  href={BOT_START.consult}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-red-600 underline decoration-red-200 underline-offset-4 transition-colors hover:text-red-700"
                >
                  бот KONSTANT AUTO
                </a>
                .
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="shine-overlay light-card flex flex-col rounded-[28px] p-5 md:col-span-2 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-500">
                  <MessageCircle className="h-5 w-5" />
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-slate-950">Telegram-бот</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                В боте доступны трекинг заявки, история этапов и быстрый диалог после отправки формы.
              </p>
              <a
                href={BOT_START.tracking}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-600 transition-colors hover:text-red-700"
              >
                Открыть Telegram-бот
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {cards.map(({ icon: Icon, title, action, href, copyText }) => (
              <div key={title} className="shine-overlay light-card flex flex-col rounded-[28px] p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-500">
                    <Icon className="h-5 w-5" />
                  </span>
                  {copyText ? <CopyButton text={copyText} label="Скопировать" onCopy={showToast} /> : null}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-950">{title}</h3>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                >
                  {action}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="light-card mt-6 rounded-[30px] p-5">
          <h3 className="text-lg font-semibold text-slate-950">Нужна быстрая консультация?</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Оставьте короткий вопрос прямо на сайте — менеджер увидит обращение в Telegram-чате и
            вернётся с ответом.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <LeadModalTrigger mode="consultation" className="cta-primary inline-flex gap-2 text-sm">
              <MessageCircle className="h-4 w-4" />
              Написать вопрос специалисту
            </LeadModalTrigger>
            <LeadModalTrigger mode="selection" className="cta-light text-sm">
              Подбор автомобиля
            </LeadModalTrigger>
          </div>
        </div>

        <p className="mt-10 text-sm text-slate-500">
          KONSTANT AUTO — Самара. Привоз автомобилей из-за рубежа под ключ.
        </p>
        <p className="mt-4">
          <Link href="/" className="text-sm font-medium text-red-600 transition-colors hover:text-red-700">
            На главную
          </Link>
        </p>
      </div>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/[0.92] px-4 py-2 text-sm font-medium text-white shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
          role="status"
          aria-live="polite"
        >
          Скопировано
        </div>
      )}
    </div>
  );
}
