import type { Metadata } from 'next';
import './globals.css';
import { getIntlayer } from 'next-intlayer';
import { IntlayerServerProvider, getLocale } from 'next-intlayer/server';
import GlobalBreadcrumbs from './components/GlobalBreadcrumbs';
import Navigation from './components/Navigation';
import { Providers } from './providers';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getIntlayer('layout', locale);

  return {
    title: t.title.value,
    description: t.description.value,
    icons: {
      icon: '/images/logo.png',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const resolvedLocale = typeof locale === 'string' ? locale : 'en';
  const direction = resolvedLocale.startsWith('ar') ? 'rtl' : 'ltr';

  return (
    <html lang={resolvedLocale} dir={direction}>
      <body>
        <IntlayerServerProvider>
          <Providers>
            <Navigation />
            <GlobalBreadcrumbs />
            <main>{children}</main>
          </Providers>
        </IntlayerServerProvider>
      </body>
    </html>
  );
}
