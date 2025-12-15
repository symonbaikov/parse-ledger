import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Navigation from './components/Navigation';
import GlobalBreadcrumbs from './components/GlobalBreadcrumbs';

export const metadata: Metadata = {
  title: 'FinFlow — Обработка банковских выписок',
  description: 'Система автоматической обработки банковских выписок',
  icons: {
    icon: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <Navigation />
          <GlobalBreadcrumbs />
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
