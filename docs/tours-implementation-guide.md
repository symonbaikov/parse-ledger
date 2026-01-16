# Инструкция по внедрению системы туров

## ✅ Что уже сделано

### 1. Базовая инфраструктура
- ✅ TypeScript типы (`types.ts`)
- ✅ TourManager класс с навигацией и сохранением прогресса
- ✅ Кастомные стили для Driver.js (`tour-theme.css`)
- ✅ React хук `useTour` для работы с турами
- ✅ UI компоненты (TourButton, TourProgress, TourMenu)

### 2. Первый тур
- ✅ Content файл для тура по выпискам (`statements-tour.content.ts`)
- ✅ Конфигурация тура (`statements-tour.ts`)
- ✅ Маркировка элементов на странице Statements (`data-tour-id`)

## 🔧 Что нужно сделать для запуска

### Шаг 1: Установка зависимостей

Добавьте driver.js в `package.json`:

```bash
cd frontend
npm install driver.js
```

### Шаг 2: Регистрация тура в приложении

Создайте провайдер туров в `frontend/app/providers.tsx` или добавьте в существующий:

```typescript
'use client';

import { useEffect } from 'react';
import { useIntlayer } from 'next-intlayer';
import { useRegisterTours } from './hooks/useTour';
import { createStatementsTour } from './tours/statements-tour';

export function TourProvider({ children }: { children: React.ReactNode }) {
  // Загрузка переводов
  const tourTexts = useIntlayer('statements-tour');
  
  // Создание и регистрация тура
  useEffect(() => {
    const statementsTour = createStatementsTour(tourTexts);
    const { tourManager } = useTour();
    tourManager.registerTour(statementsTour);
  }, [tourTexts]);

  return <>{children}</>;
}
```

Затем оберните приложение в провайдер в `layout.tsx`:

```typescript
import { TourProvider } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <TourProvider>
          {children}
        </TourProvider>
      </body>
    </html>
  );
}
```

### Шаг 3: Добавление кнопки запуска тура

На странице `/statements/page.tsx` добавьте кнопку:

```typescript
import { TourButton } from '@/app/tours';

export default function StatementsPage() {
  return (
    <div>
      {/* В заголовке страницы */}
      <div className="flex justify-between items-center">
        <h1>Банковские выписки</h1>
        <TourButton 
          tourId="statements-tour" 
          label="Показать тур"
          variant="outlined"
          size="small"
        />
      </div>
      
      {/* Остальной контент */}
    </div>
  );
}
```

Или добавьте в меню навигации (`Navigation.tsx`):

```typescript
import { TourMenu } from '@/app/tours';

export function Navigation() {
  return (
    <nav>
      {/* ... другие элементы */}
      <TourMenu />
    </nav>
  );
}
```

### Шаг 4: Пересборка Intlayer

После добавления content файлов пересоберите Intlayer:

```bash
cd frontend
npm run prebuild
```

### Шаг 5: Проверка

1. Запустите приложение:
```bash
npm run dev
```

2. Перейдите на `/statements`
3. Найдите кнопку "Показать тур" или откройте меню туров
4. Запустите тур

## 🎨 Настройка стилей

Стили уже подключены через `globals.css`. Если нужны изменения:

1. Откройте `/app/tours/tour-theme.css`
2. Измените CSS переменные или классы
3. Стили применятся автоматически

## 📱 Добавление новых туров

### 1. Создайте content файл

```typescript
// app/tours/my-page-tour.content.ts
import { t, type Dictionary } from 'intlayer';

const content = {
  key: 'my-page-tour',
  content: {
    steps: {
      step1: {
        title: t({
          ru: 'Заголовок',
          en: 'Title',
          kk: 'Тақырып',
        }),
        description: t({
          ru: 'Описание',
          en: 'Description',
          kk: 'Сипаттама',
        }),
      },
      // ...другие шаги
    },
  },
} satisfies Dictionary;

export default content;
```

### 2. Создайте конфигурацию тура

```typescript
// app/tours/my-page-tour.ts
import type { TourConfig } from './types';

export function createMyPageTour(texts: any): TourConfig {
  const { steps } = texts;
  
  return {
    id: 'my-page-tour',
    name: 'Тур по моей странице',
    description: 'Описание тура',
    page: '/my-page',
    steps: [
      {
        selector: '[data-tour-id="element-1"]',
        title: steps.step1.title.value,
        description: steps.step1.description.value,
        side: 'bottom',
      },
      // ...другие шаги
    ],
  };
}
```

### 3. Экспортируйте в index.ts

```typescript
// app/tours/index.ts
export * from './my-page-tour';
```

### 4. Разметьте элементы на странице

```tsx
<button data-tour-id="element-1">Кнопка</button>
<div data-tour-id="element-2">Контент</div>
```

### 5. Зарегистрируйте тур

```typescript
const myPageTexts = useIntlayer('my-page-tour');
const myPageTour = createMyPageTour(myPageTexts);
tourManager.registerTour(myPageTour);
```

## 🚀 Автоматический запуск для новых пользователей

```typescript
import { useAutoTour } from '@/app/hooks/useTour';

function MyPage() {
  const { user } = useAuth();
  
  // Автоматически запускать тур для новых пользователей
  useAutoTour('statements-tour', {
    condition: user && !user.hasSeenTour,
    delay: 1000,
  });
  
  return <div>...</div>;
}
```

## 📊 Аналитика

Система автоматически логирует события в консоль (в development режиме).

Для интеграции с вашей системой аналитики добавьте в `TourManager.ts`:

```typescript
private trackEvent(event: string, data: any): void {
  // Ваша система аналитики
  window.gtag?.('event', event, data);
  
  // Или
  window.analytics?.track(event, data);
}
```

## 🔍 Отладка

### Проверка регистрации тура

```typescript
const { tourManager } = useTour();
console.log(tourManager.getAllTours());
```

### Проверка элементов

```typescript
// В консоли браузера
document.querySelector('[data-tour-id="upload-button"]')
```

### Очистка данных туров

```typescript
const { tourManager } = useTour();
tourManager.clearAllData();
```

## ⚠️ Известные проблемы и решения

### Элементы не находятся

**Проблема**: Селектор не находит элемент

**Решение**:
1. Убедитесь что `data-tour-id` добавлен правильно
2. Проверьте что элемент виден (не `display: none`)
3. Используйте уникальные идентификаторы

### Тур не запускается

**Проблема**: Кнопка не реагирует

**Решение**:
1. Проверьте что тур зарегистрирован
2. Убедитесь что driver.js установлен
3. Проверьте консоль на ошибки

### Стили не применяются

**Проблема**: Попап выглядит не так

**Решение**:
1. Проверьте что `tour-theme.css` импортирован в `globals.css`
2. Очистите кеш браузера
3. Проверьте CSS переменные в `:root`

## 📋 Чеклист запуска

- [ ] Установлен driver.js
- [ ] Создан TourProvider
- [ ] Добавлен TourProvider в layout
- [ ] Пересобран Intlayer (`npm run prebuild`)
- [ ] Добавлена кнопка запуска тура
- [ ] Проверена работа на localhost
- [ ] Протестированы все шаги тура
- [ ] Проверена адаптивность на мобильных

## 🎯 Следующие шаги

1. Добавить туры для других страниц (см. план в `docs/comprehensive-tour-plan.md`)
2. Создать полный тур по всему приложению
3. Добавить контекстные мини-туры
4. Настроить аналитику
5. Добавить A/B тестирование текстов

## 📚 Полезные ссылки

- [README по турам](./README.md)
- [План реализации](../../docs/comprehensive-tour-plan.md)
- [Driver.js Docs](https://driverjs.com/)
- [Intlayer Docs](https://intlayer.org/)
