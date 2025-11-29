import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../services/i18n';

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const toggleLanguage = () => {
        const newLang = currentLang === 'ro' ? 'en' : 'ro';
        changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={currentLang === 'ro' ? 'Switch to English' : 'Comută la Română'}
        >
            <Globe className="w-5 h-5 text-gray-700" />
            <span className="text-sm font-medium text-gray-700 uppercase">
                {currentLang}
            </span>
        </button>
    );
};
