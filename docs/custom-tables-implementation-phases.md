# Custom Tables + импорт из Google Sheets — фазы реализации

Документ основан на `docs/custom-sheets-integration-plan.md` и приведён к текущей архитектуре FinFlow: NestJS + TypeORM + PostgreSQL, Next.js (App Router), REST `/api/v1`, JWT, обязательная DTO-валидация, миграции, аудит-лог.

## Цель

Сделать “пользовательские таблицы” (мини‑Notion/Airtable) внутри приложения:

- пользователь создаёт таблицы и колонки в UI
- таблица хранится только в нашей БД
- можно разово импортировать структуру и/или данные из Google Sheets (без дальнейшей синхронизации)
- внутри приложения: CRUD строк, базовые типы, валидация, сортировка/фильтры (постепенно)

## Не‑цели (чтобы не смешивать сущности)

- не делаем обратную синхронизацию в Google Sheets
- не делаем realtime‑интеграцию onEdit (это отдельный флоу из `docs/google-sheets-integration-plan.md` и модуля `backend/src/modules/google-sheets`)
- не создаём “физические SQL‑таблицы на лету” под каждую пользовательскую таблицу

## Архитектурное размещение в проекте

### Backend (NestJS)

- Новый модуль: `backend/src/modules/custom-tables/`
  - `custom-tables.controller.ts` — CRUD таблиц/колонок/строк
  - `custom-tables.service.ts` — бизнес‑логика, валидации, доступы
  - `dto/*` — DTO + `class-validator`
  - (опционально отдельный файл/сервис) `import/google-sheets/*` — preview/commit импорта
- Интеграции Google Sheets:
  - использовать существующий `GoogleSheetsApiService` (`backend/src/modules/google-sheets/services/google-sheets-api.service.ts`) для чтения диапазонов
  - OAuth остаётся в существующем модуле `google-sheets` (токены уже хранятся в `google_sheets`)
- Аудит:
  - расширить `backend/src/entities/audit-log.entity.ts` новыми `AuditAction` для custom tables и писать `metadata` (diff/контекст)

### DB (PostgreSQL + TypeORM)

Новый набор таблиц (snake_case, как в проекте):

- `custom_tables`
- `custom_table_columns`
- `custom_table_rows` (значения в `data jsonb`)

Рекомендуемая модель хранения: “метаданные + строки в JSONB”, как в исходном плане.

### Frontend (Next.js App Router)

- Новый раздел в `frontend/app/` (варианты):
  - `frontend/app/custom-tables/` — список и создание таблиц
  - `frontend/app/custom-tables/[id]/` — редактор таблицы
  - `frontend/app/custom-tables/import/google-sheets/` — мастер импорта (preview → mapping → commit)
- API: через `frontend/app/lib/api.ts` (axios), авторизация — текущий JWT flow

## Контракты API (черновик)

Все endpoints под `/api/v1` (глобальный префикс в `backend/src/main.ts`).

### Таблицы

- `POST /custom-tables` — создать таблицу
- `GET /custom-tables` — список таблиц
- `GET /custom-tables/:id` — таблица + колонки
- `PATCH /custom-tables/:id` — переименование/описание
- `DELETE /custom-tables/:id` — удаление

### Колонки

- `POST /custom-tables/:id/columns`
- `PATCH /custom-tables/:id/columns/:columnId`
- `DELETE /custom-tables/:id/columns/:columnId`
- `POST /custom-tables/:id/columns/reorder`

### Строки

- `GET /custom-tables/:id/rows?cursor&limit&sort&filters`
- `POST /custom-tables/:id/rows`
- `PATCH /custom-tables/:id/rows/:rowId`
- `DELETE /custom-tables/:id/rows/:rowId`
- `POST /custom-tables/:id/rows/batch` (для импорта и массовых операций)

### Импорт (разовый, автономный)

- `POST /custom-tables/import/google-sheets/preview`
- `POST /custom-tables/import/google-sheets/commit`

Примечание: для `commit` стоит поддержать `Idempotency-Key` (как минимум на уровне контроллера/сервиса), чтобы повторный запрос не создавал дубликаты.

## Фазы реализации

### Фаза 0 — решения “на берегу” (до кодинга)

- Зафиксировать, какие “виды таблиц” нужно поддержать на импорте (по реальным примерам):
  - **Реестр (flat table)**: одна строка заголовков + много строк данных (пример: “Реестр платежей”)
  - **Матрица/кросс‑таблица**: категории/счета по строкам + даты/месяцы по колонкам (пример: “Баланс по дням”, “Свод с категориями”)
- Решить ключевое требование: **в импорте “достаём все данные”**:
  - `commit` читает **весь used range листа** (не sample), включая “широкие” таблицы с десятками/сотнями колонок (даты по дням)
  - `preview` может читать sample, но обязан вернуть размеры used range и найденный “layout type” (реестр/матрица)
- Определить правила конвертации “матрицы” в нашу модель `columns + rows`:
  - как определяем “зону заголовков” (например, верхняя строка с датами/месяцами) и “зону row labels” (левые колонки с категориями/счетами)
  - как обрабатываем merged/пустые ячейки в заголовках и row labels (например: fill‑down/fill‑right значений, чтобы не терять смысл группировок)
  - что делаем с “секционными” строками (типа “Активы”, “Краткосрочные активы”) — импортируем как отдельные строки‑заголовки или как `row.group`/`row.kind` в `data`
- Определить, какие значения сохраняем из Google Sheets:
  - сохраняем **отображаемые значения** (результат формул), а не формулы (MVP)
  - решить, нужна ли поддержка raw/unformatted значений (например, для чисел/дат) и как нормализуем локали (`,`/`.` и форматы дат)
- Уточнить UX импорта:
  - импорт “один лист → одна custom table” или “несколько листов → несколько custom tables” (по умолчанию удобнее второе)
  - как выбираем spreadsheet / worksheet / (опционально) range (A1‑нотация), если требуется не весь лист
- Выбрать минимальный набор типов колонок (MVP): `text`, `number`, `date`, `boolean`, `select`, `multi_select`
- Зафиксировать ограничения MVP:
  - пороги “малый импорт” (синхронно) vs “большой импорт” (в фоне)
  - лимиты на количество создаваемых колонок (важно для “баланс по дням”, где колонок может быть 365+)

**Результат:** согласованный формат импорта для реестра/матрицы, решение про multi‑tab и чёткие правила “читаем весь used range и сохраняем все значения”.

### Фаза 1 — Backend + DB каркас (MVP)

- Миграции TypeORM:
  - `custom_tables` (user_id, name, description, source, timestamps)
  - `custom_table_columns` (table_id, key, title, type, required, unique, order, config jsonb)
  - `custom_table_rows` (table_id, row_number, data jsonb, timestamps)
  - индексы: `custom_table_rows(table_id)`, `GIN (data)`; unique: `(table_id, key)` для колонок
- Entities в `backend/src/entities/` (по текущему стилю проекта)
- Модуль `custom-tables` + базовые сервис/контроллер
- Авторизация:
  - все операции только для владельца `user_id` (через `JwtAuthGuard` и `@CurrentUser()`)
- Аудит:
  - добавить `AuditAction` для создания/удаления таблиц и базовых операций со строками

**Результат:** таблицы/колонки/строки существуют в БД, есть базовый API без UI.

### Фаза 2 — CRUD API (таблицы/колонки/строки) + серверная валидация

- Таблицы:
  - создание/список/получение/переименование/удаление
- Колонки:
  - добавление/редактирование/удаление/переупорядочивание
  - генерация стабильного `column.key` (не зависит от title; используется в `rows.data`)
- Строки:
  - список с пагинацией (`cursor` или `offset`, в проекте предпочтительнее cursor‑подход)
  - создание/обновление/удаление
  - нормализация значений по `column.type` на сервере (например, `date` → ISO, `number` → numeric string/number)
- Формат ошибок: текущий общий формат API (см. `docs/api.md`)

**Результат:** функционал полностью доступен через REST и готов к подключению UI.

### Фаза 3 — Frontend UI: список таблиц + редактор (MVP)

- Раздел “Пользовательские таблицы”:
  - список таблиц, создание/удаление, переход в таблицу
  - добавить пункт в навигацию (`frontend/app/components/Navigation.tsx`)
- Экран таблицы:
  - рендер колонок по метаданным
  - загрузка строк постранично
  - inline‑редактирование ячеек (оптимистично на клиенте, окончательная валидация на сервере)
  - добавление/удаление колонок и строк

**Результат:** пользователь может полноценно вести таблицы внутри приложения без импорта.

### Фаза 4 — Импорт из Google Sheets: preview → mapping → commit (MVP)

Backend:
- `preview`:
  - прочитать заголовки и sample‑строки (например, до 50) через Google Sheets API
  - предложить типы по эвристике (как в исходном плане)
  - вернуть “draft schema” (columns + sampleRows)
- UI “маппинг”:
  - включить/выключить колонки, переименовать, поправить типы
  - чекбокс “импортировать данные”
- `commit`:
  - создать `custom_table` + `columns`
  - если “с данными”: прочитать диапазон батчами и писать в `rows` через `rows/batch`
  - логировать прогресс (минимум — в логах; лучше — в ответе/статусе)

**Результат:** разовый импорт из Sheets создаёт автономную таблицу в FinFlow.

### Фаза 5 — Расширение: фильтры/сортировки/поиск + производительность

- Backend:
  - формат `filters/sort` (простая DSL в query params или JSON в body для сложных фильтров)
  - JSONB‑фильтры (равенство/диапазоны) + индексы под часто используемые поля
- Frontend:
  - UI фильтров/сортировки
  - виртуализация строк для больших таблиц (по мере необходимости)

**Результат:** таблицами удобно пользоваться на объёмах больше MVP.

### Фаза 6 — “Продакшн‑качество”

- Аудит изменений строк (diff в `AuditLog.metadata`)
- Экспорт таблицы (CSV/XLSX)
- Права (если появится шаринг/роли): read/write на уровне таблицы
- (Опционально) большой импорт в фоне:
  - добавить очередь (BullMQ + Redis) и прогресс‑endpoint
  - UI прогресса импорта

**Результат:** готовность к реальным данным, понятная эксплуатация, управляемые риски.

## Ссылки

- Исходный план: `docs/custom-sheets-integration-plan.md`
- Архитектура: `docs/architecture.md`
- Арх. правила: `docs/arch-rules.md`
- Google Sheets realtime/webhook (другая сущность): `docs/google-sheets-integration-plan.md`
- Общий API: `docs/api.md`
