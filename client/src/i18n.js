// src/i18n.js

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  // 1) load translation using http (default public/assets/locates)
  .use(HttpApi)
  // 2) detect user language
  .use(LanguageDetector)
  // 3) pass the i18n instance to react-i18next
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "fr", "es"],
    // debug: true, // enable if you want console logs during development

    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    backend: {
      // where to load translation files from
      // you’ll put your JSON files under public/locales/<lang>/translation.json
      loadPath: "/locales/{{lng}}/translation.json",
    },
    detection: {
      // optional: customize which detectors to use
      // order and options are documented at https://github.com/i18next/i18next-browser-languageDetector
      order: ["querystring", "cookie", "localStorage", "navigator"],
      caches: ["cookie"],
    },
  });

export default i18n;
