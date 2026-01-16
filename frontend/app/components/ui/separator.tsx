'use client';

import { cn } from '@/app/lib/utils';
import * as React from 'react';

const Separator = React.forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(
  ({ className, ...props }, ref) => (
    <hr ref={ref} className={cn('h-px w-full border-0 bg-border', className)} {...props} />
  ),
);
Separator.displayName = 'Separator';

export { Separator };
