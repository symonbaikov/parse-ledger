import { type Dictionary, t } from 'intlayer';

const content = {
  key: 'adminUsersPage',
  content: {
    title: t({
      ru: 'Управление пользователями',
      en: 'User management',
      kk: 'Пайдаланушыларды басқару',
    }),
    search: t({ ru: 'Поиск', en: 'Search', kk: 'Іздеу' }),
    refresh: t({ ru: 'Обновить', en: 'Refresh', kk: 'Жаңарту' }),
    table: {
      email: t({ ru: 'Email', en: 'Email', kk: 'Email' }),
      name: t({ ru: 'Имя', en: 'Name', kk: 'Аты' }),
      role: t({ ru: 'Роль', en: 'Role', kk: 'Рөлі' }),
      status: t({ ru: 'Статус', en: 'Status', kk: 'Күйі' }),
      permissions: t({ ru: 'Права', en: 'Permissions', kk: 'Құқықтар' }),
      createdAt: t({ ru: 'Дата регистрации', en: 'Registered at', kk: 'Тіркелген күні' }),
      actions: t({ ru: 'Действия', en: 'Actions', kk: 'Әрекеттер' }),
    },
    roles: {
      admin: t({ ru: 'Администратор', en: 'Administrator', kk: 'Әкімші' }),
      user: t({ ru: 'Пользователь', en: 'User', kk: 'Пайдаланушы' }),
      viewer: t({ ru: 'Наблюдатель', en: 'Viewer', kk: 'Бақылаушы' }),
    },
    status: {
      active: t({ ru: 'Активен', en: 'Active', kk: 'Белсенді' }),
      inactive: t({ ru: 'Неактивен', en: 'Inactive', kk: 'Белсенді емес' }),
    },
    permissionsChip: {
      default: t({ ru: 'По умолчанию', en: 'Default', kk: 'Әдепкі' }),
    },
    tooltips: {
      managePermissions: t({
        ru: 'Управление правами',
        en: 'Manage permissions',
        kk: 'Құқықтарды басқару',
      }),
    },
    dialog: {
      titlePrefix: t({
        ru: 'Управление правами',
        en: 'Manage permissions',
        kk: 'Құқықтарды басқару',
      }),
      rolePrefix: t({ ru: 'Роль', en: 'Role', kk: 'Рөл' }),
      subtitleSuffix: t({
        ru: 'Выберите дополнительные права доступа:',
        en: 'Select additional permissions:',
        kk: 'Қосымша құқықтарды таңдаңыз:',
      }),
      resetDefaults: t({
        ru: 'Сбросить к умолчаниям',
        en: 'Reset to defaults',
        kk: 'Әдепкіге қайтару',
      }),
      cancel: t({ ru: 'Отмена', en: 'Cancel', kk: 'Болдырмау' }),
      save: t({ ru: 'Сохранить', en: 'Save', kk: 'Сақтау' }),
    },
    errors: {
      loadUsers: t({
        ru: 'Ошибка загрузки пользователей',
        en: 'Failed to load users',
        kk: 'Пайдаланушыларды жүктеу қатесі',
      }),
      loadPermissions: t({
        ru: 'Ошибка загрузки прав',
        en: 'Failed to load permissions',
        kk: 'Құқықтарды жүктеу қатесі',
      }),
      savePermissions: t({
        ru: 'Ошибка сохранения прав',
        en: 'Failed to save permissions',
        kk: 'Құқықтарды сақтау қатесі',
      }),
      resetPermissions: t({
        ru: 'Ошибка сброса прав',
        en: 'Failed to reset permissions',
        kk: 'Құқықтарды қалпына келтіру қатесі',
      }),
      updateRole: t({
        ru: 'Ошибка обновления роли',
        en: 'Failed to update role',
        kk: 'Рөлді жаңарту қатесі',
      }),
      updateStatus: t({
        ru: 'Ошибка обновления статуса',
        en: 'Failed to update status',
        kk: 'Күйді жаңарту қатесі',
      }),
    },
    permissions: {
      statementView: t({ ru: 'Просмотр выписок', en: 'View statements', kk: 'Үзінділерді қарау' }),
      statementUpload: t({
        ru: 'Загрузка выписок',
        en: 'Upload statements',
        kk: 'Үзінділерді жүктеу',
      }),
      statementDelete: t({
        ru: 'Удаление выписок',
        en: 'Delete statements',
        kk: 'Үзінділерді жою',
      }),
      statementEdit: t({
        ru: 'Редактирование выписок',
        en: 'Edit statements',
        kk: 'Үзінділерді өңдеу',
      }),
      transactionView: t({
        ru: 'Просмотр транзакций',
        en: 'View transactions',
        kk: 'Транзакцияларды қарау',
      }),
      transactionEdit: t({
        ru: 'Редактирование транзакций',
        en: 'Edit transactions',
        kk: 'Транзакцияларды өңдеу',
      }),
      transactionDelete: t({
        ru: 'Удаление транзакций',
        en: 'Delete transactions',
        kk: 'Транзакцияларды жою',
      }),
      transactionBulkUpdate: t({
        ru: 'Массовое обновление транзакций',
        en: 'Bulk update transactions',
        kk: 'Транзакцияларды жаппай жаңарту',
      }),
      categoryView: t({ ru: 'Просмотр категорий', en: 'View categories', kk: 'Санаттарды қарау' }),
      categoryCreate: t({ ru: 'Создание категорий', en: 'Create categories', kk: 'Санат құру' }),
      categoryEdit: t({
        ru: 'Редактирование категорий',
        en: 'Edit categories',
        kk: 'Санаттарды өңдеу',
      }),
      categoryDelete: t({
        ru: 'Удаление категорий',
        en: 'Delete categories',
        kk: 'Санаттарды жою',
      }),
      branchView: t({ ru: 'Просмотр филиалов', en: 'View branches', kk: 'Филиалдарды қарау' }),
      branchCreate: t({ ru: 'Создание филиалов', en: 'Create branches', kk: 'Филиал құру' }),
      branchEdit: t({
        ru: 'Редактирование филиалов',
        en: 'Edit branches',
        kk: 'Филиалдарды өңдеу',
      }),
      branchDelete: t({ ru: 'Удаление филиалов', en: 'Delete branches', kk: 'Филиалдарды жою' }),
      walletView: t({ ru: 'Просмотр кошельков', en: 'View wallets', kk: 'Әмияндарды қарау' }),
      walletCreate: t({ ru: 'Создание кошельков', en: 'Create wallets', kk: 'Әмиян құру' }),
      walletEdit: t({ ru: 'Редактирование кошельков', en: 'Edit wallets', kk: 'Әмияндарды өңдеу' }),
      walletDelete: t({ ru: 'Удаление кошельков', en: 'Delete wallets', kk: 'Әмияндарды жою' }),
      reportView: t({ ru: 'Просмотр отчётов', en: 'View reports', kk: 'Есептерді қарау' }),
      reportExport: t({ ru: 'Экспорт отчётов', en: 'Export reports', kk: 'Есептерді экспорттау' }),
      googleSheetView: t({
        ru: 'Просмотр Google Sheets',
        en: 'View Google Sheets',
        kk: 'Google Sheets қарау',
      }),
      googleSheetConnect: t({
        ru: 'Подключение Google Sheets',
        en: 'Connect Google Sheets',
        kk: 'Google Sheets қосу',
      }),
      googleSheetSync: t({
        ru: 'Синхронизация Google Sheets',
        en: 'Sync Google Sheets',
        kk: 'Google Sheets синхрондау',
      }),
    },
  },
} satisfies Dictionary;

export default content;
