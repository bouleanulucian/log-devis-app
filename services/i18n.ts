import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import roTranslations from '../locales/ro.json';
import enTranslations from '../locales/en.json';

/**
 * i18n Configuration
 * Multi-language support for Romanian and English
 */

const resources = {
    ro: {
        translation: roTranslations
    },
    en: {
        translation: enTranslations
    }
};

export const initI18n = (): void => {
    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: localStorage.getItem('app-language') || 'ro', // Default to Romanian
            fallbackLng: 'ro',
            interpolation: {
                escapeValue: false // React already protects from XSS
            }
        });
};

export const changeLanguage = (lang: 'ro' | 'en'): void => {
    i18n.changeLanguage(lang);
    localStorage.setItem('app-language', lang);
};

export default i18n;
