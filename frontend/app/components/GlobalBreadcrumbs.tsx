'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Breadcrumbs from './Breadcrumbs';
import { useIntlayer } from 'next-intlayer';

const HIDDEN_PATHS = new Set<string>(['/login', '/register', '/auth', '/auth/callback']);

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const resolveBreadcrumbHref = (slug: string) => {
  if (slug === 'settings') return '/settings/profile';
  return `/${slug}`;
};

export default function GlobalBreadcrumbs() {
  const pathname = usePathname() || '/';
  const { labels } = useIntlayer('breadcrumbs') as { labels: Record<string, string> };

  const items = useMemo(() => {
    if (HIDDEN_PATHS.has(pathname)) return [];
    if (pathname === '/') return [];

    const segments = pathname.split('/').filter(Boolean);
    const crumbs = segments.map((_, idx) => {
      const slug = segments.slice(0, idx + 1).join('/');
      const label = labels?.[slug] || capitalize(segments[idx]);
      const href = idx === segments.length - 1 ? undefined : resolveBreadcrumbHref(slug);
      return { label, href };
    });

    return [{ label: labels?.[''] || 'Home', href: '/' }, ...crumbs];
  }, [labels, pathname]);

  if (!items.length) return null;

  return (
    <div data-global-breadcrumbs className="bg-white/70 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <Breadcrumbs items={items} />
      </div>
    </div>
  );
}
