// src/components/Layout/Footer.jsx
import React from 'react'
import { HeartIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation('nav')

  const sections = [
    { key: 'company', links: ['blog', 'places'] },
    // { key: 'legal', links: ['privacy','terms','security'] },
    // { key: 'connect', links: ['contact','faq','press'] },
  ]

  return (
    <footer role="contentinfo" className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">

        <div className="grid md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-gradient-primary to-gradient-secondary">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">
                {t('brand')}
              </span>
            </div>
            <p className="text-sm mt-2">{t('tagline')}</p>
          </div>

          {/* Links */}
          {sections.map(section => (
            <div key={section.key}>
              <h4 className="text-sm font-semibold text-white">
                {t(`sections.${section.key}`)}
              </h4>

              <ul className="mt-2 space-y-2">
                {section.links.map(link => (
                  <li key={link}>
                    <Link
                      to={`/${link}`}
                      className="hover:text-indigo-400 transition-transform duration-200 hover:translate-x-1"
                    >
                      {t(`links.${link}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* SEO internal links (important for your blog strategy) */}
        {/* <div className="mt-10 text-sm text-gray-400 space-x-4">
          <Link to="/thai-dating-culture-guide">Thai Dating Culture</Link>
          <Link to="/best-dating-apps-thailand">Best Dating Apps</Link>
          <Link to="/cost-of-dating-in-thailand">Dating Costs</Link>
          <Link to="/how-to-meet-thai-women">How to Meet Thai Women</Link>
        </div> */}

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          <p>{t('copyright')}</p>
        </div>

      </div>
    </footer>
  )
}