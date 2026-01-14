import { type Dictionary, t } from 'intlayer';

const content = {
  key: 'sharedFilePage',
  content: {
    loading: t({ ru: 'Загрузка...', en: 'Loading...', kk: 'Жүктелуде...' }),
    errors: {
      passwordRequired: t({
        ru: 'Требуется пароль для доступа к файлу',
        en: 'Password is required to access this file',
        kk: 'Бұл файлға кіру үшін құпиясөз қажет',
      }),
      loadFailed: t({
        ru: 'Не удалось загрузить файл',
        en: 'Failed to load file',
        kk: 'Файлды жүктеу мүмкін болмады',
      }),
      notFound: t({ ru: 'Файл не найден', en: 'File not found', kk: 'Файл табылмады' }),
      noTransactionsAccess: t({
        ru: 'У вас нет прав на просмотр транзакций. Обратитесь к владельцу файла для получения доступа.',
        en: 'You do not have permission to view transactions. Contact the file owner to get access.',
        kk: 'Транзакцияларды қарауға құқығыңыз жоқ. Қолжетімділік алу үшін файл иесіне хабарласыңыз.',
      }),
    },
    permission: {
      view: t({ ru: 'Просмотр', en: 'View', kk: 'Қарау' }),
      download: t({
        ru: 'Просмотр и скачивание',
        en: 'View and download',
        kk: 'Қарау және жүктеу',
      }),
      edit: t({ ru: 'Редактирование', en: 'Edit', kk: 'Өңдеу' }),
      prefix: t({ ru: 'Права', en: 'Permission', kk: 'Құқық' }),
    },
    protected: {
      title: t({ ru: 'Защищенный файл', en: 'Protected file', kk: 'Қорғалған файл' }),
      subtitle: t({
        ru: 'Для доступа к этому файлу требуется пароль',
        en: 'Password is required to access this file',
        kk: 'Бұл файлға кіру үшін құпиясөз қажет',
      }),
      passwordLabel: t({ ru: 'Пароль', en: 'Password', kk: 'Құпиясөз' }),
      open: t({ ru: 'Открыть файл', en: 'Open file', kk: 'Файлды ашу' }),
    },
    header: {
      badge: t({ ru: 'Общий доступ', en: 'Shared', kk: 'Ортақ қолжетімділік' }),
      download: t({ ru: 'Скачать', en: 'Download', kk: 'Жүктеу' }),
    },
    cards: {
      bank: t({ ru: 'Банк', en: 'Bank', kk: 'Банк' }),
      fileSize: t({ ru: 'Размер файла', en: 'File size', kk: 'Файл өлшемі' }),
      transactions: t({ ru: 'Транзакций', en: 'Transactions', kk: 'Транзакциялар' }),
      account: t({ ru: 'Счет', en: 'Account', kk: 'Шот' }),
      dash: t({ ru: '—', en: '—', kk: '—' }),
    },
    transactionsTitle: t({ ru: 'Транзакции', en: 'Transactions', kk: 'Транзакциялар' }),
  },
} satisfies Dictionary;

export default content;
