import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { BOT_START, BRAND, CHANNEL_URL, PHONE, PHONE_DISPLAY } from "@/lib/constants";

export function Footer() {
  return <footer className="bg-[#11171a] text-white">
    <div className="site-container grid gap-10 py-12 md:grid-cols-2 xl:grid-cols-[1.5fr_repeat(4,1fr)]">
      <div className="xl:pr-10">
        <Image src={BRAND.logoFooter} alt="KONSTANT AUTO" width={225} height={48} className="h-auto w-[190px]" />
        <p className="mt-5 max-w-xs text-sm leading-6 text-white/60">Привоз автомобилей из-за рубежа под ключ. Подбор, проверка, доставка, таможня и документы — с полной прозрачностью.</p>
        <p className="mt-7 text-xs text-white/40">© 2012–2026 KONSTANT AUTO. Все права защищены.</p>
      </div>
      <FooterCol title="КОМПАНИЯ" links={[["О нас","/#about"],["Как работаем","/#how"],["Отзывы","/#reviews"],["Контакты","/contacts"]]} />
      <FooterCol title="УСЛУГИ" links={[["Подбор авто","/#cta"],["Проверка","/#how"],["Доставка и таможня","/#how"],["Оформление документов","/#how"]]} />
      <FooterCol title="КАТАЛОГ" links={[["Япония","/catalog?country=Япония"],["Корея","/catalog?country=Корея"],["Китай","/catalog?country=Китай"],["Европа, США, ОАЭ","/catalog"]]} />
      <div className="border-white/15 xl:border-l xl:pl-8">
        <h3 className="text-xs font-bold">КОНТАКТЫ</h3>
        <div className="mt-5 space-y-3 text-sm text-white/65">
          <a href={`tel:${PHONE}`} className="flex items-center gap-2 hover:text-white"><Phone className="h-4 w-4" />{PHONE_DISPLAY}</a>
          <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="block hover:text-white">Telegram-канал</a>
          <a href={BOT_START.tracking} target="_blank" rel="noopener noreferrer" className="block hover:text-white">Telegram-бот</a>
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />Самара, Россия</span>
        </div>
      </div>
    </div>
  </footer>;
}

function FooterCol({title, links}:{title:string;links:string[][]}) {
  return <div className="border-white/15 xl:border-l xl:pl-8"><h3 className="text-xs font-bold">{title}</h3><div className="mt-5 space-y-3">{links.map(([label,href]) => <Link key={label} href={href} className="block text-sm text-white/60 hover:text-white">{label}</Link>)}</div></div>;
}
