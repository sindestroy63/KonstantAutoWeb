import { Globe2, ShieldCheck, Truck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionRouteLayer } from "@/components/ui/SectionRouteLayer";

const responsibilities = [
  "Подбор авто под заказ",
  "Импорт из Китая, Кореи, Японии, США, Европы, ОАЭ",
  "Доставка в Самару и любые регионы РФ + РБ",
  "Логистика и таможенное оформление",
  "Новые и с пробегом (импорт, не РФ рынок)",
];

const highlights = [
  { icon: Globe2, value: "6 направлений", label: "Китай, Корея, Япония, США, Европа, ОАЭ" },
  { icon: Truck, value: "Под ключ", label: "От первого сообщения до выдачи автомобиля" },
  { icon: ShieldCheck, value: "Прозрачно", label: "Полный комплект документов и понятный маршрут сделки" },
];

export function AboutSection() {
  return (
    <section id="about" className="section-light">
      <SectionRouteLayer pattern="alpha" />
      <div className="container relative z-10 mx-auto px-4 py-16 sm:py-20 lg:py-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="eyebrow-light">
            <span className="route-dot" />
            О компании
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Прозрачный импорт без ощущения хаоса
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div className="light-card rounded-[30px] p-6 sm:p-8">
              <p className="text-base leading-relaxed text-slate-700 sm:text-lg">
                KONSTANT AUTO — компания из Самары, специализирующаяся на подборе и привозе автомобилей
                из-за рубежа. Помогаем безопасно и прозрачно приобрести авто из Китая, Кореи, Японии,
                США, Европы и ОАЭ с доставкой в Россию и Республику Беларусь.
              </p>
              <p className="mt-5 text-base leading-relaxed text-slate-600">
                Сопровождаем клиента на всех этапах сделки: от подбора под бюджет и задачи — до выкупа,
                логистики, таможни и передачи авто с полным комплектом документов.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {highlights.map((item, index) => (
                  <Reveal key={item.value} delay={90 + index * 80}>
                    <div className="rounded-[24px] border border-slate-200/80 bg-slate-950/[0.03] p-4">
                      <item.icon className="h-5 w-5 text-red-500" />
                      <p className="mt-4 text-lg font-semibold text-slate-900">{item.value}</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.label}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="light-card rounded-[30px] p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Что берём на себя
              </p>
              <ul className="mt-6 space-y-3">
                {responsibilities.map((item, index) => (
                  <li
                    key={item}
                    className="flex items-start gap-4 rounded-[22px] border border-slate-200/80 bg-white/70 px-4 py-4"
                  >
                    <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-xs font-semibold text-red-600">
                      0{index + 1}
                    </span>
                    <span className="leading-relaxed text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
