# FinFlow Backend

Backend приложение для системы обработки банковских выписок на базе NestJS.

## Установка

```bash
npm install
```

## Настройка окружения

Скопируйте `.env.example` в `.env` и заполните необходимые переменные:

```bash
cp .env.example .env
```

## Запуск базы данных

Используйте Docker Compose для запуска PostgreSQL и Redis:

```bash
docker-compose up -d
```

## Миграции

Схема базы управляется миграциями (TypeORM synchronize отключён). При старте приложения миграции выполняются автоматически, но их можно применить вручную, чтобы заполнить таблицу `migrations` после обновления контейнера:

```bash
npm run migration:run

# или внутри Docker-контейнера backend
docker exec -it finflow-backend npm run migration:run
```

## Запуск приложения

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

## Структура проекта

```
src/
├── common/          # Общие утилиты, фильтры, guards, interceptors
├── config/          # Конфигурации (БД, и т.д.)
├── entities/        # TypeORM сущности
├── modules/         # Модули приложения
├── migrations/      # Миграции БД
├── app.module.ts    # Корневой модуль
└── main.ts          # Точка входа
```

## API

API доступно по адресу: `http://localhost:3001/api/v1`

Health check: `GET /api/v1/health`







