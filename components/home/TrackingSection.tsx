"use client";

import { useEffect, useState } from "react";
import { Activity, BellRing, CheckCheck, ShieldEllipsis } from "lucide-react";
import { BOT_START } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";
import { SectionRouteLayer } from "@/components/ui/SectionRouteLayer";

const inBotCard = [
  "Карточка вашей заявки",
  "Имя клиента, автомобиль, VIN",
  "Текущий статус и дата обновления",
  "Пошаговый ход выполнения заявки",
  "Список этапов статуса (история)",
];

const statusStages = [
  "Заявка принята",
  "Подбор и осмотр",
  "Оплата и документы",
  "Таможня",
  "В пути",
  "Готово к получению",
];

const feed = [
  "Заявка принята",
  "Подбор и осмотр",
  "Текущий статус и дата обновления",
];

export function TrackingSection() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveStage((prev) => (prev + 1) % statusStages.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section id="tracking" className="section-dark">
      <SectionRouteLayer variant="dark" pattern="alpha" />
      <div className="container relative z-10 mx-auto px-4 py-16 sm:py-20 lg:py-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="eyebrow">
            <span className="route-dot" />
            Одна из главных фишек
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Трекинг заявки в Telegram-боте
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            После оформления заявки откройте бота — там карточка вашей заявки с текущим статусом
            автомобиля и историей этапов. Обновления приходят по мере движения заказа.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="dark-card p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">Что вы увидите в боте</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    В карточке: имя, авто, VIN, текущий статус, дата обновления и список пройденных этапов.
                  </p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-red-200">
                  <ShieldEllipsis className="h-5 w-5" />
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                {inBotCard.map((item, index) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-[22px] border border-white/[0.08] bg-white/[0.03] px-4 py-4 text-sm text-slate-300"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/15 bg-emerald-400/10 text-[11px] font-semibold text-emerald-200">
                      0{index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="dark-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-7">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Tracking dashboard
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">Этапы статуса</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  <span className="route-dot animate-soft-pulse" />
                  Live
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-[1fr_0.8fr]">
                <div className="p-6 sm:p-7">
                  <p className="mb-4 text-sm leading-relaxed text-slate-400">
                    В истории заявки отображаются этапы выполнения — от приёма заявки до готовности к получению.
                  </p>
                  <div className="space-y-3">
                    {statusStages.map((stage, index) => {
                      const isActive = index === activeStage;
                      const isDone = index < activeStage;

                      return (
                        <div
                          key={stage}
                          className={`flex items-center gap-3 rounded-[22px] border px-4 py-4 transition-all duration-500 ${
                            isActive
                              ? "border-red-400/[0.18] bg-red-500/10 shadow-[0_0_0_1px_rgba(255,86,86,0.08)]"
                              : "border-white/[0.08] bg-white/[0.03]"
                          }`}
                        >
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${
                              isDone || isActive
                                ? "bg-[linear-gradient(135deg,#ff5d5d_0%,#c40000_100%)] text-white"
                                : "bg-white/[0.06] text-slate-400"
                            }`}
                          >
                            {isDone ? <CheckCheck className="h-4 w-4" /> : index + 1}
                          </span>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${isActive ? "text-white" : "text-slate-300"}`}>
                              {stage}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {isActive ? "Активное обновление статуса" : "Ожидает подтверждения этапа"}
                            </p>
                          </div>
                          {isActive && <Activity className="h-4 w-4 text-red-300" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-white/10 bg-white/[0.02] p-6 sm:p-7 lg:border-l lg:border-t-0">
                  <div className="rounded-[24px] border border-white/[0.08] bg-slate-950/50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">История обновлений</p>
                      <BellRing className="h-4 w-4 text-red-300" />
                    </div>
                    <div className="mt-5 space-y-4">
                      {feed.map((item, index) => (
                        <div key={item} className="flex gap-3">
                          <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-400 shadow-[0_0_12px_rgba(255,82,82,0.7)]" />
                          <div>
                            <p className="text-sm text-slate-200">{item}</p>
                            <p className="mt-1 text-xs text-slate-500">Обновление {index + 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a
                    href={BOT_START.tracking}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-primary mt-6 w-full text-sm"
                  >
                    Открыть трекинг в боте
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
