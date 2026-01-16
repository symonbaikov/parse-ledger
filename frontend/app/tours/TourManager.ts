/**
 * Менеджер туров - управляет запуском, навигацией и состоянием туров
 */

import { type DriveStep, type Driver, driver } from 'driver.js';
import {
  type TourConfig,
  type TourDriverConfig,
  type TourProgress,
  type TourState,
  type TourStep,
} from './types';

const TOUR_STORAGE_KEY = 'finflow_tour_state';
const TOUR_STATE_VERSION = '1.0.0';

function getPreferredLang(): string {
  if (typeof document !== 'undefined') {
    const lang = document.documentElement?.lang;
    if (lang) return lang;
  }
  return 'ru';
}

function resolveText(input: unknown): string {
  if (typeof input === 'string') return input;
  if (input == null) return '';

  if (typeof input === 'object') {
    const record = input as Record<string, unknown>;

    // react-intlayer wraps primitives into a Proxy of a ReactElement.
    // The Proxy exposes `.value` via a getter trap, so `'value' in record` is false.
    const maybeValue = (record as any).value;
    if (typeof maybeValue !== 'undefined') {
      return resolveText(maybeValue);
    }

    // Dictionary JSON shape: { nodeType: 'translation', translation: { ru: ..., en: ... } }
    if (
      record.nodeType === 'translation' &&
      typeof record.translation === 'object' &&
      record.translation
    ) {
      const lang = getPreferredLang();
      const translation = record.translation as Record<string, unknown>;
      return resolveText(translation[lang] ?? translation.ru ?? Object.values(translation)[0]);
    }

    // Plain locale map shape: { ru: '...', en: '...' }
    if ('ru' in record || 'en' in record || 'kk' in record) {
      const lang = getPreferredLang();
      return resolveText(record[lang] ?? record.ru ?? record.en ?? record.kk);
    }
  }

  return String(input);
}

export class TourManager {
  private driverInstance!: Driver;
  private currentTour: TourConfig | null = null;
  private registeredTours: Map<string, TourConfig> = new Map();
  private onNavigate?: (url: string) => Promise<void>;
  private isDestroying = false;
  private lastStepIndex = -1;
  private actualStepsCount = 0;

  constructor(options?: {
    onNavigate?: (url: string) => Promise<void>;
  }) {
    this.onNavigate = options?.onNavigate;

    // Инициализация Driver.js с базовыми настройками
    this.resetDriver();
  }

  private resetDriver(overrides?: TourDriverConfig) {
    if (this.driverInstance?.isActive()) {
      this.driverInstance.destroy();
    }

    this.driverInstance = driver({
      showProgress: overrides?.showProgress ?? true,
      animate: overrides?.animate ?? true,
      allowClose: overrides?.allowClose ?? true,
      showButtons: overrides?.showButtons as any,
      popoverClass: 'tour-popover',
      progressText: overrides?.progressText ?? '{{current}} из {{total}}',
      nextBtnText: overrides?.nextBtnText ?? 'Далее',
      prevBtnText: overrides?.prevBtnText ?? 'Назад',
      doneBtnText: overrides?.doneBtnText ?? 'Готово',
      onHighlighted: () => {
        // Сохраняем текущий индекс при каждом шаге
        this.lastStepIndex = this.driverInstance.getActiveIndex() ?? -1;
      },
      onDestroyed: () => {
        this.handleTourDestroyed();
      },
    });
  }

  /**
   * Регистрация тура
   */
  registerTour(tour: TourConfig): void {
    this.registeredTours.set(tour.id, tour);
  }

  /**
   * Регистрация нескольких туров
   */
  registerTours(tours: TourConfig[]): void {
    tours.forEach(tour => this.registerTour(tour));
  }

  /**
   * Получить зарегистрированный тур
   */
  getTour(tourId: string): TourConfig | undefined {
    return this.registeredTours.get(tourId);
  }

  /**
   * Получить все зарегистрированные туры
   */
  getAllTours(): TourConfig[] {
    return Array.from(this.registeredTours.values());
  }

  /**
   * Запустить тур
   */
  async startTour(
    tourId: string,
    startFromStep = 0,
    driverConfig?: TourDriverConfig,
  ): Promise<void> {
    // Проверяем, не запущен ли уже другой тур
    if (this.driverInstance.isActive()) {
      console.warn('Another tour is already active');
      return;
    }

    const tour = this.registeredTours.get(tourId);

    if (!tour) {
      console.error(`Tour with id "${tourId}" not found`);
      return;
    }

    // Сбрасываем флаги перед новым туром
    this.isDestroying = false;
    this.lastStepIndex = -1;
    this.currentTour = tour;

    if (driverConfig) {
      this.resetDriver(driverConfig);
    }

    // Ждем немного чтобы DOM успел загрузиться
    await new Promise(resolve => setTimeout(resolve, 500));

    // Преобразование шагов в формат Driver.js с фильтрацией
    const driveSteps = this.convertToDriverSteps(tour.steps);

    if (driveSteps.length === 0) {
      console.warn('No valid steps found for tour:', tourId);
      this.currentTour = null;
      return;
    }

    // Сохраняем реальное количество шагов
    this.actualStepsCount = driveSteps.length;

    // Сохранение начального прогресса
    this.saveProgress({
      tourId: tour.id,
      currentStep: startFromStep,
      totalSteps: this.actualStepsCount,
      completed: false,
      startedAt: new Date().toISOString(),
      skippedSteps: [],
    });

    try {
      // Запуск тура
      this.driverInstance.setSteps(driveSteps);
      this.driverInstance.drive(startFromStep);

      // Аналитика
      this.trackEvent('tour_started', { tourId: tour.id });
    } catch (error) {
      console.error('Failed to start tour:', error);
      this.currentTour = null;
    }
  }

  /**
   * Продолжить тур с сохраненного места
   */
  resumeTour(): boolean {
    const state = this.loadState();

    if (!state?.currentProgress || state.currentProgress.completed) {
      return false;
    }

    const { tourId, currentStep } = state.currentProgress;
    this.startTour(tourId, currentStep);
    this.trackEvent('tour_resumed', { tourId });

    return true;
  }

  /**
   * Остановить текущий тур
   */
  stopTour(): void {
    if (this.currentTour) {
      this.trackEvent('tour_abandoned', {
        tourId: this.currentTour.id,
        stepIndex: this.lastStepIndex,
      });
    }

    try {
      if (this.driverInstance.isActive()) {
        this.driverInstance.destroy();
      }
    } catch (error) {
      console.error('Error destroying driver:', error);
    }

    this.currentTour = null;
    this.isDestroying = false;
    this.lastStepIndex = -1;
    this.actualStepsCount = 0;
  }

  /**
   * Следующий шаг
   */
  nextStep(): void {
    this.driverInstance.moveNext();
  }

  /**
   * Предыдущий шаг
   */
  previousStep(): void {
    this.driverInstance.movePrevious();
  }

  /**
   * Проверка, активен ли тур
   */
  isActive(): boolean {
    return this.driverInstance.isActive();
  }

  /**
   * Получить активный индекс шага
   */
  getActiveStepIndex(): number | null {
    const index = this.driverInstance.getActiveIndex();
    return index !== undefined ? index : null;
  }

  /**
   * Проверить, завершен ли тур
   */
  isTourCompleted(tourId: string): boolean {
    const state = this.loadState();
    return state?.completedTours.includes(tourId) ?? false;
  }

  /**
   * Сбросить прогресс тура
   */
  resetTour(tourId: string): void {
    const state = this.loadState();
    if (state) {
      state.completedTours = state.completedTours.filter(id => id !== tourId);
      if (state.currentProgress?.tourId === tourId) {
        state.currentProgress = undefined;
      }
      this.saveState(state);
    }
  }

  /**
   * Преобразование шагов тура в формат Driver.js
   */
  private convertToDriverSteps(steps: TourStep[]): DriveStep[] {
    return steps.map((step, index) => {
      let detachAdvanceListener: (() => void) | null = null;

      const advance = () => {
        // Сохранение прогресса
        this.updateProgress(index + 1);

        // Трекинг
        this.trackEvent('tour_step_viewed', {
          tourId: this.currentTour?.id ?? '',
          stepIndex: index + 1,
        });

        this.driverInstance.moveNext();
      };

      return {
        // Важно: передаем selector строкой, чтобы шаги могли подсвечивать динамические элементы
        // (например, элементы выпадающего меню, которые появляются после клика).
        element: step.selector,
        onHighlighted: () => {
          // Надежнее, чем driver.getActiveIndex(): иногда индекс не успевает обновиться
          // до вызова onHighlighted, из-за чего тур не засчитывается.
          this.lastStepIndex = index;

          if (step.optional) {
            const maybeElement = document.querySelector(step.selector);
            if (!maybeElement) {
              window.setTimeout(() => advance(), 0);
              return;
            }
          }

          if (!step.advanceOn) return;

          // Поддерживаем только 'click' сейчас
          const eventName = step.advanceOn.event ?? 'click';
          if (eventName !== 'click') return;

          const target = document.querySelector(step.advanceOn.selector);
          if (!target) {
            console.warn(
              `advanceOn target not found for step ${index + 1}: ${step.advanceOn.selector}`,
            );
            return;
          }

          const onClick = () => {
            detachAdvanceListener?.();
            detachAdvanceListener = null;

            const delay = step.advanceOn?.delayMs ?? 0;
            if (delay > 0) {
              window.setTimeout(() => advance(), delay);
            } else {
              advance();
            }
          };

          target.addEventListener('click', onClick, { once: true } as AddEventListenerOptions);
          detachAdvanceListener = () => {
            try {
              target.removeEventListener('click', onClick as any);
            } catch {
              // noop
            }
          };
        },
        onDeselected: () => {
          if (detachAdvanceListener) {
            detachAdvanceListener();
            detachAdvanceListener = null;
          }
          if (step.onDestroy) {
            step.onDestroy();
          }
        },
        popover: {
          title: resolveText(step.title),
          description: resolveText(step.description),
          side: step.side ?? 'bottom',
          align: step.align ?? 'start',
          ...(Array.isArray(step.showButtons) ? { showButtons: step.showButtons } : {}),
          onNextClick: async () => {
            if (step.onNext) {
              await step.onNext();
            }

            advance();
          },
          onPrevClick: async () => {
            if (step.onPrev) {
              await step.onPrev();
            }
            this.driverInstance.movePrevious();
          },
        },
      } as DriveStep;
    });
  }

  /**
   * Проверка видимости элемента
   */
  private isElementVisible(element: Element): boolean {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }

    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  /**
   * Обработчик завершения/закрытия тура
   */
  private handleTourDestroyed(): void {
    if (!this.currentTour || this.isDestroying) return;

    this.isDestroying = true;
    const tourId = this.currentTour.id;
    const state = this.loadState();
    const progressIndex =
      state?.currentProgress?.tourId === tourId ? state.currentProgress.currentStep : undefined;
    const completedByProgress =
      typeof progressIndex === 'number' &&
      this.actualStepsCount > 0 &&
      progressIndex >= this.actualStepsCount - 1;

    console.log('[TourManager] Tour destroyed:', {
      tourId,
      lastStepIndex: this.lastStepIndex,
      actualStepsCount: this.actualStepsCount,
      isLastStep: this.lastStepIndex === this.actualStepsCount - 1,
      progressIndex,
    });

    // Если были на последнем шаге - тур завершен
    // Сравниваем с actualStepsCount, а не с оригинальным количеством шагов
    if (
      (this.lastStepIndex >= this.actualStepsCount - 1 || completedByProgress) &&
      this.actualStepsCount > 0
    ) {
      this.markTourCompleted(tourId);
      this.trackEvent('tour_completed', { tourId });
    }

    this.currentTour = null;
    this.isDestroying = false;
    this.lastStepIndex = -1;
    this.actualStepsCount = 0;
  }

  /**
   * Отметить тур как завершенный
   */
  private markTourCompleted(tourId: string): void {
    const state = this.loadState() ?? this.getDefaultState();

    if (!state.completedTours.includes(tourId)) {
      state.completedTours.push(tourId);
    }

    if (state.currentProgress?.tourId === tourId) {
      state.currentProgress.completed = true;
      state.currentProgress.completedAt = new Date().toISOString();
    }

    this.saveState(state);

    // Логируем для отладки
    console.log('[TourManager] Tour completed:', tourId);
    console.log('[TourManager] Completed tours:', state.completedTours);
  }

  /**
   * Обновить прогресс тура
   */
  private updateProgress(stepIndex: number): void {
    const state = this.loadState();

    if (state?.currentProgress && this.currentTour) {
      state.currentProgress.currentStep = stepIndex;
      this.saveState(state);
    }
  }

  /**
   * Сохранить прогресс тура
   */
  private saveProgress(progress: TourProgress): void {
    const state = this.loadState() ?? this.getDefaultState();
    // Преобразуем Date в ISO string для правильной сериализации
    const serializedProgress = {
      ...progress,
      startedAt:
        progress.startedAt instanceof Date ? progress.startedAt.toISOString() : progress.startedAt,
      completedAt:
        progress.completedAt instanceof Date
          ? progress.completedAt.toISOString()
          : progress.completedAt,
    };
    state.currentProgress = serializedProgress as any;
    this.saveState(state);
  }

  /**
   * Загрузить состояние из localStorage
   */
  private loadState(): TourState | null {
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!stored) return null;

      const state = JSON.parse(stored) as TourState;

      // Проверка версии
      if (state.version !== TOUR_STATE_VERSION) {
        console.warn('Tour state version mismatch, resetting');
        return null;
      }

      return state;
    } catch (error) {
      console.error('Failed to load tour state:', error);
      return null;
    }
  }

  /**
   * Сохранить состояние в localStorage
   */
  private saveState(state: TourState): void {
    try {
      state.lastInteraction = new Date().toISOString();
      localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save tour state:', error);
    }
  }

  /**
   * Получить состояние по умолчанию
   */
  private getDefaultState(): TourState {
    return {
      completedTours: [],
      lastInteraction: new Date().toISOString(),
      version: TOUR_STATE_VERSION,
    };
  }

  /**
   * Отправка события аналитики
   */
  private trackEvent(event: string, data: Partial<{ tourId: string; stepIndex?: number }>): void {
    // Интеграция с системой аналитики
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }

    // Можно добавить console.log для разработки
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Tour Analytics] ${event}:`, data);
    }
  }

  /**
   * Очистить все данные туров
   */
  clearAllData(): void {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  }
}

// Singleton экземпляр
let tourManagerInstance: TourManager | null = null;

/**
 * Получить глобальный экземпляр TourManager
 */
export function getTourManager(options?: {
  onNavigate?: (url: string) => Promise<void>;
}): TourManager {
  if (!tourManagerInstance) {
    tourManagerInstance = new TourManager(options);
  }
  return tourManagerInstance;
}
