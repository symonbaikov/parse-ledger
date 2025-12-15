'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="mb-4 flex items-center text-sm text-gray-600" aria-label="Breadcrumb">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={item.label} className="flex items-center">
            {item.href && !isLast ? (
              <Link href={item.href} className="text-primary hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />}
          </div>
        );
      })}
    </nav>
  );
}
