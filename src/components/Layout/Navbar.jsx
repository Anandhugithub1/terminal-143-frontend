import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, HeartIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import ReactCountryFlag from 'react-country-flag';

// Flag-supported languages
const LANGUAGES = [
  { code: 'en', label: 'English', countryCode: 'US' },
  { code: 'th', label: 'ภาษาไทย', countryCode: 'TH' },
  { code: 'ru', label: 'Русский', countryCode: 'RU' },
  { code: 'zh', label: '中文', countryCode: 'CN' },
  { code: 'es', label: 'Español', countryCode: 'ES' },
  { code: 'mx', label: 'Español (MX)', countryCode: 'MX' },
  { code: 'it', label: 'Italiano', countryCode: 'IT' },
  { code: 'pt', label: 'Português', countryCode: 'PT' },
];

const transitionVariants = {
  initial: { opacity: 0, y: -80 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);

  // Close outside
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.lang-selector')) setLangMenuOpen(false);
      if (!e.target.closest('.mobile-lang-selector')) setMobileLangOpen(false);
      if (!e.target.closest('.mobile-menu-btn') && !e.target.closest('.mobile-menu')) setMenuOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Filter out current language in dropdown options
  const otherLanguages = LANGUAGES.filter(lang => lang.code !== selectedLang.code);

  return (
    <motion.header
      initial="initial"
      animate="animate"
      variants={transitionVariants}
      className="bg-white border-b border-gray-100 sticky top-0 z-50"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} className="flex-shrink-0 flex items-center">
            <div className="bg-gradient-to-r from-gradient-primary to-gradient-secondary p-2 rounded-lg">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">Terminal143</span>
          </motion.div>

          {/* Desktop Links + Language */}
          <div className="hidden md:flex items-center space-x-6">
            {['about','pricing','login'].map(link => (
              <Link
                key={link}
                to={`/${link}`}
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 capitalize"
              >
                {link==='login'?'Sign In':link.charAt(0).toUpperCase()+link.slice(1)}
              </Link>
            ))}
            <div className="relative lang-selector">
              <button
                onClick={(e) => { e.stopPropagation(); setLangMenuOpen(o => !o); }}
                className="flex items-center px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ReactCountryFlag svg countryCode={selectedLang.countryCode} className="w-5 h-5 mr-2" title={selectedLang.countryCode} />
                <span className="text-sm">{selectedLang.code.toUpperCase()}</span>
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-20">
                  {otherLanguages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setSelectedLang(lang); setLangMenuOpen(false); }}
                      className="w-full flex items-center px-3 py-2 hover:bg-gray-100"
                    >
                      <ReactCountryFlag svg countryCode={lang.countryCode} className="w-5 h-5 mr-2" />
                      <span className="text-sm">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden mobile-menu-btn">
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {menuOpen ? <XMarkIcon className="h-6 w-6 text-gray-700" /> : <Bars3Icon className="h-6 w-6 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div
            initial={{opacity:0,height:0}}
            animate={{opacity:1,height:'auto'}}
            exit={{opacity:0,height:0}}
            transition={{duration:0.3}}
            className="md:hidden bg-white border-t border-gray-100 mobile-menu z-10"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {['about','pricing','login'].map(link => (
                <Link
                  key={link}
                  to={`/${link}`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  {link==='login'?'Sign In':link.charAt(0).toUpperCase()+link.slice(1)}
                </Link>
              ))}

              {/* Mobile Language Dropdown */}
              <div className="mt-2 border-t border-gray-200 mobile-lang-selector">
                <button
                  className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setMobileLangOpen(o => !o);} }
                >
                  <div className="flex items-center">
                    <ReactCountryFlag svg countryCode={selectedLang.countryCode} className="w-5 h-5 mr-2" />
                    <span className="text-sm">{selectedLang.label}</span>
                  </div>
                  <svg
                    className={`w-4 h-4 transform transition-transform ${mobileLangOpen ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileLangOpen && (
                  <div className="bg-white">
                    {otherLanguages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => { setSelectedLang(lang); setMobileLangOpen(false); setMenuOpen(false); }}
                        className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <ReactCountryFlag svg countryCode={lang.countryCode} className="w-5 h-5 mr-2" />
                        <span className="text-sm">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
};

export default Navbar;
