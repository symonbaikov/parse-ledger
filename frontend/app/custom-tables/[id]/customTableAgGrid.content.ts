import { type Dictionary, t } from 'intlayer';

const content = {
  key: 'customTableAgGrid',
  content: {
    tooltips: {
      rename: t({
        ru: 'Двойной клик — переименовать',
        en: 'Double click to rename',
        kk: 'Атын өзгерту үшін екі рет басыңыз',
      }),
      deleteColumn: t({ ru: 'Удалить колонку', en: 'Delete column', kk: 'Бағанды жою' }),
      deleteRow: t({ ru: 'Удалить', en: 'Delete', kk: 'Жою' }),
    },
    agGrid: {
      loadingOoo: t({ ru: 'Загрузка...', en: 'Loading...', kk: 'Жүктелуде...' }),
      noRowsToShow: t({
        ru: 'Нет строк для отображения',
        en: 'No rows to show',
        kk: 'Көрсететін жолдар жоқ',
      }),
      enabled: t({ ru: 'Включено', en: 'Enabled', kk: 'Қосулы' }),
      disabled: t({ ru: 'Отключено', en: 'Disabled', kk: 'Өшірулі' }),
      filterOoo: t({ ru: 'Фильтр...', en: 'Filter...', kk: 'Сүзгі...' }),
      equals: t({ ru: 'Равно', en: 'Equals', kk: 'Тең' }),
      notEqual: t({ ru: 'Не равно', en: 'Not equal', kk: 'Тең емес' }),
      blank: t({ ru: 'Пусто', en: 'Blank', kk: 'Бос' }),
      notBlank: t({ ru: 'Не пусто', en: 'Not blank', kk: 'Бос емес' }),
      empty: t({ ru: 'Выберите', en: 'Select', kk: 'Таңдаңыз' }),
      lessThan: t({ ru: 'Меньше', en: 'Less than', kk: 'Кіші' }),
      greaterThan: t({ ru: 'Больше', en: 'Greater than', kk: 'Үлкен' }),
      lessThanOrEqual: t({
        ru: 'Меньше или равно',
        en: 'Less than or equal',
        kk: 'Кіші немесе тең',
      }),
      greaterThanOrEqual: t({
        ru: 'Больше или равно',
        en: 'Greater than or equal',
        kk: 'Үлкен немесе тең',
      }),
      inRange: t({ ru: 'В диапазоне', en: 'In range', kk: 'Аралықта' }),
      inRangeStart: t({ ru: 'От', en: 'From', kk: 'Бастап' }),
      inRangeEnd: t({ ru: 'До', en: 'To', kk: 'Дейін' }),
      contains: t({ ru: 'Содержит', en: 'Contains', kk: 'Құрамында бар' }),
      notContains: t({ ru: 'Не содержит', en: 'Not contains', kk: 'Құрамында жоқ' }),
      startsWith: t({ ru: 'Начинается с', en: 'Starts with', kk: 'Басталады' }),
      endsWith: t({ ru: 'Заканчивается на', en: 'Ends with', kk: 'Аяқталады' }),
      andCondition: t({ ru: 'И', en: 'AND', kk: 'ЖӘНЕ' }),
      orCondition: t({ ru: 'ИЛИ', en: 'OR', kk: 'НЕМЕСЕ' }),
      applyFilter: t({ ru: 'Применить', en: 'Apply', kk: 'Қолдану' }),
      resetFilter: t({ ru: 'Сбросить', en: 'Reset', kk: 'Қалпына келтіру' }),
      clearFilter: t({ ru: 'Очистить', en: 'Clear', kk: 'Тазалау' }),
      cancelFilter: t({ ru: 'Отмена', en: 'Cancel', kk: 'Болдырмау' }),
      columns: t({ ru: 'Колонки', en: 'Columns', kk: 'Бағандар' }),
      filters: t({ ru: 'Фильтры', en: 'Filters', kk: 'Сүзгілер' }),
      pinColumn: t({ ru: 'Закрепить колонку', en: 'Pin column', kk: 'Бағанды бекіту' }),
      valueColumns: t({ ru: 'Колонки значений', en: 'Value columns', kk: 'Мән бағандары' }),
      pivotMode: t({ ru: 'Режим сводной таблицы', en: 'Pivot mode', kk: 'Жиынтық режимі' }),
      groups: t({ ru: 'Группы строк', en: 'Row groups', kk: 'Жол топтары' }),
      rowGroupColumnsEmptyMessage: t({
        ru: 'Перетащите сюда для группировки',
        en: 'Drag here to group',
        kk: 'Топтау үшін осында сүйреңіз',
      }),
      valuesColumnsEmptyMessage: t({
        ru: 'Перетащите сюда для значений',
        en: 'Drag here for values',
        kk: 'Мәндер үшін осында сүйреңіз',
      }),
      pivotsColumnsEmptyMessage: t({
        ru: 'Перетащите сюда для заголовков',
        en: 'Drag here for headers',
        kk: 'Тақырыптар үшін осында сүйреңіз',
      }),
    },
  },
} satisfies Dictionary;

export default content;
