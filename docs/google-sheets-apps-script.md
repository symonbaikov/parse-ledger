# Apps Script для Google Sheets → Nest.js

Этот скрипт отправляет изменения в колонках **B, C и F** в ваш Nest.js по вебхуку `/api/v1/integrations/google-sheets/update` или `/batch`. Работает на onEdit‑триггере и умеет делать первичную загрузку (syncAll).

## Что нужно на стороне сервера

- Заполнить переменные окружения:
  - `SHEETS_WEBHOOK_TOKEN` — тот же токен прописываем в Script Properties.
  - `SHEETS_ALLOWED_SPREADSHEET_IDS` и/или `SHEETS_ALLOWED_SHEETS` — необязательно, но лучше whitelists.
  - `SHEETS_WATCH_COLUMNS=2,3,6` — чтобы сервер отбрасывал события не из B/C/F.
- Адрес для webhook: `https://<домен>/api/v1/integrations/google-sheets/update`
- Адрес для пачек: `https://<домен>/api/v1/integrations/google-sheets/batch`

## Как развернуть скрипт

1. Откройте нужную таблицу → `Расширения` → `Apps Script`.
2. Удалите всё и вставьте код ниже.
3. В `Project Settings` → `Script properties` добавьте `WEBHOOK_TOKEN` с тем же значением, что и `SHEETS_WEBHOOK_TOKEN` на сервере.
4. В `Triggers` добавьте installable триггер:
   - Function: `onEdit`
   - Event type: `On edit`
   - Source: From spreadsheet
5. Сохраните и протестируйте изменение в колонке B/C/F.

## Код Apps Script (скопировать целиком)

```javascript
// Настройки
const SHEET_NAME = 'Отгрузки';          // Имя листа, за которым следим
const WATCH_COLUMNS = [2, 3, 6];        // B, C, F (нумерация с 1)
const API_URL = 'https://<домен>/api/v1/integrations/google-sheets/update';
const API_BATCH_URL = 'https://<домен>/api/v1/integrations/google-sheets/batch';
const BATCH_DEBOUNCE_MS = 0;            // Можно 200-500 мс, если правят блоками

function onEdit(e) {
  if (!e || !e.range) return;

  const sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_NAME) return;

  const editedColumns = collectEditedColumns(e.range);
  const watched = editedColumns.filter((col) => WATCH_COLUMNS.indexOf(col) !== -1);
  if (watched.length === 0) return; // Изменилась колонка вне B/C/F

  const spreadsheetId = sheet.getParent().getId();
  const updates = buildUpdatesFromRange(sheet, e.range, watched[0], spreadsheetId);

  if (updates.length === 0) return;
  sendUpdates(updates);
}

// Первичная загрузка всех строк (запускается вручную из редактора или через отдельный триггер)
function syncAll() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return; // Только заголовок

  const spreadsheetId = sheet.getParent().getId();
  const rows = [];
  for (let rowNumber = 2; rowNumber <= lastRow; rowNumber++) {
    rows.push(
      buildRowPayload({
        sheet,
        spreadsheetId,
        rowNumber,
        editedColumn: WATCH_COLUMNS[0],
        editedCellA1: `B${rowNumber}`,
      }),
    );
  }

  sendUpdatesInBatches(rows, 50);
}

// --- Вспомогательные функции ---

function collectEditedColumns(range) {
  const cols = [];
  const start = range.getColumn();
  const width = range.getNumColumns();
  for (let i = 0; i < width; i++) {
    cols.push(start + i);
  }
  return cols;
}

function buildUpdatesFromRange(sheet, range, editedColumn, spreadsheetId) {
  const updates = [];
  const startRow = range.getRow();
  const rowsCount = range.getNumRows();

  for (let offset = 0; offset < rowsCount; offset++) {
    const rowNumber = startRow + offset;
    if (rowNumber === 1) continue; // пропускаем заголовок

    updates.push(
      buildRowPayload({
        sheet,
        spreadsheetId,
        rowNumber,
        editedColumn,
        editedCellA1: sheet.getRange(rowNumber, editedColumn).getA1Notation(),
      }),
    );
  }

  return updates;
}

function buildRowPayload({ sheet, spreadsheetId, rowNumber, editedColumn, editedCellA1 }) {
  const values = {
    colB: sheet.getRange(rowNumber, 2).getValue(),
    colC: sheet.getRange(rowNumber, 3).getValue(),
    colF: sheet.getRange(rowNumber, 6).getValue(),
  };

  return {
    spreadsheetId,
    sheetName: SHEET_NAME,
    row: rowNumber,
    values,
    editedAt: new Date().toISOString(),
    editor: Session.getActiveUser()?.getEmail() || null,
    editedCell: { col: editedColumn, a1: editedCellA1 },
    eventId: Utilities.getUuid(),
  };
}

function sendUpdates(updates) {
  if (!updates || updates.length === 0) return;
  if (BATCH_DEBOUNCE_MS > 0) Utilities.sleep(BATCH_DEBOUNCE_MS);

  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('WEBHOOK_TOKEN') || '';
  const url = updates.length > 1 ? API_BATCH_URL : API_URL;
  const payload = updates.length > 1 ? { items: updates } : updates[0];

  try {
    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
      headers: {
        'X-Webhook-Token': token,
      },
    });
  } catch (error) {
    console.error('Failed to push webhook', error);
    // Можно добавить запись в отдельный лист "WebhookQueue" для ручной обработки
  }
}

function sendUpdatesInBatches(updates, chunkSize) {
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    sendUpdates(chunk);
  }
}
```

## Проверки после установки

1. Изменить ячейку в колонке B/C/F → сервер должен вернуть 200, в `sheet_rows` появляется запись, SSE (`/api/v1/integrations/google-sheets/stream`) присылает событие.
2. Изменить любую другую колонку → запрос не отправляется.
3. Вставить блок значений (несколько строк) → скрипт отправляет `batch` и сервер сохраняет каждую строку.
4. Неверный/отсутствующий `WEBHOOK_TOKEN` → сервер отвечает 401/403.
5. При ошибке сети посмотреть ошибки в Execution log (или опционально в листе `WebhookQueue`).

## Дополнительно

- Если нужно раз в N минут пересчитывать формулы и слать изменения, создайте trigger на `syncAll` с периодом (time-driven).
- При смене наблюдаемых колонок обновите `WATCH_COLUMNS` в скрипте и `SHEETS_WATCH_COLUMNS` в .env, чтобы сервер и фронт фильтровали одинаково.
- UID события (`eventId`) используется для дедупликации на сервере (10 минут cache).
