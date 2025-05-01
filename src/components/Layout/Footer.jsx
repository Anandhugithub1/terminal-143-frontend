// src/components/Layout/Footer.jsx
import React from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation('nav');

  const sections = [
    { key: 'company', links: ['about','careers','blog'] },
    { key: 'legal',   links: ['privacy','terms','security'] },
    { key: 'connect', links: ['contact','faq','press'] },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-900 text-gray-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-gradient-primary to-gradient-secondary p-2 rounded-lg">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">
                {t('brand')}
              </span>
            </motion.div>
            <p className="text-sm">
              {t('tagline')}
            </p>
          </div>

          {/* Link Sections */}
          {sections.map(section => (
            <div key={section.key} className="space-y-2">
              <h4 className="text-sm font-semibold text-white">
                {t(`sections.${section.key}`)}
              </h4>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <motion.li key={link} whileHover={{ x: 5 }}>
                    <Link
                      to={`/${link}`}
                      className="hover:text-indigo-400 transition-colors duration-300 capitalize"
                    >
                      {t(`links.${link}`)}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="border-t border-gray-800 mt-12 pt-8 text-center text-sm"
        >
          <div
            className="whitespace-pre-wrap"
            // render any HTML entities (e.g. &copy;) correctly
            dangerouslySetInnerHTML={{ __html: t('copyright') }}
          />
        </motion.div>
      </div>
    </motion.footer>
  );
}
