import { type Dictionary, t } from 'intlayer';

const content = {
  key: 'transactionsDrawer',
  content: {
    title: t({
      ru: 'Детали транзакции',
      en: 'Transaction Details',
      kk: 'Транзакция мәліметтері',
    }),
    date: t({
      ru: 'Дата',
      en: 'Date',
      kk: 'Күні',
    }),
    documentNumber: t({
      ru: 'Номер документа',
      en: 'Document Number',
      kk: 'Құжат нөмірі',
    }),
    counterparty: t({
      ru: 'Контрагент',
      en: 'Counterparty',
      kk: 'Контрагент',
    }),
    bin: t({
      ru: 'БИН',
      en: 'BIN',
      kk: 'БСН',
    }),
    purpose: t({
      ru: 'Назначение платежа',
      en: 'Payment Purpose',
      kk: 'Төлем мақсаты',
    }),
    debit: t({
      ru: 'Дебет',
      en: 'Debit',
      kk: 'Дебет',
    }),
    credit: t({
      ru: 'Кредит',
      en: 'Credit',
      kk: 'Кредит',
    }),
    additionalDetails: t({
      ru: 'Дополнительные данные',
      en: 'Additional Details',
      kk: 'Қосымша мәліметтер',
    }),
    currency: t({
      ru: 'Валюта',
      en: 'Currency',
      kk: 'Валюта',
    }),
    exchangeRate: t({
      ru: 'Курс обмена',
      en: 'Exchange Rate',
      kk: 'Айырбас курсы',
    }),
    article: t({
      ru: 'Статья',
      en: 'Article',
      kk: 'Бап',
    }),
    branch: t({
      ru: 'Филиал',
      en: 'Branch',
      kk: 'Филиал',
    }),
    wallet: t({
      ru: 'Кошелёк',
      en: 'Wallet',
      kk: 'Әмиян',
    }),
    parsingMetadata: t({
      ru: 'Метаданные распознавания',
      en: 'Parsing Metadata',
      kk: 'Тану метадеректері',
    }),
    confidence: t({
      ru: 'Уверенность',
      en: 'Confidence',
      kk: 'Сенімділік',
    }),
    rawExtract: t({
      ru: 'Исходные данные',
      en: 'Raw Extract',
      kk: 'Бастапқы деректер',
    }),
    currentCategory: t({
      ru: 'Текущая категория',
      en: 'Current Category',
      kk: 'Ағымдағы санат',
    }),
    noCategory: t({
      ru: 'Категория не назначена',
      en: 'No category assigned',
      kk: 'Санат тағайындалмаған',
    }),
    actions: t({
      ru: 'Действия',
      en: 'Actions',
      kk: 'Әрекеттер',
    }),
    setCategory: t({
      ru: 'Установить категорию',
      en: 'Set Category',
      kk: 'Санат белгілеу',
    }),
    selectCategory: t({
      ru: 'Выберите категорию...',
      en: 'Select category...',
      kk: 'Санат таңдаңыз...',
    }),
    updating: t({
      ru: 'Обновление...',
      en: 'Updating...',
      kk: 'Жаңартылуда...',
    }),
    apply: t({
      ru: 'Применить',
      en: 'Apply',
      kk: 'Қолдану',
    }),
    markIgnored: t({
      ru: 'Отметить как игнорируемое',
      en: 'Mark as Ignored',
      kk: 'Елемеу ретінде белгілеу',
    }),
  },
} satisfies Dictionary;

export default content;
