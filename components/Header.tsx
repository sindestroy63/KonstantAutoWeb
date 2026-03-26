"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LeadModalTrigger } from "@/components/leads/LeadModalTrigger";
import { BRAND } from "@/lib/constants";

const nav = [
  { label: "О нас", href: "/#about" },
  { label: "Как работаем", href: "/#how" },
  { label: "Трекинг", href: "/#tracking" },
  { label: "Каталог", href: "/catalog" },
  { label: "FAQ", href: "/#faq" },
  { label: "Контакты", href: "/contacts" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-[74px] items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3" aria-label="KONSTANT AUTO — на главную">
            <Image
              src={BRAND.logoHeader}
              alt="KONSTANT AUTO"
              width={225}
              height={48}
              priority
              className="h-auto w-[150px] transition-transform duration-300 group-hover:scale-[1.02] sm:w-[176px] lg:w-[190px]"
            />
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-2 xl:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-300 hover:bg-slate-100 hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex">
            <LeadModalTrigger mode="selection" className="cta-primary px-5 py-3 text-sm">
              Оставить заявку
            </LeadModalTrigger>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Меню"
            aria-expanded={open}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div className="pb-4 lg:hidden">
            <div className="light-card rounded-[28px] p-4">
              <div className="flex flex-col gap-2">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <LeadModalTrigger
                mode="selection"
                className="cta-primary mt-4 w-full text-sm"
                onClick={() => setOpen(false)}
              >
                Оставить заявку
              </LeadModalTrigger>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
