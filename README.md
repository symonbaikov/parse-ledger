# FinFlow - Система загрузки и обработки банковских выписок

Система автоматической загрузки и обработки банковских выписок с интеграцией в Google Sheets и автоматической отправкой отчётов в Telegram.

## Структура проекта

```
parse-ledger/
├── backend/          # Nest.js backend приложение
├── frontend/         # Next.js frontend приложение
├── docs/             # Документация проекта
├── scripts/          # Вспомогательные скрипты
└── README.md         # Этот файл
```

## Технологический стек

### Backend

- Node.js + NestJS
- PostgreSQL
- TypeORM
- BullMQ + Redis (для фоновых задач)
- Winston/Pino (логирование)

### Frontend

- Next.js + React
- TypeScript
- Material-UI
- Axios

## 🚀 Быстрый старт

### Вариант 1: Docker (рекомендуется)

```bash
# 1. Создайте .env файл в корне проекта
cp .env.example .env

# 2. Отредактируйте .env и укажите JWT секреты:
#    JWT_SECRET=<сгенерируйте: openssl rand -base64 32>
#    JWT_REFRESH_SECRET=<сгенерируйте: openssl rand -base64 32>

# 3. Запустите все сервисы
docker-compose up -d --build

# Или используйте скрипт
./scripts/docker-start.sh
```

**Доступ:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1

**Просмотр логов:**

```bash
docker-compose logs -f
```

**Остановка:**

```bash
docker-compose down
```

### Вариант 2: Локальная разработка

1. **Запустите базу данных:**

   ```bash
   docker-compose up -d postgres redis
   ```

2. **Настройте переменные окружения:**

   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Отредактируйте .env

   # Frontend
   cd ../frontend
   cp .env.local.example .env.local
   ```

3. **Установите зависимости и запустите:**

   ```bash
   # Backend
   cd backend
   npm install
   npm run start:dev

   # Frontend (в другом терминале)
   cd frontend
   npm install
   npm run dev
   ```

## 📚 Документация

- [📋 Требования](./docs/requirements.md)
- [📅 План реализации](./docs/plan.md)
- [🏗️ Архитектурные правила](./docs/arch-rules.md)
- [🚀 Инструкция по запуску](./SETUP.md)
- [🐳 Docker инструкции](./DOCKER.md)
- [🧾 API (Swagger)](./docs/api.md) — интерактивная документация доступна на `/api/docs`

## 🔧 Полезные команды

### Docker

```bash
# Запуск
docker-compose up -d --build

# Логи
docker-compose logs -f [service]

# Остановка
docker-compose down

# Пересборка
docker-compose build --no-cache
```

### База данных

```bash
# Подключение к PostgreSQL
docker exec -it finflow-postgres psql -U finflow -d finflow

# Бэкап
docker exec finflow-postgres pg_dump -U finflow finflow > backup.sql
```

## 📝 Переменные окружения

### Обязательные для запуска

**Backend (.env):**

- `JWT_SECRET` - секрет для JWT токенов (минимум 32 символа)
- `JWT_REFRESH_SECRET` - секрет для refresh токенов (минимум 32 символа)
- `DATABASE_URL` - URL базы данных

**Frontend (.env.local):**

- `NEXT_PUBLIC_API_URL` - URL backend API

### Генерация JWT секретов

```bash
openssl rand -base64 32  # Для JWT_SECRET
openssl rand -base64 32  # Для JWT_REFRESH_SECRET
```

## 🎯 Первые шаги

1. Запустите проект (Docker или локально)
2. Создайте администратора (см. ниже)
3. Откройте http://localhost:3000 и войдите

## 👤 Создание администратора

### Вариант 1: Через скрипт (рекомендуется)

```bash
# Локально
cd backend
npm run create-admin [email] [password] [name]

# Пример:
npm run create-admin admin@example.com admin123 "Admin User"

# В Docker контейнере
docker exec -it finflow-backend npm run create-admin admin@example.com admin123 "Admin User"
```

### Вариант 2: Через SQL

```bash
# Подключитесь к базе данных
docker exec -it finflow-postgres psql -U finflow -d finflow

# Выполните SQL (замените email, password_hash и name)
INSERT INTO users (id, email, password_hash, name, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  '$2b$10$YourHashedPasswordHere',  -- Используйте bcrypt для хеширования пароля
  'Administrator',
  'admin',
  true,
  NOW(),
  NOW()
);
```

### Вариант 3: Через API (если уже есть пользователь)

1. Зарегистрируйтесь через `/api/v1/auth/register`
2. Подключитесь к базе данных и обновите роль:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

**По умолчанию (если не указаны параметры):**

- Email: `admin@example.com`
- Password: `admin123`
- Name: `Administrator`

⚠️ **ВАЖНО:** Смените пароль после первого входа! 3. Зарегистрируйте аккаунт через `/register` 4. Войдите в систему через `/login` 5. Загрузите первую выписку через `/upload`

## Лицензия

Private project