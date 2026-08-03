import type { Metadata } from "next";
import Link from "next/link";
import { CHANNEL_URL, PHONE_DISPLAY } from "@/lib/constants";
import { SectionRouteLayer } from "@/components/ui/SectionRouteLayer";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных",
  description: "Политика конфиденциальности KONSTANT AUTO.",
  alternates: { canonical: "/privacy" },
  robots: "index, follow",
};

export default function PrivacyPage() {
  return (
    <div className="section-light min-h-screen border-t border-gray-200/80">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Главная", path: "/" },
          { name: "Политика обработки персональных данных", path: "/privacy" },
        ])}
      />
      <SectionRouteLayer pattern="alpha" />
      <div className="container relative z-10 mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-6 border-b border-gray-200/80">
          Политика обработки персональных данных
        </h1>
        <div className="prose prose-gray max-w-none text-gray-700 space-y-6">
          <p>
            Настоящая политика определяет порядок обработки персональных данных пользователей сайта и сервисов KONSTANT AUTO (далее — оператор).
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8">1. Общие положения</h2>
          <p>
            Обработка персональных данных осуществляется в соответствии с законодательством Российской Федерации. Оператор обрабатывает персональные данные только с согласия субъекта персональных данных или в случаях, предусмотренных законом.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8">2. Цели обработки</h2>
          <p>
            Персональные данные используются для связи с пользователем по заявкам, консультациям, информирования об этапах оказания услуг, а также для улучшения качества сервиса.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8">3. Состав данных</h2>
          <p>
            Могут обрабатываться: имя, контактный телефон, адрес электронной почты, данные мессенджеров (при обращении через Telegram и иные каналы), а также иные сведения, предоставленные пользователем добровольно.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8">4. Передача данных</h2>
          <p>
            Оператор не передаёт персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством или необходимых для исполнения договора (например, логистика, таможня).
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8">5. Защита данных</h2>
          <p>
            Оператор принимает меры для защиты персональных данных от неправомерного доступа, уничтожения, изменения или распространения.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8">6. Права пользователя</h2>
          <p>
            Пользователь вправе запросить доступ к своим данным, их уточнение, удаление или ограничение обработки, направив запрос по контактам, указанным на сайте.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8">7. Контакты</h2>
          <p>
            По вопросам обработки персональных данных:{" "}
            <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              Telegram-канал
            </a>
            , телефон {PHONE_DISPLAY}.
          </p>
          <p className="mt-10 text-sm text-gray-500">
            Дата последнего обновления: 2025 г.
          </p>
        </div>
        <p className="mt-10 pt-6 border-t border-gray-200/80">
          <Link href="/" className="text-accent hover:underline">
            На главную
          </Link>
        </p>
      </div>
    </div>
  );
}
