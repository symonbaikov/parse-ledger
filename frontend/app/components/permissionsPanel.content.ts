import { type Dictionary, t } from 'intlayer';

const content = {
  key: 'permissionsPanel',
  content: {
    title: t({ ru: 'Права доступа', en: 'Permissions', kk: 'Қолжетімділік құқықтары' }),
    grantAccess: t({ ru: 'Предоставить доступ', en: 'Grant access', kk: 'Қолжетімділік беру' }),
    empty: t({
      ru: 'Пока никому не предоставлен доступ к этому файлу',
      en: 'No one has been granted access to this file yet',
      kk: 'Бұл файлға әзірге ешкімге қолжетімділік берілген жоқ',
    }),
    confirmRevoke: t({
      ru: 'Вы уверены, что хотите отозвать права доступа?',
      en: 'Are you sure you want to revoke access?',
      kk: 'Қолжетімділікті қайтарып алғыңыз келетініне сенімдісіз бе?',
    }),
    errors: {
      grantFailed: t({
        ru: 'Не удалось предоставить доступ',
        en: 'Failed to grant access',
        kk: 'Қолжетімділік беру мүмкін болмады',
      }),
      updateFailed: t({
        ru: 'Не удалось обновить права',
        en: 'Failed to update permissions',
        kk: 'Құқықтарды жаңарту мүмкін болмады',
      }),
    },
    table: {
      user: t({ ru: 'Пользователь', en: 'User', kk: 'Пайдаланушы' }),
      rights: t({ ru: 'Права', en: 'Rights', kk: 'Құқықтар' }),
      canReshare: t({ ru: 'Может поделиться', en: 'Can reshare', kk: 'Бөлісе алады' }),
      expires: t({ ru: 'Срок действия', en: 'Expires', kk: 'Мерзімі' }),
      grantedBy: t({ ru: 'Предоставил', en: 'Granted by', kk: 'Берген' }),
      createdAt: t({ ru: 'Создано', en: 'Created', kk: 'Құрылған' }),
      actions: t({ ru: 'Действия', en: 'Actions', kk: 'Әрекеттер' }),
    },
    values: {
      yes: t({ ru: 'Да', en: 'Yes', kk: 'Иә' }),
      no: t({ ru: 'Нет', en: 'No', kk: 'Жоқ' }),
      forever: t({ ru: 'Бессрочно', en: 'Forever', kk: 'Мерзімсіз' }),
    },
    tooltips: {
      edit: t({ ru: 'Редактировать', en: 'Edit', kk: 'Өзгерту' }),
      revoke: t({ ru: 'Отозвать', en: 'Revoke', kk: 'Қайтарып алу' }),
    },
    permission: {
      owner: t({ ru: 'Владелец', en: 'Owner', kk: 'Иесі' }),
      editor: t({ ru: 'Редактор', en: 'Editor', kk: 'Өңдеуші' }),
      viewer: t({ ru: 'Просмотр', en: 'Viewer', kk: 'Қараушы' }),
      downloader: t({ ru: 'Скачивание', en: 'Download', kk: 'Жүктеу' }),
      editorLong: t({ ru: 'Редактирование', en: 'Editing', kk: 'Өңдеу' }),
      viewDownloadLong: t({
        ru: 'Просмотр и скачивание',
        en: 'View and download',
        kk: 'Қарау және жүктеу',
      }),
      default: t({ ru: 'Права', en: 'Permissions', kk: 'Құқықтар' }),
    },
    dialogs: {
      grantTitle: t({ ru: 'Предоставить доступ', en: 'Grant access', kk: 'Қолжетімділік беру' }),
      editTitle: t({
        ru: 'Редактировать права доступа',
        en: 'Edit permissions',
        kk: 'Қолжетімділік құқықтарын өзгерту',
      }),
      userIdOrEmail: t({
        ru: 'Email или ID пользователя',
        en: 'User email or ID',
        kk: 'Пайдаланушы email немесе ID',
      }),
      userIdOrEmailHelp: t({
        ru: 'Введите email пользователя, которому хотите предоставить доступ',
        en: 'Enter the email of the user you want to grant access to',
        kk: 'Қолжетімділік бергіңіз келетін пайдаланушының email енгізіңіз',
      }),
      accessLevel: t({ ru: 'Уровень доступа', en: 'Access level', kk: 'Қолжетімділік деңгейі' }),
      expiresAt: t({
        ru: 'Срок действия (опционально)',
        en: 'Expiration (optional)',
        kk: 'Жарамдылық мерзімі (міндетті емес)',
      }),
      expiresAtHelp: t({
        ru: 'Оставьте пустым для бессрочного доступа',
        en: 'Leave empty for no expiration',
        kk: 'Мерзімсіз қолжетімділік үшін бос қалдырыңыз',
      }),
      reshare: t({
        ru: 'Разрешить делиться с другими',
        en: 'Allow sharing with others',
        kk: 'Басқалармен бөлісуге рұқсат беру',
      }),
      cancel: t({ ru: 'Отмена', en: 'Cancel', kk: 'Болдырмау' }),
      save: t({ ru: 'Сохранить', en: 'Save', kk: 'Сақтау' }),
      grant: t({ ru: 'Предоставить доступ', en: 'Grant access', kk: 'Қолжетімділік беру' }),
    },
  },
} satisfies Dictionary;

export default content;
