# Tours System

Система интерактивных туров для FinFlow на основе Driver.js с поддержкой трех языков через Intlayer.

## Структура

```
frontend/app/tours/
├── types.ts                      # TypeScript типы и интерфейсы
├── TourManager.ts               # Менеджер туров с навигацией и сохранением
├── tour-theme.css               # Кастомные стили для Driver.js
├── index.ts                     # Экспорт всех туров
├── statements-tour.ts           # Тур по странице выписок
├── statements-tour.content.ts   # Переводы для тура выписок
├── upload-tour.ts               # Тур загрузки файлов
├── upload-tour.content.ts       # Переводы для тура загрузки
├── storage-tour.ts              # Тур хранилища файлов
├── storage-tour.content.ts      # Переводы для тура хранилища
├── custom-tables-tour.ts        # Тур кастомных таблиц
├── custom-tables-tour.content.ts # Переводы для тура таблиц
├── reports-tour.ts              # Тур отчётов
├── reports-tour.content.ts      # Переводы для тура отчётов
├── categories-tour.ts           # Тур категорий
├── categories-tour.content.ts   # Переводы для тура категорий
├── data-entry-tour.ts           # Тур ввода данных
├── data-entry-tour.content.ts   # Переводы для тура ввода
├── integrations-tour.ts         # Тур интеграций
├── integrations-tour.content.ts # Переводы для тура интеграций
├── settings-tour.ts             # Тур настроек
├── settings-tour.content.ts     # Переводы для тура настроек
└── components/
    ├── TourButton.tsx           # Кнопка запуска тура
    ├── TourProgress.tsx         # Индикатор прогресса
    └── TourMenu.tsx             # Меню выбора туров
```

## Реализованные туры

### ✅ Statements Tour
- Страница: `/statements`
- Шаги: приветствие, кнопка загрузки, поиск, фильтры, таблица, статусы, действия, пагинация

### ✅ Upload Tour
- Страница: `/upload`
- Шаги: приветствие, drag-drop зона, список файлов, дубликаты, кнопка загрузки, Google Sheets

### ✅ Storage Tour
- Страница: `/storage`
- Шаги: приветствие, поиск, фильтры, таблица файлов, действия, категории, права доступа

### ✅ Custom Tables Tour
- Страница: `/custom-tables`
- Шаги: приветствие, создание таблицы, список таблиц, поиск

### ✅ Reports Tour
- Страница: `/reports`
- Шаги: приветствие, выбор периода, график доходов/расходов, разбивка по категориям, сравнение банков, экспорт, фильтры

### ✅ Categories Tour
- Страница: `/categories`
- Шаги: приветствие, создание категории, список, выбор цвета, выбор иконки

### ✅ Data Entry Tour
- Страница: `/data-entry`
- Шаги: приветствие, фильтр выписок, таблица транзакций, редактирование, категории, массовые действия

### ✅ Integrations Tour
- Страница: `/integrations`
- Шаги: приветствие, Google Sheets, API ключи, вебхуки, статус подключений

### ✅ Settings Tour
- Страница: `/settings`
- Шаги: приветствие, профиль, воркспейс, команда, безопасность, уведомления

## Использование

### 1. Регистрация тура

```typescript
import { useRegisterTours } from '@/app/hooks/useTour';
import { getStatementsTour } from '@/app/tours';

function App() {
  const statementsTour = getStatementsTour();
  
  useRegisterTours([statementsTour]);
  
  return <div>...</div>;
}
```

### 2. Запуск тура

```typescript
import { useTour } from '@/app/hooks/useTour';

function MyPage() {
  const { startTour, isActive, isCompleted } = useTour('statements-tour');
  
  return (
    <button onClick={() => startTour()}>
      {isCompleted ? 'Повторить тур' : 'Начать тур'}
    </button>
  );
}
```

### 3. Использование готовых компонентов

```typescript
import { TourButton, TourMenu } from '@/app/tours';

function Header() {
  return (
    <>
      <TourButton tourId="statements-tour" />
      <TourMenu />
    </>
  );
}
```

### 4. Маркировка элементов

Добавьте `data-tour-id` атрибут к элементам, которые должны быть частью тура:

```tsx
<button data-tour-id="upload-button">
  Загрузить выписку
</button>

<div data-tour-id="statements-table">
  <Table />
</div>

<input data-tour-id="search-bar" />
```

## Создание нового тура

### Шаг 1: Content файл

Создайте файл с переводами (например, `my-tour.content.ts`):

```typescript
import { t, type Dictionary } from 'intlayer';

const content = {
  key: 'my-tour',
  content: {
    name: t({
      ru: 'Мой тур',
      en: 'My Tour',
      kk: 'Менің турым',
    }),
    description: t({
      ru: 'Описание тура',
      en: 'Tour description',
      kk: 'Тур сипаттамасы',
    }),
    steps: {
      welcome: {
        title: t({
          ru: 'Добро пожаловать!',
          en: 'Welcome!',
          kk: 'Қош келдіңіз!',
        }),
        description: t({
          ru: 'Описание шага',
          en: 'Step description',
          kk: 'Қадам сипаттамасы',
        }),
      },
      // Другие шаги...
    },
  },
} satisfies Dictionary;

export default content;
```

### Шаг 2: Тур

Создайте файл с конфигурацией тура (например, `my-tour.ts`):

```typescript
import { useIntlayer } from 'next-intlayer';
import type { TourConfig } from './types';

export function getMyTour(): TourConfig {
  const { steps } = useIntlayer('my-tour');

  return {
    id: 'my-tour',
    name: 'Мой тур',
    description: 'Описание тура',
    page: '/my-page',
    steps: [
      {
        selector: 'body',
        title: steps.welcome.title.value,
        description: steps.welcome.description.value,
        side: 'center' as any,
      },
      {
        selector: '[data-tour-id="element-1"]',
        title: steps.step1.title.value,
        description: steps.step1.description.value,
        side: 'bottom',
        align: 'start',
      },
      // Другие шаги...
    ],
  };
}
```

### Шаг 3: Экспорт

Добавьте экспорт в `index.ts`:

```typescript
export * from './my-tour';
```

### Шаг 4: Использование

```typescript
import { getMyTour } from '@/app/tours';

const myTour = getMyTour();
tourManager.registerTour(myTour);
```

## API

### TourManager

```typescript
const tourManager = getTourManager({
  onNavigate: async (url: string) => {
    router.push(url);
  },
});

// Регистрация туров
tourManager.registerTour(tour);
tourManager.registerTours([tour1, tour2]);

// Запуск
tourManager.startTour('tour-id');
tourManager.resumeTour();
tourManager.stopTour();

// Управление
tourManager.nextStep();
tourManager.previousStep();

// Проверки
tourManager.isActive();
tourManager.isTourCompleted('tour-id');
tourManager.getActiveStepIndex();

// Сброс
tourManager.resetTour('tour-id');
tourManager.clearAllData();
```

### useTour Hook

```typescript
const {
  startTour,      // (tourId?: string) => void
  resumeTour,     // () => boolean
  stopTour,       // () => void
  nextStep,       // () => void
  previousStep,   // () => void
  resetTour,      // (tourId?: string) => void
  isActive,       // boolean
  currentStep,    // number | null
  isCompleted,    // boolean
  tourManager,    // TourManager
} = useTour('tour-id');
```

### useAutoTour Hook

Автоматический запуск тура для новых пользователей:

```typescript
useAutoTour('welcome-tour', {
  condition: !user.hasSeenTour,
  delay: 1000, // ms
});
```

## Конфигурация шагов

```typescript
interface TourStep {
  selector: string;           // CSS селектор
  title: string;             // Заголовок
  description: string;       // Описание
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  highlight?: boolean;
  nextButton?: string;
  prevButton?: string;
  showButtons?: boolean | string[];
  onNext?: () => void | Promise<void>;
  onPrev?: () => void | Promise<void>;
  onDestroy?: () => void;
}
```

## Стилизация

Стили находятся в `tour-theme.css` и автоматически подключаются в `globals.css`.

Кастомизация через CSS переменные:

```css
:root {
  --primary: #0a66c2;
  --card: #ffffff;
  --card-foreground: #191919;
  --border: #e0e0e0;
  /* и т.д. */
}
```

## Примеры туров

### Простой тур

```typescript
{
  id: 'simple-tour',
  name: 'Простой тур',
  description: 'Базовый тур по странице',
  page: '/page',
  steps: [
    {
      selector: '[data-tour-id="button"]',
      title: 'Это кнопка',
      description: 'Нажмите её для действия',
      side: 'bottom',
    },
  ],
}
```

### Тур с навигацией

```typescript
{
  id: 'multi-page-tour',
  name: 'Тур по нескольким страницам',
  description: 'Тур переходит между страницами',
  canNavigate: true,
  steps: [
    {
      selector: '[data-tour-id="link"]',
      title: 'Переход',
      description: 'Сейчас перейдем на другую страницу',
      onNext: async () => {
        await navigateTo('/another-page');
      },
    },
  ],
}
```

### Условный тур

```typescript
{
  id: 'conditional-tour',
  name: 'Условный тур',
  description: 'Показывается только админам',
  requiredRole: 'admin',
  autoStart: true,
  steps: [...],
}
```

## Лучшие практики

### 1. Длина туров
- **Страничный тур**: 8-15 шагов
- **Полный тур**: Разбивать на части

### 2. Тексты
- Заголовок: 3-7 слов
- Описание: 1-3 предложения
- Избегать жаргона

### 3. Селекторы
- Использовать `data-tour-id` вместо классов
- Убедиться в уникальности селекторов
- Проверять видимость элементов

### 4. Производительность
- Lazy loading туров
- Проверка видимости элементов
- Дебаунс для интерактивных элементов

### 5. Доступность
- Поддержка клавиатуры (Enter, Esc, стрелки)
- ARIA атрибуты
- Screen reader friendly

## Тестирование

```typescript
// Unit тест
describe('TourManager', () => {
  it('should start tour', () => {
    const manager = getTourManager();
    manager.registerTour(testTour);
    manager.startTour('test-tour');
    expect(manager.isActive()).toBe(true);
  });
});

// E2E тест
describe('Statements Tour', () => {
  it('should complete tour', () => {
    cy.visit('/statements');
    cy.get('[data-tour-id="upload-button"]').should('be.visible');
    // ... проход по шагам
  });
});
```

## Аналитика

Система автоматически отправляет события:

- `tour_started` - Тур запущен
- `tour_step_viewed` - Просмотрен шаг
- `tour_step_skipped` - Шаг пропущен
- `tour_completed` - Тур завершен
- `tour_abandoned` - Тур прерван
- `tour_resumed` - Тур продолжен

## Troubleshooting

### Элемент не находится

```typescript
// Проверьте селектор
document.querySelector('[data-tour-id="my-element"]')

// Убедитесь что элемент видим
getComputedStyle(element).display !== 'none'
```

### Тур не сохраняется

```typescript
// Проверьте localStorage
localStorage.getItem('finflow_tour_state')

// Очистите данные
tourManager.clearAllData()
```

### Навигация не работает

```typescript
// Убедитесь что onNavigate передан
const tourManager = getTourManager({
  onNavigate: async (url) => {
    await router.push(url);
  },
});
```

## TODO

- [ ] Реализовать туры для остальных страниц
- [ ] Добавить полный тур по всему приложению
- [ ] Реализовать контекстные туры
- [ ] Добавить A/B тестирование
- [ ] Интегрировать с системой аналитики
- [ ] Добавить видео-инструкции
- [ ] Создать админ-панель для управления турами

## Полезные ссылки

- [Driver.js Documentation](https://driverjs.com/)
- [Intlayer Documentation](https://intlayer.org/)
- [Plan документ](../../docs/comprehensive-tour-plan.md)
