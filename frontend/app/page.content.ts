import { type Dictionary, t } from 'intlayer';

const content = {
  key: 'homePage',
  content: {
    tagline: t({
      ru: 'Профессиональная система обработки банковских выписок',
      en: 'A professional bank statement processing system',
      kk: 'Банк үзінділерін өңдеуге арналған кәсіби жүйе',
    }),
    description: t({
      ru: 'Автоматизируйте финансовые процессы с точностью и скоростью.',
      en: 'Automate financial workflows with speed and accuracy.',
      kk: 'Қаржылық үдерістерді жылдам әрі дәл автоматтандырыңыз.',
    }),
    login: t({
      ru: 'Войти',
      en: 'Log in',
      kk: 'Кіру',
    }),
    register: t({
      ru: 'Зарегистрироваться',
      en: 'Sign up',
      kk: 'Тіркелу',
    }),
  },
} satisfies Dictionary;

export default content;
