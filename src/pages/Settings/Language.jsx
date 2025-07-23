import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import '@fontsource-variable/inter';
import i18n from '../../i18n/i18n';
import clsx from 'clsx';
import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', countryCode: 'US', labelKey: 'languages.english' },
  { code: 'th', countryCode: 'TH', labelKey: 'languages.thai' },
  { code: 'ru', countryCode: 'RU', labelKey: 'languages.russian' },
  { code: 'zh', countryCode: 'CN', labelKey: 'languages.chinese' },
  { code: 'ko', countryCode: 'KR', labelKey: 'languages.korean' },
  { code: 'ms', countryCode: 'MY', labelKey: 'languages.malay' }
];

const LanguagePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('settings');
  const [selectedLang, setSelectedLang] = useState(localStorage.getItem('lang') || 'en');

  const handleLanguageChange = (code) => {
    setSelectedLang(code);
    localStorage.setItem('lang', code);
    i18n.changeLanguage(code);
  };

  return (
    <div className="min-h-screen bg-white font-inter">
      <header className="flex items-center px-4 py-3 border-b border-gray-200">
        <button onClick={() => navigate(-1)} aria-label={t('back')}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-4 text-lg font-semibold">{t('select_language')}</h1>
      </header>

      <div className="p-4">
        <nav className="mt-6 space-y-3">
          {LANGUAGES.map(({ code, countryCode, labelKey }) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={clsx(
                "flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left",
                selectedLang === code && "border-blue-500 bg-blue-50"
              )}
            >
              <div className="flex items-center space-x-3">
                <ReactCountryFlag
                  countryCode={countryCode}
                  svg
                  style={{
                    width: '1.5em',
                    height: '1.5em',
                    borderRadius: '50%',
                    boxShadow: '0 0 0.5px rgba(0,0,0,0.3)'
                  }}
                  aria-label={countryCode}
                />
                <span className="text-gray-800 font-medium">{t(labelKey)}</span>
              </div>
              {selectedLang === code && (
                <Check className="text-blue-600" size={20} />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default LanguagePage;
