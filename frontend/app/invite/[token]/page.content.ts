import { t, type Dictionary } from 'intlayer';

const content = {
  key: 'invitePage',
  content: {
    invalidLink: t({ ru: 'Некорректная ссылка приглашения', en: 'Invalid invitation link', kk: 'Шақыру сілтемесі дұрыс емес' }),
    title: t({ ru: 'Присоединиться к рабочему пространству', en: 'Join workspace', kk: 'Жұмыс кеңістігіне қосылу' }),
    subtitle: t({
      ru: 'Если у вас уже есть аккаунт на этот email, заполнение имени и пароля не обязательно. Новым пользователям потребуется задать пароль.',
      en: 'If you already have an account for this email, name and password are optional. New users will need to set a password.',
      kk: 'Егер осы email үшін аккаунтыңыз болса, аты мен құпиясөз міндетті емес. Жаңа пайдаланушыларға құпиясөз қою керек.',
    }),
    fields: {
      name: t({ ru: 'Имя', en: 'Name', kk: 'Аты' }),
      password: t({ ru: 'Пароль', en: 'Password', kk: 'Құпиясөз' }),
      passwordHelp: t({
        ru: 'Минимум 8 символов (только для новых аккаунтов)',
        en: 'Minimum 8 characters (new accounts only)',
        kk: 'Кемінде 8 таңба (тек жаңа аккаунттар үшін)',
      }),
    },
    actions: {
      login: t({ ru: 'Войти', en: 'Log in', kk: 'Кіру' }),
      accept: t({ ru: 'Принять приглашение', en: 'Accept invitation', kk: 'Шақыруды қабылдау' }),
    },
    messages: {
      acceptedFallback: t({
        ru: 'Приглашение принято. Теперь можно войти в систему.',
        en: 'Invitation accepted. You can now log in.',
        kk: 'Шақыру қабылданды. Енді жүйеге кіре аласыз.',
      }),
    },
    errors: {
      acceptFailed: t({ ru: 'Не удалось принять приглашение', en: 'Failed to accept invitation', kk: 'Шақыруды қабылдау мүмкін болмады' }),
    },
  },
} satisfies Dictionary;

export default content;

