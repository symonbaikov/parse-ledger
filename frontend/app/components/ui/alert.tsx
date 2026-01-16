'use client';

import { cn } from '@/app/lib/utils';
import * as React from 'react';

export type AlertVariant = 'default' | 'success' | 'error';

const variantClasses: Record<AlertVariant, string> = {
  default: 'border-border bg-card text-foreground',
  success:
    'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100',
  error:
    'border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-900/50 dark:text-red-100',
};

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: AlertVariant }
>(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn('rounded-2xl border px-4 py-3 text-sm', variantClasses[variant], className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

export { Alert };
