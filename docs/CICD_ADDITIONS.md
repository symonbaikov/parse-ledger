# CI/CD аудит: что добавить, чтобы в прод уходил только «идеальный» код

Документ привязан к текущему репозиторию (монорепа: NestJS backend + Next.js frontend, деплой на Railway через корневой Dockerfile).

Цель: **в production попадает только код, который проходит полный набор quality gates** (качество, тесты, безопасность, воспроизводимость сборки) и деплоится только через контролируемый процесс.

## Текущее состояние (сейчас)

**CI:** [/.github/workflows/ci.yml](../.github/workflows/ci.yml)

- Запускается на PR и push в `main|develop|staging`.
- Проверки:
  - Backend: `biome check` (без автофикса), unit-тесты (`npm --prefix backend test`).
  - Frontend: `biome check --write` (с автофиксом!), сборка (`next build`).
  - Backend build (`nest build`).
  - Docker образ собирается (без push).

**CD (Railway):** миграции БД запускаются при старте контейнера через `scripts/start.sh`, затем поднимаются backend+frontend.

## Главные пробелы/риски

- **Frontend lint в CI модифицирует код** (`--write`) — это плохая практика: CI должен быть детерминированным и только проверять.
- **Нет typecheck как отдельного gate** (backend «типизируется» косвенно через сборку, frontend typecheck отдельной командой не закреплён).
- **Нет coverage gate** (порогов покрытия) — тесты могут «зеленеть» при деградации покрытия.
- **Нет e2e в CI** (хотя скрипт `backend:test:e2e` есть).
- **Нет security gates**: SAST/CodeQL, dependency audit, container scanning, secret scanning (кроме базовых GitHub механизмов), SBOM.
- **Нет release/deploy gates**: защищённых окружений, approvals, smoke-проверок после деплоя, автоматизированного rollback.
- **Supply-chain риск**: корневой Dockerfile копирует `backend/node_modules` из build-стейджа → в runtime могут попадать devDependencies.

Дальше — список того, что стоит добавить, чтобы прод был «идеальным».

## CI (проверки на PR/merge)

Ниже перечислены gates, которые должны быть **обязательными статусами (required checks)** для merge в `main`.

- [ ] **Линт/форматирование (только check, без автофикса)**
  - [ ] В CI использовать `npm --prefix frontend run lint:check`, а не `lint`.
  - [ ] Добавить отдельный шаг `biome format` в режиме проверки (или использовать `biome check` как единственный источник правды, но без `--write`).
  - [ ] (Опционально) отдельный job: `biome ci .` (если решите перейти на `biome ci`).
- [ ] **Типизация (typecheck gate)**
  - [ ] Backend: отдельная команда, которая гарантированно падает на ошибках типов (варианты: `nest build` ок, но лучше отдельный `tsc -p backend/tsconfig.json --noEmit` для ясности).
  - [ ] Frontend: добавить скрипт `type-check` и запускать `tsc -p frontend/tsconfig.json --noEmit`.
- [ ] **Тесты (минимальный обязательный набор)**
  - [x] Backend unit тесты — оставить.
  - [ ] Backend e2e — включить в PR (или хотя бы в `develop/staging`, но лучше PR для критических модулей).
  - [ ] Frontend: если unit-тестов нет — добавить хотя бы smoke-набор (рендер ключевых страниц/компонентов) или компонентные тесты.
  - [ ] (Опционально) интеграционные тесты backend с реальными Postgres/Redis через `docker-compose` в CI.
- [ ] **E2E (критический путь)**
  - Логин/refresh, создание workspace, загрузка PDF/CSV, запуск парсинга, просмотр результата, экспорт.
  - Важно: тесты должны быть детерминированными (фикстуры, стабилизированные даты/таймзоны, изоляция данных).
- [ ] **Проверка миграций БД**
  - Прогон миграций на чистой БД в CI (Postgres в сервисе GitHub Actions или через docker-compose).
  - Проверка idempotency: повторный прогон миграций должен быть noop.
  - (Опционально) smoke-rollback: откат последней миграции на тестовой БД.
- [x] **Сборка Docker-образа**
  - Собирается образ по Dockerfile (job `docker-build`).
- [ ] **Скан Docker-образа на уязвимости**
  - Trivy/Grype в режиме fail-on-high/critical.
  - Проверять также OS пакеты (alpine apk) и python пакет `pdfplumber`.
- [ ] **Зависимости и уязвимости (dependency gate)**
  - `npm audit --audit-level=high` для backend и frontend (или OSV/Snyk).
  - Dependabot (авто PR на обновления) + правило: security PR проходят ускоренно.
  - Политика исключений: если нужно игнорировать CVE — только через документированное allowlist-решение.
- [ ] **Лицензии зависимостей**
  - Проверка несовместимых лицензий (особенно для коммерческого использования).
- [ ] **Coverage gate**
  - Backend: установить минимальные пороги (например, statements/lines/branches/functions) и падать ниже порога.
  - Порог лучше держать реалистичным и постепенно повышать (ratchet).
- [ ] **SAST / статический анализ**
  - GitHub CodeQL для JS/TS (PR + nightly).
  - Дополнительно: ESLint security rules / Semgrep (по желанию) — но не дублировать Biome без нужды.

- [ ] **Secret scanning (в CI)**
  - Gitleaks/TruffleHog по git history/PR diff.

- [ ] **Проверка “опасных” изменений**
  - Изменения в миграциях/DDL требуют отдельного approval.
  - Изменения в auth/permissions требуют отдельного security review.

## CD (деплой и релизы)

- [ ] **Staging обязателен**
  - Автодеплой из `staging` (или `develop`) в staging-окружение.
  - В staging прогоняются smoke/e2e (в идеале) и только потом разрешается promote в prod.
- [ ] **Preview окружения для PR**
  - Изолированные окружения для каждой ветки/PR (по возможности).
- [ ] **Авто-версионирование и release notes**
  - Semver по тегам и автогенерация release notes.
- [ ] **Авто-откат (rollback)**
  - Откат на предыдущий релиз при падении readiness/healthcheck после деплоя.
  - Условие: рост 5xx/latency выше порога в первые N минут после релиза.
- [ ] **Миграции как отдельный шаг (рекомендуется)**
  - Сейчас миграции бегут при старте контейнера. При горизонтальном масштабировании это риск гонок.
  - Лучше: отдельный migration job в CD перед раскаткой (или advisory lock на БД + единичный runner).
- [ ] **DB backup перед миграцией**
  - Автоматический snapshot/backup для prod перед изменениями схемы.

- [ ] **Environment protection**
  - Для production: ручное подтверждение (approval) + ограничение, кто может деплоить.
  - Только tag-based деплой (например, `vX.Y.Z`) или только merge в `main`.

- [ ] **Аттестация артефактов (supply chain)**
  - Генерация SBOM (Syft) и публикация как артефакт релиза.
  - Подпись docker-образов (cosign) и build provenance (GitHub attestations).

## Качество и надежность

- [ ] **Smoke тесты после деплоя**
  - Минимальный набор проверок на живом окружении.
- [ ] **Readiness/Liveness checks**
  - Отдельные эндпоинты: `readiness` проверяет БД/redis, `liveness` — только процесс.
- [ ] **Rate-limits и защитные заглушки**
  - На критических API включить лимиты и throttling.
- [ ] **Feature flags**
  - Включение рискованных функций через флаги.

- [ ] **Performance/регрессии**
  - (Опционально) лёгкий perf gate: замер p95 latency на ключевых ручках в staging.
  - (Опционально) frontend bundle size budget.

## Безопасность

- [ ] **Secrets scanning**
  - Скан секретов в git (git-secrets/TruffleHog).
- [ ] **SBOM**
  - Генерация SBOM при сборке и хранение как артефакт.
- [ ] **Policy-as-code**
  - Блокировка деплоя при нарушении security policy.

- [ ] **Container hardening**
  - Не запускать контейнер под root (где возможно).
  - Минимизировать runtime зависимости (не тащить devDependencies).
  - Пинить версии python пакетов и проверять их CVE.

## Наблюдаемость

- [ ] **Deploy markers**
  - Маркеры деплоя в логах/метриках.
- [ ] **Алерты на деградации**
  - Рост 5xx, деградация latency, падение healthcheck.
- [ ] **SLO/SLI мониторинг**
  - Слежение за ошибками и временем ответа.

## Управление процессом

- [ ] **Обязательные статусы CI в правилах репозитория**
  - Merge в `main` запрещён без зелёных checks.
- [ ] **Защита веток**
  - Требование review + статусные проверки.
- [ ] **Подпись коммитов и релизов**
  - Подписанные теги релизов и коммиты.

## Рекомендуемая схема пайплайнов (кратко)

### PR pipeline (обязательный)

- `lint (backend+frontend)`: check-only
- `typecheck (backend+frontend)`
- `unit tests (backend)` + coverage gate
- `e2e (backend)` (минимальный набор)
- `build (backend+frontend)`
- `docker build` + `container scan`
- `secret scan` + `dependency scan`

### Main/Release pipeline

- Публикация артефактов: docker image + SBOM + provenance
- Автодеплой в staging
- Smoke/e2e на staging
- Promote в prod только при зелёных пост-деплой проверках + approval

## Быстрые wins (самое выгодное по времени)

1) Перевести frontend lint в check-only режим в CI.
2) Включить backend `test:ci` (unit + e2e) как обязательный статус.
3) Добавить typecheck для frontend.
4) Включить хотя бы базовые security gates: CodeQL + npm audit + container scan.
5) Добавить post-deploy smoke checks и защиту окружения production.
