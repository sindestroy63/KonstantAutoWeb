import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bell, Check, ClipboardCheck, Send, ShieldCheck, Ship } from "lucide-react";
import { LeadModalTrigger } from "@/components/leads/LeadModalTrigger";
import { BOT_START } from "@/lib/constants";
import { getCars } from "@/lib/catalog";
import { SITE_STATS } from "@/data/siteStats";
import { FAQ_ITEMS } from "@/data/faq";
import { ProcessSection } from "@/components/home/ProcessSection";
import { HomeShowcaseV2, type HomeShowcaseCar } from "@/components/home/HomeShowcaseV2";
import { getProductionAiImage } from "@/lib/production-ai-images";
import { getHeroMedia } from "@/lib/hero-media";

export default function HomePage() {
  const allCars = getCars();
  const heroMedia = getHeroMedia();
  const showcaseOrder = [
    "toyota_camry",
    "toyota_rav4",
    "toyota_land_cruiser",
    "toyota_hilux",
    "lexus_rx",
    "kia_k5",
    "kia_sorento",
    "bmw_3_series",
    "bmw_x5",
  ];
  const cars = showcaseOrder.flatMap<HomeShowcaseCar>((slug) => {
    const car = allCars.find((candidate) => candidate.slug === slug);
    const image = getProductionAiImage(slug);
    if (!car || !image) return [];
    return [{
      slug: car.slug,
      brand: car.brand,
      model: car.model,
      bodyType: car.bodyType,
      country: car.country,
      budgetMin: car.budgetMin,
      imageSrc: image.src,
    }];
  });
  return <>
    {heroMedia ? <>
      <link rel="preload" as="image" href={heroMedia.mobile.src} media="(max-width: 640px)" type="image/webp" fetchPriority="high" />
      <link rel="preload" as="image" href={heroMedia.desktop.src} media="(min-width: 641px)" type="image/webp" fetchPriority="high" />
    </> : null}
    <section className="hero-section">
      {heroMedia ? <picture>
        <source media="(max-width: 640px)" srcSet={heroMedia.mobile.src} width={heroMedia.mobile.width} height={heroMedia.mobile.height} />
        <img src={heroMedia.desktop.src} alt="" width={heroMedia.desktop.width} height={heroMedia.desktop.height} loading="eager" fetchPriority="high" decoding="async" className="hero-image" />
      </picture> : null}
      <div className="hero-overlay absolute inset-0" />
      <div className="site-container hero-content">
        <div className="max-w-[650px]">
          <h1 className="hero-title">Автомобиль<br />из-за рубежа.<br /><span>Под ключ.</span></h1>
          <p className="hero-copy">Подбор, проверка, доставка и оформление — с прозрачностью на каждом этапе.</p>
      <div className="hero-actions"><LeadModalTrigger mode="selection" context={{ source: "hero" }} className="cta-primary">Рассчитать стоимость</LeadModalTrigger><Link href="/catalog" className="cta-secondary">Смотреть каталог <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="hero-benefits">
            {[[ShieldCheck,"С 2012 года","На рынке импорта"],[ClipboardCheck,"Условия в договоре","Без скрытых доплат"],[Send,"Трекинг в Telegram","24/7 по вашему заказу"]].map(([Icon,title,text]) => <div key={String(title)} className="flex gap-3 border-l border-black/20 pl-3"><Icon className="mt-1 h-5 w-5 shrink-0" /><div><b className="block text-xs">{String(title)}</b><span className="mt-1 block text-[10px] text-black/55">{String(text)}</span></div></div>)}
          </div>
        </div>
      </div>
    </section>

    <section className="bg-[#111517] text-white"><div className="site-container grid grid-cols-2 py-4 md:grid-cols-4">{SITE_STATS.map((s,i) => <div key={s.value} className={`px-4 py-1 md:px-8 ${i ? "border-l border-white/15" : ""}`}><b className="text-3xl text-red-500 md:text-4xl">{s.value}</b><span className="ml-0 mt-2 block max-w-[170px] text-xs leading-5 text-white/70 xl:ml-3 xl:mt-0 xl:inline-block">{s.label}</span></div>)}</div></section>

    <HomeShowcaseV2 cars={cars} />

    <ProcessSection />

    <section id="tracking" className="section-light overflow-hidden"><div className="site-container section-pad grid items-center gap-12 lg:grid-cols-2"><div><p className="eyebrow-red">ТРЕКИНГ В TELEGRAM</p><h2 className="display-title mt-5">Ваш заказ —<br />всегда под контролем</h2><p className="mt-6 max-w-md text-sm leading-7 text-[#646769]">Персональный бот отправляет статусы на каждом этапе: вы всегда знаете, где ваш автомобиль.</p><ul className="mt-7 space-y-4 text-sm">{["Актуальные статусы и фото","Уведомления 24/7","Все документы в одном чате"].map(x => <li key={x} className="flex items-center gap-3"><Check className="h-4 w-4 text-red-600" />{x}</li>)}</ul><a href={BOT_START.tracking} target="_blank" rel="noopener noreferrer" className="cta-light mt-8"><Send className="h-4 w-4 text-[#229ed9]" />Перейти в Telegram-бот</a></div><PhoneMockup /></div></section>

    <section id="reviews" className="section-dark"><div className="site-container section-pad"><p className="eyebrow-red">ОТЗЫВЫ КЛИЕНТОВ</p><h2 className="mt-4 text-4xl font-semibold">Нам доверяют</h2><div className="mt-9 grid gap-5 md:grid-cols-3">{[
      ["Всё чётко и прозрачно. От подбора до выдачи — без нервов и сюрпризов.","Алексей","Москва","Toyota Land Cruiser 300"],
      ["Постоянно были на связи и присылали отчёты. Рекомендую!","Мария","Санкт-Петербург","BMW X5 xDrive40d"],
      ["Все условия совпали с договором, машину привезли раньше ожидаемого срока.","Дмитрий","Казань","Lexus RX 350"],
    ].map(r => <article key={r[1]} className="dark-card flex min-h-[190px] flex-col p-6"><p className="text-sm leading-6">“{r[0]}”</p><div className="mt-auto flex items-end justify-between pt-7"><div><b className="text-xs">{r[1]}</b><span className="block text-[10px] text-white/45">{r[2]}</span></div><span className="max-w-[120px] text-right text-[10px] text-white/45">{r[3]}</span></div></article>)}</div></div></section>

    <section id="faq" className="section-light"><div className="site-container py-14"><div className="grid gap-8 lg:grid-cols-[.6fr_1.4fr]"><div><p className="eyebrow-red">FAQ</p><h2 className="mt-4 text-3xl font-semibold">Частые вопросы</h2></div><div className="divide-y divide-black/15 border-y border-black/15">{FAQ_ITEMS.map(item => <details key={item.q} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">{item.q}<span className="text-red-600 group-open:rotate-45">+</span></summary><p className="max-w-3xl pt-4 text-sm leading-7 text-black/60">{item.a}</p></details>)}</div></div></div></section>

      <section id="cta" className="border-t border-black/10 bg-[#f7f5f1]"><div className="site-container grid items-center gap-7 py-8 md:grid-cols-[1fr_1fr_auto]"><h2 className="text-2xl font-semibold">Готовы привезти<br />автомобиль под ключ?</h2><p className="max-w-md text-sm leading-6 text-black/55">Оставьте заявку — подготовим персональный расчёт и подберём лучший вариант.</p><LeadModalTrigger mode="selection" context={{ source: "home-cta" }} className="cta-primary">Оставить заявку</LeadModalTrigger></div></section>
  </>;
}

function PhoneMockup(){const phoneImage=getProductionAiImage("kia_sorento");return <div className="relative mx-auto h-[530px] w-[285px] rotate-[7deg] rounded-[42px] border-[9px] border-[#111517] bg-[#dcecf7] p-3 shadow-2xl"><div className="mx-auto h-5 w-24 rounded-b-2xl bg-[#111517]"/><div className="mt-4 text-center text-[11px] font-bold">Konstant Auto Bot</div><div className="mt-5 space-y-4 text-[10px]"><div className="rounded-lg bg-white p-3 shadow-sm"><b>Статус: Доставка</b><p className="mt-2 leading-4">Автомобиль отправлен из Кореи</p><span className="mt-2 block text-black/40">Сегодня, 11:30</span></div><div className="relative h-32 overflow-hidden rounded-lg bg-[#efeee9]">{phoneImage ? <Image src={phoneImage.src} alt="Kia Sorento в статусе доставки" fill sizes="260px" className="object-contain" /> : null}</div><div className="rounded-lg bg-white p-3 shadow-sm"><b>Таможенное оформление</b><p className="mt-2 leading-4">Автомобиль прибыл в порт Владивостока</p><span className="mt-2 block text-black/40">09:15</span></div></div><Bell className="absolute -right-20 top-28 h-9 w-9 text-red-600" /><Ship className="absolute -right-24 top-52 h-12 w-12 text-black/20" /></div>}
