"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/data/faq";
import { SectionRouteLayer } from "@/components/ui/SectionRouteLayer";

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section-light">
      <SectionRouteLayer pattern="beta" />
      <div className="container relative z-10 mx-auto px-4 py-16 sm:py-20 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="eyebrow-light">
              <span className="route-dot" />
              FAQ
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Частые вопросы
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Ответы на главные вопросы о сроках, безопасности и стоимости.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = open === index;

              return (
                <div
                  key={item.q}
                  className={`light-card overflow-hidden transition-all duration-300 ${
                    isOpen ? "border-red-200" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                    onClick={() => setOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span className="pr-2 text-base font-medium leading-snug text-slate-950">{item.q}</span>
                    <span
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xl text-slate-500 transition-transform duration-300 ${
                        isOpen ? "rotate-45 text-red-500" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-6 text-sm leading-relaxed text-slate-600 sm:px-6">
                        {item.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
