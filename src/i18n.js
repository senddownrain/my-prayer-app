import { createI18n } from 'vue-i18n';
import ru from './locales/ru.json';
import be from './locales/be.json';

const savedLanguage = localStorage.getItem('language') || 'ru';

const i18n = createI18n({
  legacy: false, 
  locale: savedLanguage,
  fallbackLocale: 'be',
  messages: {
    ru,
    be
  },
  datetimeFormats: {
    'ru': { short: { day: 'numeric', month: 'short' } },
    'be': { short: { day: 'numeric', month: 'short' } }
  }
});

export default i18n;