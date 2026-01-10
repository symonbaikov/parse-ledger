import { t, type Dictionary } from 'intlayer';

const content = {
  key: 'transactionsView',
  content: {
    searchPlaceholder: t({
      ru: 'Поиск по контрагенту, назначению или категории...',
      en: 'Search by counterparty, purpose, or category...',
      kk: 'Контрагент, мақсат немесе санат бойынша іздеу...',
    }),
    empty: t({ ru: 'Транзакции не найдены', en: 'No transactions found', kk: 'Транзакциялар табылмады' }),
    pagination: {
      rowsPerPage: t({ ru: 'Строк на странице:', en: 'Rows per page:', kk: 'Беттегі жолдар:' }),
      of: t({ ru: 'из', en: 'of', kk: '/' }),
    },
    dash: t({ ru: '—', en: '—', kk: '—' }),
    type: {
      income: t({ ru: 'Приход', en: 'Income', kk: 'Кіріс' }),
      expense: t({ ru: 'Расход', en: 'Expense', kk: 'Шығыс' }),
      transfer: t({ ru: 'Перевод', en: 'Transfer', kk: 'Аударым' }),
    },
    columns: {
      transactionDate: t({ ru: 'Дата', en: 'Date', kk: 'Күні' }),
      documentNumber: t({ ru: 'Номер документа', en: 'Document number', kk: 'Құжат нөмірі' }),
      counterpartyName: t({ ru: 'Контрагент', en: 'Counterparty', kk: 'Контрагент' }),
      counterpartyBin: t({ ru: 'БИН', en: 'BIN', kk: 'БСН' }),
      paymentPurpose: t({ ru: 'Назначение платежа', en: 'Payment purpose', kk: 'Төлем мақсаты' }),
      debit: t({ ru: 'Дебет', en: 'Debit', kk: 'Дебет' }),
      credit: t({ ru: 'Кредит', en: 'Credit', kk: 'Кредит' }),
      currency: t({ ru: 'Валюта', en: 'Currency', kk: 'Валюта' }),
      exchangeRate: t({ ru: 'Курс', en: 'Rate', kk: 'Курс' }),
      transactionType: t({ ru: 'Тип', en: 'Type', kk: 'Түрі' }),
      category: t({ ru: 'Категория', en: 'Category', kk: 'Санат' }),
      article: t({ ru: 'Статья', en: 'Article', kk: 'Бап' }),
      amountForeign: t({ ru: 'Сумма в валюте', en: 'Amount in currency', kk: 'Валютадағы сома' }),
      branch: t({ ru: 'Филиал', en: 'Branch', kk: 'Филиал' }),
      wallet: t({ ru: 'Кошелёк', en: 'Wallet', kk: 'Әмиян' }),
    },
  },
} satisfies Dictionary;

export default content;
