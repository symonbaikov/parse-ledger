'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, Plug } from 'lucide-react';
import { useIntlayer } from 'next-intlayer';

export default function IntegrationsPage() {
  const t = useIntlayer('integrationsPage');
  const integrations = [
    {
      key: 'google-sheets',
      active: true,
      name: 'Google Sheets',
      description: t.cards.googleSheets.description,
      badge: t.cards.googleSheets.badge,
      icon: (
        <Image
          src="/icons/icons8-google-sheets-48.png"
          alt="Google Sheets"
          width={32}
          height={32}
          className="rounded"
        />
      ),
      actions: [
        { label: t.cards.googleSheets.actions.connect, href: '/integrations/google-sheets' },
        { label: t.cards.googleSheets.actions.docs, href: 'https://support.google.com/docs', external: true },
      ],
    },
    {
      key: 'telegram',
      active: false,
      name: 'Telegram',
      description: t.cards.telegram.description,
      badge: t.cards.telegram.badge,
      icon: (
        <Image
          src="/icons/icons8-telegram-48.png"
          alt="Telegram"
          width={32}
          height={32}
          className="rounded"
        />
      ),
      actions: [
        { label: t.cards.telegram.actions.setup, href: '/settings/telegram' },
        { label: t.cards.telegram.actions.guide, href: 'https://core.telegram.org/bots', external: true },
      ],
    },
  ];

  const active = integrations.filter((item) => item.active);
  const available = integrations.filter((item) => !item.active);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <Plug className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-secondary mt-1">
            {t.subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{t.sections.connected}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                {t.empty.connected}
              </div>
            )}
            {active.map((item) => (
              <div
                key={item.key}
                className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">{item.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900">{item.name}</h2>
                      <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> {item.badge}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.actions.map((action) =>
                        action.external ? (
                          <a
                            key={action.href}
                            href={action.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            {action.label}
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </a>
                        ) : (
                          <Link
                            key={action.href}
                            href={action.href}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-full border border-primary text-primary hover:bg-primary/10"
                          >
                            {action.label}
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{t.sections.available}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {available.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                {t.empty.available}
              </div>
            )}
            {available.map((item) => (
              <div
                key={item.key}
                className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">{item.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900">{item.name}</h2>
                      <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> {item.badge}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.actions.map((action) =>
                        action.external ? (
                          <a
                            key={action.href}
                            href={action.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            {action.label}
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </a>
                        ) : (
                          <Link
                            key={action.href}
                            href={action.href}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-full border border-primary text-primary hover:bg-primary/10"
                          >
                            {action.label}
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
