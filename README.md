# KONSTANT AUTO

SEO-лендинг и статический каталог автомобилей под заказ для KONSTANT AUTO. Сайт показывает примеры моделей, принимает заявки через внутренний API и направляет пользователей в Telegram-бот для консультации и трекинга.

Production-домен: [https://константавто.рф](https://константавто.рф).

## Стек

- Next.js 14.2.18, App Router;
- React 18.3.1;
- TypeScript 5.9.3, `strict: true`;
- TailwindCSS 3.4.x и PostCSS;
- `next/image`, `next/font`, Lucide React;
- локальный JSON-каталог без CMS и базы данных.

Точные разрешённые версии находятся в `package.json`, зафиксированные версии — в `package-lock.json`.

## Требования

- Node.js 18.17 или новее; для разработки рекомендуется актуальная LTS-версия;
- npm с поддержкой lockfile v3;
- доступ к npm registry при первой установке;
- для обычного запуска системные зависимости не нужны: `sharp` устанавливается как npm-пакет;
- сетевой доступ нужен только для установки, отправки заявок и необязательных скриптов загрузки изображений.

## Установка

```bash
npm install
```

Не коммитьте `.env`, credentials, локальные базы и каталоги виртуальных окружений.

## Локальный запуск

Стандартный порт Next.js — 3000:

```bash
npm run dev
```

Для принятого в проекте адреса `http://localhost:3001`:

```bash
npm run dev -- -p 3001
```

## Production-сборка и запуск

```bash
npm run build
npm run start
```

Запуск production-сборки на порту 3001:

```bash
npm run start -- -p 3001
```

## Команды качества

```bash
npm run lint
npm run test:typecheck
npm run build
npm audit
```

Автоматических unit/e2e-тестов в проекте пока нет. `npm audit fix --force` не используется: переход с Next.js 14 на актуальную major-версию требует отдельного regression-тестирования.

## Переменные окружения

Скопируйте безопасный перечень имён из `.env.example` в локальный `.env.local` или настройте их в окружении хостинга.

| Переменная | Где используется | Назначение |
| --- | --- | --- |
| `LEADS_PROXY_URL` | только сервер, `POST /api/leads` | HTTP(S)-endpoint, принимающий JSON `{ "text": "..." }` |
| `LEADS_PROXY_SECRET` | только сервер, `POST /api/leads` | Bearer secret для server-to-server запроса |

Переменные не должны иметь префикс `NEXT_PUBLIC_`. Без обеих переменных форма корректно вернёт 503 и предложит пользователю альтернативный канал связи. Для production рекомендуется только HTTPS proxy URL.

Старые `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` не используются Next.js-сайтом: доставка заявок вынесена в proxy.

## Архитектура

```text
app/
  api/leads/route.ts        серверная валидация и proxy-доставка заявок
  catalog/                  каталог, query-фильтры и страницы [slug]
  contacts/                 контакты
  privacy/                  политика обработки данных
  tracking/                 трекинг через Telegram
  layout.tsx                root layout, metadata, Header/Footer, JSON-LD
  page.tsx                  главная страница
  robots.ts, sitemap.ts     техническое SEO
components/
  home/                     используемые интерактивные секции главной
  leads/                    модальная форма и её поля
  ui/                       используемые декоративные route-layers
data/
  cars.json                 исходные данные 148 моделей
  modelImages.generated.json  переопределения медиа отдельных моделей
lib/
  catalog.ts                валидация, выборка и фильтрация каталога
  constants.ts              домен, контакты, внешние ссылки
  leads.ts                  типы, runtime-parser, валидация и формат сообщений
  structured-data.ts        Organization, WebSite, breadcrumbs и Vehicle
public/
  brand/                    логотипы
  images/catalog/           оптимизированные WebP каталога
  images/hero/              изображения первого экрана
reference/
  car-source-images/        исходные JPEG/PNG вне HTTP runtime
types/catalog.ts            типы каталога
```

`KonstantAutoTreckBot/` — отдельный Python-проект и не входит в runtime Next.js-сайта. Его credentials, `.env`, локальные БД и виртуальные окружения должны оставаться вне Git и production-артефакта сайта.

Server Components используются по умолчанию. Client Components оставлены только там, где нужны состояние или browser API: Header, фильтры каталога, showcase/map/process, контакты с modal trigger и форма заявки. Код большой формы загружается динамически при открытии.

## Маршруты

| URL | Тип | Назначение |
| --- | --- | --- |
| `/` | static | SEO-лендинг |
| `/catalog` | dynamic по query string | каталог, фильтры и пагинация |
| `/catalog/[slug]` | SSG | страница модели; неизвестный slug возвращает 404 |
| `/tracking` | static | переход в Telegram-трекинг |
| `/contacts` | static | контакты и каналы связи |
| `/privacy` | static | политика обработки персональных данных |
| `/api/leads` | server route | принимает только `POST application/json` |
| `/robots.txt` | generated | правила индексации |
| `/sitemap.xml` | generated | статические страницы и все модели |

## Каталог `data/cars.json`

Корневое значение — массив объектов:

```json
{
  "slug": "toyota_camry",
  "brand": "Toyota",
  "model": "Camry",
  "bodyType": "Седан",
  "country": "Япония",
  "budgetMin": 2500000,
  "budgetMax": 3500000,
  "savingsUpTo": 150000,
  "image": "/images/catalog/toyota-camry.webp"
}
```

Правила:

- `slug` уникален и содержит только `a-z`, цифры, `_` или `-`;
- `bodyType`: `Седан`, `Кроссовер`, `Внедорожник`, `Пикап` или `Хэтчбек`;
- `country`: `Китай`, `Корея`, `Япония`, `США`, `Европа`, `ОАЭ`, `Россия` или `РФ`;
- бюджеты и `savingsUpTo` — конечные неотрицательные числа, `budgetMax >= budgetMin`;
- публичные страницы не показывают внутренние диапазоны бюджета; отображаемая выгода вычисляется в `lib/car-benefit.ts`;
- записи российского производства автоматически исключаются из публичного каталога;
- JSON проверяется при импорте, поэтому некорректная запись останавливает сборку с указанием номера.

## Добавление автомобиля

1. Добавьте объект с уникальным `slug` в `data/cars.json`.
2. Подготовьте WebP-изображение и положите его в `public/images/catalog/`.
3. Укажите путь в `image`, например `/images/catalog/toyota-camry.webp`.
4. При необходимости добавьте точные `alt`, `fit` и `position` в `data/modelImages.generated.json`.
5. Выполните `npm run test:typecheck` и `npm run build`.
6. Откройте `/catalog/<slug>` напрямую и проверьте карточку на мобильной и desktop-ширине.

## Изображения

Рекомендуемый формат каталога — WebP до 1280x800, без апскейла, с осмысленным кадрированием. Имя файла должно быть ASCII и обычно соответствует slug с заменой `_` на `-`.

Существующий вспомогательный скрипт `scripts/prepare-images.mjs` пакетно преобразует JPEG/PNG из `reference/car-source-images/` в WebP и регенерирует hero. `npm run download:images` обращается к Wikipedia/Wikimedia, записывает исходники в эту reference-папку и изменяет JSON; это служебная операция с сетью, её нельзя запускать автоматически при деплое.

Большие исходники в `reference/car-source-images/` не используются интерфейсом и должны быть исключены из production-артефакта выбранного хостинга. Runtime использует только `public/images/catalog/`.

## SEO

- источник production URL: `SITE_URL` в `lib/constants.ts`;
- `metadataBase`, canonical, Open Graph и Twitter metadata задаются через Metadata API;
- `robots.txt` и `sitemap.xml` используют `https://константавто.рф`;
- для главной добавлены Organization и WebSite JSON-LD;
- для внутренних страниц — BreadcrumbList;
- для моделей — Vehicle без выдуманных цен, наличия, рейтинга и отзывов;
- `<html lang="ru">`, favicon, icon и apple icon находятся в App Router metadata conventions.

## Домен

Пользовательский адрес хранится в Unicode-виде: `https://константавто.рф`. Стандартный `URL` сериализует его в технический IDN-вариант `https://xn--80aag3apbefwkcc.xn--p1ai/`; это ожидаемо.

В DNS, TLS-сертификате и панели хостинга проверьте оба представления одного IDN-домена. Настройте единственный HTTPS canonical host и 301 redirect со всех дополнительных доменов/`www`, не меняя canonical в приложении.

## Telegram и внешние ссылки

Контакты централизованы в `lib/constants.ts`.

- бот: `https://t.me/KONSTANTAutobot`;
- подбор: `?start=site_quiz`;
- консультация: `?start=site_consult`;
- трекинг: `?start=site_tracking`;
- модель каталога: `?start=catalog_<slug>` (поддерживается константой для интеграций);
- Telegram-канал, VK, MAX и телефон также берутся из `lib/constants.ts`.

Не добавляйте пользовательский ввод в redirect URL. Внешние ссылки, открывающиеся в новой вкладке, должны иметь `rel="noopener noreferrer"`.

## Проверки перед деплоем

```bash
npm install
npm run lint
npm run test:typecheck
npm run build
npm audit
npm run start -- -p 3001
```

После запуска вручную проверьте:

- `/`, `/catalog`, фильтры, пагинацию и прямой URL известной/неизвестной модели;
- `/tracking`, `/contacts`, `/privacy`, `/robots.txt`, `/sitemap.xml`;
- отправку обоих типов заявок с production proxy-env;
- мобильное меню, фильтры и modal с клавиатуры/Escape;
- отсутствие overflow и битых изображений на 320, 375, 430, 768, 1024, 1440 и 1920 px;
- canonical/OG/JSON-LD и защитные response headers;
- что `reference/car-source-images/`, credentials бота и локальные БД не попали в production-артефакт.

## Типовые ошибки

- `POST /api/leads` возвращает 503: не заданы или некорректны `LEADS_PROXY_URL`/`LEADS_PROXY_SECRET`.
- Форма возвращает 502: proxy недоступен, истёк восьмисекундный timeout или upstream отверг запрос.
- Сборка сообщает `data/cars.json`: исправьте номер записи, enum, числа, image path или дубликат slug.
- Изображение модели не найдено: проверьте WebP в `public/images/catalog/` и нормализацию `_` в `-`.
- Dev-сервер отвечает 500 после изменений: остановите старый процесс, удалите только generated `.next` и запустите `npm run dev -- -p 3001` заново.
- Шрифт не собирается в чистом окружении: разрешите build-процессу загрузку Google Font или заранее перейдите на проверенный локальный font asset отдельной задачей.

## Ограничения

- каталог статический: нет CMS, личного кабинета, backend-хранилища и live-наличия;
- цены, наличие и рейтинги намеренно не публикуются;
- заявки не сохраняются локально и зависят от внешнего proxy;
- rate limiting должен быть настроен на reverse proxy/CDN, а не в памяти одного Next.js-процесса;
- Next.js 14.2.18 имеет известные security advisory; major-upgrade должен быть выполнен отдельной контролируемой задачей;
- CSP требует nonce/hash и проверки инфраструктуры, поэтому формальная потенциально ломающая политика не включена.

Подробный технический статус и оставшиеся риски находятся в `AUDIT.md`.
