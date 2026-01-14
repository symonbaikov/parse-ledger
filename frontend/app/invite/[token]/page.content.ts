import { type Dictionary, t } from 'intlayer';

const content = {
  key: 'invitePage',
  content: {
    invalidLink: t({
      ru: 'Некорректная ссылка приглашения',
      en: 'Invalid invitation link',
      kk: 'Шақыру сілтемесі дұрыс емес',
    }),
    title: t({
      ru: 'Приглашение в рабочее пространство',
      en: 'Workspace invitation',
      kk: 'Жұмыс кеңістігіне шақыру',
    }),
    subtitle: t({
      ru: 'Чтобы принять приглашение, войдите или зарегистрируйтесь под указанным email.',
      en: 'To accept the invitation, log in or sign up with the invited email.',
      kk: 'Шақыруды қабылдау үшін көрсетілген email арқылы кіріңіз немесе тіркеліңіз.',
    }),
    details: {
      workspace: t({ ru: 'Рабочее пространство', en: 'Workspace', kk: 'Workspace' }),
      role: t({ ru: 'Роль', en: 'Role', kk: 'Рөл' }),
      expiresAt: t({ ru: 'Действует до', en: 'Expires at', kk: 'Дейін жарамды' }),
      email: t({ ru: 'Кому отправлено', en: 'Sent to', kk: 'Кімге жіберілді' }),
    },
    statusMessages: {
      accepted: t({
        ru: 'Это приглашение уже принято.',
        en: 'This invitation has already been accepted.',
        kk: 'Бұл шақыру қабылданған.',
      }),
      expired: t({
        ru: 'Срок действия приглашения истёк.',
        en: 'This invitation has expired.',
        kk: 'Шақырудың мерзімі аяқталды.',
      }),
      cancelled: t({
        ru: 'Это приглашение было отозвано.',
        en: 'This invitation was revoked.',
        kk: 'Бұл шақыру кері қайтарылды.',
      }),
      pending: t({
        ru: 'Приглашение активно.',
        en: 'Invitation is active.',
        kk: 'Шақыру белсенді.',
      }),
    },
    actions: {
      login: t({ ru: 'Войти', en: 'Log in', kk: 'Кіру' }),
      register: t({ ru: 'Зарегистрироваться', en: 'Sign up', kk: 'Тіркелу' }),
      accept: t({ ru: 'Принять приглашение', en: 'Accept invitation', kk: 'Шақыруды қабылдау' }),
      loginAnother: t({
        ru: 'Войти другим аккаунтом',
        en: 'Log in with another account',
        kk: 'Басқа аккаунтпен кіру',
      }),
      goToApp: t({ ru: 'Перейти в приложение', en: 'Go to app', kk: 'Қосымшаға өту' }),
    },
    messages: {
      acceptedFallback: t({
        ru: 'Приглашение принято. Добро пожаловать!',
        en: 'Invitation accepted. Welcome!',
        kk: 'Шақыру қабылданды. Қош келдіңіз!',
      }),
      wrongAccount: t({
        ru: 'Вам нужно войти как',
        en: 'You need to log in as',
        kk: 'Кіру қажет аккаунт',
      }),
    },
    errors: {
      loadFailed: t({
        ru: 'Не удалось загрузить приглашение',
        en: 'Failed to load invitation',
        kk: 'Шақыруды жүктеу мүмкін болмады',
      }),
      acceptFailed: t({
        ru: 'Не удалось принять приглашение',
        en: 'Failed to accept invitation',
        kk: 'Шақыруды қабылдау мүмкін болмады',
      }),
    },
  },
} satisfies Dictionary;

export default content;
