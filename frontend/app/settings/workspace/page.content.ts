import { t, type Dictionary } from 'intlayer';

const content = {
  key: 'settingsWorkspacePage',
  content: {
    authRequired: t({
      ru: 'Войдите, чтобы управлять рабочим пространством.',
      en: 'Log in to manage your workspace.',
      kk: 'Жұмыс кеңістігін басқару үшін кіріңіз.',
    }),
    title: t({
      ru: 'Рабочее пространство',
      en: 'Workspace',
      kk: 'Жұмыс кеңістігі',
    }),
    subtitle: t({
      ru: 'Приглашайте коллег по email и управляйте доступом.',
      en: 'Invite teammates by email and manage access.',
      kk: 'Әріптестерді email арқылы шақырып, қолжетімділікті басқарыңыз.',
    }),
    errors: {
      loadOverview: t({
        ru: 'Не удалось загрузить рабочее пространство',
        en: 'Failed to load workspace',
        kk: 'Жұмыс кеңістігін жүктеу мүмкін болмады',
      }),
      inviteFailed: t({
        ru: 'Не удалось отправить приглашение',
        en: 'Failed to send invitation',
        kk: 'Шақыруды жіберу мүмкін болмады',
      }),
      copyFailed: t({
        ru: 'Не удалось скопировать ссылку',
        en: 'Failed to copy link',
        kk: 'Сілтемені көшіру мүмкін болмады',
      }),
    },
    toasts: {
      inviteSent: t({ ru: 'Приглашение отправлено', en: 'Invitation sent', kk: 'Шақыру жіберілді' }),
      linkCopied: t({ ru: 'Ссылка скопирована', en: 'Link copied', kk: 'Сілтеме көшірілді' }),
    },
    roles: {
      owner: t({ ru: 'Владелец', en: 'Owner', kk: 'Иесі' }),
      admin: t({ ru: 'Администратор', en: 'Admin', kk: 'Әкімші' }),
      member: t({ ru: 'Участник', en: 'Member', kk: 'Мүше' }),
      roleLabel: t({ ru: 'Роль', en: 'Role', kk: 'Рөл' }),
    },
    members: {
      title: t({ ru: 'Участники', en: 'Members', kk: 'Қатысушылар' }),
    },
    invite: {
      title: t({ ru: 'Пригласить по email', en: 'Invite by email', kk: 'Email арқылы шақыру' }),
      onlyAdminHint: t({
        ru: 'Только владелец или администратор может отправлять приглашения.',
        en: 'Only the owner or an admin can send invitations.',
        kk: 'Шақыруларды тек иесі немесе әкімші жібере алады.',
      }),
      send: t({ ru: 'Отправить приглашение', en: 'Send invitation', kk: 'Шақыру жіберу' }),
      inviteLinkLabel: t({ ru: 'Ссылка на приглашение', en: 'Invitation link', kk: 'Шақыру сілтемесі' }),
    },
    pending: {
      title: t({ ru: 'Ожидающие приглашения', en: 'Pending invitations', kk: 'Күтілетін шақырулар' }),
      empty: t({ ru: 'Пока нет активных приглашений.', en: 'No active invitations yet.', kk: 'Әзірше белсенді шақырулар жоқ.' }),
      validUntil: t({ ru: 'Действительно до', en: 'Valid until', kk: 'Мерзімі' }),
      copyLink: t({ ru: 'Копировать ссылку', en: 'Copy link', kk: 'Сілтемені көшіру' }),
    },
  },
} satisfies Dictionary;

export default content;

