// src/components/Layout/Navbar.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bars3Icon, XMarkIcon, HeartIcon } from '@heroicons/react/24/outline'
import ReactCountryFlag from 'react-country-flag'
import { useTranslation } from 'react-i18next'

// Supported languages
const LANGUAGES = [
  { code: 'en', countryCode: 'US' },
  { code: 'th', countryCode: 'TH' },
  { code: 'ru', countryCode: 'RU' },
  { code: 'zh', countryCode: 'CN' },
  { code: 'ko', countryCode: 'KR' },
  { code: 'ms', countryCode: 'MY' }
]

export default function Navbar() {
  const { t, i18n } = useTranslation(['common', 'nav'])

  const [menuOpen, setMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [mobileLangOpen, setMobileLangOpen] = useState(false)

  const [selectedLang, setSelectedLang] = useState(
    LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0]
  )

  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('.lang-selector'))
        setLangMenuOpen(false)

      if (!e.target.closest('.mobile-lang-selector'))
        setMobileLangOpen(false)

      if (
        !e.target.closest('.mobile-menu-btn') &&
        !e.target.closest('.mobile-menu')
      )
        setMenuOpen(false)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const otherLanguages = LANGUAGES.filter(
    l => l.code !== selectedLang.code
  )

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 animate-fade-in-down">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="bg-gradient-to-r from-gradient-primary to-gradient-secondary p-2 rounded-lg">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">
              {t('common:appName')}
            </span>
          </div>

          {/* Desktop Links + Language */}
          <div className="hidden md:flex items-center space-x-6">
            {['about', 'pricing', 'login'].map(key => (
              <Link
                key={key}
                to={`/${key}`}
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 capitalize"
              >
                {t(`common:links.${key}`)}
              </Link>
            ))}

            <div className="relative lang-selector">
              <button
                onClick={e => {
                  e.stopPropagation()
                  setLangMenuOpen(o => !o)
                }}
                className="flex items-center px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ReactCountryFlag
                  svg
                  countryCode={selectedLang.countryCode}
                  className="w-5 h-5 mr-2"
                />
                <span className="text-sm">
                  {selectedLang.code.toUpperCase()}
                </span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-20">
                  {otherLanguages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code)
                        setSelectedLang(lang)
                        setLangMenuOpen(false)
                      }}
                      className="w-full flex items-center px-3 py-2 hover:bg-gray-100"
                    >
                      <ReactCountryFlag
                        svg
                        countryCode={lang.countryCode}
                        className="w-5 h-5 mr-2"
                      />
                      <span className="text-sm">
                        {lang.code.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center space-x-2 md:hidden">

            {/* Mobile Language */}
            <div className="relative mobile-lang-selector">
              <button
                onClick={e => {
                  e.stopPropagation()
                  setMobileLangOpen(o => !o)
                }}
                className="flex items-center px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <ReactCountryFlag
                  svg
                  countryCode={selectedLang.countryCode}
                  className="w-5 h-5 mr-1"
                />
                <span className="text-xs">
                  {selectedLang.code.toUpperCase()}
                </span>
              </button>

              {mobileLangOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-20">
                  {otherLanguages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code)
                        setSelectedLang(lang)
                        setMobileLangOpen(false)
                      }}
                      className="w-full flex items-center px-3 py-2 hover:bg-gray-100"
                    >
                      <ReactCountryFlag
                        svg
                        countryCode={lang.countryCode}
                        className="w-5 h-5 mr-2"
                      />
                      <span className="text-sm">
                        {lang.code.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hamburger */}
            <div className="mobile-menu-btn">
              <button
                onClick={e => {
                  e.stopPropagation()
                  setMenuOpen(o => !o)
                }}
                className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {menuOpen ? (
                  <XMarkIcon className="h-6 w-6 text-gray-700" />
                ) : (
                  <Bars3Icon className="h-6 w-6 text-gray-700" />
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 mobile-menu z-10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {['about', 'pricing', 'login'].map(key => (
                <Link
                  key={key}
                  to={`/${key}`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  {t(`common:links.${key}`)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
