# Общий релиз Facebook и публичных текстов — 2026-10-09

## Состав

- Facebook `https://www.facebook.com/1497572453430978` в контактах и подвале главной ES/EN/RU, а также Organization `sameAs`.
- Испанские тексты каталога проектов и страницы комплексного ремонта больше не упоминают внутренний репозиторий. Правка перенесена из `3e6d809710c4aed6c4051c0e33b0fa2bc268652e`.
- Статья об учёте работ/расходов из PR #10 не входит в релиз и остаётся черновиком в отдельной ветке.

Объединённые изменения находятся в PR #22. Production в этой сессии не публикуется. Проверенный публичный DEPLOYMENT_COMMIT перед подготовкой: `013c8b18855d0076534331db4971e55f616c70dd`; записанный release ID: `20261004-013c8b1`. Перед своим деплоем повторно проверьте фактический текущий релиз сервера.

## Как взять проверенную сборку дома

Используйте успешный GitHub Actions **VPS bundle check** именно для полного SHA, указанного в передаче релиза, а не произвольный последний run. У этого же SHA должны пройти **Project checks** и **Visual QA**.

Скачайте artifact `vps-site-bundle` из выбранного run. ZIP артефакта содержит `vps-site-bundle.tgz`. Перед загрузкой проверьте:

```bash
tar -xOf vps-site-bundle.tgz ./DEPLOYMENT_COMMIT
sha256sum vps-site-bundle.tgz
```

DEPLOYMENT_COMMIT должен совпадать с полным проверенным SHA. Сохраните SHA-256 архива и проверьте его ещё раз после передачи на VPS.

Если artifact уже истёк (workflow хранит его 7 дней), соберите заново из закреплённого SHA в чистом checkout с Node 20, ImageMagick и cwebp:

```bash
git checkout --detach FULL_VERIFIED_SHA
node tools/checks/run.mjs
git diff --exit-code
node tools/deploy/build-vps-bundle.mjs
node tools/deploy/validate-vps-bundle.mjs
tar -C .deploy-dist -czf vps-site-bundle.tgz .
```

`FULL_VERIFIED_SHA` замените полным SHA из передачи релиза. Публикуйте только сборку `.deploy-dist`, а не корень репозитория.

## Перед переключением и после него

Сохраните фактические `readlink -f /srv/vital-vibe/current` и `/srv/vital-vibe/current/DEPLOYMENT_COMMIT`; сохраните предыдущую директорию релиза. Сверьте checksum и содержимое распакованного архива. Проверяемый результат: по две обычные ссылки Facebook на каждой главной ES/EN/RU; URL в Organization sameAs; исправленные испанские тексты `/projects/` и `/servicios/reformas-integrales-barcelona/`.

Существующий `deploy/vps/install-release.sh` выполняет реальное атомарное переключение symlink; используйте его только в домашней сессии деплоя после проверки архива. Не повторяйте DNS cutover и не меняйте nginx/Caddy/TLS или планировщик.

После активации проверьте публичный `/DEPLOYMENT_COMMIT`, три главные, две страницы с исправленным текстом, загрузку фото, переключение языка и отсутствие мобильного переполнения. При проблеме используйте `deploy/vps/rollback-release.sh` с реально сохранённым предыдущим release ID.
