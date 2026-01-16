'use client';

import { Check, Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

type ThemeOption = {
  key: 'light' | 'dark' | 'system';
  label: string;
  icon: React.ReactNode;
};

export function ModeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme();

  const options: ThemeOption[] = [
    { key: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { key: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { key: 'system', label: 'System', icon: <Laptop className="h-4 w-4" /> },
  ];

  const activeKey = (theme as ThemeOption['key']) || 'system';
  const activeIcon =
    activeKey === 'system'
      ? options.find(opt => opt.key === 'system')?.icon || <Laptop className="h-4 w-4" />
      : options.find(opt => opt.key === activeKey)?.icon || <Sun className="h-4 w-4" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Select theme"
          className="h-10 w-10 rounded-xl border-border bg-card text-foreground shadow-sm"
        >
          {activeKey === 'system' ? (
            activeIcon
          ) : resolvedTheme === 'dark' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 rounded-2xl border border-border bg-card p-1.5 text-foreground shadow-lg"
      >
        {options.map(option => (
          <DropdownMenuItem
            key={option.key}
            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm"
            onClick={() => setTheme(option.key)}
          >
            <span className="flex items-center gap-2">
              {option.icon}
              {option.label}
            </span>
            {activeKey === option.key && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
