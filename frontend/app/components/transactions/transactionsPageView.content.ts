import { type Dictionary, t } from 'intlayer';

const content = {
  key: 'transactionsPageView',
  content: {
    notImplemented: t({
      ru: 'Еще не реализовано',
      en: 'Not implemented yet',
      kk: 'Әлі іске асырылмаған',
    }),
    categoryUpdated: t({
      ru: 'Категория обновлена успешно',
      en: 'Category updated successfully',
      kk: 'Санат сәтті жаңартылды',
    }),
    categoryUpdateFailed: t({
      ru: 'Не удалось обновить категорию',
      en: 'Failed to update category',
      kk: 'Санатты жаңарту сәтсіз аяқталды',
    }),
    categoriesUpdated: t({
      ru: 'Категория назначена транзакциям',
      en: 'Category assigned to transactions',
      kk: 'Санат транзакцияларға тағайындалды',
    }),
    bulkUpdateFailed: t({
      ru: 'Не удалось обновить категории',
      en: 'Failed to update categories',
      kk: 'Санаттарды жаңарту сәтсіз аяқталды',
    }),
    exportComingSoon: t({
      ru: 'Экспорт скоро будет доступен',
      en: 'Export feature coming soon',
      kk: 'Экспорт мүмкіндігі жақын арада',
    }),
    shareComingSoon: t({
      ru: 'Функция поделиться скоро будет доступна',
      en: 'Share feature coming soon',
      kk: 'Бөлісу мүмкіндігі жақын арада',
    }),
    fixIssuesHint: t({
      ru: 'Используйте фильтры для поиска и исправления проблем',
      en: 'Use filters to find and fix issues',
      kk: 'Мәселелерді табу және шешу үшін сүзгілерді пайдаланыңыз',
    }),
    selected: t({
      ru: 'выбрано',
      en: 'selected',
      kk: 'таңдалды',
    }),
    selectCategory: t({
      ru: 'Выберите категорию...',
      en: 'Select category...',
      kk: 'Санат таңдаңыз...',
    }),
    apply: t({
      ru: 'Применить',
      en: 'Apply',
      kk: 'Қолдану',
    }),
    clearSelection: t({
      ru: 'Очистить',
      en: 'Clear',
      kk: 'Тазалау',
    }),
  },
} satisfies Dictionary;

export default content;
