import Link from "next/link";
import { BOT_START, CHANNEL_URL, MAX_URL, PHONE, PHONE_DISPLAY, VK_URL } from "@/lib/constants";
import { LeadModalTrigger } from "@/components/leads/LeadModalTrigger";
import { SectionRouteLayer } from "@/components/ui/SectionRouteLayer";

export function Footer() {
  return (
    <footer className="relative border-t border-slate-200 bg-[linear-gradient(180deg,#fbfcfe_0%,#f3f6fb_100%)]">
      <SectionRouteLayer pattern="gamma" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(255,84,84,0.12),transparent_60%)]" />
      <div className="container relative mx-auto px-4 py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-[0.24em] text-slate-950">
              <span>KONSTANT</span>
              <span className="text-red-600">AUTO</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              Привоз автомобилей из-за рубежа под ключ. Подбор, проверка, доставка, документы и
              сопровождение сделки на каждом этапе.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <LeadModalTrigger mode="selection" className="cta-primary px-5 py-3 text-sm">
                Заявка на подбор
              </LeadModalTrigger>
              <LeadModalTrigger mode="consultation" className="cta-light px-5 py-3 text-sm">
                Консультация
              </LeadModalTrigger>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Контакты</h3>
            <div className="mt-4 space-y-3">
              <a
                href={`tel:${PHONE}`}
                className="block text-sm text-slate-700 transition-colors hover:text-red-600"
              >
                {PHONE_DISPLAY}
              </a>
              <a
                href={BOT_START.consult}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-slate-700 transition-colors hover:text-red-600"
              >
                Telegram-бот
              </a>
              <Link href="/contacts" className="block text-sm text-slate-700 transition-colors hover:text-red-600">
                Страница контактов
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Соцсети</h3>
            <div className="mt-4 space-y-3">
              <a
                href={CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-slate-700 transition-colors hover:text-red-600"
              >
                Telegram-канал
              </a>
              <a
                href={VK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-slate-700 transition-colors hover:text-red-600"
              >
                VK
              </a>
              <a
                href={MAX_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-slate-700 transition-colors hover:text-red-600"
              >
                MAX
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Навигация</h3>
            <div className="mt-4 space-y-3">
              <Link href="/catalog" className="block text-sm text-slate-700 transition-colors hover:text-red-600">
                Каталог
              </Link>
              <Link href="/tracking" className="block text-sm text-slate-700 transition-colors hover:text-red-600">
                Трекинг
              </Link>
              <Link href="/privacy" className="block text-sm text-slate-700 transition-colors hover:text-red-600">
                Политика конфиденциальности
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© KONSTANT AUTO. Все права защищены.</p>
          <p>Самара • импорт автомобилей под ключ</p>
        </div>
      </div>
    </footer>
  );
}
