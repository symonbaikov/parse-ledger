План реализации копирования и воспроизведения стилей таблиц (Google Sheets → Приложение)
Цель документа — описать технический план реализации импорта, хранения и воспроизведения визуальных стилей таблиц Google Sheets внутри приложения с возможностью дальнейшего расширения и улучшения по сравнению с Google Sheets.

1. Цели и ограничения

Цели:
- Визуально приблизить таблицы приложения к Google Sheets.
- Сохранить цвета, шрифты, выравнивание, форматы чисел.
- Обеспечить масштабируемость и расширяемость стилей.
- Сделать таблицы автономными от Google Sheets после импорта.

Ограничения:
- Не требуется 100% пиксель-в-пиксель соответствие.
- Формулы, условное форматирование и скрипты импортируются отдельно.

2. Источник данных стилей (Google Sheets API)

Используется Google Sheets API v4:
- spreadsheets.get с параметром includeGridData=true
- Получаем:
 - userEnteredFormat
 - effectiveFormat
 - numberFormat
 - backgroundColor
 - textFormat (bold, italic, fontSize, fontFamily, foregroundColor)
 - horizontalAlignment / verticalAlignment

3. Модель хранения стилей в базе данных

Рекомендуемый подход — нормализованная модель + JSONB.

Пример сущностей:
- table_styles
- column_styles
- cell_styles (опционально)
- row_styles (опционально)

Каждый стиль:
- id
- scope (table | column | row | cell)
- target_id
- style_json (JSONB)

4. Алгоритм импорта стилей

1. Запрос структуры и данных листа.
2. Парсинг gridData.
3. Выделение:
  - Стилей колонок (если повторяются > N раз).
  - Стилей строк (если применимы).
  - Уникальных ячеек.
4. Дедупликация стилей.
5. Сохранение ссылок на стили.

5. Приоритеты применения стилей (CSS cascade модель)

Порядок применения:
1. Table style
2. Column style
3. Row style
4. Cell style (максимальный приоритет)

Этот порядок полностью повторяет логику Google Sheets.

6. Отрисовка на фронтенде

Рекомендуемые библиотеки:
- TanStack Table (headless)
- CSS variables + inline styles
- Optional: Tailwind + style mapper

Подход:
- Каждая ячейка получает вычисленный style object.
- Используются CSS-переменные для цветов и шрифтов.

7. Масштабирование и улучшения относительно Google Sheets

Возможные улучшения:
- Темы таблиц (dark / light / custom).
- Переиспользуемые шаблоны стилей.
- Override-стили поверх импортированных.
- Анимации hover / focus.

8. Ограничения и осознанные компромиссы

Не копируются:
- Conditional formatting (на первом этапе).
- Формулы отображения.
- Custom Google fonts (замена на system fonts).

Эти функции можно добавить на Phase 2.

9. Roadmap реализации

Phase 1 (MVP):
- Импорт backgroundColor, numberFormat, alignment.
- Column + Cell styles.

Phase 2:
- Text formatting, fonts, themes.

Phase 3:
- Conditional formatting engine.
- Пользовательский редактор стилей.

10. Итог
Данный подход позволяет воспроизводить стили Google Sheets, но при этом создать более гибкую и расширяемую систему визуальных таблиц, адаптированную под бизнес-логику приложения.