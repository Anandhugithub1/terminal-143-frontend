// src/components/Layout/Footer.jsx
import React from 'react'
import { HeartIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation('nav')

  const sections = [
    { key: 'company', links: ['blog', 'places'] },
  ]

  // helper function to decide link type
  const renderLink = (link, label, className) => {
    // STATIC PAGES → use <a>
    if (link === 'blog') {
      return (
        <a href="/blog" className={className}>
          {label}
        </a>
      )
    }

    if (link === 'places') {
      return (
        <a href="/places" className={className}>
          {label}
        </a>
      )
    }

    // REACT ROUTES → use <Link>
    return (
      <Link to={`/${link}`} className={className}>
        {label}
      </Link>
    )
  }

  return (
    <footer role="contentinfo" className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">

        <div className="grid md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
          
        
<a href="/" className="text-2xl font-bold tracking-tight text-[#D2449D]">
  <span className="text-white">PassorMatch</span>
</a>
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
                    {renderLink(
                      link,
                      t(`links.${link}`),
                      "hover:text-indigo-400 transition-transform duration-200 hover:translate-x-1"
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          <p>{t('copyright')}</p>
        </div>

      </div>
    </footer>
  )
}