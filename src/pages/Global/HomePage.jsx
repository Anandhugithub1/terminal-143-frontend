import React, { useEffect, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { itemVariants, containerVariants } from '../../Utlis/animation_variants';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { Link } from 'react-router-dom';

// Lazy-loaded components
const Navbar   = React.lazy(() => import('../../components/Layout/Navbar'));
const Footer   = React.lazy(() => import('../../components/Layout/Footer'));
const Hero     = React.lazy(() => import('../../components/Global/Hero'));
const Features = React.lazy(() => import('../../components/Global/Features'));

export default function HomePage() {
  const { t } = useTranslation('home');
  const { t: tCommon, i18n, ready } = useTranslation('common');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Recompute stats on language change
  const stats = useMemo(() => [
    { value: '50K+', label: t('stats.matches') },
    { value: '98%',  label: t('stats.verified') },
    { value: '4.9',  label: t('stats.rating') },
  ], [t, i18n.language]);

  if (!ready) {
    return (
      <SkeletonTheme baseColor="#e5e7eb" highlightColor="#f3f4f6">
        <div className="h-screen flex items-center justify-center">
          <Skeleton width={200} height={40} />
        </div>
      </SkeletonTheme>
    );
  }

  return (
    <SkeletonTheme baseColor="#e5e7eb" highlightColor="#f3f4f6">
      <div className="min-h-screen font-sans text-gray-700 antialiased overflow-x-hidden">

        {/* Navbar */}
        <Suspense fallback={<Skeleton height={60} />}>
          <Navbar />
        </Suspense>

        {/* Hero & Features */}
        <Suspense fallback={<Skeleton count={3} />}>
          <Hero />
          <Features />
        </Suspense>

        {/* Stats Section */}
        <section className="bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white py-20" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">{t('stats.heading')}</h2>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
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
              role="region"
              aria-labelledby="cta-heading"
            >
              <h2 id="cta-heading" className="text-3xl font-bold text-gray-900 mb-4">
                {t('ctaHeading')}
              </h2>
              <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                {t('ctaText')}
              </p>
              <motion.div
                className="flex justify-center gap-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white font-semibold py-2 px-6 rounded-xl transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {tCommon('cta.createProfile')}
                </Link>
                <Link
                  to="/pricing"
                  className="border border-indigo-500 text-indigo-600 font-semibold py-2 px-6 rounded-xl transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {tCommon('cta.viewPricing')}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <Suspense fallback={null}>
          <Footer />
        </Suspense>

      </div>
    </SkeletonTheme>
  );
}
