import { type Dictionary, t } from 'intlayer';

const content = {
  key: 'shareDialog',
  content: {
    createTitle: t({
      ru: 'Создать новую ссылку',
      en: 'Create a new link',
      kk: 'Жаңа сілтеме жасау',
    }),
    accessLevel: {
      label: t({ ru: 'Уровень доступа', en: 'Access level', kk: 'Қолжетімділік деңгейі' }),
      view: t({ ru: 'Только просмотр', en: 'View only', kk: 'Тек қарау' }),
      download: t({
        ru: 'Просмотр и скачивание',
        en: 'View and download',
        kk: 'Қарау және жүктеу',
      }),
      edit: t({ ru: 'Полный доступ', en: 'Full access', kk: 'Толық қолжетімділік' }),
    },
    expiresAt: t({
      ru: 'Срок действия (опционально)',
      en: 'Expiration (optional)',
      kk: 'Жарамдылық мерзімі (міндетті емес)',
    }),
    password: {
      label: t({
        ru: 'Пароль (опционально)',
        en: 'Password (optional)',
        kk: 'Құпиясөз (міндетті емес)',
      }),
      help: t({
        ru: 'Добавьте пароль для дополнительной защиты',
        en: 'Add a password for extra protection',
        kk: 'Қосымша қорғаныс үшін құпиясөз қосыңыз',
      }),
    },
    description: {
      label: t({
        ru: 'Описание (опционально)',
        en: 'Description (optional)',
        kk: 'Сипаттама (міндетті емес)',
      }),
      help: t({
        ru: 'Добавьте заметку о том, для кого эта ссылка',
        en: 'Add a note about who this link is for',
        kk: 'Бұл сілтеме кімге арналғанын көрсететін жазба қосыңыз',
      }),
    },
    allowAnonymous: t({
      ru: 'Разрешить доступ по ссылке без авторизации',
      en: 'Allow access via link without login',
      kk: 'Кірусіз сілтеме арқылы қол жеткізуге рұқсат беру',
    }),
    createButton: t({ ru: 'Создать ссылку', en: 'Create link', kk: 'Сілтеме жасау' }),
    createdCopied: t({
      ru: 'Ссылка создана и скопирована в буфер обмена!',
      en: 'Link created and copied to clipboard!',
      kk: 'Сілтеме жасалып, алмасу буферіне көшірілді!',
    }),
    activeLinks: t({ ru: 'Активные ссылки', en: 'Active links', kk: 'Белсенді сілтемелер' }),
    noLinks: t({
      ru: 'Пока нет активных ссылок для этого файла',
      en: 'There are no active links for this file yet',
      kk: 'Бұл файл үшін белсенді сілтемелер әзірге жоқ',
    }),
    untilPrefix: t({ ru: 'До', en: 'Until', kk: 'Дейін' }),
    createdPrefix: t({ ru: 'Создана', en: 'Created', kk: 'Құрылды' }),
    visitsPrefix: t({ ru: 'Переходов', en: 'Visits', kk: 'Өтулер' }),
    tooltips: {
      copy: t({ ru: 'Копировать ссылку', en: 'Copy link', kk: 'Сілтемені көшіру' }),
      delete: t({ ru: 'Удалить', en: 'Delete', kk: 'Жою' }),
    },
    permissionLabel: {
      view: t({ ru: 'Просмотр', en: 'View', kk: 'Қарау' }),
      download: t({ ru: 'Просмотр и скачивание', en: 'View & download', kk: 'Қарау және жүктеу' }),
      edit: t({ ru: 'Полный доступ', en: 'Full access', kk: 'Толық қолжетімділік' }),
    },
    statusLabel: {
      active: t({ ru: 'Активна', en: 'Active', kk: 'Белсенді' }),
      expired: t({ ru: 'Истекла', en: 'Expired', kk: 'Мерзімі өтті' }),
    },
  },
} satisfies Dictionary;

export default content;
