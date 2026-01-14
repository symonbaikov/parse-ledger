import { type Dictionary, t } from 'intlayer';

const content = {
  key: 'dataEntryPage',
  content: {
    currencies: {
      kzt: t({ ru: 'KZT (Казахстан)', en: 'KZT (Kazakhstan)', kk: 'KZT (Қазақстан)' }),
      usd: t({ ru: 'USD (США)', en: 'USD (USA)', kk: 'USD (АҚШ)' }),
      eur: t({ ru: 'EUR (Еврозона)', en: 'EUR (Eurozone)', kk: 'EUR (Еуроаймақ)' }),
      rub: t({ ru: 'RUB (Россия)', en: 'RUB (Russia)', kk: 'RUB (Ресей)' }),
    },
    tabs: {
      cash: {
        label: t({ ru: 'Наличные', en: 'Cash', kk: 'Қолма-қол' }),
        description: t({
          ru: 'Остатки наличных средств.',
          en: 'Cash balance.',
          kk: 'Қолма-қол қалдық.',
        }),
      },
      raw: {
        label: t({ ru: 'Сырьё', en: 'Raw materials', kk: 'Шикізат' }),
        description: t({
          ru: 'Остатки по сырью или материалам.',
          en: 'Raw materials or inventory balance.',
          kk: 'Шикізат немесе материалдар қалдығы.',
        }),
      },
      debit: {
        label: t({ ru: 'Дебет', en: 'Debit', kk: 'Дебет' }),
        description: t({
          ru: 'Дебетовые операции / приход.',
          en: 'Debit operations / income.',
          kk: 'Дебет операциялары / кіріс.',
        }),
      },
      credit: {
        label: t({ ru: 'Кредит', en: 'Credit', kk: 'Кредит' }),
        description: t({
          ru: 'Кредитовые операции / расход.',
          en: 'Credit operations / expense.',
          kk: 'Кредит операциялары / шығыс.',
        }),
      },
      custom: {
        label: t({ ru: 'Пользовательская', en: 'Custom', kk: 'Пайдаланушы' }),
        description: t({
          ru: 'Создайте пользовательскую вкладку (название + иконка). После создания она появится сверху рядом с другими вкладками.',
          en: 'Create a custom tab (name + icon). After creation, it will appear at the top next to other tabs.',
          kk: 'Пайдаланушы қойындысын жасаңыз (атауы + белгіше). Жасалғаннан кейін ол жоғарғы жақта басқа қойындылардың жанында пайда болады.',
        }),
      },
    },
    labels: {
      loading: t({ ru: 'Загрузка...', en: 'Loading...', kk: 'Жүктелуде...' }),
      loadingEllipsis: t({ ru: 'Загрузка…', en: 'Loading…', kk: 'Жүктелуде…' }),
      signInTitle: t({
        ru: 'Войдите, чтобы вводить данные.',
        en: 'Sign in to enter data.',
        kk: 'Деректер енгізу үшін кіріңіз.',
      }),
      signInSubtitle: t({
        ru: 'Авторизация необходима для сохранения записей.',
        en: 'Authentication is required to save entries.',
        kk: 'Жазбаларды сақтау үшін авторизация қажет.',
      }),
      title: t({ ru: 'Ввод данных', en: 'Data entry', kk: 'Деректер енгізу' }),
      subtitle: t({
        ru: 'Фиксируйте остатки налички, сырья и движения по дебету/кредиту.',
        en: 'Track cash and raw material balances, and debit/credit movements.',
        kk: 'Қолма-қол, шикізат қалдықтарын және дебет/кредит қозғалысын белгілеңіз.',
      }),
      tableActions: t({ ru: 'Действия с таблицами', en: 'Table actions', kk: 'Кесте әрекеттері' }),
      createTableForTabPrefix: t({
        ru: 'Создать таблицу по текущей вкладке — ',
        en: 'Create table for current tab — ',
        kk: 'Ағымдағы қойынды үшін кесте жасау — ',
      }),
      createSingleTable: t({
        ru: 'Создать единую таблицу по всей базе «Ввод данных»',
        en: 'Create one table for the entire “Data entry” database',
        kk: 'Бүкіл «Деректер енгізу» базасы үшін бір кесте жасау',
      }),
      syncing: t({ ru: 'Синхронизация…', en: 'Syncing…', kk: 'Синхрондалуда…' }),
      syncWithTablePrefix: t({
        ru: 'Синхронизировать с таблицей — ',
        en: 'Sync with table — ',
        kk: 'Кестемен синхрондау — ',
      }),
      dataEntryForTabPrefix: t({
        ru: 'Ввод данных для вкладки «',
        en: 'Data entry for tab “',
        kk: 'Қойынды үшін деректер енгізу «',
      }),
      dataEntryForTabSuffix: t({ ru: '».', en: '”.', kk: '».' }),
      columnNameLabel: t({ ru: 'Название колонки', en: 'Column name', kk: 'Баған атауы' }),
      columnNamePlaceholder: t({ ru: 'Например: Проект', en: 'e.g. Project', kk: 'Мысалы: Жоба' }),
      chooseIconTitle: t({ ru: 'Выбрать иконку', en: 'Choose icon', kk: 'Белгішені таңдау' }),
      iconLabel: t({ ru: 'Иконка', en: 'Icon', kk: 'Белгіше' }),
      create: t({ ru: 'Создать', en: 'Create', kk: 'Құру' }),
      uploadIcon: t({ ru: 'Загрузить иконку', en: 'Upload icon', kk: 'Белгішені жүктеу' }),
      myColumns: t({ ru: 'Мои колонки', en: 'My columns', kk: 'Менің бағандарым' }),
      piecesShort: t({ ru: 'шт', en: 'pcs', kk: 'дана' }),
      delete: t({ ru: 'Удалить', en: 'Delete', kk: 'Жою' }),
      noColumnsYet: t({
        ru: 'Пока нет созданных колонок',
        en: 'No columns created yet',
        kk: 'Әзірге жасалған бағандар жоқ',
      }),
      date: t({ ru: 'Дата', en: 'Date', kk: 'Күні' }),
      selectDate: t({ ru: 'Выберите дату', en: 'Select date', kk: 'Күнді таңдаңыз' }),
      amount: t({ ru: 'Сумма', en: 'Amount', kk: 'Сома' }),
      comment: t({ ru: 'Комментарий', en: 'Comment', kk: 'Түсініктеме' }),
      commentPlaceholder: t({
        ru: 'Например, инкассация / поставщик / склад',
        en: 'e.g. collection / supplier / warehouse',
        kk: 'Мысалы, инкассация / жеткізуші / қойма',
      }),
      currency: t({ ru: 'Валюта', en: 'Currency', kk: 'Валюта' }),
      saveEntry: t({ ru: 'Сохранить запись', en: 'Save entry', kk: 'Жазбаны сақтау' }),
      recentEntriesTitlePrefix: t({
        ru: 'Последние записи — ',
        en: 'Recent entries — ',
        kk: 'Соңғы жазбалар — ',
      }),
      recentEntriesHint: t({
        ru: 'Отображаются последние записи из базы',
        en: 'Shows the latest entries from the database',
        kk: 'Базадағы соңғы жазбалар көрсетіледі',
      }),
      searchEntriesPlaceholder: t({
        ru: 'Поиск по записям…',
        en: 'Search entries…',
        kk: 'Жазбалар бойынша іздеу…',
      }),
      clearSearchTitle: t({
        ru: 'Очистить поиск',
        en: 'Clear search',
        kk: 'Іздеуді тазалау',
      }),
      filterDateTitle: t({
        ru: 'Фильтр по дате',
        en: 'Filter by date',
        kk: 'Күн бойынша сүзгі',
      }),
      clearDateTitle: t({
        ru: 'Очистить дату',
        en: 'Clear date',
        kk: 'Күнді тазалау',
      }),
      loadingData: t({
        ru: 'Загрузка данных...',
        en: 'Loading data...',
        kk: 'Деректер жүктелуде...',
      }),
      noEntriesForTab: t({
        ru: 'Пока нет записей для этой вкладки',
        en: 'No entries for this tab yet',
        kk: 'Бұл қойынды үшін әзірге жазбалар жоқ',
      }),
      noEntriesFound: t({
        ru: 'Ничего не найдено',
        en: 'No results found',
        kk: 'Ештеңе табылмады',
      }),
      paginationPrev: t({ ru: 'Назад', en: 'Prev', kk: 'Артқа' }),
      paginationNext: t({ ru: 'Вперёд', en: 'Next', kk: 'Алға' }),
      paginationPageShort: t({ ru: 'Стр.', en: 'Page', kk: 'Бет' }),
      paginationShowingPrefix: t({ ru: 'Показано', en: 'Showing', kk: 'Көрсетілгені' }),
      paginationShowingOf: t({ ru: 'из', en: 'of', kk: 'ішінен' }),
      noComment: t({ ru: 'Без комментария', en: 'No comment', kk: 'Түсініктеме жоқ' }),
      deleteTabTitle: t({ ru: 'Удалить вкладку', en: 'Delete tab', kk: 'Қойындыны жою' }),
      deleteEntryTitle: t({ ru: 'Удалить запись', en: 'Delete entry', kk: 'Жазбаны жою' }),
      tabLabel: t({ ru: 'Вкладка:', en: 'Tab:', kk: 'Қойынды:' }),
      tabHasDataPrefix: t({
        ru: 'Внутри есть данные (',
        en: 'This tab contains data (',
        kk: 'Ішінде деректер бар (',
      }),
      tabHasDataSuffix: t({
        ru: '). Перед удалением можно скопировать их в таблицу.',
        en: '). Before deleting, you can copy them into a table.',
        kk: '). Жоймас бұрын оларды кестеге көшіруге болады.',
      }),
      tabNoData: t({
        ru: 'Данных нет — вкладка будет удалена.',
        en: 'No data — the tab will be deleted.',
        kk: 'Деректер жоқ — қойынды жойылады.',
      }),
      copying: t({ ru: 'Копирование…', en: 'Copying…', kk: 'Көшірілуде…' }),
      copyAndDelete: t({
        ru: 'Скопировать в таблицу и удалить',
        en: 'Copy to table and delete',
        kk: 'Кестеге көшіріп, жою',
      }),
      deleting: t({ ru: 'Удаление…', en: 'Deleting…', kk: 'Жойылуда…' }),
      cancel: t({ ru: 'Отмена', en: 'Cancel', kk: 'Бас тарту' }),
      iconAlt: t({ ru: 'иконка', en: 'icon', kk: 'белгіше' }),
    },
    errors: {
      useColumnCreationForTab: t({
        ru: 'Для этой вкладки используйте создание колонки',
        en: 'Use column creation for this tab',
        kk: 'Бұл қойынды үшін баған құруды пайдаланыңыз',
      }),
      fillDateAndAmount: t({
        ru: 'Заполните дату и сумму',
        en: 'Fill in date and amount',
        kk: 'Күн мен соманы толтырыңыз',
      }),
      amountMustBeNumber: t({
        ru: 'Сумма должна быть числом',
        en: 'Amount must be a number',
        kk: 'Сома сан болуы керек',
      }),
      saveFailed: t({
        ru: 'Не удалось сохранить данные',
        en: 'Failed to save data',
        kk: 'Деректерді сақтау мүмкін болмады',
      }),
      loadEntriesFailed: t({
        ru: 'Не удалось загрузить записи',
        en: 'Failed to load entries',
        kk: 'Жазбаларды жүктеу мүмкін болмады',
      }),
      loadCustomColumnsFailed: t({
        ru: 'Не удалось загрузить пользовательские колонки',
        en: 'Failed to load custom columns',
        kk: 'Пайдаланушы бағандарын жүктеу мүмкін болмады',
      }),
      loadTablesFailed: t({
        ru: 'Не удалось загрузить таблицы',
        en: 'Failed to load tables',
        kk: 'Кестелерді жүктеу мүмкін болмады',
      }),
      columnNameRequired: t({
        ru: 'Укажите название колонки',
        en: 'Enter column name',
        kk: 'Баған атауын көрсетіңіз',
      }),
      createColumnFailed: t({
        ru: 'Не удалось создать колонку',
        en: 'Failed to create column',
        kk: 'Бағанды құру мүмкін болмады',
      }),
      deleteColumnFailed: t({
        ru: 'Не удалось удалить колонку',
        en: 'Failed to delete column',
        kk: 'Бағанды жою мүмкін болмады',
      }),
      copyToTableFailed: t({
        ru: 'Не удалось скопировать в таблицу',
        en: 'Failed to copy to table',
        kk: 'Кестеге көшіру мүмкін болмады',
      }),
      deleteTabFailed: t({
        ru: 'Не удалось удалить вкладку',
        en: 'Failed to delete tab',
        kk: 'Қойындыны жою мүмкін болмады',
      }),
      uploadIconFailed: t({
        ru: 'Не удалось загрузить иконку',
        en: 'Failed to upload icon',
        kk: 'Белгішені жүктеу мүмкін болмады',
      }),
      syncFailed: t({
        ru: 'Не удалось синхронизировать',
        en: 'Failed to sync',
        kk: 'Синхрондау мүмкін болмады',
      }),
      createTableFailed: t({
        ru: 'Не удалось создать таблицу',
        en: 'Failed to create table',
        kk: 'Кесте жасау мүмкін болмады',
      }),
      deleteEntryFailed: t({
        ru: 'Не удалось удалить запись',
        en: 'Failed to delete entry',
        kk: 'Жазбаны жою мүмкін болмады',
      }),
    },
    status: {
      dataSaved: t({ ru: 'Данные сохранены', en: 'Data saved', kk: 'Деректер сақталды' }),
      entrySaved: t({ ru: 'Запись сохранена', en: 'Entry saved', kk: 'Жазба сақталды' }),
      columnCreated: t({
        ru: 'Пользовательская колонка создана',
        en: 'Custom column created',
        kk: 'Пайдаланушы бағаны құрылды',
      }),
      columnCreatedToast: t({ ru: 'Колонка создана', en: 'Column created', kk: 'Баған құрылды' }),
      columnDeleted: t({ ru: 'Колонка удалена', en: 'Column deleted', kk: 'Баған жойылды' }),
      tabDeleted: t({ ru: 'Вкладка удалена', en: 'Tab deleted', kk: 'Қойынды жойылды' }),
      entryDeleted: t({ ru: 'Запись удалена', en: 'Entry deleted', kk: 'Жазба жойылды' }),
      synced: t({ ru: 'Синхронизировано', en: 'Synced', kk: 'Синхрондалды' }),
      syncedWithRowsPrefix: t({ ru: 'Синхронизировано (', en: 'Synced (', kk: 'Синхрондалды (' }),
      syncedWithRowsSuffix: t({ ru: ' строк)', en: ' rows)', kk: ' жол)' }),
    },
  },
} satisfies Dictionary;

export default content;
