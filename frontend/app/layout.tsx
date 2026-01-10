import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Navigation from './components/Navigation';
import GlobalBreadcrumbs from './components/GlobalBreadcrumbs';
import { IntlayerServerProvider, getLocale } from 'next-intlayer/server';
import { getIntlayer } from 'next-intlayer';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={undefined} dir={undefined}>
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
