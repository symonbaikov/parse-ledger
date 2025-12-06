# Хранилище файлов - Функциональность

## Обзор

Модуль хранилища превращает FinFlow в полноценную систему управления финансовыми документами с возможностями, аналогичными Dropbox:

- 📁 Централизованное хранение всех загруженных файлов
- 👀 Просмотр результатов парсинга для каждого файла
- ⬇️ Скачивание оригинальных файлов
- 🔗 Публичный шаринг через защищенные ссылки
- 🔐 Гранулярное управление правами доступа
- 🔒 Защита паролем и ограничение срока действия

---

## Backend API

### Storage Endpoints

#### 1. Получение списка файлов
```http
GET /api/v1/storage/files
Authorization: Bearer {access_token}
```

**Ответ**: Список всех файлов пользователя (owned + shared)

#### 2. Детали файла с транзакциями
```http
GET /api/v1/storage/files/:id
Authorization: Bearer {access_token}
```

**Ответ**: Полная информация о файле, транзакции, shared links, permissions

#### 3. Скачивание файла
```http
GET /api/v1/storage/files/:id/download
Authorization: Bearer {access_token}
```

**Ответ**: Бинарный файл для скачивания

### Shared Links (Публичный шаринг)

#### 4. Создание shared link
```http
POST /api/v1/storage/files/:id/share
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "permission": "view" | "download" | "edit",
  "expiresAt": "2024-12-31T23:59:59Z" (optional),
  "password": "secret123" (optional),
  "allowAnonymous": true,
  "description": "Для бухгалтера" (optional)
}
```

**Ответ**: Объект shared link с shareUrl

#### 5. Получить shared links файла
```http
GET /api/v1/storage/files/:id/shares
Authorization: Bearer {access_token}
```

#### 6. Обновить shared link
```http
PUT /api/v1/storage/shares/:id
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "permission": "download",
  "status": "revoked"
}
```

#### 7. Удалить shared link
```http
DELETE /api/v1/storage/shares/:id
Authorization: Bearer {access_token}
```

### Публичный доступ (без авторизации)

#### 8. Доступ к файлу по ссылке
```http
GET /api/v1/storage/shared/:token?password=secret123
```

**Public endpoint** - не требует авторизации

#### 9. Скачивание по shared link
```http
GET /api/v1/storage/shared/:token/download?password=secret123
```

**Public endpoint** - не требует авторизации

### Permissions (Права доступа)

#### 10. Предоставить права пользователю
```http
POST /api/v1/storage/files/:id/permissions
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "userId": "user-uuid",
  "permissionType": "viewer" | "downloader" | "editor",
  "canReshare": false,
  "expiresAt": "2024-12-31T23:59:59Z" (optional)
}
```

#### 11. Получить права доступа файла
```http
GET /api/v1/storage/files/:id/permissions
Authorization: Bearer {access_token}
```

#### 12. Обновить права доступа
```http
PUT /api/v1/storage/permissions/:id
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "permissionType": "editor",
  "canReshare": true
}
```

#### 13. Отозвать права доступа
```http
DELETE /api/v1/storage/permissions/:id
Authorization: Bearer {access_token}
```

---

## Frontend Pages

### 1. Страница хранилища (`/storage`)

**Функции**:
- Список всех файлов (owned + shared with you)
- Поиск по названию, банку, номеру счета
- Фильтрация файлов
- Быстрые действия: просмотр, скачивание, шаринг
- Отображение статуса прав доступа

**Компоненты**:
- Таблица файлов с сортировкой
- Поисковая строка
- Иконки действий для каждого файла

### 2. Детальный просмотр файла (`/storage/:id`)

**Вкладки**:

#### Транзакции
- Таблица всех транзакций файла
- Поиск по транзакциям
- Пагинация
- Просмотр категорий, филиалов, кошельков

#### Ссылки (Shares)
- Создание новой shared link
- Настройка уровня доступа (view/download/edit)
- Установка срока действия
- Защита паролем
- Список существующих ссылок с статистикой
- Копирование ссылки в буфер обмена

#### Права доступа (только для владельца)
- Таблица пользователей с правами
- Предоставление прав новому пользователю
- Редактирование существующих прав
- Отзыв прав доступа

### 3. Публичная страница (`/shared/:token`)

**Public page** - доступна без авторизации

**Функции**:
- Ввод пароля (если требуется)
- Просмотр метаданных файла
- Просмотр транзакций (если permission >= download)
- Скачивание файла (если permission >= download)

---

## Database Schema

### SharedLink

```sql
CREATE TABLE shared_links (
  id UUID PRIMARY KEY,
  statement_id UUID NOT NULL REFERENCES statements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,
  permission VARCHAR(20) DEFAULT 'view',
  expires_at TIMESTAMP NULL,
  password VARCHAR NULL,  -- bcrypt hash
  status VARCHAR(20) DEFAULT 'active',
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP NULL,
  allow_anonymous BOOLEAN DEFAULT true,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shared_links_token ON shared_links(token);
CREATE INDEX idx_shared_links_statement_id ON shared_links(statement_id);
```

### FilePermission

```sql
CREATE TABLE file_permissions (
  id UUID PRIMARY KEY,
  statement_id UUID NOT NULL REFERENCES statements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  granted_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_type VARCHAR(20) DEFAULT 'viewer',
  can_reshare BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(statement_id, user_id)
);

CREATE INDEX idx_file_permissions_statement_id ON file_permissions(statement_id);
CREATE INDEX idx_file_permissions_user_id ON file_permissions(user_id);
```

---

## Типы прав доступа

### FilePermissionType (для пользователей)

- **OWNER** - Владелец файла (все права)
- **EDITOR** - Редактор (просмотр, скачивание, редактирование транзакций)
- **VIEWER** - Просмотр метаданных и транзакций
- **DOWNLOADER** - Просмотр и скачивание файла

### SharePermissionLevel (для публичных ссылок)

- **VIEW** - Только просмотр метаданных файла
- **DOWNLOAD** - Просмотр метаданных, транзакций и скачивание
- **EDIT** - Полный доступ (как EDITOR)

---

## Безопасность

### Проверка прав доступа

Каждый endpoint проверяет:
1. **Владение файлом** - пользователь является владельцем?
2. **FilePermission** - есть ли явные права доступа?
3. **Тип действия** - соответствует ли permissionType требуемому действию?
4. **Срок действия** - не истекли ли права?

### Shared Links

- **Уникальный токен**: 64-символьный случайный hex-string
- **Пароль**: bcrypt хеширование (если установлен)
- **Истечение**: автоматическая проверка expiresAt
- **Статус**: ACTIVE, EXPIRED, REVOKED
- **Аудит**: отслеживание accessCount и lastAccessedAt

### Рекомендации

1. Устанавливайте срок действия для временных ссылок
2. Используйте пароль для конфиденциальных данных
3. Регулярно проверяйте и отзывайте неиспользуемые ссылки
4. Ограничивайте права доступа (principle of least privilege)

---

## Использование

### Создание shared link (пример)

```typescript
// Frontend
const createShareLink = async (fileId: string) => {
  const response = await api.post(`/api/v1/storage/files/${fileId}/share`, {
    permission: 'download',
    expiresAt: '2024-12-31T23:59:59Z',
    password: 'secret123',
    description: 'Выписка для бухгалтера'
  });

  const shareUrl = response.data.shareUrl;
  // shareUrl: https://finflow.app/shared/abc123...
  
  // Копировать в буфер обмена
  await navigator.clipboard.writeText(shareUrl);
};
```

### Предоставление прав пользователю

```typescript
// Frontend
const grantAccess = async (fileId: string, userEmail: string) => {
  await api.post(`/api/v1/storage/files/${fileId}/permissions`, {
    userId: userEmail, // В production нужен userId
    permissionType: 'editor',
    canReshare: true,
    expiresAt: '2024-12-31T23:59:59Z'
  });
};
```

### Доступ к shared link

```typescript
// Frontend (public page)
const accessSharedFile = async (token: string, password?: string) => {
  const response = await api.get(`/api/v1/storage/shared/${token}`, {
    params: { password }
  });

  return response.data; // { statement, transactions, permission, canDownload }
};
```

---

## Миграция

Для применения изменений в БД:

```bash
# Backend
cd backend
npm run typeorm migration:run
```

Это создаст таблицы:
- `shared_links`
- `file_permissions`

С соответствующими индексами и внешними ключами.

---

## Тестирование

### Backend

```bash
# Запустить backend
cd backend
npm run start:dev

# Проверить endpoints
curl http://localhost:3001/api/v1/storage/files \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend

```bash
# Запустить frontend
cd frontend
npm run dev

# Открыть в браузере
open http://localhost:3000/storage
```

### Интеграционное тестирование

1. Загрузите файл через `/upload`
2. Перейдите в `/storage`
3. Откройте детали файла
4. Создайте shared link
5. Откройте ссылку в инкогнито-режиме
6. Проверьте доступ с паролем и без

---

## Будущие улучшения

1. **Поиск пользователей**: Endpoint для поиска пользователей по email
2. **Групповые права**: Создание групп пользователей с общими правами
3. **Версионирование**: Хранение истории изменений файлов
4. **Уведомления**: Email/Telegram уведомления при шаринге
5. **Статистика**: Аналитика по доступу к файлам
6. **Корзина**: Временное хранение удаленных файлов
7. **Теги и папки**: Организация файлов по категориям
8. **Массовые операции**: Bulk sharing, bulk permission management

---

## Заключение

Модуль Storage превращает FinFlow в полноценную систему управления документами с:

✅ Централизованным хранилищем
✅ Публичным шарингом
✅ Гранулярными правами доступа
✅ Защитой и аудитом
✅ Удобным интерфейсом

Все готово к использованию! 🚀




