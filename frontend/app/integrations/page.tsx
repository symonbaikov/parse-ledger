'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, Plug } from 'lucide-react';

const integrations = [
  {
    key: 'google-sheets',
    name: 'Google Sheets',
    description: 'Отправляйте распарсенные транзакции в выбранную таблицу.',
    badge: 'Доступно',
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
      { label: 'Подключить', href: '/integrations/google-sheets' },
      { label: 'Документация', href: 'https://support.google.com/docs', external: true },
    ],
  },
  {
    key: 'telegram',
    name: 'Telegram',
    description: 'Получайте уведомления и отправляйте выписки через бота.',
    badge: 'Скоро',
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
      { label: 'Настроить бота', href: '/settings/telegram' },
      { label: 'Руководство', href: 'https://core.telegram.org/bots', external: true },
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <Plug className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Интеграции</h1>
          <p className="text-secondary mt-1">
            Подключайте внешние сервисы и автоматизируйте обмен данными.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item) => (
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
                        key={action.label}
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
                        key={action.label}
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
  );
}
