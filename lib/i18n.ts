'use client';

import { useState, useEffect } from 'react';

export type PosLanguage = 'en' | 'km';

export const POS_TRANSLATIONS: Record<string, { en: string; km: string }> = {
  pos_terminal: { en: 'POS Terminal', km: 'ស្ថានីយ៍លក់ (POS)' },
  current_order: { en: 'Current Order', km: 'ការបញ្ជាទិញបច្ចុប្បន្ន' },
  items_in_basket: { en: 'items in basket', km: 'មុខទំនិញក្នុងកន្ត្រក' },
  basket_empty: { en: 'Basket is empty', km: 'កន្ត្រកទទេ' },
  basket_empty_desc: {
    en: 'Tap products on the left or scan a barcode to start ringing.',
    km: 'សូមជ្រើសរើសទំនិញនៅខាងឆ្វេង ឬស្កេនបាកូដដើម្បីចាប់ផ្តើមលក់។',
  },
  subtotal: { en: 'Subtotal', km: 'សរុបរង' },
  discount: { en: 'Discount', km: 'បញ្ចុះតម្លៃ' },
  tax: { en: 'VAT (10%)', km: 'អាករលើតម្លៃបន្ថែម (១០%)' },
  grand_total: { en: 'Grand Total', km: 'សរុបរួម' },
  total_due: { en: 'Total Due', km: 'ទឹកប្រាក់ត្រូវបង់' },
  cash: { en: 'Cash (USD/KHR)', km: 'សាច់ប្រាក់ (USD/KHR)' },
  khqr: { en: 'Bakong KHQR', km: 'បាគង KHQR' },
  card: { en: 'Card / Visa', km: 'កាតធនាគារ / វីសា' },
  store_credit: { en: 'Store Credit', km: 'ឥណទានអតិថិជន' },
  tendered_amount: { en: 'Tendered Amount', km: 'ចំនួនទឹកប្រាក់ទទួល' },
  change_due: { en: 'Change Due', km: 'ប្រាក់អាប់ត្រូវប្រគល់' },
  complete_sale: { en: 'Complete Sale', km: 'បញ្ចប់ការលក់' },
  hold_cart: { en: 'Hold Cart', km: 'ផ្អាកកន្ត្រក' },
  void_cart: { en: 'Void Cart', km: 'លុបចោលកន្ត្រក' },
  receipt: { en: 'Official Receipt', km: 'វិក្កយបត្រផ្លូវការ' },
  thank_you: { en: 'Thank you for shopping with us!', km: 'សូមអរគុណដែលបានគាំទ្រ!' },
  date: { en: 'Date', km: 'កាលបរិច្ឆេទ' },
  cashier: { en: 'Cashier', km: 'បេឡាករ' },
  customer: { en: 'Customer', km: 'អតិថិជន' },
  table: { en: 'Table', km: 'លេខតុ' },
  all_categories: { en: 'All Categories', km: 'គ្រប់ប្រភេទ' },
  night_mode: { en: 'Night Bar Mode', km: 'ម៉ូដរាត្រី' },
  day_mode: { en: 'Day Mode', km: 'ម៉ូដថ្ងៃ' },
  branch_stock: { en: 'Branch Stock', km: 'ស្តុកសាខា' },
  split_bill: { en: 'Split Bill', km: 'ចែកវិក្កយបត្រ' },
  out_of_stock: { en: 'Out of Stock', km: 'អស់ពីស្តុក' },
  only_left: { en: 'Only left', km: 'នៅសល់តែ' },
};

export function getTranslation(key: string, lang: PosLanguage = 'en'): string {
  if (POS_TRANSLATIONS[key]) {
    return POS_TRANSLATIONS[key][lang] || POS_TRANSLATIONS[key].en;
  }
  return key;
}

export function usePosLanguage() {
  const [lang, setLang] = useState<PosLanguage>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cb_pos_lang') as PosLanguage | null;
      if (saved && (saved === 'en' || saved === 'km')) {
        setLang(saved);
      }
    }
  }, []);

  const toggleLanguage = () => {
    setLang((prev) => {
      const next: PosLanguage = prev === 'en' ? 'km' : 'en';
      if (typeof window !== 'undefined') {
        localStorage.setItem('cb_pos_lang', next);
        window.dispatchEvent(new CustomEvent('cb_pos_lang_changed', { detail: next }));
      }
      return next;
    });
  };

  return {
    lang,
    setLang,
    toggleLanguage,
    t: (key: string) => getTranslation(key, lang),
  };
}
