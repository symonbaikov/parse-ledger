'use client';

import * as React from 'react';
import { cn } from '@/app/lib/utils';

const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('h-px w-full bg-gray-100', className)} role="separator" {...props} />
));
Separator.displayName = 'Separator';

export { Separator };

