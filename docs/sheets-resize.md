План реализации растягивания таблицы (Column/Row Resize + Wrap) как в Google Sheets
Цель: добавить в приложении поведение таблицы, аналогичное Google Sheets — возможность растягивать ширину колонок и высоту строк для большего пространства под текст, а также поддержать перенос текста (wrap) и опциональную авто-высоту строки.

1. Функциональные требования
- Изменение ширины колонок перетягиванием границы заголовка (column resize).
- Изменение высоты строк перетягиванием границы строки (row resize).
- Перенос текста по словам (wrap) на уровне таблицы и/или отдельной колонки.
- Опционально: авто-подбор высоты строки по содержимому (auto row height).
- Сохранение пользовательских размеров (persist) и восстановление при открытии таблицы.

2. UX поведение (как в Google Sheets)
Колонки:
- Наведение на правую границу header → курсор col-resize.
- Drag → изменение ширины.
- (Опционально) Double click → авто-подбор ширины по контенту.

Строки:
- Наведение на нижнюю границу row header (или строки) → курсор row-resize.
- Drag → изменение высоты.

Текст:
- wrap: off/on.
- autoRowHeight: off/on (для wrap-колонок).

3. Хранение размеров и настроек (view_settings)
Рекомендуемый способ — хранить настройки в JSONB view_settings у таблицы.

Пример:
{
 "layout": { "defaultRowHeight": 32, "maxAutoRowHeight": 240, "stickyHeader": true },
 "columns": {
   "col_title": { "width": 320, "wrap": true, "align": "left" },
   "col_notes": { "width": 520, "wrap": true }
 },
 "rows": {
   "<rowId>": { "height": 64 }
 }
}

4. Реализация на Frontend
4.1 Column resize:
- Если используется TanStack Table: включить enableColumnResizing.
- Режим columnResizeMode='onEnd' (рекомендовано для производительности).
- В header cell добавить resizer-handle.
- На окончании drag сохранить width.

4.2 Row resize:
- Реализовать кастомно: в row header (номер строки) добавить handle снизу.
- По drag обновлять rowHeight[rowId].
- На drag end сохранять высоту строки.

4.3 Wrap:
- Для колонки wrap=true: white-space: normal; word-break: break-word.
- Управление wrap через меню колонки / настройки таблицы.

4.4 Виртуализация:
- При больших таблицах использовать @tanstack/react-virtual.
- estimateSize = defaultRowHeight.
- При row resize обновлять измерения (measureElement или invalidate).

5. Auto row height (опционально)
Суть: высота строки автоматически увеличивается под текст в wrap-колонках.

Подход:
- Измерять высоту (scrollHeight) только для видимых строк.
- Измерять только колонки с wrap=true.
- Обновлять измерения при:
 - изменении текста в ячейке
 - изменении ширины колонки
 - включении/выключении wrap
- Ограничить высоту maxAutoRowHeight (например 240px).

6. Backend API для сохранения настроек
Рекомендуемые endpoints:
- PATCH /custom-tables/:id/view-settings/columns
 Body: { columnKey, width?, wrap?, align? }
- PATCH /custom-tables/:id/view-settings/rows
 Body: { rowId, height }
- PATCH /custom-tables/:id/view-settings (batch)
 Body: { columnUpdates: [...], rowUpdates: [...], layout?: {...} }

Рекомендации:
- Сохранять изменения по событию drag end.
- Debounce 300–500ms, если требуется плавная запись.
- Валидировать min/max значения (например ширина 60..1200px).

7. Производительность и масштабирование
- Не отправлять запрос на сервер на каждый пиксель drag — только onEnd.
- Для больших данных использовать виртуализацию.
- Auto row height считать только для видимых строк.
- Хранить row overrides только для изменённых строк (не для всех).

8. Roadmap внедрения
Phase 1 (MVP):
- Column resize + persist widths
- Wrap toggle per column
- Default row height

Phase 2:
- Row resize + persist heights
- Sticky header / frozen columns (если нужно)

Phase 3:
- Auto row height + ограничение maxAutoRowHeight
- Double-click fit width/height (опционально)

9. Рекомендуемые библиотеки
Frontend:
- @tanstack/react-table
- @tanstack/react-virtual
- date-fns (если участвует date column)
- (опционально) lodash.debounce

Backend:
- текущий ORM (Prisma / TypeORM)
- JSONB хранение view_settings в PostgreSQL