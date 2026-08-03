import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, FileCheck2, Handshake, KeyRound, MapPin, Search, ShieldCheck, Ship, Sparkles } from "lucide-react";
import type { Car } from "@/types/catalog";
import { CarImage } from "@/components/CarImage";
import { LeadModalTrigger } from "@/components/leads/LeadModalTrigger";
import { DesignSystemProvider, StatusBadge, buttonClassName } from "@/components/ui-v2";
import { formatBenefit, getCarBenefit } from "@/lib/car-benefit";
import { getVehicleBenefits } from "@/lib/vehicle-detail";
import styles from "./VehicleDetailPageV2.module.css";
import { VehicleMediaViewerV2 } from "./VehicleMediaViewerV2";

const processSteps = [
  { title: "Консультация", text: "Фиксируем бюджет, задачи и требования к автомобилю.", icon: Handshake },
  { title: "Поиск", text: "Отбираем подходящие варианты на доступных рынках.", icon: Search },
  { title: "Проверка", text: "Проверяем историю, документы и состояние автомобиля.", icon: ShieldCheck },
  { title: "Покупка", text: "Согласовываем вариант и сопровождаем расчёты по договору.", icon: ClipboardCheck },
  { title: "Логистика", text: "Организуем перевозку, таможню и доставку.", icon: Ship },
  { title: "Выдача", text: "Передаём автомобиль и комплект документов.", icon: KeyRound },
] as const;

const includedServices = ["Подбор", "Проверка", "Отчёт", "Документы", "Доставка", "Таможня", "Постановка на учёт"] as const;

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value);
}

export function VehicleDetailPageV2({ car, relatedCars }: { car: Car; relatedCars: Car[] }) {
  const context = { source: "vehicle-page" as const, carSlug: car.slug, carName: `${car.brand} ${car.model}` };
  const benefits = getVehicleBenefits(car);

  return (
    <DesignSystemProvider className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Навигация по каталогу">
          <Link href="/catalog"><ArrowLeft aria-hidden="true" />Назад в каталог</Link>
        </nav>

        <div className={styles.heroGrid}>
          <VehicleMediaViewerV2 car={car} />
          <aside className={styles.summary} aria-labelledby="vehicle-title">
            <div className={styles.meta}><span>{car.country}</span><StatusBadge tone="success">Под заказ</StatusBadge></div>
            <p className={styles.brand}>{car.brand}</p>
            <h1 id="vehicle-title">{car.model}</h1>
            <p className={styles.bodyType}>{car.bodyType}</p>
            <div className={styles.priceBlock}>
              <span>Ориентировочная стоимость</span>
              <strong>от {formatPrice(car.budgetMin)} ₽</strong>
              <small>Итоговая стоимость зависит от выбранного автомобиля и условий поставки.</small>
            </div>
            <div className={styles.saving}><span>Потенциальная выгода</span><strong>до {formatBenefit(getCarBenefit(car))} ₽</strong></div>
            <p className={styles.description}>Это ориентир для индивидуального подбора, а не автомобиль в наличии. Найдём, проверим, купим и доставим подходящий вариант под ваши критерии.</p>
            <div className={styles.actions}>
              <LeadModalTrigger mode="selection" context={context} className={buttonClassName({ variant: "primary", fullWidth: true })}>Получить расчёт</LeadModalTrigger>
              <LeadModalTrigger mode="consultation" context={{ ...context, consultationTopic: "Покупка автомобиля" }} className={buttonClassName({ variant: "secondary", fullWidth: true })}>Получить консультацию</LeadModalTrigger>
            </div>
            <ul className={styles.compactList} aria-label="Входит в сопровождение">
              {["Подбор", "Проверка", "Доставка", "Оформление", "Документы", "Сопровождение"].map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}
            </ul>
          </aside>
        </div>
      </div>

      <section className={styles.section} aria-labelledby="benefits-title">
        <div className={styles.container}>
          <div className={styles.sectionHead}><span>Ориентир для подбора</span><h2 id="benefits-title">Почему именно этот автомобиль</h2><p>Практические преимущества модели, которые стоит учитывать при выборе.</p></div>
          <ul className={styles.benefits}>{benefits.map((benefit, index) => <li key={benefit}><span>{String(index + 1).padStart(2, "0")}</span>{benefit}</li>)}</ul>
        </div>
      </section>

      <section className={`${styles.section} ${styles.mutedSection}`} aria-labelledby="process-title">
        <div className={styles.container}>
          <div className={styles.sectionHead}><span>Понятный процесс</span><h2 id="process-title">Как проходит подбор</h2></div>
          <ol className={styles.process}>{processSteps.map(({ title, text, icon: Icon }, index) => <li key={title}><div className={styles.icon}><Icon aria-hidden="true" /></div><small>Этап {index + 1}</small><h3>{title}</h3><p>{text}</p></li>)}</ol>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="included-title">
        <div className={styles.container}>
          <div className={styles.sectionHead}><span>Под ключ</span><h2 id="included-title">Что входит в стоимость</h2><p>Состав работ фиксируем до начала подбора. Дополнительные услуги согласовываются отдельно.</p></div>
          <ul className={styles.included}>{includedServices.map((service) => <li key={service}><FileCheck2 aria-hidden="true" /><strong>{service}</strong>{service === "Постановка на учёт" ? <span>Опционально</span> : <span>Включено</span>}</li>)}</ul>
        </div>
      </section>

      <section className={`${styles.section} ${styles.inverse}`} aria-labelledby="trust-title">
        <div className={styles.container}>
          <div className={styles.sectionHead}><span>Konstant Auto</span><h2 id="trust-title">Почему нас выбирают</h2></div>
          <div className={styles.trustGrid}>
            <article><Sparkles aria-hidden="true" /><strong>1 договор</strong><p>Ответственность и состав услуг закреплены документально.</p></article>
            <article><ShieldCheck aria-hidden="true" /><strong>Проверка до покупки</strong><p>Согласование только после проверки истории и состояния.</p></article>
            <article><MapPin aria-hidden="true" /><strong>Под ключ</strong><p>Один процесс от поиска до выдачи автомобиля.</p></article>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="related-title">
        <div className={styles.container}>
          <div className={styles.sectionHead}><span>Другие ориентиры</span><h2 id="related-title">Похожие автомобили</h2></div>
          <ul className={styles.relatedGrid}>{relatedCars.map((related) => <li key={related.slug}><article className={styles.relatedCard}><div className={styles.relatedMedia}><CarImage car={related} sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw" /></div><div className={styles.relatedBody}><span>{related.country} · {related.bodyType}</span><h3>{related.brand} {related.model}</h3><strong>от {formatPrice(related.budgetMin)} ₽</strong><Link href={`/catalog/${related.slug}`} aria-label={`Подробнее о ${related.brand} ${related.model}`}>Подробнее<ArrowRight aria-hidden="true" /></Link></div></article></li>)}</ul>
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="final-cta-title">
        <div className={styles.container}><div><span>Персональный подбор</span><h2 id="final-cta-title">Получите расчёт под ваши задачи</h2><p>Расскажите, какой автомобиль нужен. Подготовим варианты и понятный план поставки.</p></div><LeadModalTrigger mode="selection" context={context} className={buttonClassName({ variant: "primary" })}>Оставить заявку</LeadModalTrigger></div>
      </section>
      <div className={styles.mobileSticky}>
        <LeadModalTrigger mode="selection" context={context} className={buttonClassName({ variant: "primary", fullWidth: true })}>Получить расчёт</LeadModalTrigger>
      </div>
    </DesignSystemProvider>
  );
}
