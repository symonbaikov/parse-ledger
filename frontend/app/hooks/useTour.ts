/**
 * React хук для работы с турами
 */

'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getTourManager } from '../tours/TourManager';
import type { TourConfig } from '../tours/types';

export function useTour(tourId?: string) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Инициализация TourManager с навигацией
  const tourManager = getTourManager({
    onNavigate: async (url: string) => {
      router.push(url);
      // Даем время на переход
      await new Promise(resolve => setTimeout(resolve, 300));
    },
  });

  // Проверка статуса при монтировании
  useEffect(() => {
    if (tourId) {
      setIsCompleted(tourManager.isTourCompleted(tourId));
    }
  }, [tourId, tourManager]);

  // Запуск тура
  const startTour = useCallback(
    (customTourId?: string) => {
      const id = customTourId || tourId;
      if (!id) {
        console.error('Tour ID is required');
        return;
      }

      tourManager.startTour(id);
      setIsActive(true);
    },
    [tourId, tourManager],
  );

  // Продолжение тура
  const resumeTour = useCallback(() => {
    const resumed = tourManager.resumeTour();
    if (resumed) {
      setIsActive(true);
    }
    return resumed;
  }, [tourManager]);

  // Остановка тура
  const stopTour = useCallback(() => {
    tourManager.stopTour();
    setIsActive(false);
    setCurrentStep(null);
  }, [tourManager]);

  // Следующий шаг
  const nextStep = useCallback(() => {
    tourManager.nextStep();
  }, [tourManager]);

  // Предыдущий шаг
  const previousStep = useCallback(() => {
    tourManager.previousStep();
  }, [tourManager]);

  // Сброс прогресса тура
  const resetTour = useCallback(
    (customTourId?: string) => {
      const id = customTourId || tourId;
      if (id) {
        tourManager.resetTour(id);
        setIsCompleted(false);
      }
    },
    [tourId, tourManager],
  );

  // Обновление состояния активности
  useEffect(() => {
    const interval = setInterval(() => {
      const active = tourManager.isActive();
      const step = tourManager.getActiveStepIndex();

      setIsActive(active);
      setCurrentStep(step);

      if (!active && isActive) {
        // Тур только что завершился
        if (tourId) {
          setIsCompleted(tourManager.isTourCompleted(tourId));
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [tourManager, tourId, isActive]);

  return {
    startTour,
    resumeTour,
    stopTour,
    nextStep,
    previousStep,
    resetTour,
    isActive,
    currentStep,
    isCompleted,
    tourManager,
  };
}

/**
 * Хук для автоматического запуска тура для новых пользователей
 */
export function useAutoTour(
  tourId: string,
  options?: {
    /** Условие для запуска тура */
    condition?: boolean;
    /** Задержка перед запуском (мс) */
    delay?: number;
  },
) {
  const { startTour, isCompleted } = useTour(tourId);
  const { condition = true, delay = 1000 } = options || {};

  useEffect(() => {
    if (!isCompleted && condition) {
      const timer = setTimeout(() => {
        startTour();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isCompleted, condition, delay, startTour]);
}

/**
 * Хук для регистрации туров
 */
export function useRegisterTours(tours: TourConfig[]) {
  const tourManager = getTourManager();

  useEffect(() => {
    tourManager.registerTours(tours);
  }, [tours, tourManager]);
}

/**
 * Хук для получения списка всех туров
 */
export function useAvailableTours() {
  const tourManager = getTourManager();
  const [tours, setTours] = useState<TourConfig[]>([]);

  useEffect(() => {
    setTours(tourManager.getAllTours());
  }, [tourManager]);

  return tours;
}
