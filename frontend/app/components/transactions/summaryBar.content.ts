import { type Dictionary, t } from 'intlayer';

const content = {
  key: 'transactionsSummaryBar',
  content: {
    uploadedAt: t({
      ru: 'Загружено',
      en: 'Uploaded',
      kk: 'Жүктелген',
    }),
    parsed: t({
      ru: 'Распознано',
      en: 'Parsed',
      kk: 'Танылды',
    }),
    warnings: t({
      ru: 'Предупреждения',
      en: 'Warnings',
      kk: 'Ескертулер',
    }),
    errors: t({
      ru: 'Ошибки',
      en: 'Errors',
      kk: 'Қателер',
    }),
    uncategorized: t({
      ru: 'Без категории',
      en: 'Uncategorized',
      kk: 'Санатсыз',
    }),
    debitTotal: t({
      ru: 'Дебет',
      en: 'Debit',
      kk: 'Дебет',
    }),
    creditTotal: t({
      ru: 'Кредит',
      en: 'Credit',
      kk: 'Кредит',
    }),
    fixIssues: t({
      ru: 'Исправить проблемы',
      en: 'Fix Issues',
      kk: 'Мәселелерді шешу',
    }),
    showErrors: t({
      ru: 'Показать ошибки',
      en: 'Show Errors',
      kk: 'Қателерді көрсету',
    }),
    export: t({
      ru: 'Экспорт',
      en: 'Export',
      kk: 'Экспорт',
    }),
    download: t({
      ru: 'Скачать',
      en: 'Download',
      kk: 'Жүктеу',
    }),
    share: t({
      ru: 'Поделиться',
      en: 'Share',
      kk: 'Бөлісу',
    }),
  },
} satisfies Dictionary;

export default content;
