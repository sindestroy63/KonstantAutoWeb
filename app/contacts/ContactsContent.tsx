"use client";

import { ArrowRight, Bot, Clock3, FileCheck2, Globe2, MapPin, MessageCircle, Phone, Radio, Send } from "lucide-react";
import { LeadModalTrigger } from "@/components/leads/LeadModalTrigger";
import { BOT_START, CHANNEL_URL, MAX_URL, PHONE as PHONE_VALUE, PHONE_DISPLAY, VK_URL } from "@/lib/constants";

const channels = [
  { icon: Bot, title: "Telegram-бот", text: "Заявка, консультация и трекинг", href: BOT_START.tracking },
  { icon: Radio, title: "Telegram-канал", text: "Новости и автомобили в наличии", href: CHANNEL_URL },
  { icon: MessageCircle, title: "ВКонтакте", text: "Сообщество и сообщения", href: VK_URL },
  { icon: Send, title: "MAX", text: "Связаться с менеджером", href: MAX_URL },
];

export function ContactsContent() {
  return <div className="bg-[#f7f5f1]">
    <div className="site-container pb-8 pt-14 md:pb-12 md:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
        <section>
          <p className="eyebrow-red">КОНТАКТЫ</p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] md:text-6xl">Давайте обсудим<br />ваш автомобиль</h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-black/60">Подберём автомобиль под ваши задачи, проверим и доставим из любой страны. Проконсультируем по всем этапам — от выбора до выдачи ключей.</p>
          <a href={`tel:${PHONE_VALUE}`} className="mt-8 flex items-center gap-4 text-2xl font-semibold md:text-3xl"><span className="flex h-12 w-12 items-center justify-center rounded-[6px] border border-black/15"><Phone className="h-5 w-5" /></span>{PHONE_DISPLAY}</a>
          <p className="mt-5 flex items-center gap-3 text-sm text-black/55"><Clock3 className="h-5 w-5 text-black" />Отвечаем ежедневно с 9:00 до 21:00</p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row"><LeadModalTrigger mode="selection" context={{ source: "contacts" }} className="cta-primary">Оставить заявку</LeadModalTrigger><LeadModalTrigger mode="consultation" context={{ source: "contacts" }} className="cta-light">Получить консультацию</LeadModalTrigger></div>
        </section>
        <section className="light-card px-5 md:px-7">{channels.map(({icon:Icon,title,text,href}) => <a key={title} href={href} target="_blank" rel="noopener noreferrer" className="group flex min-h-[112px] items-center gap-5 border-b border-black/10 py-5 last:border-0"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[8px] border border-black/15"><Icon className="h-7 w-7" /></span><span><b className="block text-lg md:text-xl">{title}</b><small className="mt-2 block text-sm text-black/50">{text}</small></span><ArrowRight className="ml-auto h-6 w-6 text-red-600 transition-transform group-hover:translate-x-1" /></a>)}</section>
      </div>
      <section className="light-card relative mt-12 grid overflow-hidden md:grid-cols-3">
        {[[MapPin,"Самара","Работаем из Самары. Встречи и выдача автомобилей — по предварительной договорённости."],[Globe2,"Регион работы","Россия и Республика Беларусь. Доставляем автомобили из разных стран."],[FileCheck2,"Работа по договору","Работаем официально по договору. Прозрачные условия и полное сопровождение."]].map(([Icon,title,text],i)=><div key={String(title)} className={`flex gap-4 p-7 ${i ? "border-t border-black/10 md:border-l md:border-t-0" : ""}`}><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-red-200 text-red-600"><Icon className="h-5 w-5" /></span><div><h2 className="font-semibold">{String(title)}</h2><p className="mt-2 text-xs leading-6 text-black/55">{String(text)}</p></div></div>)}
      </section>
    </div>
  </div>;
}
