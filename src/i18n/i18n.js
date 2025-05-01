import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)                              // loads translations from /public/locales
  .use(LanguageDetector)                     // auto-detect user language
  .use(initReactI18next)                     // passes i18n down to react-i18next
  .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: { escapeValue: false },   // not needed for React

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    ns: ['common', 'home', 'navbar'],
    defaultNS: 'common'
  });

export default i18n;
