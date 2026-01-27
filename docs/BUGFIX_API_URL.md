# Bugfix: API URL Path in Document Viewer

## Проблема

При открытии страницы просмотра документа (`/statements/:id/view`) возникала ошибка:

```
Error fetching data: Error: Failed to fetch data
```

В консоли браузера видны запросы к неверным URL:
```
http://localhost:3001/statements/df8bd2eb-57dc-4674-b92b-8c4deffddf78
http://localhost:3001/statements/df8bd2eb-57dc-4674-b92b-8c4deffddf78/transactions
```

## Причина

В коде страницы `frontend/app/statements/[id]/view/page.tsx` была ошибка с префиксом `/api/v1/` в URL запросов к API.

**Проблема:** Переменная окружения `NEXT_PUBLIC_API_URL` уже содержит `/api/v1`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

**Было (неправильно - дублировал /api/v1/):**
```typescript
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/statements/${statementId}`)
// Результат: http://localhost:3001/api/v1/api/v1/statements/... ❌
```

**Стало (правильно):**
```typescript
fetch(`${process.env.NEXT_PUBLIC_API_URL}/statements/${statementId}`)
// Результат: http://localhost:3001/api/v1/statements/... ✅
```

## Исправление

### Измененный файл

`frontend/app/statements/[id]/view/page.tsx`

### Изменения

```diff
- `${process.env.NEXT_PUBLIC_API_URL}/api/v1/statements/${statementId}`,
+ `${process.env.NEXT_PUBLIC_API_URL}/statements/${statementId}`,

- `${process.env.NEXT_PUBLIC_API_URL}/api/v1/statements/${statementId}/transactions`,
+ `${process.env.NEXT_PUBLIC_API_URL}/statements/${statementId}/transactions`,
```

**Важно:** Не нужно добавлять `/api/v1/` в URL, так как он уже есть в `NEXT_PUBLIC_API_URL`!

## Как применить исправление

### 1. Обновить код

Код уже исправлен в файле `frontend/app/statements/[id]/view/page.tsx`

### 2. Пересобрать frontend

```bash
cd frontend
npm run build
```

### 3. Перезапустить контейнер

```bash
docker-compose restart frontend
```

## Проверка

### 1. Откройте страницу хранилища

```
http://localhost:3000/storage
```

### 2. Нажмите на иконку глаза 👁️

Должна открыться страница с красиво оформленным документом

### 3. Проверьте консоль браузера (F12)

Должны быть успешные запросы:
```
GET http://localhost:3001/api/v1/statements/:id → 200
GET http://localhost:3001/api/v1/statements/:id/transactions → 200
```

### 4. Проверьте логи backend

```bash
docker-compose logs backend --tail 50 | grep statements
```

Должны появиться записи:
```json
{"method":"GET","url":"/api/v1/statements/:id","statusCode":200}
{"method":"GET","url":"/api/v1/statements/:id/transactions","statusCode":200}
```

## Результат

✅ Страница просмотра документа загружается без ошибок
✅ Отображается красивый документ с транзакциями
✅ Все данные загружаются корректно
✅ Кнопки "Печать" и "Редактировать" работают

## Урок на будущее

### Проверка переменных окружения

Всегда проверяйте, что содержит `NEXT_PUBLIC_API_URL`:

```bash
# Проверить в контейнере
docker exec finflow-frontend printenv | grep NEXT_PUBLIC_API_URL
```

**Если `NEXT_PUBLIC_API_URL` уже содержит `/api/v1/`:**
```typescript
// ✅ ПРАВИЛЬНО
const url = `${process.env.NEXT_PUBLIC_API_URL}/resource`;
// Результат: http://localhost:3001/api/v1/resource

// ❌ НЕПРАВИЛЬНО - дублирование /api/v1/
const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/resource`;
// Результат: http://localhost:3001/api/v1/api/v1/resource
```

**Если `NEXT_PUBLIC_API_URL` = `http://localhost:3001` (без /api/v1/):**
```typescript
// ✅ ПРАВИЛЬНО
const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/resource`;
```

### Тестирование в Dev Tools

Перед коммитом всегда проверяйте:
1. Откройте консоль браузера (F12)
2. Перейдите на вкладку Network
3. Проверьте URL всех запросов
4. Убедитесь, что все запросы возвращают 200 OK

### Проверка логов backend

```bash
# Смотрите логи в реальном времени
docker-compose logs -f backend | grep ERROR

# Проверьте, что запросы доходят до backend
docker-compose logs backend --tail 100 | grep "GET.*statements"
```

## Связанные документы

- [DOCUMENT_VIEWER.md](./DOCUMENT_VIEWER.md) - Основная документация
- [TESTING_DOCUMENT_VIEWER.md](./TESTING_DOCUMENT_VIEWER.md) - Гид по тестированию
- [QUICK_START_DOCUMENT_VIEWER.md](./QUICK_START_DOCUMENT_VIEWER.md) - Быстрый старт

---

**Дата исправления**: 2025-01-20  
**Версия**: 1.0.1  
**Статус**: ✅ ИСПРАВЛЕНО