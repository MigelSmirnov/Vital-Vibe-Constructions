# /task — продолжение работы над Vital Vibe

Это вход для владельца и следующего разработчика. Папка видна в GitHub и связана с корневым README, но не включается в сайт. Это рабочие заметки, а не новое место хранения бизнес-контента и не замена архитектурным контрактам.

## С чего начать

1. Проверить `git status -sb` и актуальность ветки `agent/architecture-sandbox`. Сохранить чужие незавершённые изменения; не применять и не удалять stash вслепую.
2. Прочитать [AGENTS.md](../AGENTS.md) и перечисленные там контракты в указанном порядке.
3. Первый visual baseline утверждён; accessibility/token layer зелёный. Responsive-image work зафиксирован в [002 — responsive image optimization](002-responsive-images.md).
4. По завершении обновить этот список, [HANDOFF.md](../HANDOFF.md) и [session-state.yaml](../architecture/session-state.yaml); записать реальные проверки и ограничения.

## Текущая точка

- Опубликованная статья о ванной существует на ES / EN / RU; главные страницы ведут на соответствующую языковую версию.
- Visual QA воспроизводимо запускается в GitHub Actions на 390×844, 768×1024 и 1440×1000.
- Human-approved baseline: run #15 / `b34f72fd7902235cd24206f9a56ea9e243e89c92`.
- Accessibility QA: run #23, без блокирующих semantic-token / target-size / Tab-focus / reduced-motion findings.
- Homepage responsive images: первые семь high-impact изображений браузерно проверены.
- Standard project: все шесть фотографий получают EXIF-aware 480/768/1200 WebP; run #45 подтвердил фактический выбор ресурсов Chromium и сохранение визуального результата.
- Premium project: bounded top-ten heavy-image slice браузерно подтверждён run #64 — 177,286 B / 177,286 B / 382,392 B выбранных ресурсов на 390 / 768 / 1440, без failed requests, broken images и overflow.
- Homepage hero/LCP: baseline run #63 показал один JPEG 264,764 B и hero как LCP в 3/3 viewport. После 480/768/1152 WebP run #64 выбирает 28,102 B / 28,102 B / 55,556 B и сохраняет approved crop. Синтетический LCP в том же профиле снизился с 1,892/3,044/3,240 ms до 632/640/892 ms; это comparison data, не field CWV.
- Hero сохраняет `fetchpriority="high"`; preload специально не добавлялся без отдельного доказательства пользы.
- Галерея сохраняет все 39 contract media. Для 16 самых тяжёлых источников повторно используются уже существующие Standard/Premium derivatives: исходный bounded payload 39,956,827 B, фактически выбранный Chromium payload в run #66 — 257,852 B на каждом reference viewport. Остальные 23 изображения намеренно не подвергались массовой генерации вариантов.
- Gallery run #66 прошёл с 0 failed requests, 0 broken images и 0 overflow; человеческий review 390/768/1440 не выявил видимой регрессии кропов или ориентации.
- Production и `main` этими изменениями не разворачивались.

## Очередь

| Приоритет | Задача | Статус / результат |
| --- | --- | --- |
| 1 | Shared secondary reduced-motion scroll cleanup | Неблокирующий хвост: gallery/El Raval всё ещё вычисляют `scroll-behavior: smooth` при reduced-motion. Исправить в source stylesheet и повторить accessibility/visual QA. |
| 2 | [002 — responsive image optimization](002-responsive-images.md) | Текущий bounded scope закрыт: homepage + Standard + Premium + hero/LCP + top-16 gallery reuse зелёные. Оставшиеся 23 gallery images не трогать без нового измеренного основания. |
| 3 | Hero / preload follow-up | Только если отдельный timing experiment покажет пользу. Responsive hero уже внедрён и измерен; preload сейчас не нужен по умолчанию. |
| Отложено | Солнечный коллектор: статья + анимация | Историческая ветка найдена; владелец попросил вернуться позже и переносить материал хирургически, без wholesale merge старой ветки. |
| Отложено | Подготовить выбранный логотип к внедрению | Концепт выбран, **пока не устанавливать на сайт**. |

## Внутренний фотобэклог El Raval

Следующие кадры были прежним внутренним `pending_technical_media`. После visual review они удалены из публичной Project-записи и остаются только рабочим бэклогом:

- формирование и заливка полов;
- полы в стадии работ и перегородки из гипсокартона;
- восстановление стены;
- гидроизоляция ванных;
- монтаж с белой гофрой;
- электрический щит.

Если реальные фотографии появятся, добавлять их через `content/tables/media.yaml` и `image_ids` проекта. Публичные заглушки «ожидается загрузка» не создавать.

## Зафиксированные решения

### Логотип

Владелец выбрал **вариант 02 с плавным золотым росчерком**: архитектурный знак из двух смещённых порталов, полное название `VITAL VIBE`, строка `CONSTRUCCIÓN`, светлые буквы на тёмном фоне. На текущем этапе оставить как есть.

Исходный лист концептов и запись о выборе сохранены отдельно в архиве `VitalVibe-logo-selected-02.zip`; архив не добавлен в этот репозиторий. Если его нет в новой рабочей сессии, попросить владельца приложить именно этот архив, а не восстанавливать знак приблизительно.

### Контент и объекты

- Кухня и кадр с дверью в туалет относятся к одному объекту El Raval: не разделять обратно на два проекта.
- Для ванной публикуется только город **Badalona**, без улицы и номера дома.
- Подтверждены четыре рабочих дня и 1100 € за работу с выносом мусора. Материалы не включать в эту сумму без подтверждения.
- Вывод под зеркало переносился на ту же высоту; потребовались два дополнительных ряда плитки.
- Сохранять раскрытие прежней ИИ-ретуши итоговой фотографии. Не придумывать технические испытания, сертификаты, отзывы или переживания клиента.

## Что уже автоматизировано

- `node tools/checks/run.mjs` — сборка и проверки записей, маршрутов, страниц, языковых метаданных и поисковых файлов.
- `node tools/articles/validate-drafts.mjs` — валидация оставшихся черновиков.
- `node tools/deploy/build-vps-bundle.mjs` и `validate-vps-bundle.mjs` — публичный release bundle и его проверка.
- `bash tools/visual/run.sh` — browser QA + Standard/Premium project checks + gallery responsive check + accessibility QA + responsive-resource verification + hero/LCP measurement.
- `bash tools/media/build-home-responsive.sh` — EXIF-aware deterministic WebP derivatives; CI workflow `Responsive image derivatives` сохраняет diagnostic artifact.

## Граница публикации

`task/` не добавлять в `content/tables`, `site-next`, маршруты, sitemap, llms.txt или навигацию сайта. Публиковать только проверенный release artifact, а не корень репозитория.
