// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // loads translations from /public/locales/{lng}/{ns}.json
  .use(Backend)
  // detects user language (navigator, querystring, localStorage, etc.)
  .use(LanguageDetector)
  // passes the i18n instance to react-i18next
  .use(initReactI18next)
  .init({
    // default language if detection fails
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false, // React already protects against XSS
    },

    backend: {
      // Path to load each namespace file:
      //   e.g. public/locales/en/common.json
      // The v= query param busts stale browser/CDN caches on mobile after a
      // deploy adds or changes keys — these JSON files aren't content-hashed
      // like the JS/CSS bundle, so without this a phone could keep serving a
      // pre-deploy copy indefinitely and print raw "namespace.key" text.
      loadPath: `/locales/{{lng}}/{{ns}}.json?v=${__APP_BUILD_ID__}`,
    },

    ns: ['common', 'home', 'nav' ,'auth','settings','location','circles','chat','swipe','onboardingCircles','errors'],
    defaultNS: 'common',

    // turn on/react options
    react: {
      useSuspense: true, // you can set to false if you prefer manual loading
    },
  });

export default i18n;
