import { type Dictionary, t } from 'intlayer';

const content = {
  key: 'navigation',
  content: {
    nav: {
      statements: t({
        ru: 'Выписки',
        en: 'Statements',
        kk: 'Үзінділер',
      }),
      storage: t({
        ru: 'Хранилище',
        en: 'Storage',
        kk: 'Қойма',
      }),
      dataEntry: t({
        ru: 'Ввод данных',
        en: 'Data entry',
        kk: 'Деректерді енгізу',
      }),
      tables: t({
        ru: 'Таблицы',
        en: 'Tables',
        kk: 'Кестелер',
      }),
      reports: t({
        ru: 'Отчёты',
        en: 'Reports',
        kk: 'Есептер',
      }),
      categories: t({
        ru: 'Категории',
        en: 'Categories',
        kk: 'Санаттар',
      }),
    },
    userMenu: {
      profile: t({
        ru: 'Профиль',
        en: 'Profile',
        kk: 'Профиль',
      }),
      settings: t({
        ru: 'Настройки',
        en: 'Settings',
        kk: 'Баптаулар',
      }),
      workspace: t({
        ru: 'Рабочее пространство',
        en: 'Workspace',
        kk: 'Жұмыс кеңістігі',
      }),
      integrations: t({
        ru: 'Интеграции',
        en: 'Integrations',
        kk: 'Интеграциялар',
      }),
      admin: t({
        ru: 'Админка',
        en: 'Admin',
        kk: 'Админка',
      }),
      logout: t({
        ru: 'Выйти',
        en: 'Log out',
        kk: 'Шығу',
      }),
      logoutSuccess: t({
        ru: 'Вы успешно вышли из системы',
        en: 'You have successfully logged out',
        kk: 'Сіз жүйеден сәтті шықтыңыз',
      }),
      language: t({
        ru: 'Язык',
        en: 'Language',
        kk: 'Тіл',
      }),
    },
    languageModal: {
      sectionLabel: t({
        ru: 'Интерфейс',
        en: 'Interface',
        kk: 'Интерфейс',
      }),
      title: t({
        ru: 'Выбор языка',
        en: 'Choose language',
        kk: 'Тілді таңдау',
      }),
      back: t({
        ru: 'Назад',
        en: 'Back',
        kk: 'Артқа',
      }),
      currentLanguageLabel: t({
        ru: 'Текущий язык',
        en: 'Current language',
        kk: 'Ағымдағы тіл',
      }),
      defaultLanguageNote: t({
        ru: 'По умолчанию',
        en: 'Default',
        kk: 'Әдепкі',
      }),
      changeLanguage: t({
        ru: 'Сменить язык',
        en: 'Change language',
        kk: 'Тілді өзгерту',
      }),
      availableLanguagesLabel: t({
        ru: 'Доступные языки',
        en: 'Available languages',
        kk: 'Қолжетімді тілдер',
      }),
      chooseAction: t({
        ru: 'Выбрать',
        en: 'Select',
        kk: 'Таңдау',
      }),
      scrollHint: t({
        ru: 'Прокрутите список и выберите язык.',
        en: 'Scroll the list and choose a language.',
        kk: 'Тізімді жылжытып, тілді таңдаңыз.',
      }),
      footerHint: t({
        ru: 'Переводы будут добавлены на следующем этапе.',
        en: 'Translations will be added in the next step.',
        kk: 'Аудармалар келесі кезеңде қосылады.',
      }),
      cancel: t({
        ru: 'Отмена',
        en: 'Cancel',
        kk: 'Болдырмау',
      }),
      save: t({
        ru: 'Сохранить',
        en: 'Save',
        kk: 'Сақтау',
      }),
      savedToastPrefix: t({
        ru: 'Язык выбран',
        en: 'Language selected',
        kk: 'Тіл таңдалды',
      }),
    },
    languages: {
      ru: t({ ru: 'Русский', en: 'Russian', kk: 'Орысша' }),
      en: t({ ru: 'English', en: 'English', kk: 'English' }),
      kk: t({ ru: 'Қазақша', en: 'Kazakh', kk: 'Қазақша' }),
    },
  },
} satisfies Dictionary;

export default content;
