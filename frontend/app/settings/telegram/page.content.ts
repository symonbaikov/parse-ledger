import { t, type Dictionary } from 'intlayer';

const content = {
  key: 'settingsTelegramPage',
  content: {
    authRequired: t({
      ru: 'Войдите в систему, чтобы настроить Telegram.',
      en: 'Log in to configure Telegram.',
      kk: 'Telegram баптау үшін жүйеге кіріңіз.',
    }),
    permissionRequired: t({
      ru: 'У вас нет прав для просмотра Telegram настроек.',
      en: "You don't have permission to view Telegram settings.",
      kk: 'Telegram баптауларын көруге рұқсатыңыз жоқ.',
    }),
    title: t({
      ru: 'Telegram настройки',
      en: 'Telegram settings',
      kk: 'Telegram баптаулары',
    }),
    subtitle: t({
      ru: 'Подключите чат к боту, отправляйте отчёты и просматривайте историю отправок.',
      en: 'Connect a chat to the bot, send reports, and view sending history.',
      kk: 'Чатты ботқа қосыңыз, есептерді жіберіңіз және жіберу тарихын қараңыз.',
    }),
    errors: {
      chatIdRequired: t({
        ru: 'Укажите chatId, полученный от бота',
        en: 'Provide the chatId received from the bot',
        kk: 'Боттан алынған chatId мәнін көрсетіңіз',
      }),
      connectFailed: t({
        ru: 'Не удалось подключить Telegram',
        en: 'Failed to connect Telegram',
        kk: 'Telegram қосу мүмкін болмады',
      }),
      sendFailed: t({
        ru: 'Не удалось отправить отчёт',
        en: 'Failed to send report',
        kk: 'Есепті жіберу мүмкін болмады',
      }),
    },
    messages: {
      connected: t({
        ru: 'Telegram успешно подключен. Проверьте бота и команду /report.',
        en: 'Telegram connected successfully. Check the bot and the /report command.',
        kk: 'Telegram сәтті қосылды. Ботты және /report командасын тексеріңіз.',
      }),
      sent: t({
        ru: 'Отчёт отправлен в Telegram. Проверьте чат.',
        en: 'Report sent to Telegram. Check the chat.',
        kk: 'Есеп Telegram-ға жіберілді. Чатты тексеріңіз.',
      }),
    },
    connect: {
      title: t({ ru: 'Подключение', en: 'Connection', kk: 'Қосу' }),
      steps: t({
        ru: '1) В Telegram откройте бота и отправьте команду /start, чтобы увидеть свой Telegram ID.\n2) Введите ниже chatId из Telegram (ID чата, обычно совпадает с вашим user ID для личных чатов).\n3) Нажмите «Сохранить», затем выполните /report в боте.',
        en: '1) In Telegram, open the bot and send /start to see your Telegram ID.\n2) Enter the chatId from Telegram below (chat ID usually matches your user ID for private chats).\n3) Click “Save”, then run /report in the bot.',
        kk: '1) Telegram-да ботты ашып, Telegram ID-іңізді көру үшін /start жіберіңіз.\n2) Төменге Telegram-дағы chatId енгізіңіз (жеке чатта ол әдетте user ID-іңізге сәйкес келеді).\n3) «Сақтау» басып, ботта /report орындаңыз.',
      }),
      chatIdLabel: t({ ru: 'Telegram chatId', en: 'Telegram chatId', kk: 'Telegram chatId' }),
      chatIdPlaceholder: t({ ru: 'Например, 123456789', en: 'For example, 123456789', kk: 'Мысалы, 123456789' }),
      chatIdHelp: t({ ru: 'Введите chatId, который показывает бот', en: 'Enter the chatId shown by the bot', kk: 'Бот көрсететін chatId енгізіңіз' }),
      telegramIdLabel: t({ ru: 'Telegram ID', en: 'Telegram ID', kk: 'Telegram ID' }),
      telegramIdPlaceholder: t({ ru: 'ID из команды /start', en: 'ID from the /start command', kk: '/start командасынан ID' }),
      telegramIdHelp: t({ ru: 'Необязательно, но ускоряет привязку', en: 'Optional, but speeds up linking', kk: 'Міндетті емес, бірақ байланыстыруды жылдамдатады' }),
      save: t({ ru: 'Сохранить подключение', en: 'Save connection', kk: 'Қосуды сақтау' }),
      linkedIdPrefix: t({ ru: 'Связан ID', en: 'Linked ID', kk: 'Байланған ID' }),
    },
    quickSend: {
      title: t({ ru: 'Быстрая отправка отчёта', en: 'Quick report send', kk: 'Есепті жылдам жіберу' }),
      subtitle: t({
        ru: 'Ежедневные отчёты отправляются автоматически в 08:00 UTC, месячные — 1 числа в 09:00 UTC.',
        en: 'Daily reports are sent automatically at 08:00 UTC; monthly reports on the 1st at 09:00 UTC.',
        kk: 'Күнделікті есептер 08:00 UTC-де автоматты жіберіледі, айлық — айдың 1-күні 09:00 UTC-де.',
      }),
      sendToday: t({ ru: 'Отправить за сегодня', en: 'Send for today', kk: 'Бүгін үшін жіберу' }),
      sendMonth: t({ ru: 'Отправить за месяц', en: 'Send for month', kk: 'Ай үшін жіберу' }),
    },
    history: {
      title: t({ ru: 'История отправок', en: 'Sending history', kk: 'Жіберу тарихы' }),
      subtitle: t({
        ru: 'Последние попытки отправки отчётов через Telegram бот.',
        en: 'Latest attempts to send reports via the Telegram bot.',
        kk: 'Telegram бот арқылы есеп жіберудің соңғы әрекеттері.',
      }),
      table: {
        type: t({ ru: 'Тип', en: 'Type', kk: 'Түрі' }),
        reportDate: t({ ru: 'Дата отчёта', en: 'Report date', kk: 'Есеп күні' }),
        chat: t({ ru: 'Чат', en: 'Chat', kk: 'Чат' }),
        status: t({ ru: 'Статус', en: 'Status', kk: 'Күйі' }),
        sentAt: t({ ru: 'Отправлено', en: 'Sent', kk: 'Жіберілді' }),
      },
      empty: t({ ru: 'История пока пуста.', en: 'History is empty for now.', kk: 'Әзірше тарих бос.' }),
      dash: t({ ru: '—', en: '—', kk: '—' }),
    },
    reportType: {
      daily: t({ ru: 'Ежедневный', en: 'Daily', kk: 'Күнделікті' }),
      monthly: t({ ru: 'Месячный', en: 'Monthly', kk: 'Айлық' }),
      custom: t({ ru: 'Пользовательский', en: 'Custom', kk: 'Пайдаланушы' }),
    },
    reportStatus: {
      sent: t({ ru: 'Отправлено', en: 'Sent', kk: 'Жіберілді' }),
      failed: t({ ru: 'Ошибка', en: 'Failed', kk: 'Қате' }),
      pending: t({ ru: 'В очереди', en: 'Pending', kk: 'Кезекте' }),
    },
    howTo: {
      title: t({ ru: 'Как узнать chatId?', en: 'How to find chatId?', kk: 'chatId қалай табуға болады?' }),
      text: t({
        ru: 'Откройте бота в Telegram, отправьте /start и скопируйте ID из ответа. Для личных чатов chatId совпадает с этим ID. Для групповых чатов понадобится chatId группы (отправьте сообщение и запросите через @userinfobot).',
        en: 'Open the bot in Telegram, send /start, and copy the ID from the reply. For private chats, chatId matches this ID. For group chats, you need the group chatId (send a message and query it via @userinfobot).',
        kk: 'Telegram-да ботты ашып, /start жіберіп, жауаптағы ID-ді көшіріңіз. Жеке чаттарда chatId осы ID-ге тең. Топтық чаттар үшін топтың chatId қажет (хабарлама жіберіп, @userinfobot арқылы сұраңыз).',
      }),
    },
  },
} satisfies Dictionary;

export default content;

