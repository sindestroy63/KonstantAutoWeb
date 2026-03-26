import Link from "next/link";
import { ArrowRight, MessageCircleMore } from "lucide-react";
import { getHeroCars } from "@/lib/catalog";
import { Reveal } from "@/components/ui/Reveal";
import { LeadModalTrigger } from "@/components/leads/LeadModalTrigger";
import { HeroCarCarousel } from "@/components/home/HeroCarCarousel";
import { HeroRouteBackground } from "@/components/home/HeroRouteBackground";

const badges = [
  "Работа по договору",
  "Фото и видео на каждом этапе",
  "Без скрытых платежей",
  "На рынке с 2012 года",
];

export function HeroSection() {
  const cars = getHeroCars();

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(180deg,#0b1018_0%,#121824_100%)]">
      <HeroRouteBackground />

      <div className="container relative z-10 mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 xl:grid-cols-[1fr_0.95fr]">
          <Reveal className="max-w-2xl">
            <div className="eyebrow">
              <span className="route-dot" />
              KONSTANT AUTO
            </div>
            <h1 className="text-balance mt-6 text-4xl font-semibold leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Привоз автомобилей из-за рубежа без лишних посредников
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Подбор, проверка, выкуп, доставка и оформление — сопровождаем сделку на каждом этапе.
              Статус автомобиля и заявки можно отслеживать в Telegram.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LeadModalTrigger mode="selection" className="cta-primary gap-2 text-base">
                Оставить заявку на подбор
                <ArrowRight className="h-4 w-4" />
              </LeadModalTrigger>
              <Link href="/catalog" className="cta-secondary text-base">
                Смотреть каталог
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <LeadModalTrigger
                mode="consultation"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-medium transition-colors hover:border-white/20 hover:bg-white/[0.08]"
              >
                <MessageCircleMore className="h-4 w-4 text-red-300" />
                Консультация специалиста
              </LeadModalTrigger>
              <span className="text-slate-500">Ответим по подбору, выгоде и срокам привоза.</span>
            </div>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-slate-200"
                >
                  {badge}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <HeroCarCarousel cars={cars} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
