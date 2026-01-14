'use client';

import { cn } from '@/app/lib/utils';
import * as React from 'react';

export type AlertVariant = 'default' | 'success' | 'error';

const variantClasses: Record<AlertVariant, string> = {
  default: 'border-gray-200 bg-white text-gray-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  error: 'border-red-200 bg-red-50 text-red-950',
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
