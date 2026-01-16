/**
 * Типы для системы туров
 */

import { type DriveStep, type PopoverDOM } from 'driver.js';

/**
 * Шаг тура
 */
export interface TourStep {
  /** CSS селектор элемента */
  selector: string;
  /** Если true, шаг будет пропущен, если элемент не найден в DOM */
  optional?: boolean;
  /** Заголовок шага */
  title: string;
  /** Описание шага */
  description: string;
  /** Сторона размещения попапа относительно элемента */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Выравнивание попапа */
  align?: 'start' | 'center' | 'end';
  /** Подсветить элемент */
  highlight?: boolean;
  /** Текст кнопки "Далее" */
  nextButton?: string;
  /** Текст кнопки "Назад" */
  prevButton?: string;
  /** Показывать кнопки навигации */
  showButtons?: boolean | string[];
  /** Callback при переходе к следующему шагу */
  onNext?: () => void | Promise<void>;
  /** Callback при возврате к предыдущему шагу */
  onPrev?: () => void | Promise<void>;
  /** Callback при уничтожении шага */
  onDestroy?: () => void;

  /**
   * Требовать действие пользователя для перехода к следующему шагу.
   * Например: пользователь должен кликнуть по кнопке, чтобы открыть меню.
   */
  advanceOn?: {
    /** CSS селектор элемента, по которому нужно совершить действие */
    selector: string;
    /** Событие, по которому происходит переход (по умолчанию: 'click') */
    event?: 'click';
    /** Задержка перед переходом на следующий шаг (мс) */
    delayMs?: number;
  };
}

/**
 * Конфигурация тура
 */
export interface TourConfig {
  /** Уникальный идентификатор тура */
  id: string;
  /** Название тура */
  name: string;
  /** Описание тура */
  description: string;
  /** Шаги тура */
  steps: TourStep[];
  /** URL страницы, для которой предназначен тур */
  page?: string;
  /** Может ли тур переключаться между страницами */
  canNavigate?: boolean;
  /** Автоматический старт для новых пользователей */
  autoStart?: boolean;
  /** Необходимая роль пользователя для показа тура */
  requiredRole?: 'admin' | 'member' | 'viewer';
}

/**
 * Прогресс прохождения тура
 */
export interface TourProgress {
  /** ID тура */
  tourId: string;
  /** Текущий шаг (индекс) */
  currentStep: number;
  /** Общее количество шагов */
  totalSteps: number;
  /** Тур завершен */
  completed: boolean;
  /** Дата начала (ISO string) */
  startedAt: string | Date;
  /** Дата завершения (ISO string) */
  completedAt?: string | Date;
  /** Пропущенные шаги */
  skippedSteps: number[];
}

/**
 * Состояние тура в localStorage
 */
export interface TourState {
  /** Просмотренные туры */
  completedTours: string[];
  /** Прогресс текущего тура */
  currentProgress?: TourProgress;
  /** Дата последнего взаимодействия */
  lastInteraction: string;
  /** Версия схемы данных */
  version: string;
}

/**
 * Версия тура
 */
export interface TourVersion {
  /** Версия в формате semver */
  version: string;
  /** Дата релиза */
  released: Date;
  /** Список изменений */
  changes: string[];
  /** Тур устарел */
  deprecated?: boolean;
}

/**
 * События тура для аналитики
 */
export type TourEvent =
  | 'tour_started'
  | 'tour_step_viewed'
  | 'tour_step_skipped'
  | 'tour_completed'
  | 'tour_abandoned'
  | 'tour_resumed';

/**
 * Данные события тура
 */
export interface TourEventData {
  tourId: string;
  userId?: string;
  stepIndex?: number;
  stepId?: string;
  duration?: number;
  timestamp: Date;
}

/**
 * Настройки Driver.js
 */
export interface TourDriverConfig {
  showProgress?: boolean;
  animate?: boolean;
  overlayClickNext?: boolean;
  allowClose?: boolean;
  showButtons?: string[];
  nextBtnText?: string;
  prevBtnText?: string;
  doneBtnText?: string;
  closeBtnText?: string;
  progressText?: string;
}

/**
 * Расширенный шаг для Driver.js
 */
export interface ExtendedDriveStep extends Partial<DriveStep> {
  element: string | Element;
  popover: Partial<PopoverDOM> & {
    title: string;
    description: string;
  };
}
