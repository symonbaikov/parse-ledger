import { type DeclarationContent, t } from 'intlayer';

/**
 * Контент для тура по отчётам
 */
export const reportsTourContent = {
  key: 'reports-tour-content',
  content: {
    name: t({
      ru: 'Тур по отчётам',
      en: 'Reports Tour',
      kk: 'Есептер туры',
    }),
    description: t({
      ru: 'Анализ финансов и визуализация данных',
      en: 'Analyze finances and visualize data',
      kk: 'Қаржыны талдау және деректерді визуализациялау',
    }),
    steps: {
      welcome: {
        title: t({
          ru: 'Добро пожаловать в отчёты',
          en: 'Welcome to Reports',
          kk: 'Есептерге қош келдіңіз',
        }),
        description: t({
          ru: 'Здесь вы быстро понимаете, что происходит с деньгами: суммы, тренды и детализация. В этом туре пройдём 3 источника данных и ключевые метрики.',
          en: 'This page helps you understand totals, trends, and details. This tour covers all 3 data sources and the key metrics.',
          kk: 'Бұл бетте жиынтықтар, трендтер және детализация бар. Бұл тур 3 дереккөзді және негізгі метрикаларды көрсетеді.',
        }),
      },

      tabsOverview: {
        title: t({
          ru: 'Вкладки отчётов',
          en: 'Report Tabs',
          kk: 'Есеп қойындылары',
        }),
        description: t({
          ru: 'Здесь три источника данных: Google Sheets, Локально (кастомные таблицы) и Парсинг выписок. Сейчас пройдём все три — и вы кликнете по каждой вкладке.',
          en: 'There are 3 data sources: Google Sheets, Local (custom tables), and Statements parsing. We will visit all of them — you will click each tab.',
          kk: '3 дереккөз бар: Google Sheets, Local (кастом кестелер) және үзінділерді парсинг. Үшеуін де қараймыз — әр қойындыны басасыз.',
        }),
      },

      tabSheetsClick: {
        title: t({
          ru: 'Вкладка: Google Sheets',
          en: 'Tab: Google Sheets',
          kk: 'Қойынды: Google Sheets',
        }),
        description: t({
          ru: 'Нажмите вкладку Google Sheets, чтобы посмотреть отчёт по данным из подключённых таблиц.',
          en: 'Click Google Sheets to view reports from connected sheets.',
          kk: 'Google Sheets қойындысын басып, қосылған кестелер бойынша есепті ашыңыз.',
        }),
      },

      sheetsDays: {
        title: t({
          ru: 'Окно времени',
          en: 'Time Window',
          kk: 'Уақыт терезесі',
        }),
        description: t({
          ru: 'Выберите период (7/30/90 дней) и обновите данные. Все графики и карточки ниже пересчитываются под выбранное окно.',
          en: 'Pick 7/30/90 days and refresh. Everything below updates for that window.',
          kk: '7/30/90 күнді таңдаңыз және жаңартыңыз. Төмендегі барлық графиктер сол терезеге сай есептеледі.',
        }),
      },

      sheetsTotals: {
        title: t({
          ru: 'Ключевые метрики',
          en: 'Key Metrics',
          kk: 'Негізгі метрикалар',
        }),
        description: t({
          ru: 'Доход — сумма положительных операций, Расход — сумма отрицательных. Net = Доход − Расход. Rows — количество строк/операций, попавших в отчёт.',
          en: 'Income is positive amounts, Expense is negative amounts. Net = Income − Expense. Rows is the number of included operations.',
          kk: 'Income — оң сома, Expense — теріс сома. Net = Income − Expense. Rows — есепке кірген операция саны.',
        }),
      },

      sheetsTrend: {
        title: t({
          ru: 'Тренд по дням',
          en: 'Daily Trend',
          kk: 'Күндік тренд',
        }),
        description: t({
          ru: 'График показывает динамику доходов и расходов по дням. Наведите курсор, чтобы увидеть точные значения за конкретную дату.',
          en: 'This chart shows income/expense over time. Hover to see exact values for a date.',
          kk: 'График кіріс/шығыс динамикасын көрсетеді. Нақты күнді көру үшін hover жасаңыз.',
        }),
      },

      sheetsExpenseCategories: {
        title: t({
          ru: 'Расходы по категориям',
          en: 'Expenses by Category',
          kk: 'Санат бойынша шығын',
        }),
        description: t({
          ru: 'Круговая диаграмма показывает, какие категории дают наибольший вклад в расходы. Это помогает быстро найти «где утекает бюджет».',
          en: 'The pie chart shows which categories drive your expenses.',
          kk: 'Дөңгелек диаграмма шығындардың негізгі санаттарын көрсетеді.',
        }),
      },

      sheetsIncomeCounterparty: {
        title: t({
          ru: 'Доход по контрагентам',
          en: 'Income by Counterparty',
          kk: 'Контрагент бойынша кіріс',
        }),
        description: t({
          ru: 'Столбчатая диаграмма показывает, кто приносит больше всего дохода. Используйте это для оценки источников выручки.',
          en: 'This bar chart shows who contributes the most income.',
          kk: 'Бағанды диаграмма ең көп кіріс әкелетін контрагенттерді көрсетеді.',
        }),
      },

      sheetsLastOperations: {
        title: t({
          ru: 'Последние операции',
          en: 'Recent Operations',
          kk: 'Соңғы операциялар',
        }),
        description: t({
          ru: 'Быстрая проверка «что изменилось» и свежих движений. Удобно для сверки и поиска аномалий.',
          en: 'A quick view of the most recent changes and movements.',
          kk: 'Соңғы өзгерістерді тез көруге арналған бөлім.',
        }),
      },

      tabLocalClick: {
        title: t({
          ru: 'Вкладка: Локально',
          en: 'Tab: Local',
          kk: 'Қойынды: Local',
        }),
        description: t({
          ru: 'Нажмите «Локально», чтобы построить отчёт по данным из кастомных таблиц (созданных в приложении).',
          en: 'Click Local to build a report from custom tables created in the app.',
          kk: 'Local қойындысын басып, қолданбадағы кастом кестелер бойынша есеп құрыңыз.',
        }),
      },

      localTables: {
        title: t({
          ru: 'Выбор таблиц',
          en: 'Select Tables',
          kk: 'Кестелерді таңдау',
        }),
        description: t({
          ru: 'Здесь можно выбрать, какие таблицы участвуют в отчёте. Если выбрать несколько — отчёт агрегирует данные.',
          en: 'Pick which tables to include. Selecting multiple tables aggregates the data.',
          kk: 'Есепке кіретін кестелерді таңдаңыз. Бірнешеуін таңдасаңыз — дерек агрегатталады.',
        }),
      },

      localDays: {
        title: t({
          ru: 'Период для локальных данных',
          en: 'Local Time Window',
          kk: 'Local уақыт терезесі',
        }),
        description: t({
          ru: 'Выберите период и нажмите обновление — отчёт пересчитается для выбранных таблиц.',
          en: 'Choose days and refresh to recalculate the report for the selected tables.',
          kk: 'Күнді таңдаңыз және жаңартыңыз — таңдалған кестелер бойынша есеп қайта есептеледі.',
        }),
      },

      localTotals: {
        title: t({
          ru: 'Метрики (локально)',
          en: 'Metrics (Local)',
          kk: 'Метрикалар (Local)',
        }),
        description: t({
          ru: 'Те же показатели (Доход/Расход/Net/Rows), но только по выбранным локальным таблицам.',
          en: 'Same metrics (Income/Expense/Net/Rows), but limited to the selected local tables.',
          kk: 'Сол метрикалар, бірақ тек таңдалған local кестелер бойынша.',
        }),
      },

      localTrend: {
        title: t({
          ru: 'Тренд (локально)',
          en: 'Trend (Local)',
          kk: 'Тренд (Local)',
        }),
        description: t({
          ru: 'Смотрите динамику по дням, чтобы понять сезонность и пики расходов/доходов.',
          en: 'Use this trend to spot seasonality and spikes.',
          kk: 'Күндік динамика арқылы маусымдылық пен шыңдарды көріңіз.',
        }),
      },

      localExpenseCategories: {
        title: t({
          ru: 'Категории расходов (локально)',
          en: 'Expense Categories (Local)',
          kk: 'Шығын санаттары (Local)',
        }),
        description: t({
          ru: 'Распределение расходов по категориям для выбранных таблиц.',
          en: 'Expense category split for the selected tables.',
          kk: 'Таңдалған кестелер бойынша шығын санаттары.',
        }),
      },

      localIncomeCounterparty: {
        title: t({
          ru: 'Контрагенты (локально)',
          en: 'Counterparties (Local)',
          kk: 'Контрагенттер (Local)',
        }),
        description: t({
          ru: 'Показывает, от кого приходит доход по локальным данным.',
          en: 'Shows who your income comes from (local data).',
          kk: 'Local деректегі кіріс қайдан келетінін көрсетеді.',
        }),
      },

      localLastOperations: {
        title: t({
          ru: 'Последние операции (локально)',
          en: 'Recent Operations (Local)',
          kk: 'Соңғы операциялар (Local)',
        }),
        description: t({
          ru: 'Список последних записей из выбранных таблиц — удобно для контроля качества данных.',
          en: 'Latest records from your selected tables for quick QA.',
          kk: 'Таңдалған кестелердегі соңғы жазбалар — дерек сапасын тексеруге ыңғайлы.',
        }),
      },

      tabStatementsClick: {
        title: t({
          ru: 'Вкладка: Парсинг выписок',
          en: 'Tab: Statements',
          kk: 'Қойынды: Үзінділер',
        }),
        description: t({
          ru: 'Нажмите вкладку «Парсинг выписок», чтобы увидеть статистику по загруженным выпискам и их обработке.',
          en: 'Click Statements to see stats for uploaded statements and processing.',
          kk: 'Үзінділер қойындысын басып, жүктелген үзінділердің статистикасын көріңіз.',
        }),
      },

      statementsRefresh: {
        title: t({
          ru: 'Обновление данных',
          en: 'Refresh Data',
          kk: 'Деректі жаңарту',
        }),
        description: t({
          ru: 'Если вы только что загрузили файлы или ожидаете обновления статусов — нажмите обновить.',
          en: 'Refresh to fetch latest statuses and stats.',
          kk: 'Соңғы статустарды алу үшін жаңартыңыз.',
        }),
      },

      statementsPipeline: {
        title: t({
          ru: 'Статусы обработки',
          en: 'Processing Statuses',
          kk: 'Өңдеу статустары',
        }),
        description: t({
          ru: 'Карточки показывают, сколько файлов всего, сколько в обработке, сколько завершено и сколько с ошибкой.',
          en: 'Cards show how many files are total, processing, completed, and errored.',
          kk: 'Карточкалар жалпы/өңдеуде/аяқталды/қате санын көрсетеді.',
        }),
      },

      statementsTotals: {
        title: t({
          ru: 'Итоги по операциям',
          en: 'Totals',
          kk: 'Жиынтық',
        }),
        description: t({
          ru: 'Это агрегированные суммы по операциям из выписок за период: Доход, Расход, Net и количество операций.',
          en: 'Aggregated totals from statement transactions for the period.',
          kk: 'Үзінді операциялары бойынша жиынтық сома және операция саны.',
        }),
      },

      statementsUploadsTrend: {
        title: t({
          ru: 'Тренд загрузок',
          en: 'Uploads Trend',
          kk: 'Жүктеу тренді',
        }),
        description: t({
          ru: 'График показывает, как меняется объём загрузок/операций по датам. Удобно для контроля процесса.',
          en: 'Shows how uploads/volume changes over time.',
          kk: 'Уақыт бойынша жүктеу/көлем өзгерісін көрсетеді.',
        }),
      },

      statementsBanks: {
        title: t({
          ru: 'По банкам',
          en: 'By Bank',
          kk: 'Банк бойынша',
        }),
        description: t({
          ru: 'Диаграмма помогает понять распределение загрузок и ошибок по банкам.',
          en: 'Helps you see distribution by bank.',
          kk: 'Банк бойынша бөліністі көрсетеді.',
        }),
      },

      statementsStatuses: {
        title: t({
          ru: 'По статусам',
          en: 'By Status',
          kk: 'Статус бойынша',
        }),
        description: t({
          ru: 'Сводка по статусам обработки — быстро видно, где «застряло» или где есть ошибки.',
          en: 'A status breakdown shows where things are stuck or failing.',
          kk: 'Статус бойынша бөлу — қай жерде мәселе барын көрсетеді.',
        }),
      },

      statementsLatestUploads: {
        title: t({
          ru: 'Последние загрузки',
          en: 'Latest Uploads',
          kk: 'Соңғы жүктеулер',
        }),
        description: t({
          ru: 'Список последних файлов, статусов и ошибок. Отлично подходит для быстрого дебага.',
          en: 'Latest files, statuses, and errors for quick debugging.',
          kk: 'Соңғы файлдар, статустар және қателер — тез тексеруге.',
        }),
      },

      completed: {
        title: t({
          ru: 'Отлично!',
          en: 'Great!',
          kk: 'Тамаша!',
        }),
        description: t({
          ru: 'Готово! Вы посмотрели все 3 источника данных и ключевые метрики. Дальше можно углубляться: меняйте период, сравнивайте категории и проверяйте последние операции.',
          en: 'Done! You visited all 3 sources and the core metrics. Next: change the window, compare categories, and review recent operations.',
          kk: 'Дайын! 3 дереккөз және негізгі метрикалар қаралды. Енді периодты өзгертіп, категорияларды салыстырыңыз.',
        }),
      },
    },
  },
} satisfies DeclarationContent;

export default reportsTourContent;
