"use client";

import { Check, FileCheck2, MessageCircle, Search, Send, Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const steps = [
  [MessageCircle, "Заявка", "Обсуждаем пожелания и параметры подбора"],
  [Search, "Подбор и проверка", "Ищем лучший вариант и предоставляем отчёт"],
  [FileCheck2, "Договор", "Фиксируем условия и порядок поставки"],
  [Truck, "Доставка", "Организуем логистику и таможенное оформление"],
  [Send, "Трекинг", "Следите за статусом в Telegram 24/7"],
  [Check, "Выдача авто", "Передаём автомобиль и документы"],
] as const;

export function ProcessSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.22 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} id="how" className={`section-dark process-section ${visible ? "is-visible" : ""}`}>
      <div className="site-container section-pad">
        <div className="process-layout">
          <div><p className="eyebrow-red">КАК МЫ РАБОТАЕМ</p><h2>Прозрачный процесс<br />от заявки до выдачи</h2></div>
          <div className="process-steps">
            <svg className="process-line process-line-horizontal" viewBox="0 0 1000 8" preserveAspectRatio="none" aria-hidden><path d="M0 4H1000" /></svg>
            <svg className="process-line process-line-vertical" viewBox="0 0 8 1000" preserveAspectRatio="none" aria-hidden><path d="M4 0V1000" /></svg>
            {steps.map(([Icon, title, text], index) => (
              <article key={title} className="process-step" style={{ "--step-delay": `${index * 90}ms` } as React.CSSProperties}>
                <div className="process-icon"><Icon aria-hidden /></div>
                <div className="process-copy"><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
