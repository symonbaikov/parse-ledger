'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Breadcrumbs from './Breadcrumbs';

const LABELS: Record<string, string> = {
  '': 'Главная',
  'statements': 'Выписки',
  'upload': 'Загрузка',
  'data-entry': 'Ввод данных',
  'storage': 'Хранилище',
  'reports': 'Отчёты',
  'categories': 'Категории',
  'integrations': 'Интеграции',
  'integrations/google-sheets': 'Google Sheets',
  'custom-tables': 'Таблицы',
  'custom-tables/import': 'Импорт',
  'custom-tables/import/google-sheets': 'Google Sheets',
  'settings': 'Настройки',
  'settings/profile': 'Профиль',
  'settings/telegram': 'Telegram',
  'google-sheets': 'Google Sheets',
  'google-sheets/callback': 'Callback',
  'admin': 'Админка',
};

const HIDDEN_PATHS = new Set<string>(['/login', '/register', '/auth', '/auth/callback']);

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function GlobalBreadcrumbs() {
  const pathname = usePathname() || '/';

  const items = useMemo(() => {
    if (HIDDEN_PATHS.has(pathname)) return [];
    if (pathname === '/') return [];

    const segments = pathname.split('/').filter(Boolean);
    const crumbs = segments.map((_, idx) => {
      const slug = segments.slice(0, idx + 1).join('/');
      const label = LABELS[slug] || capitalize(segments[idx]);
      const href = idx === segments.length - 1 ? undefined : `/${slug}`;
      return { label, href };
    });

    return [{ label: LABELS[''], href: '/' }, ...crumbs];
  }, [pathname]);

  if (!items.length) return null;

  return (
    <div className="bg-white/70 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <Breadcrumbs items={items} />
      </div>
    </div>
  );
}
