# Парсинг выписок: SLO и playbook

## SLO
- Успех парсинга (status != error): 99% за 24ч окно.
- Валидированный парсинг (status = validated): 97% за 24ч.
- Латентность полного цикла: p95 ≤ 30 сек, p99 ≤ 60 сек.
- AI доля ошибок (ai_parsing_calls_total result=error): ≤ 5% за 24ч.

## Алёрты
- error rate >1% за 15 мин по `statement_parsing_errors_total`.
- tail latency p99 >60 сек за 30 мин.
- AI circuit open или error >5% за 30 мин.
- Нулевая транзакция/дедуп (transactionsCreated=0) >3 случая за 30 мин.

## Playbook
- Проверить метрики: `statement_parsing_duration_seconds`, `statement_parsing_errors_total`, `ai_parsing_calls_total`, балансные варнинги в parsingDetails.
- Включить/выключить AI: env `AI_PARSING_ENABLED` (0/1). При деградации поставить 0 и прогнать без AI.
- Перепарсить с debug: `npm run parse:debug -- <file>` (видно детект/парсер/версию, первые транзакции) и `npm run parse:tables -- <file>` для снапшотов таблиц.
- Если баланс-чек фейлится: сверить суммы/валюты, проверить парсер версии; при необходимости добавить hotfix в mapping и rerun.
- При росте ошибок pdfplumber: проверить python/pdfplumber доступность, лог stderr; при необходимости временно переключить на AI-only (добавить флаг в окружение).
