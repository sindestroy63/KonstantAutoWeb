# KONSTANT AUTO — сайт и каталог

SEO-лендинг и каталог «варианты под заказ» для компании KONSTANT AUTO (Самара). Сайт — витрина и точка входа в Telegram-бот для заявок и трекинга.

## Стек

- **Next.js 14** (App Router) + **TypeScript**
- **TailwindCSS**
- Данные каталога в локальном `data/cars.json` (без CMS)

## Структура

```
konstant-auto-next/
├── app/
│   ├── layout.tsx          # Общий layout, Header, Footer
│   ├── page.tsx            # Главная (лендинг)
│   ├── globals.css
│   ├── robots.ts           # Генерация robots.txt
│   ├── sitemap.ts          # Генерация sitemap.xml
│   ├── catalog/
│   │   ├── page.tsx        # Каталог с фильтрами и пагинацией
│   │   ├── CatalogClient.tsx
│   │   └── [slug]/page.tsx # Страница модели
│   ├── tracking/page.tsx   # Трекинг в Telegram
│   ├── contacts/page.tsx   # Контакты
│   └── privacy/page.tsx    # Политика конфиденциальности
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── home/               # Секции главной
├── lib/
│   ├── constants.ts        # Ссылки на бот, канал, соцсети
│   ├── catalog.ts          # Работа с data/cars.json
│   └── utils.ts
├── data/
│   └── cars.json           # Позиции каталога (только импорт, без РФ-производства)
├── public/
│   ├── logo.svg            # Логотип (Hero watermark)
│   ├── logo-footer.svg     # Логотип для футера
│   └── cars/               # Фото авто: положите slug.jpg и укажите в JSON "image": "/cars/slug.jpg"
└── types/
    └── catalog.ts
```

## Запуск

### Установка зависимостей

```bash
cd konstant-auto-next
npm install
```

### Режим разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

### Сборка для продакшена

```bash
npm run build
```

### Запуск продакшен-сборки

```bash
npm start
```

Порт по умолчанию: 3000.

## Ссылки и контакты (в коде)

- **Telegram-бот:** https://t.me/KONSTANTAutobot  
  - Заявка на подбор: `?start=site_quiz`  
  - Консультация: `?start=site_consult`  
  - Трекинг: `?start=site_tracking`  
  - Из каталога: `?start=catalog_<slug>`
- **Канал:** https://t.me/+BrmEHe0MHWtkOWFi
- **Телефон:** +7 927 719 8887 (`tel:+79277198887`)
- **VK:** https://vk.com/konstantauto
- **MAX:** ссылка из задания (в `lib/constants.ts`)

## SEO

- У каждой страницы заданы `title`, `description`, при необходимости OpenGraph.
- Страницы каталога `/[slug]` генерируются статически (`generateStaticParams`).
- Подключены `robots.txt` и `sitemap.xml` (в т.ч. все страницы каталога).
- В `metadataBase` в `app/layout.tsx` указан домен (при деплое заменить на реальный).

## Каталог

- Фильтры: марка, тип кузова, страна, бюджет, выгода «до», поиск по названию.
- Пагинация по 12 карточек на страницу.
- Кнопка «Хочу такую» ведёт в бота с параметром `catalog_<slug>`.
- В `data/cars.json` у каждой модели может быть поле `image` (путь `/cars/slug.jpg` или URL). Если не указано — подставляется стоковое фото по типу кузова. Свои фото кладите в `public/cars/`.
- Автомобили российского производства (Lada, УАЗ, Москвич и т.п.) и записи с `country: "Россия"` автоматически исключаются из каталога.

Все позиции — примеры «под заказ», не «в наличии».
