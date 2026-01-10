import { t, type Dictionary } from 'intlayer';

const content = {
  key: 'storagePage',
  content: {
    title: t({ ru: 'Хранилище', en: 'Storage', kk: 'Қойма' }),
    subtitle: t({
      ru: 'Управляйте загруженными файлами и документами',
      en: 'Manage uploaded files and documents',
      kk: 'Жүктелген файлдар мен құжаттарды басқарыңыз',
    }),
    searchPlaceholder: t({ ru: 'Поиск по файлам...', en: 'Search files...', kk: 'Файлдардан іздеу...' }),
    filters: {
      button: t({ ru: 'Фильтры', en: 'Filters', kk: 'Сүзгілер' }),
      title: t({ ru: 'Фильтры', en: 'Filters', kk: 'Сүзгілер' }),
      reset: t({ ru: 'Сбросить', en: 'Reset', kk: 'Қалпына келтіру' }),
      apply: t({ ru: 'Применить', en: 'Apply', kk: 'Қолдану' }),
      all: t({ ru: 'Все', en: 'All', kk: 'Барлығы' }),
      status: t({ ru: 'Статус', en: 'Status', kk: 'Күйі' }),
      bank: t({ ru: 'Банк', en: 'Bank', kk: 'Банк' }),
      category: t({ ru: 'Категория', en: 'Category', kk: 'Санат' }),
      accessType: t({ ru: 'Тип доступа', en: 'Access type', kk: 'Қолжетімділік түрі' }),
      owned: t({ ru: 'Мои файлы', en: 'My files', kk: 'Менің файлдарым' }),
      shared: t({ ru: 'Доступные мне', en: 'Shared with me', kk: 'Маған қолжетімді' }),
    },
    table: {
      fileName: t({ ru: 'Имя файла', en: 'File name', kk: 'Файл атауы' }),
      bank: t({ ru: 'Банк', en: 'Bank', kk: 'Банк' }),
      account: t({ ru: 'Счет', en: 'Account', kk: 'Шот' }),
      size: t({ ru: 'Размер', en: 'Size', kk: 'Өлшемі' }),
      status: t({ ru: 'Статус', en: 'Status', kk: 'Күйі' }),
      category: t({ ru: 'Категория', en: 'Category', kk: 'Санат' }),
      access: t({ ru: 'Доступ', en: 'Access', kk: 'Қолжетімділік' }),
      createdAt: t({ ru: 'Создано', en: 'Created', kk: 'Құрылған' }),
      actions: t({ ru: 'Действия', en: 'Actions', kk: 'Әрекеттер' }),
    },
    empty: {
      title: t({ ru: 'Файлы не найдены', en: 'No files found', kk: 'Файлдар табылмады' }),
      subtitle: t({
        ru: 'Попробуйте изменить параметры поиска или фильтры',
        en: 'Try adjusting search or filters',
        kk: 'Іздеу немесе сүзгілер параметрлерін өзгертіп көріңіз',
      }),
    },
    sharedLinksShort: t({ ru: 'ссылок', en: 'links', kk: 'сілтемелер' }),
    categoryCell: {
      choose: t({ ru: 'Выбрать', en: 'Choose', kk: 'Таңдау' }),
      none: t({ ru: 'Без категории', en: 'No category', kk: 'Санатсыз' }),
    },
    permission: {
      owner: t({ ru: 'Владелец', en: 'Owner', kk: 'Иесі' }),
      editor: t({ ru: 'Редактор', en: 'Editor', kk: 'Өңдеуші' }),
      viewer: t({ ru: 'Просмотр', en: 'View', kk: 'Қарау' }),
      downloader: t({ ru: 'Скачивание', en: 'Download', kk: 'Жүктеу' }),
      access: t({ ru: 'Доступ', en: 'Access', kk: 'Қолжетімділік' }),
    },
    statusLabels: {
      completed: t({ ru: 'Завершено', en: 'Completed', kk: 'Аяқталды' }),
      processing: t({ ru: 'Обрабатывается', en: 'Processing', kk: 'Өңделуде' }),
      error: t({ ru: 'Ошибка', en: 'Error', kk: 'Қате' }),
      uploaded: t({ ru: 'Загружено', en: 'Uploaded', kk: 'Жүктелді' }),
      parsed: t({ ru: 'Распарсено', en: 'Parsed', kk: 'Өңделді' }),
    },
    actions: {
      view: t({ ru: 'Просмотр', en: 'View', kk: 'Қарау' }),
      download: t({ ru: 'Скачать', en: 'Download', kk: 'Жүктеу' }),
      share: t({ ru: 'Поделиться', en: 'Share', kk: 'Бөлісу' }),
      permissions: t({ ru: 'Доступ', en: 'Access', kk: 'Қолжетімділік' }),
      tooltipView: t({ ru: 'Просмотр', en: 'View', kk: 'Қарау' }),
      tooltipDownload: t({ ru: 'Скачать', en: 'Download', kk: 'Жүктеу' }),
    },
    toasts: {
      loadFilesFailed: t({ ru: 'Не удалось загрузить файлы', en: 'Failed to load files', kk: 'Файлдарды жүктеу мүмкін болмады' }),
      loadCategoriesFailed: t({ ru: 'Не удалось загрузить категории', en: 'Failed to load categories', kk: 'Санаттарды жүктеу мүмкін болмады' }),
      downloaded: t({ ru: 'Файл скачан', en: 'File downloaded', kk: 'Файл жүктелді' }),
      downloadFailed: t({ ru: 'Не удалось скачать файл', en: 'Failed to download file', kk: 'Файлды жүктеу мүмкін болмады' }),
      shareOpened: t({ ru: 'Открыто окно доступа', en: 'Sharing opened', kk: 'Бөлісу терезесі ашылды' }),
      permissionsOpened: t({ ru: 'Открыто управление правами', en: 'Permissions opened', kk: 'Құқықтарды басқару ашылды' }),
      categoryUpdated: t({ ru: 'Категория обновлена', en: 'Category updated', kk: 'Санат жаңартылды' }),
      categoryUpdateFailed: t({ ru: 'Не удалось обновить категорию файла', en: 'Failed to update file category', kk: 'Файл санатын жаңарту мүмкін болмады' }),
    },
  },
} satisfies Dictionary;

export default content;
