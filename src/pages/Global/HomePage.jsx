// src/pages/HomePage.jsx
import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import Hero from '../../components/Global/Hero';
import Features from '../../components/Global/Features';
import { PrimaryButton, SecondaryButton } from '../../shared/Button';
import { itemVariants, containerVariants } from '../../Utlis/animation_variants';

export default function HomePage() {
  const { t, i18n } = useTranslation(['common', 'home']);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Recompute stats labels whenever the active language changes
  const stats = useMemo(() => [
    { value: '50K+', label: t('home:stats.matches') },
    { value: '98%',  label: t('home:stats.verified') },
    { value: '4.9',  label: t('home:stats.rating') },
  ], [t, i18n.language]);


  return (
    <div className="min-h-screen font-sans text-gray-700 antialiased overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 
            By giving the container a key that includes the current language,
            React will fully remount this block when the user switches language,
            so you'll see the new translated labels immediately.
          */}
          <motion.div
            key={i18n.language}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8 text-center"
          >
            {stats.map(stat => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="p-6"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-indigo-100 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="bg-white rounded-2xl p-8 shadow-2xl border border-transparent bg-gradient-to-br from-white via-white to-indigo-50"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home:ctaHeading')}
            </h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              {t('home:ctaText')}
            </p>
            <motion.div
              className="flex justify-center gap-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <PrimaryButton
                to="/register"
                className="!py-2 px-6 transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                {t('common:cta.createProfile')}
              </PrimaryButton>
              <SecondaryButton to="/pricing">
                {t('common:cta.viewPricing')}
              </SecondaryButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
