import { createI18n } from 'vue-i18n';
import ru from './locales/ru.json';
import be from './locales/be.json';

const savedLanguage = localStorage.getItem('language') || 'ru';

const i18n = createI18n({
  legacy: false, 
  locale: savedLanguage,
  fallbackLocale: 'ru',
  messages: {
    ru,
    be
  }
});

export default i18n;