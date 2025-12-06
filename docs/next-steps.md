# Next Steps Plan

## 1) Database migrations
- Create a formal migration that adds `telegram_chat_id` to `users` and ensures storage/telegram tables exist (shared_links, file_permissions, telegram_reports) instead of relying on `synchronize`.
- Seed/mark migrations in the container DB (`migrations` table) so future deploys use `npm run migration:run` cleanly.
- Align container DB with code: drop ad-hoc sync, keep a single source of truth via migrations.

## 2) API documentation
- Add Swagger decorators (ApiTags/ApiBearerAuth/ApiResponse/ApiBody/ApiQuery) for all controllers/DTOs: auth, statements, transactions, classification, reports, google-sheets, telegram, storage.
- Enrich examples and error schemas; reflect idempotency header for uploads.
- Update README/docs with short usage guides for Google Sheets OAuth flow, Telegram bot setup/webhook, and UI navigation.

## 3) Tests
- Unit: parsers (Bereke, etc.), reports service, auth service (password/hash, refresh), telegram service message formatting.
- Integration: auth + upload → parse → classify → report path; Google Sheets/Telegram mocked clients; storage permissions/share links.
- E2E/smoke: login, upload sample PDF, verify transactions list, manual report export.

## 4) Observability & security
- Structured JSON logging (timestamp, level, service, user_id, statement_id, correlation_id, message, details) and consistent error payloads.
- Retry/backoff wrappers for Google Sheets and Telegram APIs; handle rate limits and transient network errors.
- Metrics/health: basic latency + counts (processed statements, failed statements, sent telegram reports) and healthchecks; address npm audit vulnerabilities.
- Harden configs: ensure secrets via env, CORS/validation already in place; add rate-limit tuning and optional alerts.
