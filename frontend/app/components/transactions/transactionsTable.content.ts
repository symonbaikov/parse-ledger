import { type Dictionary, t } from 'intlayer';

const content = {
  key: 'transactionsTable',
  content: {
    searchPlaceholder: t({
      ru: 'Поиск по контрагенту, назначению, БИН или номеру  документа...',
      en: 'Search by counterparty, purpose, BIN or document number...',
      kk: 'Контрагент, мақсат, БСН немесе құжат нөмірі бойынша іздеу...',
    }),
    filters: t({
      ru: 'Фильтры',
      en: 'Filters',
      kk: 'Сүзгілер',
    }),
    statusFilter: t({
      ru: 'Статус',
      en: 'Status',
      kk: 'Күйі',
    }),
    statusAll: t({
      ru: 'Все',
      en: 'All',
      kk: 'Барлығы',
    }),
    statusWarnings: t({
      ru: 'С предупреждениями',
      en: 'With Warnings',
      kk: 'Ескертулермен',
    }),
    statusErrors: t({
      ru: 'С ошибками',
      en: 'With Errors',
      kk: 'Қателермен',
    }),
    statusUncategorized: t({
      ru: 'Без категории',
      en: 'Uncategorized',
      kk: 'Санатсыз',
    }),
    categoryFilter: t({
      ru: 'Категория',
      en: 'Category',
      kk: 'Санат',
    }),
    categoryAll: t({
      ru: 'Все категории',
      en: 'All Categories',
      kk: 'Барлық санаттар',
    }),
    clearFilters: t({
      ru: 'Очистить',
      en: 'Clear',
      kk: 'Тазалау',
    }),
    columnDate: t({
      ru: 'Дата',
      en: 'Date',
      kk: 'Күні',
    }),
    columnCounterparty: t({
      ru: 'Контрагент',
      en: 'Counterparty',
      kk: 'Контрагент',
    }),
    columnBin: t({
      ru: 'БИН',
      en: 'BIN',
      kk: 'БСН',
    }),
    columnPurpose: t({
      ru: 'Назначение',
      en: 'Purpose',
      kk: 'Мақсаты',
    }),
    columnDebit: t({
      ru: 'Дебет',
      en: 'Debit',
      kk: 'Дебет',
    }),
    columnCredit: t({
      ru: 'Кредит',
      en: 'Credit',
      kk: 'Кредит',
    }),
    columnCategory: t({
      ru: 'Категория',
      en: 'Category',
      kk: 'Санат',
    }),
    noResults: t({
      ru: 'Транзакции не найдены',
      en: 'No transactions found',
      kk: 'Транзакциялар табылмады',
    }),
    rowsPerPage: t({
      ru: 'Строк на странице:',
      en: 'Rows per page:',
      kk: 'Беттегі жолдар:',
    }),
    of: t({
      ru: 'из',
      en: 'of',
      kk: '/',
    }),
    previous: t({
      ru: 'Назад',
      en: 'Previous',
      kk: 'Артқа',
    }),
    next: t({
      ru: 'Вперед',
      en: 'Next',
      kk: 'Алға',
    }),
  },
} satisfies Dictionary;

export default content;
