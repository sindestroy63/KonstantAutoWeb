import type { Metadata } from "next";
import Link from "next/link";
import { Activity, CheckCircle2 } from "lucide-react";
import { BOT_START } from "@/lib/constants";
import { SectionRouteLayer } from "@/components/ui/SectionRouteLayer";

export const metadata: Metadata = {
  title: "Трекинг автомобиля в Telegram",
  description:
    "Отслеживайте статус доставки и этапы заказа в Telegram-боте KONSTANT AUTO. Уведомления в реальном времени.",
  openGraph: {
    title: "Трекинг авто в Telegram | KONSTANT AUTO",
    description: "Статусы доставки и этапов заказа в боте.",
  },
};

const items = [
  "Карточка заявки с текущим статусом авто",
  "История этапов и обновления в чате",
  "Не нужно звонить — всё в боте",
];

export default function TrackingPage() {
  return (
    <div className="section-dark min-h-screen border-t border-white/10">
      <SectionRouteLayer variant="dark" pattern="gamma" />
      <div className="container relative z-10 mx-auto max-w-5xl px-4 py-12 sm:py-14 md:py-16">
        <div className="glass-panel-strong rounded-[36px] p-6 sm:p-8 md:p-10">
          <div className="eyebrow">
            <span className="route-dot" />
            Tracking dashboard
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Трекинг заявки в Telegram-боте
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-400">
            После оформления заявки откройте бота — там карточка вашей заявки: имя клиента,
            автомобиль, VIN, текущий статус и дата обновления. Видны пошаговый ход выполнения
            и список этапов статуса; обновления приходят по мере движения заказа.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="dark-card rounded-[28px] p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Что внутри
                </p>
                <Activity className="h-4 w-4 text-red-300" />
              </div>
              <ul className="mt-5 space-y-3">
                {items.map((item) => (
                  <li key={item} className="flex gap-3 rounded-[22px] border border-white/[0.08] bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="dark-card rounded-[28px] p-5">
              <div className="rounded-[24px] border border-white/[0.08] bg-slate-950/[0.6] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Live
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-red-400/[0.16] bg-red-500/10 px-4 py-3 text-sm text-white">
                    <span>Статус заявки</span>
                    <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs">обновляется</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                    <span>VIN и карточка клиента</span>
                    <span>внутри бота</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                    <span>История этапов</span>
                    <span>внутри бота</span>
                  </div>
                </div>
              </div>

              <a
                href={BOT_START.tracking}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-primary mt-6"
              >
                Открыть трекинг в боте
              </a>
            </div>
          </div>

          <p className="mt-8 border-t border-white/10 pt-6 text-sm text-slate-500">
            <Link href="/" className="text-red-200 transition-colors hover:text-white">
              На главную
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
