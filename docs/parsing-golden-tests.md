# Golden-тесты парсинга (каркас)

- Директория с эталонными файлами: `backend/golden/` (поддиректории по банку/формату, например `kaspi/pdf/`, `bereke/new/`).
- Для каждого файла хранить ожидаемый JSON `*.expected.json` с `ParsedStatement` (metadata + transactions).
- Плановая команда: `npm run test:golden` (backend) → Jest тест, который для каждого файла гоняет пайплайн парсинга и сравнивает с эталоном.
- Пока данные не собраны, тест должен пропускаться, если нет директории `backend/golden` или переменной `GOLDEN_ENABLED=1`.
- После появления датасета: добавить снапшоты/дифф сумм (debit/credit/balances) и отчёт по расхождениям в CI.
- Для быстрой отладки без CI есть CLI: `cd backend && npx ts-node -r tsconfig-paths/register scripts/parse-debug.ts <file>` — показывает детект, парсер, версию и первые транзакции.
- Для подготовки эталонов таблиц PDF есть дампер: `cd backend && npx ts-node -r tsconfig-paths/register scripts/pdf-table-dump.ts <file> [out.json]` — сохраняет извлечённые таблицы pdfplumber для ручной разметки/сверки.
- Для сравнения текущего парса с эталоном: `cd backend && npm run parse:diff -- <file> <expected.json>` — выводит дельты по количеству/суммам и список недостающих/лишних транзакций по сигнатурам.
