import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navigation from './components/Navigation';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'FinFlow — Обработка банковских выписок',
  description: 'Система автоматической обработки банковских выписок',
  icons: {
    icon: '/images/logo.png',
  },
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: '',
              style: {
                border: '1px solid #713200',
                padding: '16px',
                color: '#713200',
              },
              success: {
                style: {
                  border: '1px solid #E0E0E0',
                  background: '#F0F9F4',
                  color: '#155724',
                },
                iconTheme: {
                  primary: '#155724',
                  secondary: '#F0F9F4',
                },
              },
              error: {
                style: {
                  border: '1px solid #E0E0E0',
                  background: '#FEF2F2',
                  color: '#991B1B',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

