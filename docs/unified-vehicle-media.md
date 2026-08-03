# Unified Vehicle Media

> Hero media is outside this system. Its independent paths, dimensions and
> neutral fallback are defined in `docs/hero-media-contract.md`.

## Статус Phase 3.5

Единственным разрешённым runtime-источником изображений автомобилей является:

```text
public/images/catalog/manifest.json
  -> images[slug].status === "production"
  -> public/images/catalog/<file>.webp
```

Прямые fallback-переходы к `priority/`, `models/`, старым hero-изображениям, gallery, uploads и полю `cars.json.image` отключены. Поле `image` пока остаётся в data-контракте для обратной совместимости данных, но media resolver его не читает.

## Поведение при отсутствии AI-изображения

- Старое изображение автоматически не используется.
- Карточка или detail gallery показывают нейтральный placeholder «AI-изображение готовится».
- Open Graph и Vehicle JSON-LD не публикуют вымышленный или legacy image URL.
- Для модели создаётся задача в `catalog-generator/manifests/generation-queue.json`.
- Production promotion остаётся заблокирован до reference check, generation QA и подтверждения владельца.

## Покрытие

Отчёт `catalog-generator/reports/unified-vehicle-media.json` фиксирует:

- всего моделей: 148;
- AI production: 11;
- legacy в runtime: 0;
- требуют генерации: 137;
- покрытие: 7,43%.

Покрытые модели: Toyota Camry, RAV4, Land Cruiser, Hilux, Corolla, Yaris; BMW 3 Series и X5; Kia K5 и Sorento; Lexus RX.

## Legacy quarantine

Legacy-файлы физически сохранены, но не участвуют в runtime:

- 137 root catalog WebP, отсутствующих в production manifest;
- 12 файлов в `public/images/catalog/priority/`;
- 44 файла в `public/images/catalog/models/`;
- 6 файлов в `public/images/hero/`.

Они не удалены, потому что текущее покрытие ниже 100%. Удаление разрешается только когда одновременно выполнены условия:

1. все 148 моделей имеют manifest entry со статусом `production`;
2. каждый manifest-файл существует и проходит QA;
3. runtime-аудит не находит legacy-ссылок;
4. владелец подтверждает финальный promotion.

После достижения 100% необходимо удалить перечисленные legacy-каталоги и записи, повторно выполнить audit, typecheck, lint и build, затем обновить этот документ финальными значениями.

## Проверка

```powershell
npm.cmd run qa:vehicle-media
```

Команда пересобирает coverage-отчёт и generation queue и завершится ошибкой, если в `app/`, `components/` или `lib/` снова появится запрещённая legacy-ссылка.
