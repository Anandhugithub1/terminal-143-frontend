import React, { useMemo, useState, useEffect } from "react";
import { FiSettings, FiBell } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNotifications } from "../../features/Notifications/Hooks/useNotifications";
import ReactCountryFlag from "react-country-flag";

const LANGUAGES = [
  { code: "en", countryCode: "US" },
  { code: "th", countryCode: "TH" },
  { code: "ru", countryCode: "RU" },
  { code: "zh", countryCode: "CN" },
  { code: "ko", countryCode: "KR" },
  { code: "ms", countryCode: "MY" }
];

const TopNav = () => {
  const { t, i18n } = useTranslation(["common"]);
  const { data } = useNotifications();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(
    LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0]
  );

  useEffect(() => {
    const handleClick = e => {
      if (!e.target.closest(".lang-selector")) {
        setLangMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const hasNotifications = useMemo(() => {
    const items = data?.pages?.flatMap(p => p.items) || [];
    return items.length > 0;
  }, [data]);

  return (
    <div
      className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-40"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
    >

      {/* LEFT: App Name */}
      <Link to="/home" className="flex items-center h-10 min-w-0 group">
        <span className="text-base sm:text-xl font-bold tracking-tight text-[#D2449D] whitespace-nowrap">
          Pass<span className="text-gray-800">or</span>Match
        </span>
      </Link>


      {/* RIGHT SIDE */}
      <div className="flex items-center space-x-1 sm:space-x-2">

        {/* Language Switcher */}
        <div className="relative lang-selector">
          <button
            onClick={e => {
              e.stopPropagation();
              setLangMenuOpen(o => !o);
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

          {langMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 
                         bg-white border border-gray-200 
                         rounded-xl shadow-xl 
                         p-1 z-50
                         animate-in fade-in zoom-in-95 duration-150"
            >
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setSelectedLang(lang);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 
                             px-3 py-2.5 
                             text-sm font-medium 
                             rounded-lg
                             transition-all duration-150
                             ${
                               selectedLang.code === lang.code
                                 ? "bg-indigo-50 text-indigo-600"
                                 : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
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

        {/* Settings */}
        <Link
          to="/settings"
          className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FiSettings size={20} className="text-gray-600 hover:text-gray-900" />
        </Link>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FiBell size={20} className="text-gray-600 hover:text-gray-900" />
          {hasNotifications && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </Link>

      </div>
    </div>
  );
};

export default TopNav;
