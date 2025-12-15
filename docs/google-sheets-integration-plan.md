Ниже — полный технический план реализации Google Sheets → Apps Script (onEdit) → Webhook → Nest.js → DB → realtime (WS/SSE), с акцентом на то, что синхронизируем только 3 столбца и не читаем всю таблицу.

⸻

0) Цель и контракт данных

Цель: при изменении значений в 3 конкретных колонках таблицы, твой Nest.js получает событие только по изменившейся строке и сохраняет/обновляет запись в БД, затем пушит обновление фронту.

Что считаем “ключом строки”:
	•	самый практичный вариант — номер строки (row) + spreadsheetId + sheetName.
	•	если нужно “стабильнее, чем row” (вдруг строки вставляют/удаляют) — добавь скрытую колонку с UUID. Но ты сказал 3 столбца — значит UUID-колонку не трогаем; тогда фиксируем, что строки не должны произвольно перемещаться или мы живем с этим риском.

⸻

1) Настройки и конфигурация

1.1. В Apps Script (константы)
	•	SHEET_NAME — имя листа (например: Отгрузки)
	•	WATCH_COLUMNS — список наблюдаемых колонок (например: [2,3,6] для B,C,F)
	•	API_URL — endpoint твоего Nest: https://your-domain.com/integrations/google-sheets/update
	•	WEBHOOK_TOKEN — секрет (строка), которую скрипт будет слать в заголовке
	•	(опционально) BATCH_DEBOUNCE_MS — анти-дребезг, если часто правят пачками

1.2. В Nest.js (env)
	•	SHEETS_WEBHOOK_TOKEN — ожидаемый секрет
	•	SHEETS_ALLOWED_SHEET/SHEETS_ALLOWED_SPREADSHEET_ID — whitelist, чтобы не принимал мусор
	•	DB доступ (Prisma/TypeORM — что у тебя)

⸻

2) Apps Script: логика триггера

2.1. Какой триггер ставим
	•	Installable trigger “On edit” (через редактор Apps Script → Triggers).
	•	Он надежнее, чем простой onEdit(e) (особенно в корпоративных доменах/сложных сценариях).
	•	Если нужно ловить изменения не только руками (например, формулы/импорты):
	•	это важно: onEdit не всегда сработает на изменения от формул.
	•	тогда делаем дополнительный подход: periodic trigger (раз в минуту) + сравнение хеша/версии по 3 колонкам (но это уже вариант смешанный). В 90% кейсов для “человек заносит данные” достаточно onEdit.

2.2. Фильтрация событий

В обработчике onEdit(e):
	1.	Проверить, что e существует (защита)
	2.	Проверить лист: e.range.getSheet().getName() === SHEET_NAME
	3.	Определить:
	•	editedCol = e.range.getColumn()
	•	editedRow = e.range.getRow()
	4.	Если editedCol не входит в WATCH_COLUMNS → return
	5.	Прочитать только нужные ячейки этой строки:
	•	valB = sheet.getRange(editedRow, 2).getValue()
	•	valC = sheet.getRange(editedRow, 3).getValue()
	•	valF = sheet.getRange(editedRow, 6).getValue()
	6.	Сформировать payload:
    {
  "spreadsheetId": "...",
  "sheetName": "Отгрузки",
  "row": 123,
  "values": { "colB": "...", "colC": "...", "colF": "..." },
  "editedAt": "2025-12-14T11:22:33.000Z",
  "editor": "если доступно",
  "editedCell": { "col": 2, "a1": "B123" }
}

2.3. Отправка в Nest.js
	•	UrlFetchApp.fetch(API_URL, { method: "post", headers: { "X-Webhook-Token": WEBHOOK_TOKEN }, payload: JSON.stringify(payload), contentType: "application/json" })

2.4. Надежность: retries + лог

Важно: Apps Script иногда ловит временные ошибки сети.
	•	Обернуть fetch в try/catch
	•	На ошибке:
	•	console.error(...)
	•	(опционально) записать событие в отдельный лист “WebhookQueue” (как dead-letter), чтобы не потерять изменения.
	•	(опционально) запланировать повтор: но “истинный retry” в Apps Script ограничен. Обычно достаточно “dead-letter”.

⸻

3) Nest.js: прием webhook и валидация

3.1. Endpoint

POST /integrations/google-sheets/update

3.2. Auth/verification

Минимум:
	•	сравнить req.headers['x-webhook-token'] с SHEETS_WEBHOOK_TOKEN
Чуть лучше:
	•	HMAC подпись: X-Signature: hmac_sha256(body, secret) — но для старта токена достаточно.

Также:
	•	whitelist по spreadsheetId и sheetName (если это 1 конкретная таблица клиента).

3.3. DTO + validation

Сделай DTO:
	•	spreadsheetId: string
	•	sheetName: string
	•	row: number
	•	values: { colB: string|number|null, colC: ..., colF: ... }
	•	editedAt: ISO string

Проверки:
	•	row > 1 (если первая строка заголовок)
	•	значения приводить к строке/нормализовать (trim и т.д.) по нуждам.

⸻

4) Слой хранения (DB)

4.1. Таблица/модель

Например sheet_rows:
	•	id (uuid)
	•	spreadsheetId
	•	sheetName
	•	row (int)
	•	colB, colC, colF (типы: text / varchar / json)
	•	updatedAt (timestamp)
	•	lastEditedAt (timestamp) — из payload, если хочешь

Уникальный индекс:
	•	(spreadsheetId, sheetName, row) unique

4.2. Upsert

На каждое событие делай upsert:
	•	если запись есть → update 3 поля
	•	если нет → create

⸻

5) Realtime в приложении (WS или SSE)

Тут зависит от твоего фронта и инфраструктуры.

5.1. SSE (самый простой one-way)
	•	GET /integrations/google-sheets/stream
	•	Nest держит соединение и пушит события всем подписчикам
	•	На webhook после upsert — делай sseService.broadcast({row, values, updatedAt})

Плюсы: проще, не нужен socket.io, хорошо для “только обновления”.

5.2. WebSocket (если нужно больше интерактива)
	•	@WebSocketGateway()
	•	событие sheet.update
	•	на клиенте подписка и обновление UI.

⸻

6) Инициализация: первичная загрузка данных (только 3 колонки)

Webhook ловит изменения, но что делать с уже существующими данными?

Сделай отдельную “однократную синхронизацию”:
	1.	либо вручную: Apps Script функция syncAll():
	•	проходит по нужным строкам
	•	отправляет пачками (например, по 50 строк) только 3 колонки
	2.	либо Nest.js job, который через Sheets API читает диапазоны B:B, C:C, F:F и строит initial state.

Если клиент уже живёт в таблице с историей — syncAll нужен.

⸻

7) Дедупликация и порядок событий

Реальные проблемы:
	•	одно изменение может триггериться несколько раз
	•	события могут прийти не в порядке

Решения:
	•	в payload добавь eventId (UUID) в Apps Script и храни последние N eventId в Redis/DB (на 5–10 минут)
	•	или используй editedAt и при апдейте не перетирать более “свежее” старым (редко, но бывает).

⸻

8) Безопасность и эксплуатация
	•	Только HTTPS endpoint
	•	Токен/секрет хранить в Apps Script через PropertiesService.getScriptProperties(), а не в коде.
	•	Логи:
	•	Apps Script: Stackdriver/Execution log
	•	Nest: request id + сохранение результата

⸻

9) Тест-план (что проверить)
	1.	Редактирование колонок B/C/F → webhook приходит, DB обновляется
	2.	Редактирование другой колонки → ничего не отправляется
	3.	Вставка значения в диапазон (копипаст на 10 строк) → событие корректно отрабатывает (в Apps Script нужно учесть range может быть многоячеечный; тогда:
	•	либо обрабатывать только верхнюю строку,
	•	либо пройтись по всем строкам диапазона и отправить несколько событий)
	4.	Ошибка сети → запись в dead-letter лист (если сделал)
	5.	SSE/WS → UI обновляется без перезагрузки

⸻

10) Итоговая структура модулей в Nest.js
	•	integrations/google-sheets/
	•	google-sheets.controller.ts (webhook endpoint)
	•	google-sheets.service.ts (upsert + broadcast)
	•	dto/sheets-update.dto.ts
	•	guards/webhook-token.guard.ts
	•	realtime/sse.gateway.ts или ws.gateway.ts