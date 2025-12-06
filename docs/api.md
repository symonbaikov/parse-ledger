# FinFlow API

Документация REST API доступна в интерактивном виде (Swagger UI) по адресу `/api/docs` после запуска backend. Базовый префикс: `/api/v1`.

## Аутентификация

- JWT Bearer. Получение токенов: `POST /auth/login` (email + password) или `/auth/refresh` (refresh_token в Authorization: Bearer).
- Добавляйте заголовок `Authorization: Bearer <access_token>` ко всем защищённым запросам.

## Идемпотентность

- Для загрузки выписок используйте заголовок `Idempotency-Key` (UUID). Повторные запросы с тем же ключом не создадут дубликат.

## Основные разделы API

- `/auth` — регистрация, логин, refresh, logout, профиль.
- `/statements` — загрузка и управление выписками; просмотр файла `/statements/:id/view`, скачивание `/statements/:id/file`, повторная обработка `/statements/:id/reprocess`.
- `/transactions` — управление транзакциями (CRUD, массовые операции).
- `/classification` — автоматическая классификация транзакций.
- `/reports` — ежедневные/месячные/кастомные отчёты и экспорт.
- `/google-sheets` — подключение и синхронизация Google Sheets.
- `/telegram` — подключение чата, отправка отчётов, история отправок; вебхук `/telegram/webhook` для бота.
- `/users` — профиль пользователя, управление ролями и правами (админ).

## Коды ошибок

- 400 Bad Request — ошибка валидации/формата.
- 401 Unauthorized — отсутствует/просрочен JWT.
- 403 Forbidden — недостаточно прав.
- 404 Not Found — ресурс не найден.
- 422 Unprocessable Entity — бизнес-валидация.
- 429 Too Many Requests — превышен лимит.
- 500 Internal Server Error — неожиданная ошибка.

Формат ответа об ошибке (пример):

```json
{
  "error": {
    "code": 400,
    "message": "Validation failed",
    "details": ["email must be an email"]
  }
}
```

## Примеры запросов

### Логин

```bash
curl -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secret"}'
```

### Загрузка выписки (PDF)

```bash
curl -X POST "$API/statements/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: 123e4567-e89b-12d3-a456-426614174000" \
  -F "files=@/path/to/statement.pdf"
```

### Отправка отчёта в Telegram вручную

```bash
curl -X POST "$API/telegram/send-report" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reportType": "daily", "chatId": "<chat_id>"}'
```

### Смена email

```bash
curl -X PATCH "$API/users/me/email" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "new@example.com", "currentPassword": "old_password"}'
```

### Смена пароля

```bash
curl -X PATCH "$API/users/me/password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword": "old_password", "newPassword": "new_secure_password"}'
```

## Переменные окружения (важное)

- `PORT` — порт backend (по умолчанию 3001)
- `FRONTEND_URL` — origin фронтенда для CORS
- `DATABASE_URL` — строка подключения PostgreSQL
- `JWT_SECRET`, `JWT_REFRESH_SECRET` — секреты JWT
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- `TELEGRAM_BOT_TOKEN` — токен бота
- `REDIS_*` — для фоновых задач
