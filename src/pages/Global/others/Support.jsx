import React, { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'

const Navbar = React.lazy(() => import('../../../components/Layout/Navbar'))
const Footer = React.lazy(() => import('../../../components/Layout/Footer'))

export default function Support() {
  const { t } = useTranslation('legal')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <>
      <div className="min-h-screen font-sans text-gray-700 antialiased overflow-x-hidden">
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Skeleton count={5} /></div>}>
          <Navbar />
        </Suspense>

        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-8 border-l-4 border-[#D2449D] text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('support.pageTitle')}</h1>
              <p className="text-gray-500 text-sm mb-8">{t('support.subtitle')}</p>

              <div className="prose prose-lg max-w-none text-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('support.heading')}</h2>
                <p>{t('support.body')}</p>
                <p className="mt-6 text-xl">
                  <strong>{t('support.emailLabel')}</strong>{' '}
                  <a
                    href={`mailto:${t('support.email')}`}
                    className="text-[#D2449D] font-semibold hover:underline"
                  >
                    {t('support.email')}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={<div className="h-32 flex items-center justify-center"><Skeleton count={3} /></div>}>
          <Footer />
        </Suspense>
      </div>
    </>
  )
}
