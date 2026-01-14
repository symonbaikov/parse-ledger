'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { IntlayerClientProvider } from 'next-intlayer';
import { Toaster } from 'react-hot-toast';
import { useHTMLLanguage } from './hooks/useHTMLLanguage';
import { theme } from './theme';

function HTMLLanguageSync() {
  useHTMLLanguage();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <IntlayerClientProvider>
      <HTMLLanguageSync />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontSize: '14px' },
          }}
        />
        {children}
      </ThemeProvider>
    </IntlayerClientProvider>
  );
}
