План реализации фильтрации по колонкам
1. Цель
Реализовать масштабируемую фильтрацию по колонкам пользовательских таблиц по аналогии с Google Sheets, но с серверной обработкой для высокой производительности.

2. Общая архитектура
Фильтрация реализуется в формате client → server:
- UI формирует фильтры
- Backend применяет фильтры на уровне БД (PostgreSQL)
- Возвращается отфильтрованный набор строк с пагинацией и сортировкой

3. Типы фильтрации
3.1 Header-фильтры (в шапке таблицы):
- Text
- Number (min/max)
- Date (range)
- Select / Multi-select
- Boolean

3.2 Advanced filters (панель фильтров):
- Column
- Operator
- Value
- Логика AND (на первом этапе)

4. Формат фильтров (DTO)
Пример структуры запроса:

{
 cursor: null,
 limit: 50,
 sort: [{ col: 'amount', dir: 'desc' }],
 filters: [
   { col: 'currency', op: 'eq', value: 'KZT' },
   { col: 'amount', op: 'between', value: [0, 100000] },
   { col: 'date', op: 'gte', value: '2025-01-01' }
 ]
}

5. Поддерживаемые операторы
- eq / neq
- contains / startsWith
- gt / gte / lt / lte
- between
- in
- isEmpty / isNotEmpty

6. Реализация на backend (PostgreSQL + JSONB)
Данные строк хранятся в JSONB поле data.

Примеры SQL:
- Text: (data->>'counterparty') ILIKE '%kaspi%'
- Number: NULLIF(data->>'amount','')::numeric >= 0
- Date: (data->>'date')::date >= '2025-01-01'

7. Индексация и производительность
- Индекс по table_id
- Cursor-based pagination
- GIN индекс по JSONB (data)
- Опционально: отдельное поле search_text или full-text search

8. Пагинация и сортировка
Использовать server-side pagination.
Сортировка по JSONB с приведением типов.
Cursor содержит lastValue + lastId.

9. Реализация на frontend (React)
Рекомендуется TanStack Table:
- manualFiltering
- manualSorting
- manualPagination
- debounce 300–500 мс при изменении фильтров

10. Этапы внедрения
Шаг 1 (MVP): Header-фильтры + AND логика
Шаг 2: Сохранение пресетов фильтров (Views)
Шаг 3: Faceted filters, пустые значения, глобальный поиск

11. Используемые библиотеки
- Frontend: TanStack Table, lodash.debounce
- Backend: PostgreSQL, ORM (Prisma / TypeORM)
- Дополнительно: Full-text search (опционально)