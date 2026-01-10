import { t, type Dictionary } from 'intlayer';

const content = {
  key: 'settingsProfilePage',
  content: {
    authRequired: t({
      ru: 'Войдите в систему, чтобы управлять профилем.',
      en: 'Log in to manage your profile.',
      kk: 'Профильді басқару үшін жүйеге кіріңіз.',
    }),
    title: t({
      ru: 'Настройки профиля',
      en: 'Profile settings',
      kk: 'Профиль баптаулары',
    }),
    subtitle: t({
      ru: 'Обновите контактный email и пароль. Изменения вступают в силу сразу после сохранения.',
      en: 'Update your contact email and password. Changes take effect immediately after saving.',
      kk: 'Байланыс email-ін және құпиясөзді жаңартыңыз. Өзгерістер сақтағаннан кейін бірден күшіне енеді.',
    }),
    validation: {
      passwordRequiredForEmail: t({
        ru: 'Введите текущий пароль для подтверждения.',
        en: 'Enter your current password to confirm.',
        kk: 'Растау үшін ағымдағы құпиясөзді енгізіңіз.',
      }),
      passwordMismatch: t({
        ru: 'Новый пароль и подтверждение не совпадают.',
        en: 'New password and confirmation do not match.',
        kk: 'Жаңа құпиясөз бен растау сәйкес келмейді.',
      }),
    },
    emailCard: {
      title: t({ ru: 'Email', en: 'Email', kk: 'Email' }),
      newEmailLabel: t({ ru: 'Новый email', en: 'New email', kk: 'Жаңа email' }),
      currentPasswordLabel: t({ ru: 'Текущий пароль', en: 'Current password', kk: 'Ағымдағы құпиясөз' }),
      currentPasswordHelp: t({
        ru: 'Мы запрашиваем пароль, чтобы подтвердить смену email.',
        en: 'We ask for your password to confirm the email change.',
        kk: 'Email өзгерісін растау үшін құпиясөз сұраймыз.',
      }),
      submit: t({ ru: 'Обновить email', en: 'Update email', kk: 'Email жаңарту' }),
      successFallback: t({ ru: 'Email успешно обновлён.', en: 'Email updated successfully.', kk: 'Email сәтті жаңартылды.' }),
      errorFallback: t({ ru: 'Не удалось обновить email.', en: 'Failed to update email.', kk: 'Email жаңарту мүмкін болмады.' }),
    },
    passwordCard: {
      title: t({ ru: 'Пароль', en: 'Password', kk: 'Құпиясөз' }),
      currentPasswordLabel: t({ ru: 'Текущий пароль', en: 'Current password', kk: 'Ағымдағы құпиясөз' }),
      newPasswordLabel: t({ ru: 'Новый пароль', en: 'New password', kk: 'Жаңа құпиясөз' }),
      newPasswordHelp: t({ ru: 'Минимум 8 символов.', en: 'At least 8 characters.', kk: 'Кемінде 8 таңба.' }),
      confirmPasswordLabel: t({
        ru: 'Подтвердите новый пароль',
        en: 'Confirm new password',
        kk: 'Жаңа құпиясөзді растаңыз',
      }),
      submit: t({ ru: 'Обновить пароль', en: 'Update password', kk: 'Құпиясөз жаңарту' }),
      successFallback: t({ ru: 'Пароль успешно обновлён.', en: 'Password updated successfully.', kk: 'Құпиясөз сәтті жаңартылды.' }),
      errorFallback: t({ ru: 'Не удалось обновить пароль.', en: 'Failed to update password.', kk: 'Құпиясөзді жаңарту мүмкін болмады.' }),
    },
  },
} satisfies Dictionary;

export default content;

