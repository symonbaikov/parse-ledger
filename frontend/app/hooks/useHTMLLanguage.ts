'use client';

import { useEffect } from 'react';
import { getHTMLTextDir } from 'intlayer';
import { useLocale } from 'next-intlayer';

export function useHTMLLanguage() {
  const { locale } = useLocale();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = locale;
    document.documentElement.dir = getHTMLTextDir(locale);
  }, [locale]);
}

