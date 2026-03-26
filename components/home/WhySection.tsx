import {
  BadgeCheck,
  Camera,
  CircleDollarSign,
  FileCheck2,
  MessagesSquare,
  ShieldEllipsis,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionRouteLayer } from "@/components/ui/SectionRouteLayer";

const reasons = [
  {
    title: "Опыт с 2012 года",
    desc: "Более 10 лет на автомобильном рынке, импорт с 2019 — знаем процедуры и подводные камни.",
    icon: BadgeCheck,
  },
  {
    title: "Цена в договоре",
    desc: "Итоговая сумма фиксируется до старта. Никаких доплат «по ходу» — вы знаете бюджет заранее.",
    icon: CircleDollarSign,
  },
  {
    title: "Договор и обязательства",
    desc: "Все этапы, сроки и условия прописаны. Работаем официально, с полной ответственностью.",
    icon: FileCheck2,
  },
  {
    title: "Фото и видео на каждом этапе",
    desc: "От осмотра до выдачи ключей — вы видите, что происходит с вашим авто в реальном времени.",
    icon: Camera,
  },
  {
    title: "Без скрытых платежей",
    desc: "Озвучиваем полную стоимость до подписания: машина, таможня, доставка, наше вознаграждение.",
    icon: ShieldEllipsis,
  },
  {
    title: "Трекинг в Telegram",
    desc: "Статус заказа и этапы доставки — в боте. Не нужно звонить: всё приходит в мессенджер.",
    icon: MessagesSquare,
  },
];

export function WhySection() {
  return (
    <section className="section-light">
      <SectionRouteLayer pattern="beta" />
      <div className="container relative z-10 mx-auto px-4 py-16 sm:py-20 lg:py-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="eyebrow-light">
            <span className="route-dot" />
            Почему выбирают нас
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Бизнес-серьёзность без непрозрачных процессов
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            Прозрачность, контроль и предсказуемый результат — без сюрпризов по деньгам и срокам.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reasons.map((reason, index) => (
            <Reveal key={reason.title} delay={index * 80}>
              <div className="shine-overlay tilt-card light-card h-full p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-500">
                    <reason.icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-950">{reason.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{reason.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
