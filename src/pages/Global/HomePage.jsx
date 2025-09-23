import React, { useEffect, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { itemVariants, containerVariants } from '../../Utlis/animation_variants';
import Skeleton from 'react-loading-skeleton';

// Lazy-loaded components
const Navbar   = React.lazy(() => import('../../components/Layout/Navbar'));
const Footer   = React.lazy(() => import('../../components/Layout/Footer'));
const Hero     = React.lazy(() => import('../Global/components/Hero'));
const Features = React.lazy(() => import('../Global/components/Features'));

export default function HomePage() {
  const { t, i18n, ready } = useTranslation(['common', 'home']);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Recompute stats labels on language change
  const stats = useMemo(() => [
    { value: '50K+', label: t('home:stats.matches') },
    { value: '98%',  label: t('home:stats.verified') },
    { value: '4.9',  label: t('home:stats.rating') },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t, i18n.language]);

  if (!ready) {
    // Prevent flicker during translation load
    return <div className="h-screen flex items-center justify-center"><Skeleton width={200} height={40} /></div>;
  }

  return (
    <>
      <div className="min-h-screen font-sans text-gray-700 antialiased overflow-x-hidden">
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Skeleton count={5} /></div>}>
          <Navbar />
          <Hero />
          <Features />
        </Suspense>

        {/* Stats Section */}
        <section className="bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white py-20" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">{t('home:stats.heading')}</h2>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              role="region"
              aria-labelledby="cta-heading"
            >
              <h2 id="cta-heading" className="text-3xl font-bold text-gray-900 mb-4">
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
                <a
                  href="/register"
                  className=" bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white font-semibold py-2 px-6 rounded-xl transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {t('common:cta.createProfile')}
                </a>
                <a
                  href="/pricing"
                  className="border from-gradient-primary to-gradient-secondary font-semibold py-2 px-6 rounded-xl transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {t('common:cta.viewPricing')}
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>
    </>
  );
}
