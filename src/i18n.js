import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translation_es from './local/translation_es.json';
import translation_en from './local/translation_en.json';
import translation_de from './local/translation_de.json';
import translation_fr from './local/translation_fr.json';
import translation_ru from './local/translation_ru.json';
import translation_zh from './local/translation_zh.json';
import translation_ja from './local/translation_ja.json';
import translation_el from './local/translation_el.json';
import translation_pt from './local/translation_pt.json';
import translation_it from './local/translation_it.json';
import translation_ar from './local/translation_ar.json';
import translation_hi from './local/translation_hi.json';

i18n
  .use(initReactI18next)
  .init({
    lng: 'en', // Idioma por defecto
    fallbackLng: 'en', // Idioma de respaldo si no se encuentra una traducción
    resources: {
      en: {
        translation: translation_en // Traducciones en inglés
      },
      es: {
        translation: translation_es // Traducciones en español
      },
      de: {
        translation: translation_de // Traducciones en alemán
      },
      fr: {
        translation: translation_fr // Traducciones en francés
      },
      ru: {
        translation: translation_ru // Traducciones en ruso
      },
      zh: {
        translation: translation_zh // Traducciones en chino
      },
      ja: {
        translation: translation_ja // Traducciones en japonés
      },
      el: {
        translation: translation_el // Traducciones en griego
      },
      pt: {
        translation: translation_pt // Traducciones en portugués
      },
      it: {
        translation: translation_it // Traducciones en italiano
      },
      ar: {
        translation: translation_ar // Traducciones en árabe
      },
      hi: {
        translation: translation_hi // Traducciones en hindi
      },
      // Agrega más idiomas y sus traducciones aquí
    }
  });

export default i18n;
