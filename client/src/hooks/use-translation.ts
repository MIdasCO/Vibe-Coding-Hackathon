import { create } from 'zustand';
import { translations } from '@/lib/i18n/translations';

type Language = 'ru' | 'ky' | 'en';

interface TranslationState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const useTranslation = create<TranslationState>((set, get) => ({
  language: 'ru', // Default language
  setLanguage: (lang) => set({ language: lang }),
  t: (key: string) => {
    const state = get();
    const keys = key.split('.');
    let value: any = translations[state.language];

    for (const k of keys) {
      if (value === undefined) return key;
      value = value[k];
    }

    // If the value is an object with language keys, return the current language value
    if (typeof value === 'object' && (value.ru || value.ky || value.en)) {
      return value[state.language] || value.ru || key;
    }

    return value || key;
  },
}));

export { useTranslation }; 