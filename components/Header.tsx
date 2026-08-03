"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { LeadModalTrigger } from "@/components/leads/LeadModalTrigger";
import { BRAND } from "@/lib/constants";

const nav = [
  { label: "О нас", href: "/#about" },
  { label: "Как работаем", href: "/#how" },
  { label: "Каталог", href: "/catalog" },
  { label: "Трекинг", href: "/#tracking" },
  { label: "FAQ", href: "/#faq" },
  { label: "Контакты", href: "/contacts" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => firstMobileLinkRef.current?.focus(), 0);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      menuButton?.focus();
    };
  }, [open]);

  function trapMobileMenuFocus(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab" || !mobileMenuRef.current) return;
    const focusable = Array.from(
      mobileMenuRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="site-container header-inner">
        <Link href="/" aria-label="KONSTANT AUTO — на главную">
          <Image src={BRAND.logoHeader} alt="KONSTANT AUTO" width={225} height={48} priority className="h-auto w-[170px] md:w-[190px]" />
        </Link>
        <nav className="hidden h-full items-center gap-7 lg:flex">
          {nav.map((item) => {
            const active = item.href === "/contacts" && pathname === "/contacts";
            return <Link key={item.href} href={item.href} className={`flex h-full items-center border-b-2 px-1 text-sm font-medium transition-colors ${active ? "border-red-600 text-red-600" : "border-transparent hover:text-red-600"}`}>{item.label}</Link>;
          })}
        </nav>
          <LeadModalTrigger mode="selection" context={{ source: "header" }} className="cta-primary hidden lg:inline-flex">Оставить заявку</LeadModalTrigger>
        <button ref={menuButtonRef} type="button" className="flex h-11 w-11 items-center justify-center lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Закрыть меню" : "Открыть меню"} aria-expanded={open} aria-controls="mobile-navigation">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <div ref={mobileMenuRef} id="mobile-navigation" onKeyDown={trapMobileMenuFocus} className="border-t border-black/10 bg-[#f9f8f5] px-5 pb-5 lg:hidden">
        <nav aria-label="Мобильная навигация" className="flex flex-col py-2">{nav.map((item, index) => <Link ref={index === 0 ? firstMobileLinkRef : undefined} key={item.href} href={item.href} className="border-b border-black/10 py-3 text-sm font-medium" onClick={() => setOpen(false)}>{item.label}</Link>)}</nav>
            <LeadModalTrigger mode="selection" context={{ source: "header" }} className="cta-primary mt-3 w-full" onClick={() => setOpen(false)}>Оставить заявку</LeadModalTrigger>
      </div>}
    </header>
  );
}
