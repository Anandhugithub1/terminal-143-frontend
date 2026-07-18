// src/components/Layout/Navbar.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
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
       
                   <a href="/" className="text-base sm:text-xl font-bold tracking-tight text-[#D2449D] whitespace-nowrap">Pass<span className="text-gray-800">or</span>Match
                  <span className="text-gray-800">.com</span>
                   </a>

          </div>

          {/* Desktop Links + Language */}
          <div className="hidden md:flex items-center space-x-6">
           {[ 'blog', 'login'].map(key => (
  key === 'blog' ? (
    <a
      key={key}
      href="/blog"
      className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 capitalize"
    >
      {t(`common:links.${key}`)}
    </a>
  ) : (
    <Link
      key={key}
      to={`/${key}`}
      className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 capitalize"
    >
      {t(`common:links.${key}`)}
    </Link>
  )
))}

          <div className="relative lang-selector">
  {/* Trigger Button */}
  <button
    onClick={e => {
      e.stopPropagation()
      setLangMenuOpen(o => !o)
    }}
    className="flex items-center gap-2 px-3 py-2 rounded-lg 
               border border-transparent 
               text-gray-700 text-sm font-medium
               hover:bg-gray-50 hover:border-gray-200
               active:scale-95
               transition-all duration-150"
  >
    <ReactCountryFlag
      svg
      countryCode={selectedLang.countryCode}
      className="w-5 h-5"
    />
    <span>{selectedLang.code.toUpperCase()}</span>

    {/* Chevron */}
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${
        langMenuOpen ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {/* Dropdown */}
  {langMenuOpen && (
    <div
      className="absolute right-0 mt-2 w-48 
                 bg-white border border-gray-200 
                 rounded-xl shadow-xl 
                 p-1 z-50
                 animate-in fade-in zoom-in-95 duration-150"
    >
      {otherLanguages.map(lang => (
        <button
          key={lang.code}
          onClick={() => {
            i18n.changeLanguage(lang.code)
            setSelectedLang(lang)
            setLangMenuOpen(false)
          }}
          className="w-full flex items-center gap-3 
                     px-3 py-2.5 
                     text-sm font-medium text-gray-700
                     rounded-lg
                     hover:bg-indigo-50 hover:text-indigo-600
                     active:scale-95
                     transition-all duration-150"
        >
          <ReactCountryFlag
            svg
            countryCode={lang.countryCode}
            className="w-5 h-5"
          />
          {lang.code.toUpperCase()}
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
    className="flex items-center gap-2 px-3 py-2 rounded-lg
               text-gray-700 text-sm font-medium
               hover:bg-gray-100
               active:scale-95
               transition-all duration-150"
  >
    <ReactCountryFlag
      svg
      countryCode={selectedLang.countryCode}
      className="w-5 h-5"
    />
    <span>{selectedLang.code.toUpperCase()}</span>

    <svg
      className={`w-4 h-4 transition-transform duration-200 ${
        mobileLangOpen ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {mobileLangOpen && (
    <div className="absolute right-0 mt-2 w-56 
                    bg-white border border-gray-200 
                    rounded-xl shadow-xl 
                    p-2 z-50">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => {
            i18n.changeLanguage(lang.code)
            setSelectedLang(lang)
            setMobileLangOpen(false)
          }}
          className={`w-full flex items-center gap-3 
                     px-4 py-3 
                     text-base font-medium 
                     rounded-lg 
                     transition-all duration-150
                     ${
                       selectedLang.code === lang.code
                         ? "bg-indigo-50 text-indigo-600"
                         : "text-gray-700 hover:bg-gray-100"
                     }`}
        >
          <ReactCountryFlag
            svg
            countryCode={lang.countryCode}
            className="w-5 h-5"
          />
          {lang.code.toUpperCase()}
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
           {[ 'blog', 'login'].map(key => (
  key === 'blog' ? (
    <a
      key={key}
      href="/blog"
      onClick={() => setMenuOpen(false)}
      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
    >
      {t(`common:links.${key}`)}
    </a>
  ) : (
    <Link
      key={key}
      to={`/${key}`}
      onClick={() => setMenuOpen(false)}
      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
    >
      {t(`common:links.${key}`)}
    </Link>
  )
))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
