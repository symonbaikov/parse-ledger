import { type Dictionary, t } from 'intlayer';

const content = {
  key: 'uploadPage',
  content: {
    title: t({
      ru: 'Загрузка банковских выписок',
      en: 'Upload bank statements',
      kk: 'Банк үзінділерін жүктеу',
    }),
    description: t({
      ru: 'После загрузки файлы будут автоматически обработаны: извлечены транзакции, классифицированы и синхронизированы с Google Sheets (если подключен). Результаты обработки можно посмотреть на странице Выписки.',
      en: 'After upload, files will be processed automatically: transactions will be extracted, categorized, and synced to Google Sheets (if connected). You can view results on the Statements page.',
      kk: 'Жүктелгеннен кейін файлдар автоматты түрде өңделеді: транзакциялар алынады, санаттарға бөлінеді және (қосылған болса) Google Sheets-пен синхрондалады. Нәтижелерді Үзінділер бетінде көре аласыз.',
    }),
    success: t({
      ru: 'Файлы успешно загружены! Идёт обработка... Вы будете перенаправлены на страницу выписок.',
      en: 'Files uploaded successfully! Processing is in progress... You will be redirected to the statements page.',
      kk: 'Файлдар сәтті жүктелді! Өңдеу жүріп жатыр... Сіз үзінділер бетіне бағытталасыз.',
    }),
    oauthLinkMissing: t({
      ru: 'Не удалось получить ссылку для авторизации Google',
      en: 'Failed to get Google authorization link',
      kk: 'Google авторизация сілтемесін алу мүмкін болмады',
    }),
    oauthStartFailed: t({
      ru: 'Не удалось начать авторизацию Google',
      en: 'Failed to start Google authorization',
      kk: 'Google авторизациясын бастау мүмкін болмады',
    }),
    maxTwoFiles: t({
      ru: 'Максимум 2 файла можно загрузить за раз',
      en: 'You can upload up to 2 files at a time',
      kk: 'Бір ретте ең көбі 2 файл жүктеуге болады',
    }),
    allowDuplicates: t({
      ru: 'Разрешить загрузку дубликатов',
      en: 'Allow uploading duplicates',
      kk: 'Дубликаттарды жүктеуге рұқсат беру',
    }),
    uploadFailed: t({
      ru: 'Не удалось загрузить файлы. Попробуйте снова.',
      en: 'Failed to upload files. Please try again.',
      kk: 'Файлдарды жүктеу мүмкін болмады. Қайтадан көріңіз.',
    }),
    pickAtLeastOne: t({
      ru: 'Пожалуйста, выберите хотя бы один файл',
      en: 'Please select at least one file',
      kk: 'Кемінде бір файл таңдаңыз',
    }),
    googleSheetOptional: t({
      ru: 'Google Таблица (опционально)',
      en: 'Google Sheet (optional)',
      kk: 'Google кестесі (міндетті емес)',
    }),
    noSync: t({
      ru: 'Без синхронизации с Google Таблицами',
      en: 'No Google Sheets sync',
      kk: 'Google Sheets синхрондаусыз',
    }),
    googleSheetHelp: t({
      ru: 'Выберите Google Таблицу для автоматической синхронизации транзакций. Если не выбрана, данные будут сохранены только в системе.',
      en: 'Select a Google Sheet for automatic transaction sync. If not selected, data will be saved only in the system.',
      kk: 'Транзакцияларды автоматты синхрондау үшін Google кестесін таңдаңыз. Таңдалмаса, деректер тек жүйеде сақталады.',
    }),
    noConnectedSheets: t({
      ru: 'Нет подключенных таблиц.',
      en: 'No connected sheets.',
      kk: 'Қосылған кестелер жоқ.',
    }),
    oauthOpening: t({
      ru: 'Открытие...',
      en: 'Opening...',
      kk: 'Ашылуда...',
    }),
    connectGoogleSheets: t({
      ru: 'Подключить Google Таблицы',
      en: 'Connect Google Sheets',
      kk: 'Google Sheets қосу',
    }),
    dropTitle: t({
      ru: 'Перетащите файлы сюда или нажмите, чтобы выбрать',
      en: 'Drag files here or click to select',
      kk: 'Файлдарды осында сүйреп әкеліңіз немесе таңдау үшін басыңыз',
    }),
    dropSubtitle: t({
      ru: 'Поддерживаемые форматы: PDF, XLSX, XLS, CSV, JPG, PNG (до 2 файлов, каждый до 10 МБ)',
      en: 'Supported formats: PDF, XLSX, XLS, CSV, JPG, PNG (up to 2 files, up to 10 MB each)',
      kk: 'Қолдау көрсетілетін форматтар: PDF, XLSX, XLS, CSV, JPG, PNG (ең көбі 2 файл, әрқайсысы 10 МБ дейін)',
    }),
    selectedFiles: t({
      ru: 'Выбранные файлы',
      en: 'Selected files',
      kk: 'Таңдалған файлдар',
    }),
    megabytesShort: t({
      ru: 'МБ',
      en: 'MB',
      kk: 'МБ',
    }),
    uploadButtonIdle: t({
      ru: 'Загрузить файлы',
      en: 'Upload files',
      kk: 'Файлдарды жүктеу',
    }),
    uploadButtonLoading: t({
      ru: 'Загрузка...',
      en: 'Uploading...',
      kk: 'Жүктелуде...',
    }),
    afterUploadTitle: t({
      ru: 'Что происходит после загрузки?',
      en: 'What happens after upload?',
      kk: 'Жүктегеннен кейін не болады?',
    }),
    afterUploadSteps: {
      step1: t({
        ru: 'Файл сохраняется в системе',
        en: 'The file is saved in the system',
        kk: 'Файл жүйеде сақталады',
      }),
      step2: t({
        ru: 'Автоматически определяется банк и формат выписки',
        en: 'The bank and statement format are detected automatically',
        kk: 'Банк және үзінді форматы автоматты түрде анықталады',
      }),
      step3: t({
        ru: 'Извлекаются все транзакции',
        en: 'All transactions are extracted',
        kk: 'Барлық транзакциялар алынады',
      }),
      step4: t({
        ru: 'Транзакции автоматически классифицируются по категориям',
        en: 'Transactions are categorized automatically',
        kk: 'Транзакциялар автоматты түрде санаттарға бөлінеді',
      }),
      step5: t({
        ru: 'Если выбран Google Sheet, данные синхронизируются',
        en: 'If a Google Sheet is selected, data is synced',
        kk: 'Егер Google кестесі таңдалса, деректер синхрондалады',
      }),
      step6: t({
        ru: 'Результаты можно посмотреть на странице Выписки',
        en: 'Results are available on the Statements page',
        kk: 'Нәтижелер Үзінділер бетінде қолжетімді',
      }),
    },
  },
} satisfies Dictionary;

export default content;
