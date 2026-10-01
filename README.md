# Vital Vibe Constructions — сайт

> **Начать здесь: [текущие задачи и передача контекста → `/task`](task/README.md).**
> Следующий шаг — [подготовка и перенос проверенного релиза на VPS](task/003-vps-cutover.md).

Полный новый сайт готовится к переносу в ветке `release/vps-migration`. Разбор истории и правила веток — в [аудите релиза](task/004-release-branch-audit.md). Исходные данные находятся в `content/tables`, страницы собираются в `site-next`.

## Для продолжения работы

- [task/README.md](task/README.md) — краткий контекст, решения владельца и очередь задач.
- [AGENTS.md](AGENTS.md) — обязательные правила работы и порядок чтения контрактов.
- [HANDOFF.md](HANDOFF.md) — подробная передача контекста.
- [architecture/session-state.yaml](architecture/session-state.yaml) — текущее состояние и результаты проверок.
- [TERMUX_WORKFLOW.md](TERMUX_WORKFLOW.md) — работа с репозиторием через Termux.

## Проверка и сборка нового сайта

Из корня репозитория:

```bash
node tools/checks/run.mjs
node tools/deploy/build-vps-bundle.mjs
node tools/deploy/validate-vps-bundle.mjs
```

Публикуется только содержимое `.deploy-dist/`. Не загружайте весь корень репозитория и не переключайте GitHub Pages на корень рабочей ветки: там находятся служебные документы и черновики. `/task` — папка репозитория, а не маршрут сайта. Валидатор сборки отклоняет её попадание в публичный пакет.

Текущий план размещения: [VPS и Caddy](architecture/vps-migration-plan.md). [GitHub Pages](architecture/production-deployment-plan.md) сохранён как отдельный резервный сценарий. Команды выше готовят и проверяют файлы, но не выполняют деплой.

## Структура

- `content/tables/`, `knowledge/` — исходные записи и их валидация.
- `tools/` — сборщики и проверки; `site-next/` — генерируемые страницы.
- `assets/`, `estandar/`, `premium/`, `proyecto-1/`, `proyecto-2/`, `smart/` — изображения.
- `sandbox/articles/` — оставшиеся черновики статей.
- `task/`, `architecture/`, `HANDOFF.md` — задачи, контракты и контекст разработки.
- Корневые `index.html`, старые галереи и `support.js` — прежний сайт; во время миграции их не редактируем.
