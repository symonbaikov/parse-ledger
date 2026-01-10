import { t, type Dictionary } from 'intlayer';

const content = {
  key: 'googleSheetsCallbackPage',
  content: {
    errors: {
      missingCode: t({
        ru: 'Не удалось получить код авторизации Google.',
        en: 'Failed to get Google authorization code.',
        kk: 'Google авторизация коды алынбады.',
      }),
      oauthErrorPrefix: t({ ru: 'Google OAuth ошибка', en: 'Google OAuth error', kk: 'Google OAuth қатесі' }),
      sheetIdRequired: t({ ru: 'Введите ID таблицы Google Sheet', en: 'Enter the Google Sheet ID', kk: 'Google Sheet ID енгізіңіз' }),
      connectFailed: t({
        ru: 'Не удалось подключить Google Sheet',
        en: 'Failed to connect Google Sheet',
        kk: 'Google Sheet қосу мүмкін болмады',
      }),
    },
    title: t({ ru: 'Подключение Google Sheets', en: 'Google Sheets connection', kk: 'Google Sheets қосу' }),
    subtitle: t({
      ru: 'Авторизация в Google завершена. Укажите ID таблицы, чтобы сохранить подключение.',
      en: 'Google authorization completed. Provide the spreadsheet ID to save the connection.',
      kk: 'Google авторизациясы аяқталды. Қосылымды сақтау үшін кесте ID енгізіңіз.',
    }),
    success: t({
      ru: 'Подключение сохранено. Перенаправляем на загрузку…',
      en: 'Connection saved. Redirecting…',
      kk: 'Қосылым сақталды. Бағытталуда…',
    }),
    fields: {
      sheetId: t({ ru: 'ID таблицы', en: 'Spreadsheet ID', kk: 'Кесте ID' }),
      sheetIdPlaceholder: t({ ru: 'Например: 1AbCdEf...', en: 'e.g. 1AbCdEf...', kk: 'Мысалы: 1AbCdEf...' }),
      connectionName: t({ ru: 'Название подключения (опционально)', en: 'Connection name (optional)', kk: 'Қосылым атауы (міндетті емес)' }),
      connectionNamePlaceholder: t({ ru: 'Например: Финансы 2025', en: 'e.g. Finance 2025', kk: 'Мысалы: Қаржы 2025' }),
      worksheet: t({ ru: 'Лист (опционально)', en: 'Worksheet (optional)', kk: 'Парақ (міндетті емес)' }),
      worksheetPlaceholder: t({ ru: 'Лист1', en: 'Sheet1', kk: 'Sheet1' }),
    },
    actions: {
      save: t({ ru: 'Сохранить подключение', en: 'Save connection', kk: 'Қосылымды сақтау' }),
      backToUpload: t({ ru: 'Вернуться к загрузке', en: 'Back to upload', kk: 'Жүктеуге қайту' }),
    },
  },
} satisfies Dictionary;

export default content;

