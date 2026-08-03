"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LeadModalTrigger } from "@/components/leads/LeadModalTrigger";
import { Container, Stack } from "@/components/ui-v2/layout/Layout";
import { DesignSystemProvider } from "@/components/ui-v2/core/DesignSystemProvider";
import { IconButton, buttonClassName } from "@/components/ui-v2/actions/Actions";
import { LazyDialog } from "@/components/ui-v2/overlays/LazyDialog";
import { BRAND, PHONE as PHONE_VALUE, PHONE_DISPLAY } from "@/lib/constants";
import { cx } from "@/components/ui-v2/core/cx";
import styles from "./HeaderV2.module.css";

const navigation = [
  { label: "О нас", href: "/#about" },
  { label: "Как работаем", href: "/#how" },
  { label: "Каталог", href: "/catalog" },
  { label: "Трекинг", href: "/#tracking" },
  { label: "FAQ", href: "/#faq" },
  { label: "Контакты", href: "/contacts" },
] as const;

function isActiveRoute(pathname: string, href: string) {
  if (href === "/catalog") return pathname === "/catalog" || pathname.startsWith("/catalog/");
  if (href === "/contacts") return pathname === "/contacts";
  return false;
}

export function HeaderV2() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY >= 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <DesignSystemProvider as="header" className={cx(styles.header, scrolled && styles.scrolled)}>
      <Container>
        <div className={styles.inner}>
          <Link href="/" className={styles.logoLink} aria-label="KONSTANT AUTO — на главную">
            <Image src={BRAND.logoHeader} alt="KONSTANT AUTO" width={225} height={48} priority className={styles.logo} />
          </Link>

          <nav className={styles.desktopNav} aria-label="Основная навигация">
            {navigation.map((item) => {
              const active = isActiveRoute(pathname, item.href);
              return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cx(styles.navLink, active && styles.navLinkActive)}>{item.label}</Link>;
            })}
          </nav>

          <div className={styles.desktopActions}>
            <a href={`tel:${PHONE_VALUE}`} className={styles.phone}>{PHONE_DISPLAY}</a>
            <LeadModalTrigger mode="selection" context={{ source: "header" }} className={buttonClassName({ size: "small" })}>Оставить заявку</LeadModalTrigger>
          </div>

          <IconButton className={styles.menuButton} label="Открыть меню" icon={<Menu aria-hidden="true" />} aria-expanded={menuOpen} aria-controls="mobile-navigation-v2" onClick={() => setMenuOpen(true)} />
        </div>
      </Container>

      <LazyDialog
        open={menuOpen}
        onOpenChange={setMenuOpen}
        variant="drawer"
        title="Меню"
        description="KONSTANT AUTO"
        closeLabel="Закрыть меню"
        initialFocusRef={firstMobileLinkRef}
      >
        <Stack id="mobile-navigation-v2" className={styles.mobileMenuContent} gap={6}>
          <nav className={styles.mobileNav} aria-label="Мобильная навигация">
            {navigation.map((item, index) => {
              const active = isActiveRoute(pathname, item.href);
              return (
                <Link ref={index === 0 ? firstMobileLinkRef : undefined} key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cx(styles.mobileLink, active && styles.mobileLinkActive)} onClick={() => setMenuOpen(false)}>
                  {item.label}<ArrowRight aria-hidden="true" />
                </Link>
              );
            })}
          </nav>
          <Stack className={styles.mobileContact} gap={4}>
            <a href={`tel:${PHONE_VALUE}`} className={styles.mobilePhone}><Phone aria-hidden="true" /> {PHONE_DISPLAY}</a>
            <LeadModalTrigger mode="selection" context={{ source: "header" }} className={buttonClassName({ fullWidth: true })} onClick={() => setMenuOpen(false)}>Оставить заявку</LeadModalTrigger>
          </Stack>
        </Stack>
      </LazyDialog>
    </DesignSystemProvider>
  );
}
