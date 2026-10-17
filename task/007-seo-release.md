# 007 — SEO-релиз: подготовлен, ожидает публикации

## Состав

PR #25 (`claude/focused-keller-0fo9z5`, merge `4d70d31e67b4261ca905b9b7bfcd55e52ced67e5` с тем же деревом), проверенный SHA `3e5c1acb70fde5c3a848c729b539eedd1a4dd16b`:

- EN/RU главные: alt и подписи фото переведены полностью; сборка падает на частично переведённом тексте изображения.
- Главная: `HomeAndConstructionBusiness` с телефоном, email, картой и адресом только «Barcelona, Cataluña, ES».
- `og:image` и `twitter:card` у статей, проектов, каталога проектов и каталогов статей.
- Title ≤ 60 и description ≤ 160 на всех страницах sitemap; у проектов суффикс `| Vital Vibe`.
- Ссылки «Ver también / See also / См. также» в статьях; услуги на страницах проектов ведут на страницу услуги или блок услуги на главной.
- `sitemap.xml`: `<lastmod>` для статей и каталогов статей.

Решения владельца: статьи подписаны компанией; улица и часы работы не публикуются.

## Проверенная сборка

- GitHub Actions **VPS bundle check** run `39029825045` для `3e5c1ac…`, artifact `vps-site-bundle` (хранится 7 дней, до 2026-10-24).
- Project checks и Visual QA того же SHA должны быть зелёными.
- Публикуется именно сборка от `3e5c1ac`.

Предлагаемый release ID: `20261017-3e5c1ac`. Откат: `20261010-7fbbe65`.

## Публикация с домашней машины

```bash
unzip vps-site-bundle.zip
tar -xOf vps-site-bundle.tgz ./DEPLOYMENT_COMMIT   # должно быть 3e5c1acb70fde5c3a848c729b539eedd1a4dd16b
sha256sum vps-site-bundle.tgz                      # записать; сверить ещё раз на VPS
```

Если artifact истёк, собрать заново в чистом checkout (Node 20, ImageMagick, cwebp):

```bash
git checkout --detach 3e5c1acb70fde5c3a848c729b539eedd1a4dd16b
node tools/checks/run.mjs
git diff --exit-code
node tools/deploy/build-vps-bundle.mjs
node tools/deploy/validate-vps-bundle.mjs
tar -C .deploy-dist -czf vps-site-bundle.tgz .
```

На VPS перед переключением сохранить `readlink -f /srv/vital-vibe/current` и `/srv/vital-vibe/current/DEPLOYMENT_COMMIT`, затем:

```bash
sha256sum vps-site-bundle.tgz
deploy/vps/install-release.sh vps-site-bundle.tgz 20261017-3e5c1ac
```

DNS, nginx/Caddy/TLS и планировщик не менять.

## Проверка после активации

- `https://vitalvibeconstruction.com/DEPLOYMENT_COMMIT` = `3e5c1ac…`.
- `/en/` и `/ru/`: «Просмотр кода» → нет «de techo a pistola», «integrada», «Panel de», «Escenas de»; в JSON-LD `"@type": "HomeAndConstructionBusiness"`.
- Статья, например `/articulos/traslado-lavabo-toallero/`: есть `og:image`, внизу строка «Ver también» со ссылками.
- Проект, например `/en/projects/estudio-reformado-barcelona/`: title «Two studios in a 50 m² apartment in El Raval | Vital Vibe», названия услуг — ссылки с префиксом `/en/`.
- `/sitemap.xml`: 43 URL, `<lastmod>` у 18 статейных адресов.
- Фото загружаются, переключение языка работает, нет горизонтальной прокрутки на телефоне.
- Ссылку на статью отправить в WhatsApp/Telegram — превью с картинкой.
- По желанию: Rich Results Test для главной и `/servicios/reformas-integrales-barcelona/`.

При проблеме: `deploy/vps/rollback-release.sh 20261010-7fbbe65` (или фактически сохранённый предыдущий ID).
