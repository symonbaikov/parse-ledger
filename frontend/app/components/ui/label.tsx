'use client';

import { cn } from '@/app/lib/utils';
import * as React from 'react';

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, htmlFor, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('text-sm font-medium text-foreground', className)}
      htmlFor={htmlFor}
      {...props}
    >
      {children}
    </label>
  ),
);
Label.displayName = 'Label';

export { Label };
