# План подключения кнопок в кастомных таблицах

Документ описывает, какие кнопки/иконки в кастомных таблицах сейчас являются «болванками», какие действия им нужны, и как эти действия должны синхронизироваться с системой (API + локальный стейт). План покрывает: список таблиц, детальную таблицу, грид, импорт Google Sheets.

---

## 1) Список кастомных таблиц
**Файл:** `frontend/app/custom-tables/page.tsx`

### Кнопки и меню
- **Create (кнопка)**
  - **Статус:** уже открывает меню.
  - **Действие:** открыть меню создания.
  - **Синхронизация:** не требуется.

- **Create menu → Empty**
  - **Статус:** открывает форму создания.
  - **Действие:** `POST /custom-tables` с `name`, `description`, `categoryId`.
  - **Синхронизация:** после создания — `loadTables()` и переход на созданную таблицу.

- **Create menu → From Statement**
  - **Статус:** открывает модалку.
  - **Действие:** `POST /custom-tables/from-statements` с `statementIds`.
  - **Синхронизация:** переход на созданную таблицу или `loadTables()`.

- **Create menu → Import Google Sheets**
  - **Статус:** переход на `/custom-tables/import/google-sheets`.
  - **Действие:** навигация.

- **Card → Actions menu**
  - **Open**
    - **Действие:** открыть таблицу.
  - **Delete**
    - **Действие:** `DELETE /custom-tables/:id`
    - **Синхронизация:** `loadTables()` + toast.

**Замечание:** функционально почти готово; проверить, что все кнопки имеют `onClick` и работают на актуальном API.

---

## 2) Детальная страница таблицы (toolbar, tabs)
**Файл:** `frontend/app/custom-tables/[id]/page.tsx`

### Верхние табы (All / Unpaid / Paid / Archived)
- **Статус:** переключают `activeTab`, но не влияют на данные.
- **Что нужно:** табы должны подтягиваться автоматически из основных категорий/ключевых значений таблицы (самые частые элементы), максимум до 5 вкладок. Эти вкладки используются для быстрого фильтра.
- **Что нужно:** маппинг табов в `filtersParam` и перезагрузка через `loadRows({ reset: true, filtersParam })`.
- **Синхронизация:** фильтр должен идти в `GET /custom-tables/:id/rows?filters=...`.

### Toolbar actions
- **Mark as paid**
  - **Статус:** кнопка без обработчика.
  - **Действие:** массовое обновление выбранных строк, **но логика paid/unpaid должна определяться динамически** на основе комментария или контрагента.
  - **ML/Gemini:** встроить ML-классификацию (можно использовать Gemini, как сейчас при парсинге), чтобы определять paid/unpaid по данным строки.
  - **API:** `PATCH /custom-tables/:id/rows/:rowId` (батч через Promise.all или отдельный bulk endpoint, если есть).
  - **Синхронизация:** обновить локальные строки и сбросить selection.
  - **Фильтрация:** при нажатии также применить фильтр по рассчитанному paid/unpaid.

- **Mark as unpaid**
  - **Статус:** кнопка без обработчика.
  - **Действие:** аналогично `paid=false`, **значение определяется ML/Gemini по комментарию/контрагенту**.
  - **ML/Gemini:** встроить ML-классификацию (можно использовать Gemini, как сейчас при парсинге).
  - **API:** как выше.
  - **Синхронизация:** локальный стейт + toast.
  - **Фильтрация:** при нажатии также применить фильтр по рассчитанному paid/unpaid.

- **Print**
  - **Статус:** болванка.
  - **Действие:** `window.print()` либо экспорт печатного вида.
  - **Синхронизация:** не требуется, но важно учитывать текущие фильтры и выбранные строки.

- **Delete (bulk)**
  - **Статус:** уже открывает модалку для одной строки (берёт первую selected).
  - **Что нужно:** массовое удаление всех `selectedRowIds`.
  - **API:** `DELETE /custom-tables/:id/rows/:rowId` (батч).
  - **Синхронизация:** удалить из локального `rows`, очистить selection.

- **Search**
  - **Статус:** input без привязки.
  - **Действие:** добавить локальный фильтр или серверный фильтр (в идеале через `filtersParam`).
  - **Синхронизация:** `loadRows({ reset: true, filtersParam })`.

- **Add row (Plus)**
  - **Статус:** уже делает `POST /custom-tables/:id/rows`.
  - Нужно переделать ui, избавится от выбора иконки и сделать больше в стиле финтех минимализма потому что сейчас вылезающее окно бесит. Лучше вообще просто в пустом месте при нажатии на + пусть добавляется новая колонка где мы будем уже ей присваевать имя. 
  - **Синхронизация:** добавляет строку в локальный список.

### Редактирование мета-данных таблицы
- **Название / Описание (если UI есть)**
  - **Действие:** `PATCH /custom-tables/:id` с `name`, `description`.
  - **Синхронизация:** `loadTable()` и обновление заголовка.

---

## 3) Грид (TanStack)
**Файл:** `frontend/app/custom-tables/[id]/CustomTableTanStack.tsx`

### Actions column (View / Edit / Delete)
- **View**
  - **Статус:** болванка.
  - **Действие:** открыть **Drawer**, который уже используется в проекте (storybook Drawer), в режиме **read-only**.
  - **Сценарий:** быстрое окно с ключевыми полями строки, метаданными, предпросмотром и блоком «История изменений» (если доступно).
  - **Синхронизация:** не требуется (только чтение).

- **Edit**
  - **Статус:** болванка.
  - **Действие:** открыть **тот же Drawer**, но в режиме **редактирования**.
  - **Сценарий:** поля редактируются inline, внизу — действия **Save / Cancel**, плюс быстрые кнопки «Применить и перейти к следующей строке» и «Сохранить и закрыть».
  - **Синхронизация:** изменения уходят через `onUpdateCell` / `PATCH /rows/:id` и локально обновляют `rows`.

- **Общее для View/Edit**
  - **UI:** один Drawer-компонент, режим определяется параметром (`mode: view | edit`).
  - **Польза:** меньше контекстных переключений, быстрые правки и единый UX для просмотра и редактирования.

- **Delete**
  - **Статус:** работает (вызывает `onDeleteRow`).
  - **Синхронизация:** `DELETE /custom-tables/:id/rows/:rowId`.

### Add Column header button
- **Статус:** вызывает `onAddColumnClick`.
- **Действие:** открыть форму новой колонки.
- **Синхронизация:** не требуется.

### Row selection
- **Статус:** selection есть, но не прокидывается вверх.
- **Что нужно:** при изменении `rowSelection` дергать `props.onSelectedRowIdsChange`.
- **Синхронизация:** важно для bulk actions в toolbar.

---

## 4) Заголовки и колонок
**Файл:** `frontend/app/custom-tables/[id]/components/headers/EditableHeader.tsx`

### Rename
- **Статус:** работает через `onRename`.
- **API:** `PATCH /custom-tables/:id/columns/:colId`.
- **Синхронизация:** `loadTable()`.

### Delete column (иконка X)
- **Статус:** вызывает `onDelete`.
- **API:** `DELETE /custom-tables/:id/columns/:colId`.
- **Синхронизация:** `loadTable()` + обновление ширин.

---

## 5) Новая колонка (форма)
**Файл:** `frontend/app/custom-tables/[id]/page.tsx`

### Кнопки
- **Choose icon**
  - **Статус:** открывает список, работает.
- **Upload icon**
  - **Статус:** `POST /data-entry/custom-fields/icon` (проверить endpoint).
  - **Синхронизация:** сохраняется в `newColumnIcon`.

- **Cancel**
  - **Статус:** работает.

- **Save**
  - **Статус:** `POST /custom-tables/:id/columns`.
  - **Синхронизация:** `loadTable()` + сброс формы.

---

## 6) Ячейки (inline редакторы)
**Файл:** `frontend/app/custom-tables/[id]/components/cells/*`

### Общая логика
- **Изменение значения**
  - **API:** `PATCH /custom-tables/:id/rows/:rowId` с `data`.
  - **Синхронизация:** апдейт локальных `rows`.

### EditableDateCell
- **Cancel**
  - **Статус:** работает локально.
  - **Действие:** сброс в `initialValue`.

---

## 7) Импорт из Google Sheets
**Файл:** `frontend/app/custom-tables/import/google-sheets/page.tsx`

### Кнопки
- **Preview**
  - **Статус:** `POST /custom-tables/import/google-sheets/preview`.
  - **Синхронизация:** заполнение `preview` и `columns`.

- **Enable all**
  - **Статус:** работает (только UI).

- **Commit import**
  - **Статус:** `POST /custom-tables/import/google-sheets/commit`.
  - **Синхронизация:** обновление статуса job и переход на таблицу по завершению.

---

## 8) Что требует уточнения
1. **Какие колонки означают “paid/unpaid”** — нужен ключ в данных строки.
2. **Bulk API** — если есть endpoint для массовых апдейтов/удалений, используем его вместо множества запросов.
3. **View/Edit row modal** — нужен UX: drawer, modal, inline? Сейчас это болванки.

---

## Приоритет внедрения
1. **Bulk actions (Mark/Unmark/Delete)**  
2. **Search/filter привязка к API**  
3. **View/Edit row (иконки в Actions)**  
4. **Selection → синхронизация с тулбаром**  
5. **Print**  

---

## Итог
План закрывает все UI-кнопки в кастомных таблицах, которые сейчас не выполняют действий. После внедрения каждая кнопка должна либо:
- выполнять API-запрос и синхронизировать локальные данные, либо
- выполнять локальное действие (открыть модалку, переключить режим), либо
- запускать системное действие (печать).

---

## Статус по пунктам
1) **Список кастомных таблиц (`frontend/app/custom-tables/page.tsx`)**
   - Create — ✅ открывает меню.
   - Create → Empty — ✅ `POST /custom-tables` + `loadTables()` + переход.
   - Create → From Statement — ✅ `POST /custom-tables/from-statements` + переход/обновление.
   - Create → Import Google Sheets — ✅ навигация.
   - Card → Open/Delete — ✅ открыть таблицу / `DELETE` + `loadTables()` + toast.

2) **Детальная страница (`frontend/app/custom-tables/[id]/page.tsx`)**
   - Верхние табы — ✅ динамические (топ‑значения), маппинг в `filtersParam`, перезагрузка `loadRows({ reset: true })`.
   - Mark as paid / unpaid — ✅ батч‑`PATCH`, добавление `Paid` колонки при необходимости, ML/Gemini‑классификация + fallback, локальный апдейт + reset selection + фильтр.
   - Print — ✅ `window.print()`.
   - Delete (bulk) — ✅ батч‑`DELETE`, локальный апдейт + очистка selection.
   - Search — ✅ серверный `filtersParam` (`search`) + reload.
   - Add row (Plus) — ✅ `POST /custom-tables/:id/rows` + локальный апдейт.
   - Редактирование мета‑данных — ✅ `PATCH /custom-tables/:id` + `loadTable()`.

3) **Грид (`frontend/app/custom-tables/[id]/CustomTableTanStack.tsx`)**
   - View/Edit — ✅ Drawer (read‑only / edit) с сохранением и быстрыми действиями.
   - Delete — ✅ вызывает `onDeleteRow`.
   - Add Column header — ✅ открывает форму новой колонки.
   - Row selection — ✅ прокидывается вверх через `onSelectedRowIdsChange`.

4) **Заголовки колонок (`frontend/app/custom-tables/[id]/components/headers/EditableHeader.tsx`)**
   - Rename — ✅ `PATCH /custom-tables/:id/columns/:colId` + `loadTable()`.
   - Delete column — ✅ `DELETE /custom-tables/:id/columns/:colId` + обновление.

5) **Новая колонка (форма, `frontend/app/custom-tables/[id]/page.tsx`)**
   - Save/Cancel — ✅ `POST /custom-tables/:id/columns` + `loadTable()` + reset формы.
   - Choose/Upload icon — ⚠️ упрощено: выбор/загрузка иконки убраны по запросу, минималистичный UI.

6) **Ячейки (`frontend/app/custom-tables/[id]/components/cells/*`)**
   - Изменение значения — ✅ `PATCH /custom-tables/:id/rows/:rowId` + локальный апдейт.
   - EditableDateCell Cancel — ✅ сброс на `initialValue`.

7) **Импорт Google Sheets (`frontend/app/custom-tables/import/google-sheets/page.tsx`)**
   - Preview — ✅ `POST /custom-tables/import/google-sheets/preview` + `preview/columns`.
   - Enable all — ✅ UI‑только.
   - Commit import — ✅ `POST /custom-tables/import/google-sheets/commit` + job‑статус + переход.

8) **Что требовало уточнения**
   - Paid/Unpaid колонка — ✅ авто‑создание/поиск + ML‑классификация по данным строки.
   - Bulk API — ✅ используется батч через `Promise.all` (bulk endpoint отсутствует).
   - View/Edit row modal — ✅ Drawer с view/edit режимами.
