/**
 * Компонент для автоматического запуска туров при первом посещении страницы
 */

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getTourManager } from '../TourManager';

export function TourAutoStarter() {
  const pathname = usePathname();
  const hasTriggeredRef = useRef<Set<string>>(new Set());
  const [isReady, setIsReady] = useState(false);

  // Ждем регистрации всех туров (они регистрируются в TourMenu)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // Предотвращаем повторный запуск для этой страницы
    if (hasTriggeredRef.current.has(pathname)) return;

    const tourManager = getTourManager();
    const allTours = tourManager.getAllTours();

    // Если туры еще не зарегистрированы, ждем
    if (allTours.length === 0) return;

    // Находим тур для текущей страницы
    const tourForCurrentPage = allTours.find(tour => {
      if (!tour.page) return false;
      return pathname.startsWith(tour.page);
    });

    // Если нашли тур и он еще не пройден - запускаем
    if (tourForCurrentPage && !tourManager.isTourCompleted(tourForCurrentPage.id)) {
      // Проверяем, не запущен ли уже тур
      if (tourManager.isActive()) {
        console.log('Tour already active, skipping auto-start');
        return;
      }

      hasTriggeredRef.current.add(pathname);

      // Увеличенная задержка для надежной загрузки DOM элементов
      const timer = setTimeout(() => {
        // Еще раз проверяем перед запуском
        if (!tourManager.isActive()) {
          tourManager.startTour(tourForCurrentPage.id);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [pathname, isReady]);

  return null;
}
