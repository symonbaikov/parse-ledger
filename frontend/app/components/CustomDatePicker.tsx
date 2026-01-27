'use client';

import { format } from 'date-fns';
import { enUS, kk, ru } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { useLocale } from 'next-intlayer';
import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

interface CustomDatePickerProps {
  value?: string | null;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
}

const resolveDateFnsLocale = (locale: string) => {
  if (locale === 'ru') return ru;
  if (locale === 'kk') return kk;
  return enUS;
};

export default function CustomDatePicker({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  helperText,
}: CustomDatePickerProps) {
  const { locale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dateFnsLocale = resolveDateFnsLocale(locale);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (day: Date | undefined) => {
    if (day) {
      onChange(format(day, 'yyyy-MM-dd'));
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className="relative" style={{ zIndex: isOpen ? 100 : 'auto' }} ref={containerRef}>
      {label && <span className="text-xs text-gray-500 block mb-1 font-medium ml-1">{label}</span>}
      <button
        type="button"
        className={`w-full rounded-lg border bg-white px-3 py-[8.5px] text-sm flex items-center justify-between transition-colors ${
          isOpen ? 'border-primary ring-1 ring-primary' : 'border-gray-300 hover:border-gray-400'
        }`} // Adjusted border colors to match MUI text field default look slightly better or stay consistent with DataEntry
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value
            ? format(new Date(value), 'd MMMM yyyy', {
                locale: dateFnsLocale,
              })
            : placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 text-gray-500" />
      </button>

      {value && (
        <button
          type="button"
          onClick={handleClear}
          title="Clear date"
          className="absolute right-8 top-[2.1rem] -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {helperText && <p className="mt-1 text-xs text-gray-500 ml-3.5">{helperText}</p>}

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-[9999] bg-white rounded-xl shadow-xl border border-gray-200 p-3 animate-in fade-in zoom-in-95 duration-200">
          <style>{`
            .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #0a66c2; --rdp-background-color: #e3f2fd; margin: 0; }
            .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f3f2ef; font-weight: bold; }
            .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover { background-color: var(--rdp-accent-color); color: white; font-weight: bold; }
            .rdp-head_cell { color: #666; font-weight: 600; font-size: 0.875rem; }
            .rdp-caption_label { font-weight: 700; color: #191919; font-size: 1rem; }
            .rdp-nav_button { color: #666; }
            .rdp-nav_button:hover { background-color: #f3f2ef; color: #0a66c2; }
          `}</style>
          <DayPicker
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={handleSelect}
            locale={dateFnsLocale}
            className="rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
