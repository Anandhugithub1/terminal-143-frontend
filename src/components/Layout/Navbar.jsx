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
            {/* <div className="bg-gradient-to-r from-gradient-primary to-gradient-secondary p-2 rounded-lg">
              <HeartIcon className="w-6 h-6 text-white" />
            </div> */}
                      <a href="/" class="text-2xl font-bold tracking-tight text-[#D2449D]">Pass<span class="text-gray-800">or</span>Match</a>

            {/* <span className="ml-3 text-xl font-bold text-gray-900">
              {t('common:appName')}
            </span> */}
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6">

            {/* BLOG → static */}
            <a
              href="/blog"
              className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 capitalize"
            >
              {t('common:links.blog')}
            </a>

            {/* LOGIN → React */}
            <Link
              to="/login"
              className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 capitalize"
            >
              {t('common:links.login')}
            </Link>

            {/* Language */}
            <div className="relative lang-selector">
              <button
                onClick={e => {
                  e.stopPropagation()
                  setLangMenuOpen(o => !o)
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg 
                           text-gray-700 text-sm font-medium
                           hover:bg-gray-50"
              >
                <ReactCountryFlag
                  svg
                  countryCode={selectedLang.countryCode}
                  className="w-5 h-5"
                />
                <span>{selectedLang.code.toUpperCase()}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-xl p-1 z-50">
                  {otherLanguages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code)
                        setSelectedLang(lang)
                        setLangMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-indigo-50"
                    >
                      <ReactCountryFlag svg countryCode={lang.countryCode} className="w-5 h-5" />
                      {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Mobile button */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(o => !o)}>
              {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t">

            {/* BLOG */}
            <a
              href="/blog"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:bg-indigo-50"
            >
              {t('common:links.blog')}
            </a>

            {/* LOGIN */}
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:bg-indigo-50"
            >
              {t('common:links.login')}
            </Link>

          </div>
        )}
      </nav>
    </header>
  )
}