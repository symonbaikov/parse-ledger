/**
 * Компонент для автоматического запуска туров при первом посещении страницы
 */

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { getTourManager } from '../TourManager';

export function TourAutoStarter() {
  const pathname = usePathname();
  const hasTriggeredRef = useRef<Set<string>>(new Set());
  const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

  const isOnCooldown = (tourId: string) => {
    try {
      const raw = localStorage.getItem(`finflow_tour_last_shown:${tourId}`);
      if (!raw) return false;
      const timestamp = Number(raw);
      if (Number.isNaN(timestamp)) return false;
      return Date.now() - timestamp < COOLDOWN_MS;
    } catch {
      return false;
    }
  };

  const markShown = (tourId: string) => {
    try {
      localStorage.setItem(`finflow_tour_last_shown:${tourId}`, Date.now().toString());
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // Предотвращаем повторный запуск для этой страницы
    if (hasTriggeredRef.current.has(pathname)) return;

    const tourManager = getTourManager();
    let cancelled = false;

    const tryStart = (attemptsLeft: number) => {
      if (cancelled) return;
      if (hasTriggeredRef.current.has(pathname)) return;

      const allTours = tourManager.getAllTours();

      // Если туры еще не зарегистрированы, быстро ретраим на следующих кадрах.
      if (allTours.length === 0) {
        if (attemptsLeft > 0) {
          window.requestAnimationFrame(() => tryStart(attemptsLeft - 1));
        }
        return;
      }

      const tourForCurrentPage = allTours.find(tour => {
        if (!tour.page) return false;
        return pathname.startsWith(tour.page);
      });

      if (!tourForCurrentPage) {
        // Нет тура для текущей страницы.
        hasTriggeredRef.current.add(pathname);
        return;
      }

      if (
        tourManager.isTourCompleted(tourForCurrentPage.id) ||
        isOnCooldown(tourForCurrentPage.id)
      ) {
        hasTriggeredRef.current.add(pathname);
        return;
      }

      if (tourManager.isActive()) {
        return;
      }

      // Стартуем без искусственных задержек (на ближайшем кадре — чтобы DOM успел отрисоваться).
      hasTriggeredRef.current.add(pathname);
      window.requestAnimationFrame(() => {
        if (cancelled) return;
        if (!tourManager.isActive()) {
          markShown(tourForCurrentPage.id);
          tourManager.startTour(tourForCurrentPage.id);
        }
      });
    };

    // ~1 сек ретраев (60 кадров) на случай, если TourMenu еще не успел зарегистрировать туры.
    tryStart(60);

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
