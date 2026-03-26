import { ArrowRight, MessageCircleMore } from "lucide-react";
import { BOT_START } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";
import { LeadModalTrigger } from "@/components/leads/LeadModalTrigger";
import { SectionRouteLayer } from "@/components/ui/SectionRouteLayer";

export function CtaSection() {
  return (
    <section className="section-light border-t border-slate-200/80">
      <SectionRouteLayer pattern="beta" />
      <div className="container relative z-10 mx-auto px-4 py-16 sm:py-20 lg:py-24">
        <Reveal>
          <div className="light-card relative mx-auto max-w-5xl overflow-hidden rounded-[36px] px-6 py-8 sm:px-10 sm:py-12">
            <div className="absolute inset-x-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,76,76,0.28),transparent_70%)] blur-3xl" />
            <div className="relative">
              <div className="eyebrow-light">
                <span className="route-dot" />
                Следующий шаг — заявка или консультация
              </div>
              <h2 className="mx-auto mt-5 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Следующий шаг — Telegram-бот
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Заявка, консультация и трекинг заказа — всё в одном месте. Оставьте запрос на сайте,
                а мы сразу отправим его в рабочий Telegram-чат и подключим бот для дальнейшего
                сопровождения.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                  <p className="text-lg font-semibold text-slate-950">Заявка на подбор авто</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Короткий пошаговый бриф: бюджет, тип автомобиля, сроки и пожелания по модели.
                  </p>
                  <LeadModalTrigger mode="selection" className="cta-primary mt-6 gap-2 text-sm">
                    Открыть форму подбора
                    <ArrowRight className="h-4 w-4" />
                  </LeadModalTrigger>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                  <p className="text-lg font-semibold text-slate-950">Консультация специалиста</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Быстрый сценарий для вопросов по выгоде, логистике, документам и подбору.
                  </p>
                  <LeadModalTrigger mode="consultation" className="cta-light mt-6 gap-2 text-sm">
                    <MessageCircleMore className="h-4 w-4 text-red-500" />
                    Получить консультацию
                  </LeadModalTrigger>
                </div>
              </div>

              <p className="mt-6 text-sm text-slate-500">
                После отправки можно сразу перейти в{" "}
                <a
                  href={BOT_START.consult}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-red-600 underline decoration-red-200 underline-offset-4 transition-colors hover:text-red-700"
                >
                  Telegram-бот
                </a>{" "}
                для дальнейшего общения и трекинга.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
