import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui-v2/layout/Layout";
import { DesignSystemProvider } from "@/components/ui-v2/core/DesignSystemProvider";
import { BOT_START, BRAND, CHANNEL_URL, PHONE as PHONE_VALUE, PHONE_DISPLAY } from "@/lib/constants";
import styles from "./FooterV2.module.css";

const footerGroups = [
  {
    title: "Компания",
    links: [
      ["О нас", "/#about"],
      ["Как работаем", "/#how"],
      ["Каталог", "/catalog"],
      ["Контакты", "/contacts"],
    ],
  },
  {
    title: "Направления",
    links: [
      ["Япония", "/catalog?country=Япония"],
      ["Корея", "/catalog?country=Корея"],
      ["Китай", "/catalog?country=Китай"],
      ["Европа, США и ОАЭ", "/catalog"],
    ],
  },
] as const;

export function FooterV2() {
  return (
    <DesignSystemProvider as="footer" className={styles.footer}>
      <Container>
        <div className={styles.main}>
          <div className={styles.brand}>
            <Image src={BRAND.logoFooter} alt="KONSTANT AUTO" width={225} height={48} className={styles.logo} />
            <p className={styles.positioning}>Подбор и привоз автомобилей из-за рубежа под ключ: проверка, доставка, таможня и документы с прозрачным сопровождением.</p>
          </div>

          <div className={styles.groups}>
            {footerGroups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className={styles.groupTitle}>{group.title}</h2>
                <ul className={styles.links}>
                  {group.links.map(([label, href]) => <li key={label}><Link href={href} className={styles.link}>{label}</Link></li>)}
                </ul>
              </nav>
            ))}
            <div>
              <h2 className={styles.groupTitle}>Контакты</h2>
              <ul className={styles.links}>
                <li><a href={`tel:${PHONE_VALUE}`} className={styles.link}><Phone aria-hidden="true" />{PHONE_DISPLAY}</a></li>
                <li><a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className={styles.link}><MessageCircle aria-hidden="true" />Telegram-канал</a></li>
                <li><a href={BOT_START.tracking} target="_blank" rel="noopener noreferrer" className={styles.link}>Telegram-бот</a></li>
                <li><span className={styles.link}><MapPin aria-hidden="true" />Самара, Россия</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© 2012–2026 KONSTANT AUTO. Все права защищены.</span>
          <nav className={styles.legal} aria-label="Юридическая информация">
            <Link href="/privacy" className={styles.link}>Политика обработки данных</Link>
          </nav>
        </div>
      </Container>
    </DesignSystemProvider>
  );
}
