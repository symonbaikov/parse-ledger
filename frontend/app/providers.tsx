'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { IntlayerClientProvider } from 'next-intlayer';
import { useTheme as useNextTheme } from 'next-themes';
import React, { useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { useHTMLLanguage } from './hooks/useHTMLLanguage';
import { createAppTheme } from './theme';
import { TourAutoStarter } from './tours/components/TourAutoStarter';

function HTMLLanguageSync() {
  useHTMLLanguage();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme();
  const paletteMode = resolvedTheme === 'dark' ? 'dark' : 'light';
  const muiTheme = useMemo(() => createAppTheme(paletteMode), [paletteMode]);

  return (
    <IntlayerClientProvider>
      <HTMLLanguageSync />
      <TourAutoStarter />
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: '14px',
              background: 'var(--card-bg)',
              color: 'var(--foreground)',
              border: '1px solid var(--border-color)',
            },
          }}
        />
        {children}
      </ThemeProvider>
    </IntlayerClientProvider>
  );
}
