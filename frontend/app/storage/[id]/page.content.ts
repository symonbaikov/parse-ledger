import { type Dictionary, t } from 'intlayer';

const content = {
  key: 'storageDetailsPage',
  content: {
    loading: t({ ru: 'Загрузка...', en: 'Loading...', kk: 'Жүктелуде...' }),
    notFound: t({ ru: 'Файл не найден', en: 'File not found', kk: 'Файл табылмады' }),
    toasts: {
      previewFailed: t({
        ru: 'Не удалось загрузить превью файла',
        en: 'Failed to load file preview',
        kk: 'Файл превьюін жүктеу мүмкін болмады',
      }),
    },
    availability: {
      labels: {
        both: t({ ru: 'OK', en: 'OK', kk: 'OK' }),
        disk: t({ ru: 'Диск', en: 'Disk', kk: 'Disk' }),
        db: t({ ru: 'БД', en: 'DB', kk: 'DB' }),
        missing: t({ ru: 'Нет файла', en: 'Missing', kk: 'Қолжетімсіз' }),
      },
      tooltips: {
        both: t({
          ru: 'Файл доступен на диске и в базе данных',
          en: 'File is available on disk and in DB',
          kk: 'Файл дискте және дерекқорда қолжетімді',
        }),
        disk: t({
          ru: 'Файл доступен на диске',
          en: 'File is available on disk',
          kk: 'Файл дискте қолжетімді',
        }),
        db: t({
          ru: 'Файл доступен в базе данных',
          en: 'File is available in DB',
          kk: 'Файл дерекқорда қолжетімді',
        }),
        missing: t({
          ru: 'Файл недоступен (нет на диске и в базе данных)',
          en: 'File is unavailable (missing on disk and in DB)',
          kk: 'Файл қолжетімсіз (дискте де, дерекқорда да жоқ)',
        }),
      },
    },
    permission: {
      owner: t({ ru: 'Владелец', en: 'Owner', kk: 'Иесі' }),
      editor: t({ ru: 'Редактор', en: 'Editor', kk: 'Өңдеуші' }),
      viewer: t({ ru: 'Просмотр', en: 'Viewer', kk: 'Қарау' }),
      downloader: t({ ru: 'Скачивание', en: 'Download', kk: 'Жүктеу' }),
      access: t({ ru: 'Доступ', en: 'Access', kk: 'Қолжетімділік' }),
    },
    status: {
      completed: t({ ru: 'Завершено', en: 'Completed', kk: 'Аяқталды' }),
      processing: t({ ru: 'Обрабатывается', en: 'Processing', kk: 'Өңделуде' }),
      error: t({ ru: 'Ошибка', en: 'Error', kk: 'Қате' }),
      uploaded: t({ ru: 'Загружено', en: 'Uploaded', kk: 'Жүктелді' }),
    },
    actions: {
      downloadTooltip: t({ ru: 'Скачать файл', en: 'Download file', kk: 'Файлды жүктеу' }),
      download: t({ ru: 'Скачать', en: 'Download', kk: 'Жүктеу' }),
      shareTooltip: t({ ru: 'Поделиться файлом', en: 'Share file', kk: 'Файлмен бөлісу' }),
      share: t({ ru: 'Поделиться', en: 'Share', kk: 'Бөлісу' }),
    },
    cards: {
      size: t({ ru: 'Размер файла', en: 'File size', kk: 'Файл өлшемі' }),
      transactions: t({ ru: 'Транзакций', en: 'Transactions', kk: 'Транзакциялар' }),
      uploadedAt: t({ ru: 'Загружено', en: 'Uploaded', kk: 'Жүктелді' }),
      account: t({ ru: 'Счет', en: 'Account', kk: 'Шот' }),
      dash: t({ ru: '—', en: '—', kk: '—' }),
    },
    preview: {
      title: t({ ru: 'Предпросмотр файла', en: 'File preview', kk: 'Файл превьюі' }),
      refresh: t({ ru: 'Обновить', en: 'Refresh', kk: 'Жаңарту' }),
      openNewTab: t({
        ru: 'Открыть в новой вкладке',
        en: 'Open in new tab',
        kk: 'Жаңа қойындыда ашу',
      }),
      iframeTitle: t({ ru: 'Предпросмотр файла', en: 'File preview', kk: 'Файл превьюі' }),
      retry: t({ ru: 'Попробовать снова', en: 'Try again', kk: 'Қайтадан көру' }),
      unavailable: t({
        ru: 'Файл недоступен. Похоже, он был удалён с сервера. Попросите владельца загрузить файл заново.',
        en: 'File is unavailable. It may have been removed from the server. Ask the owner to upload it again.',
        kk: 'Файл қолжетімсіз. Ол серверден өшірілген болуы мүмкін. Иесінен файлды қайта жүктеуді сұраңыз.',
      }),
      empty: t({
        ru: 'Превью появится после загрузки файла. Если формат не поддерживает онлайн-просмотр, скачайте файл.',
        en: 'Preview will appear after file upload. If the format is not supported online, download the file.',
        kk: 'Превью файл жүктелгеннен кейін пайда болады. Егер формат онлайн қарауды қолдамаса, файлды жүктеңіз.',
      }),
    },
    tabs: {
      transactions: t({ ru: 'Транзакции', en: 'Transactions', kk: 'Транзакциялар' }),
      links: t({ ru: 'Ссылки', en: 'Links', kk: 'Сілтемелер' }),
      permissions: t({ ru: 'Права доступа', en: 'Permissions', kk: 'Құқықтар' }),
    },
  },
} satisfies Dictionary;

export default content;
