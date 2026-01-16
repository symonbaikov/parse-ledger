import { type DeclarationContent, t } from 'intlayer';

/**
 * Контент для тура по странице хранилища
 */
export const storageTourContent = {
  key: 'storage-tour-content',
  content: {
    name: t({
      ru: 'Тур по хранилищу',
      en: 'Storage Tour',
      kk: 'Қойма туры',
    }),
    description: t({
      ru: 'Управление файлами и правами доступа',
      en: 'Manage files and access rights',
      kk: 'Файлдар мен қолжетімділік құқықтарын басқару',
    }),
    steps: {
      welcome: {
        title: t({
          ru: 'Добро пожаловать в хранилище файлов',
          en: 'Welcome to File Storage',
          kk: 'Файл қоймасына қош келдіңіз',
        }),
        description: t({
          ru: 'Здесь вы можете управлять всеми загруженными банковскими выписками: просматривать, скачивать, делиться и организовывать файлы по категориям. Давайте познакомимся с основными возможностями!',
          en: "Here you can manage all uploaded bank statements: view, download, share, and organize files by categories. Let's explore the main features!",
          kk: 'Мұнда сіз барлық жүктелген банк үзінділерін басқара аласыз: қарау, жүктеп алу, бөлісу және файлдарды санаттар бойынша ұйымдастыру. Негізгі мүмкіндіктермен танысайық!',
        }),
      },
      search: {
        title: t({
          ru: 'Поиск файлов',
          en: 'File Search',
          kk: 'Файлдарды іздеу',
        }),
        description: t({
          ru: 'Используйте поиск для быстрого нахождения нужных файлов по имени. Поиск работает мгновенно и фильтрует результаты в реальном времени.',
          en: 'Use search to quickly find files by name. Search works instantly and filters results in real-time.',
          kk: 'Файлдарды аты бойынша жылдам табу үшін іздеуді пайдаланыңыз. Іздеу лезде жұмыс істейді және нәтижелерді нақты уақытта сүзеді.',
        }),
      },
      filters: {
        title: t({
          ru: 'Фильтры',
          en: 'Filters',
          kk: 'Сүзгілер',
        }),
        description: t({
          ru: 'Используйте фильтры для отбора файлов по статусу, банку или категории. Комбинируйте несколько фильтров для точного поиска нужных документов.',
          en: 'Use filters to select files by status, bank, or category. Combine multiple filters for precise document search.',
          kk: 'Файлдарды күй, банк немесе санат бойынша таңдау үшін сүзгілерді пайдаланыңыз. Қажетті құжаттарды дәл іздеу үшін бірнеше сүзгіні біріктіріңіз.',
        }),
      },
      fileList: {
        title: t({
          ru: 'Таблица файлов',
          en: 'File Table',
          kk: 'Файлдар кестесі',
        }),
        description: t({
          ru: 'Таблица отображает все ваши файлы с подробной информацией: название, банк, размер, статус обработки, категория и права доступа. Файлы также показывают, находятся ли они на диске, в базе данных или в обоих местах.',
          en: 'The table displays all your files with detailed information: name, bank, size, processing status, category, and access rights. Files also show whether they are on disk, in database, or in both locations.',
          kk: 'Кесте барлық файлдарыңызды толық ақпаратпен көрсетеді: атауы, банкі, өлшемі, өңдеу күйі, санаты және қол жеткізу құқықтары. Файлдар сонымен қатар дискіде, дерекқорда немесе екі жерде де екенін көрсетеді.',
        }),
      },
      actions: {
        title: t({
          ru: 'Действия с файлами',
          en: 'File Actions',
          kk: 'Файлдармен әрекеттер',
        }),
        description: t({
          ru: 'Для каждого файла доступны быстрые действия: просмотр, скачивание и дополнительное меню. Если вы владелец файла, то можете делиться им и управлять правами доступа.',
          en: "Each file has quick actions: view, download, and additional menu. If you're the file owner, you can share it and manage access permissions.",
          kk: 'Әрбір файл үшін жылдам әрекеттер қолжетімді: қарау, жүктеп алу және қосымша мәзір. Егер сіз файлдың иесі болсаңыз, онымен бөлісе аласыз және қол жеткізу құқықтарын басқара аласыз.',
        }),
      },
      categories: {
        title: t({
          ru: 'Категории файлов',
          en: 'File Categories',
          kk: 'Файл санаттары',
        }),
        description: t({
          ru: 'Назначайте категории файлам для лучшей организации. Выберите категорию из выпадающего списка для каждого файла. Вы можете создавать и управлять категориями в разделе настроек.',
          en: 'Assign categories to files for better organization. Select a category from the dropdown for each file. You can create and manage categories in settings.',
          kk: 'Жақсы ұйымдастыру үшін файлдарға санаттарды тағайындаңыз. Әрбір файл үшін ашылмалы тізімнен санатты таңдаңыз. Баптауларда санаттарды жасай және басқара аласыз.',
        }),
      },
      permissions: {
        title: t({
          ru: 'Права доступа',
          en: 'Access Permissions',
          kk: 'Қол жеткізу құқықтары',
        }),
        description: t({
          ru: 'Столбец показывает ваши права на файл: владелец, редактор, наблюдатель или загрузчик. Файлы с общим доступом отмечены значком и количеством ссылок для общего доступа.',
          en: 'The column shows your file permissions: owner, editor, viewer, or downloader. Shared files are marked with an icon and the number of shared links.',
          kk: 'Баған файлға құқықтарыңызды көрсетеді: иесі, редактор, бақылаушы немесе жүктеуші. Ортақ файлдар белгішемен және ортақ сілтемелер санымен белгіленген.',
        }),
      },
      completed: {
        title: t({
          ru: 'Отлично!',
          en: 'Great!',
          kk: 'Тамаша!',
        }),
        description: t({
          ru: 'Теперь вы знаете, как управлять файлами в хранилище. Используйте фильтры и категории для быстрого поиска нужных документов!',
          en: 'Now you know how to manage files in storage. Use filters and categories to quickly find the documents you need!',
          kk: 'Енді сіз қоймадағы файлдарды қалай басқаруды білесіз. Қажетті құжаттарды жылдам табу үшін сүзгілер мен санаттарды пайдаланыңыз!',
        }),
      },
    },
  },
} satisfies DeclarationContent;

export default storageTourContent;
