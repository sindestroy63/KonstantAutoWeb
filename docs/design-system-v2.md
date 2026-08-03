# Design System V2: архитектура и миграция

## Статус Phase 1

Design System V2 создана как параллельный, scoped слой. Она не импортируется в `app/layout.tsx`, существующие страницы или V1-компоненты, поэтому не меняет внешний вид, routing, SEO, API и бизнес-поведение сайта.

Исходный UI остается источником production-представления до отдельного решения о миграции каждого маршрута.

## Архитектурные решения

### Scoped tokens

`DesignSystemProvider` добавляет CSS variables только своему subtree. Это позволяет мигрировать одну секцию или компонент без глобального переключения темы. `Dialog` рендерится через portal и самостоятельно добавляет тот же token scope.

Цвета разделены по ролям, а не по физическим названиям: `canvas`, `surface`, `text`, `border`, `accent`, `success`, `warning`, `danger`. Компонент не должен знать конкретный HEX.

Spacing построен на четырехпиксельной шкале. Радиусы ограничены `none`, `sm`, `md`, `lg`, `pill`; pill является исключением для status и segmented controls. Shadows имеют четыре уровня: `none`, `soft`, `raised`, `overlay`.

Typography использует Manrope из текущего проекта с system fallback. Display и headings масштабируются через ограниченный `clamp`; body text не масштабируется от viewport и сохраняет читаемый размер.

Motion имеет три длительности и общий easing. Reduced-motion автоматически обнуляет длительности, а overlay keyframes дополнительно отключаются.

### Разделение ответственности

```text
Page/feature
  данные, URL, API, validation, analytics, business state
       |
       v
UI V2 component
  semantics, layout, visual states, focus, keyboard behavior
       |
       v
Scoped tokens
  color, typography, spacing, radius, shadow, motion
```

UI-компонент не импортирует catalog data, lead API, router или SEO metadata. Feature-компонент может использовать V2 primitive, сохраняя существующие handlers.

## Примеры

### Изолированный фрагмент

```tsx
import {
  Button,
  Container,
  DesignSystemProvider,
  Heading,
  Section,
  Stack,
  Text,
} from "@/components/ui-v2";

export function NewSection() {
  return (
    <DesignSystemProvider>
      <Section tone="canvas">
        <Container>
          <Stack gap={4}>
            <Heading as="h2">Автомобили под заказ</Heading>
            <Text tone="muted">Существующие данные и обработчики передаются без изменений.</Text>
            <Button onClick={existingHandler}>Получить расчет</Button>
          </Stack>
        </Container>
      </Section>
    </DesignSystemProvider>
  );
}
```

### Next.js Link в виде кнопки

```tsx
import Link from "next/link";
import { buttonClassName } from "@/components/ui-v2";

<Link href="/catalog" className={buttonClassName({ variant: "secondary" })}>
  Смотреть каталог
</Link>
```

### Поле с ошибкой

```tsx
<TextField
  label="Телефон"
  type="tel"
  autoComplete="tel"
  required
  error={errors.phone}
  value={payload.phone}
  onChange={handlePhoneChange}
/>
```

### Drawer с существующим состоянием фильтров

```tsx
<Dialog
  variant="drawer"
  open={filtersOpen}
  onOpenChange={setFiltersOpen}
  title="Фильтры"
  closeLabel="Закрыть фильтры"
  footer={<Button fullWidth onClick={applyExistingFilters}>Показать результаты</Button>}
>
  {existingFilterFields}
</Dialog>
```

Компилируемый полный пример находится в `components/ui-v2/examples/ComponentExamples.tsx`; он намеренно не подключен как route.

## Компонентная структура

| Слой | Компоненты | Назначение |
|---|---|---|
| Core | `DesignSystemProvider`, `tokens` | Scoped тема и типизированные CSS variable references |
| Layout | `Container`, `ReadingWidth`, `Section`, `Stack`, `Cluster`, `ResponsiveGrid` | Mobile-first композиция без page-specific grid |
| Typography | `Heading`, `Text`, `Eyebrow` | Ограниченная типографическая шкала |
| Actions | `Button`, `ButtonLink`, `IconButton` | Команды, ссылки и icon-only actions |
| Forms | `TextField`, `SelectField`, `Checkbox`, `SegmentedControl` | Доступные form primitives без бизнес-логики |
| Feedback | `StatusBadge`, `InlineAlert` | Статусы, ошибки и системная обратная связь |
| Media | `ResponsiveImage` | Стабильный ratio и `next/image` contract |
| Overlays | `Dialog` | Modal, desktop drawer и mobile bottom sheet |

## План миграции страниц

### Gate 0: до первой миграции

1. Добавить component-level tests для keyboard/focus behavior `Dialog` и form associations.
2. Зафиксировать screenshots текущих страниц на 320, 375, 768, 1440 и 1920 px.
3. Утвердить визуальный token sheet владельцем.
4. Запретить прямые внутренние импорты из `ui-v2/*` через code review convention.

### Шаг 1: низкорисковые primitives

Мигрировать локальные `Button`, `StatusBadge`, `Heading/Text` внутри одного вторичного блока. Существующий handler, Link href, analytics source и текст остаются прежними. Один `DesignSystemProvider` охватывает только migrated section.

### Шаг 2: Header/Footer

Собрать новые feature-компоненты поверх `Container`, actions и typography. Старые `Header`/`Footer` не удалять; переключение проводить атомарно после keyboard, route и visual QA.

### Шаг 3: Catalog

1. Создать V2 `CarCard` как domain component, используя `ResponsiveImage`, `StatusBadge` и actions.
2. Сохранить `PublicCar`, `getCarMedia`, slugs и lead context.
3. Обернуть существующие query-param handlers новым presentation layer фильтров.
4. Использовать `Dialog variant="bottomSheet"` на mobile и `drawer` при необходимости, не меняя server filtering.

### Шаг 4: Detail

Перенести gallery/summary на layout primitives. Сохранить metadata, structured data, static params, benefit calculation и оба lead modes. Новые facts добавлять только после утверждения data contract.

### Шаг 5: Lead-modal

Сначала заменить только visual shell на `Dialog`, form fields и actions. Порядок шагов, validation и API payload остаются прежними. Изменение воронки выполняется отдельной продуктовой фазой после контрактных тестов.

### Шаг 6: Home, Contacts, Tracking, Privacy

Собирать секции из уже проверенных primitives. Tracking получает один overlay/card язык; Privacy использует `ReadingWidth`; Contacts сохраняет все external links. Старый CSS удалять только после миграции последнего consumer.

## Definition of done для мигрированного компонента

- Нет изменений входных data types, API payload, URL и analytics source.
- Все visual values идут из token или component prop.
- Keyboard, focus-visible, disabled, loading, error и long-copy states проверены.
- Нет overflow на 320 px и layout shift от media.
- Контраст соответствует WCAG 2.2 AA.
- `prefers-reduced-motion` работает.
- Старый компонент остается доступен до route-level acceptance.
- Typecheck, lint, build и responsive regression проходят.

## Расширение системы

Новый primitive добавляется только если паттерн используется минимум в двух независимых местах или представляет обязательную accessibility-инфраструктуру. Domain-компоненты (`CarCard`, `VehicleFacts`) не должны попадать в core primitives.

При добавлении token:

1. Назвать его по семантической роли.
2. Добавить CSS variable в `tokens.module.css`.
3. При необходимости добавить типизированную ссылку в `tokens.ts`.
4. Документировать допустимые consumers и состояния.
5. Проверить contrast/motion/responsive последствия.

На Phase 1 глобальный импорт tokens, демонстрационный route, Storybook и изменение Tailwind theme намеренно не выполнялись: это сохраняет production UI неизменным.
