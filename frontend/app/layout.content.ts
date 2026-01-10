import { t, type Dictionary } from 'intlayer';

const content = {
  key: 'layout',
  content: {
    title: t({
      ru: 'FinFlow — Обработка банковских выписок',
      en: 'FinFlow — Bank statement processing',
      kk: 'FinFlow — Банктік үзінділерді өңдеу',
    }),
    description: t({
      ru: 'Система автоматической обработки банковских выписок',
      en: 'Automatic bank statement processing system',
      kk: 'Банктік үзінділерді автоматты өңдеу жүйесі',
    }),
  },
} satisfies Dictionary;

export default content;

