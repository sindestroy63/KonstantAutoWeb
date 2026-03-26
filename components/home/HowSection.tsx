"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRightLeft, Route } from "lucide-react";
import { PROCESS_STEPS } from "@/data/processSteps";
import { SectionRouteLayer } from "@/components/ui/SectionRouteLayer";

export function HowSection() {
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [visibleSteps, setVisibleSteps] = useState<Record<number, boolean>>({});
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const refs = itemRefs.current.filter((node): node is HTMLLIElement => node !== null);
    if (refs.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (Number.isNaN(index)) return;

          if (entry.isIntersecting) {
            setVisibleSteps((prev) => ({ ...prev, [index]: true }));
            setActiveStep((prev) => {
              if (entry.intersectionRatio > 0.55) return index;
              return Math.max(prev, index);
            });
          }
        });
      },
      {
        threshold: [0.2, 0.55, 0.8],
        rootMargin: "-8% 0px -18% 0px",
      }
    );

    refs.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const progress = useMemo(() => {
    if (PROCESS_STEPS.length <= 1) return 100;
    return ((activeStep + 1) / PROCESS_STEPS.length) * 100;
  }, [activeStep]);

  return (
    <section id="how" className="section-light">
      <SectionRouteLayer pattern="gamma" />
      <div className="container relative z-10 mx-auto px-4 py-16 sm:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="eyebrow-light">
              <span className="route-dot" />
              Как проходит работа
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Маршрут сделки, который можно читать как таймлайн
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              От заявки в боте до ключей в руках — шесть понятных этапов. Стоимость и сроки
              зафиксированы в договоре, на каждом шаге вы в курсе.
            </p>

            <div className="light-card mt-8 rounded-[30px] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Прогресс маршрута
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {String(activeStep + 1).padStart(2, "0")} / {String(PROCESS_STEPS.length).padStart(2, "0")}
                  </p>
                </div>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
                  <Route className="h-6 w-6" />
                </span>
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#ff5a5a_0%,#c40000_100%)] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-6 space-y-3">
                {PROCESS_STEPS.map((step, index) => (
                  <div
                    key={step.n}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition-all duration-300 ${
                      index <= activeStep
                        ? "bg-slate-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)]"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <span className="font-medium">{step.title}</span>
                    <span className="text-xs uppercase tracking-[0.2em]">{step.n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-5 top-0 h-full w-px bg-slate-200 sm:left-7" aria-hidden />
            <div
              className="absolute left-5 top-0 w-px bg-[linear-gradient(180deg,#ff6262_0%,#c40000_100%)] transition-all duration-500 sm:left-7"
              style={{ height: `${progress}%` }}
              aria-hidden
            />

            <ul className="space-y-5">
              {PROCESS_STEPS.map((step, index) => {
                const isActive = index === activeStep;
                const isReached = index <= activeStep;

                return (
                  <li
                    key={step.n}
                    ref={(node) => {
                      itemRefs.current[index] = node;
                    }}
                    data-index={index}
                    className={`relative pl-14 sm:pl-20 transition-all duration-700 ${
                      visibleSteps[index] ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    }`}
                    style={{ transitionDelay: `${index * 80}ms` }}
                  >
                    <span
                      className={`absolute left-0 top-5 flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold sm:left-2 sm:h-11 sm:w-11 ${
                        isReached
                          ? "bg-[linear-gradient(135deg,#ff5d5d_0%,#c40000_100%)] text-white shadow-[0_0_24px_rgba(255,88,88,0.35)]"
                          : "bg-white text-slate-500 ring-1 ring-slate-200"
                      }`}
                    >
                      {step.n}
                    </span>

                    <div
                      className={`rounded-[28px] border p-6 transition-all duration-300 sm:p-7 ${
                        isActive
                          ? "border-red-200 bg-white shadow-[0_26px_70px_rgba(196,0,0,0.12)]"
                          : "border-slate-200/80 bg-white/[0.88] shadow-[0_18px_44px_rgba(15,23,42,0.06)]"
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                            Этап {step.n}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-slate-950">{step.title}</h3>
                        </div>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                            isActive ? "bg-red-500/10 text-red-600" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                          {isActive ? "Активный шаг" : "Маршрут"}
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-slate-600">{step.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
