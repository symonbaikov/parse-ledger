import { t, type Dictionary } from 'intlayer';

const content = {
  key: 'confirmModal',
  content: {
    buttons: {
      confirm: t({ ru: 'Подтвердить', en: 'Confirm', kk: 'Растау' }),
      cancel: t({ ru: 'Отмена', en: 'Cancel', kk: 'Болдырмау' }),
    },
    sr: {
      close: t({ ru: 'Закрыть', en: 'Close', kk: 'Жабу' }),
    },
  },
} satisfies Dictionary;

export default content;

