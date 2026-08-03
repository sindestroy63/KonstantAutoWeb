# Konstant Auto Design System V2

Новая система существует параллельно текущему UI и не подключена к production routes. Единственная публичная точка импорта:

```tsx
import { Button, Container, DesignSystemProvider } from "@/components/ui-v2";
```

## Структура

```text
components/ui-v2/
  core/          scoped tokens, provider, class-name utility
  layout/        Container, Section, ReadingWidth, Stack, Cluster, ResponsiveGrid
  typography/    Heading, Text, Eyebrow
  actions/       Button, ButtonLink, IconButton
  forms/         TextField, SelectField, Checkbox, SegmentedControl
  feedback/      StatusBadge, InlineAlert
  media/         ResponsiveImage
  overlays/      Dialog (dialog, drawer, bottom sheet)
  examples/      compiling showcase, not exposed as a route
  index.ts       public API
```

## Правила

1. Оборачивайте мигрируемый фрагмент в `DesignSystemProvider`. Токены scoped и не влияют на соседний V1 UI.
2. В application code используйте узкий domain entrypoint (`ui-v2/actions/Actions`, `ui-v2/layout/Layout`) для tree-shaking CSS Modules. Root barrel допустим в документационных примерах.
3. Не задавайте цвет, radius, shadow, motion или spacing произвольным значением. Сначала добавьте semantic token.
4. Не используйте `tokens` для inline-стилизации там, где уже существует component prop.
5. Бизнес-логика, данные, API-вызовы и routing остаются во feature-компонентах.
6. `Dialog` управляется снаружи. Он отвечает за overlay, focus trap, Escape, scroll lock и возврат фокуса.
7. Для внутренних Next.js-ссылок используйте `buttonClassName` с `next/link`, если нужен client-side navigation.

## API

### Core

- `DesignSystemProvider`: token scope; поддерживает `as="div" | "main" | "section"`.
- `tokens`: типизированные ссылки на CSS variables для редких интеграционных случаев.

### Layout

- `Container`: максимальная ширина и responsive gutters.
- `ReadingWidth`: ограничивает длину строки длинного текста.
- `Section`: стандартный vertical rhythm; tones `canvas`, `surface`, `inverse`, `transparent`.
- `Stack`: вертикальная компоновка с tokenized `gap`.
- `Cluster`: переносимая горизонтальная группа действий.
- `ResponsiveGrid`: auto-fit сетка без component-level breakpoints.

### Typography

- `Heading`: визуальные варианты `display`, `h1`-`h4`; semantic element задается через `as`.
- `Text`: размеры `large`, `body`, `small`, `label`; tones и weights ограничены.
- `Eyebrow`: короткая надсекционная подпись. Не использовать для длинного текста.

### Actions

- `Button`: native button, по умолчанию `type="button"`.
- `ButtonLink`: native anchor для внешних ссылок.
- `buttonClassName`: стили для `next/link` и существующих trigger-компонентов.
- `IconButton`: требует `label`; этот label становится `aria-label` и tooltip через `title`.

Variants: `primary`, `secondary`, `quiet`, `inverse`, `danger`. Sizes: `small`, `medium`.

### Forms

- `TextField`, `SelectField`: автоматически связывают label, description и error; error получает `role="alert"`.
- `Checkbox`: поддерживает ReactNode-label, error и native form props.
- `SegmentedControl`: контролируемая одиночная группа; не заменяет checkbox/multi-select.

Form primitives не выполняют валидацию и не отправляют данные.

### Feedback

- `StatusBadge`: semantic status; pill разрешен только здесь и в segmented controls.
- `InlineAlert`: `info`, `success`, `warning`, `danger`; danger объявляется screen reader как alert.

### Media

- `ResponsiveImage`: обертка над `next/image` со стабильными ratios `landscape`, `editorial`, `square`.
- `sizes` и содержательный `alt` обязательны на уровне использования.
- `ratio="none"` допустим только когда внешний container гарантирует высоту.

### Overlays

- `Dialog`: variants `dialog`, `drawer`, `bottomSheet`.
- Обязательны `open`, `onOpenChange`, `title`, `closeLabel` для локализованного интерфейса.
- При необходимости передайте `initialFocusRef`; иначе focus устанавливается на panel.
- Нельзя вкладывать один modal overlay в другой.

## Accessibility contract

- Основные controls имеют target не менее 44x44 px.
- Focus использует отдельный AA-контрастный синий token и не зависит только от цвета бренда.
- Labels и errors программно связаны с полями.
- Dialog имеет `role="dialog"`, `aria-modal`, accessible title/description, focus trap, Escape и focus return.
- Motion tokens становятся `0ms` при `prefers-reduced-motion: reduce`.
- Значения secondary text подобраны для AA на соответствующих surfaces; любые overrides требуют повторной проверки контраста.

Полная архитектура, примеры и migration plan находятся в `docs/design-system-v2.md`.
