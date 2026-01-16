import { type DeclarationContent, t } from 'intlayer';

/**
 * Контент для тура по категориям
 */
export const categoriesTourContent = {
  key: 'categories-tour-content',
  content: {
    name: t({
      ru: 'Тур по категориям',
      en: 'Categories Tour',
      kk: 'Санаттар туры',
    }),
    description: t({
      ru: 'Организация транзакций и файлов',
      en: 'Organize transactions and files',
      kk: 'Транзакциялар мен файлдарды ұйымдастыру',
    }),
    steps: {
      welcome: {
        title: t({
          ru: 'Добро пожаловать в категории',
          en: 'Welcome to Categories',
          kk: 'Санаттарға қош келдіңіз',
        }),
        description: t({
          ru: 'Категории помогают организовать ваши транзакции и файлы. Создавайте собственные категории, назначайте им цвета и иконки для быстрой идентификации. Давайте разберемся, как это работает!',
          en: "Categories help organize your transactions and files. Create your own categories, assign colors and icons for quick identification. Let's see how it works!",
          kk: 'Санаттар транзакцияларыңыз бен файлдарыңызды ұйымдастыруға көмектеседі. Өз санаттарыңызды жасаңыз, жылдам анықтау үшін түстер мен белгішелерді тағайындаңыз. Бұл қалай жұмыс істейтінін көрейік!',
        }),
      },
      createButton: {
        title: t({
          ru: 'Создание категории',
          en: 'Create Category',
          kk: 'Санат жасау',
        }),
        description: t({
          ru: 'Нажмите эту кнопку, чтобы создать новую категорию. Укажите название, выберите цвет и иконку. Категории можно использовать для группировки транзакций и файлов.',
          en: 'Click this button to create a new category. Specify a name, choose a color and icon. Categories can be used to group transactions and files.',
          kk: 'Жаңа санат жасау үшін осы батырманы басыңыз. Атауын көрсетіңіз, түс пен белгішені таңдаңыз. Санаттарды транзакциялар мен файлдарды топтастыру үшін пайдалануға болады.',
        }),
      },
      categoriesList: {
        title: t({
          ru: 'Список категорий',
          en: 'Categories List',
          kk: 'Санаттар тізімі',
        }),
        description: t({
          ru: 'Все ваши категории отображаются здесь. Для каждой категории показан цвет, иконка и количество связанных элементов. Нажмите на категорию для редактирования или удаления.',
          en: 'All your categories are displayed here. Each category shows color, icon and number of related items. Click on a category to edit or delete.',
          kk: 'Барлық санаттарыңыз мұнда көрсетіледі. Әрбір санат үшін түс, белгіше және байланысты элементтер саны көрсетіледі. Өңдеу немесе жою үшін санатқа басыңыз.',
        }),
      },
      colorPicker: {
        title: t({
          ru: 'Выбор цвета',
          en: 'Color Picker',
          kk: 'Түс таңдау',
        }),
        description: t({
          ru: 'Назначьте уникальный цвет каждой категории для лучшей визуальной идентификации. Цвета отображаются в графиках, таблицах и списках транзакций.',
          en: 'Assign a unique color to each category for better visual identification. Colors are displayed in charts, tables and transaction lists.',
          kk: 'Жақсы визуалды анықтау үшін әрбір санатқа бірегей түс тағайындаңыз. Түстер кестелерде, кестелерде және транзакциялар тізімінде көрсетіледі.',
        }),
      },
      iconPicker: {
        title: t({
          ru: 'Выбор иконки',
          en: 'Icon Picker',
          kk: 'Белгіше таңдау',
        }),
        description: t({
          ru: 'Выберите подходящую иконку для категории из большой коллекции. Иконки помогают быстро находить нужные категории в списках и фильтрах.',
          en: 'Choose a suitable icon for the category from a large collection. Icons help quickly find the right categories in lists and filters.',
          kk: 'Үлкен коллекциядан санат үшін қолайлы белгішені таңдаңыз. Белгішелер тізімдер мен сүзгілерде қажетті санаттарды жылдам табуға көмектеседі.',
        }),
      },
      completed: {
        title: t({
          ru: 'Отлично!',
          en: 'Great!',
          kk: 'Тамаша!',
        }),
        description: t({
          ru: 'Теперь вы знаете, как управлять категориями. Создавайте свою систему организации данных и легко находите нужную информацию!',
          en: 'Now you know how to manage categories. Create your own data organization system and easily find the information you need!',
          kk: 'Енді сіз санаттарды қалай басқаруды білесіз. Өз деректерді ұйымдастыру жүйеңізді жасаңыз және қажетті ақпаратты оңай табыңыз!',
        }),
      },
    },
  },
} satisfies DeclarationContent;

export default categoriesTourContent;
