// Enhanced category patterns for smart auto-categorization
// Covers Russian, Kazakh, and English keywords

export interface CategoryPattern {
  pattern: RegExp;
  categoryName: string;
  priority: number;
}

/**
 * Comprehensive keyword patterns for automatic transaction categorization.
 * Patterns are checked in array order - more specific patterns first.
 */
export const ENHANCED_CATEGORY_PATTERNS: CategoryPattern[] = [
  // === HIGH PRIORITY: Kaspi-specific patterns ===
  { pattern: /kaspi red/i, categoryName: 'Платежи Kaspi Red', priority: 100 },
  { pattern: /продажи\s+с\s+kaspi/i, categoryName: 'Продажи Kaspi', priority: 99 },
  {
    pattern: /kaspi\s+доставка|доставк.*kaspi/i,
    categoryName: 'Логистика и доставка',
    priority: 98,
  },
  { pattern: /комисси.*kaspi|kaspi.*комисси/i, categoryName: 'Комиссии банка', priority: 97 },
  { pattern: /kaspi\s+gold|gold.*карт/i, categoryName: 'Комиссии банка', priority: 96 },
  { pattern: /kaspi\s+магазин/i, categoryName: 'Комиссии Kaspi', priority: 95 },
  { pattern: /kaspi\s*pay/i, categoryName: 'Комиссии Kaspi', priority: 94 },

  // === UTILITIES & HOUSING ===
  { pattern: /электр|электроэнерг/i, categoryName: 'Коммунальные услуги', priority: 50 },
  {
    pattern: /газ(?!\s*(?:олин|ин))|газоснабж/i,
    categoryName: 'Коммунальные услуги',
    priority: 50,
  },
  { pattern: /вода|водоснабж/i, categoryName: 'Коммунальные услуги', priority: 50 },
  { pattern: /отопление|тепл/i, categoryName: 'Коммунальные услуги', priority: 50 },
  { pattern: /свет|освещ/i, categoryName: 'Коммунальные услуги', priority: 48 },
  { pattern: /квартплат|жкх/i, categoryName: 'Коммунальные услуги', priority: 49 },
  { pattern: /коммунал/i, categoryName: 'Коммунальные услуги', priority: 45 },
  { pattern: /аренд/i, categoryName: 'Аренда', priority: 52 },

  // === GROCERIES & SHOPPING ===
  { pattern: /магазин|супермаркет|market/i, categoryName: 'Продукты', priority: 47 },
  { pattern: /продукт|продовольств/i, categoryName: 'Продукты', priority: 46 },
  { pattern: /гастроном|минимаркет/i, categoryName: 'Продукты', priority: 47 },
  { pattern: /дүкен/i, categoryName: 'Продукты', priority: 47 }, // Kazakh

  // === TRANSPORTATION ===
  { pattern: /такси|taxi/i, categoryName: 'Транспорт', priority: 51 },
  { pattern: /бензин|топлив|азс/i, categoryName: 'Транспорт', priority: 51 },
  { pattern: /автобус|метро|маршрутк/i, categoryName: 'Транспорт', priority: 50 },
  { pattern: /парковк/i, categoryName: 'Транспорт', priority: 49 },

  // === FOOD & RESTAURANTS ===
  { pattern: /кафе|ресторан|cafe|restaurant/i, categoryName: 'Кафе и рестораны', priority: 48 },
  { pattern: /мейрамхана/i, categoryName: 'Кафе и рестораны', priority: 48 }, // Kazakh
  { pattern: /кофе|coffee/i, categoryName: 'Кафе и рестораны', priority: 46 },
  { pattern: /питани|столов/i, categoryName: 'Кафе и рестораны', priority: 45 },

  // === HEALTHCARE ===
  { pattern: /аптека|pharmacy/i, categoryName: 'Здоровье', priority: 49 },
  { pattern: /дәріхана/i, categoryName: 'Здоровье', priority: 49 }, // Kazakh
  { pattern: /медицин|клиника|больница|hospital/i, categoryName: 'Здоровье', priority: 48 },
  { pattern: /врач|доктор|лечени/i, categoryName: 'Здоровье', priority: 47 },

  // === ENTERTAINMENT ===
  { pattern: /кино|cinema|театр/i, categoryName: 'Развлечения', priority: 46 },
  { pattern: /ойын-сауық/i, categoryName: 'Развлечения', priority: 46 }, // Kazakh
  { pattern: /фитнес|спортзал|gym/i, categoryName: 'Развлечения', priority: 46 },
  { pattern: /развлечен|entertainment/i, categoryName: 'Развлечения', priority: 44 },

  // === BUSINESS & GENERAL ===
  {
    pattern: /зарплат|заработн|salary|жалақы/i,
    categoryName: 'Зарплаты сотрудникам',
    priority: 53,
  },
  { pattern: /налог|гнп|опв|осмс/i, categoryName: 'Налоги', priority: 52 },
  {
    pattern: /рекламн.*услуг|маркетинг|реклам/i,
    categoryName: 'Маркетинг и реклама',
    priority: 48,
  },
  { pattern: /IT.*услуг|информационно.*технолог/i, categoryName: 'IT услуги', priority: 47 },
  { pattern: /доставк|курьер/i, categoryName: 'Логистика и доставка', priority: 47 },
  { pattern: /закуп|товар/i, categoryName: 'Закупки товаров', priority: 45 },
  { pattern: /страхов/i, categoryName: 'Страхование', priority: 46 },
  { pattern: /комисси/i, categoryName: 'Комиссии банка', priority: 44 },
  { pattern: /кредит|лизинг|займ/i, categoryName: 'Кредиты и займы', priority: 45 },
  { pattern: /оплата\s+услуг/i, categoryName: 'Оплата услуг', priority: 43 },

  // === INCOME PATTERNS ===
  { pattern: /поступлени|приход/i, categoryName: 'Приход', priority: 50 },
  { pattern: /выручк|продаж/i, categoryName: 'Выручка от продаж', priority: 51 },
  { pattern: /возврат/i, categoryName: 'Возвраты и компенсации', priority: 48 },
];
