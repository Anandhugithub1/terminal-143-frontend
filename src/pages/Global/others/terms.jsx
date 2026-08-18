import React, { Suspense, useEffect } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'

const Navbar = React.lazy(() => import('../../../components/Layout/Navbar'))
const Footer = React.lazy(() => import('../../../components/Layout/Footer'))

export default function Terms() {
  const { t } = useTranslation('legal')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const licenseItems = t('terms.license.items', { returnObjects: true })
  const accountsItems = t('terms.accounts.items', { returnObjects: true })
  const acceptableUseItems = t('terms.acceptableUse.items', { returnObjects: true })
  const safetyItems = t('terms.safety.items', { returnObjects: true })

  return (
    <>
      <div className="min-h-screen font-sans text-gray-700 antialiased overflow-x-hidden">
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Skeleton count={5} /></div>}>
          <Navbar />
        </Suspense>

        {/* Terms of Service Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-8 border-l-4 border-[#D2449D]">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('terms.pageTitle')}</h1>
              <p className="text-gray-500 text-sm mb-8">{t('terms.lastUpdated')}</p>

              <div className="prose prose-lg max-w-none space-y-6 text-gray-700">

                {/* Introduction */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.acceptance.heading')}</h2>
                  <p>{t('terms.acceptance.body')}</p>
                </div>

                {/* Use License */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.license.heading')}</h2>
                  <p>{t('terms.license.intro')}</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {Object.values(licenseItems).map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>

                {/* User Accounts */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.accounts.heading')}</h2>
                  <p>{t('terms.accounts.intro')}</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {Object.values(accountsItems).map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>

                {/* No Guarantee of Matches */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.noGuarantee.heading')}</h2>
                  <p>{t('terms.noGuarantee.body')}</p>
                </div>

                {/* Acceptable Use */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.acceptableUse.heading')}</h2>
                  <p>{t('terms.acceptableUse.intro')}</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {Object.values(acceptableUseItems).map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>

                {/* Dating Safety & In-Person Meetings */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.safety.heading')}</h2>
                  <p>{t('terms.safety.intro')}</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {Object.values(safetyItems).map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                  <p className="mt-3">{t('terms.safety.outro')}</p>
                </div>

                {/* Reporting, Blocking & Enforcement */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.reporting.heading')}</h2>
                  <p>{t('terms.reporting.body')}</p>
                </div>

                {/* Content Ownership */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.content.heading')}</h2>
                  <p>{t('terms.content.body')}</p>
                </div>

                {/* Liability Disclaimer */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.warranties.heading')}</h2>
                  <p>{t('terms.warranties.body')}</p>
                </div>

                {/* Limitation of Liability */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.liability.heading')}</h2>
                  <p>{t('terms.liability.body')}</p>
                </div>

                {/* Accuracy of Materials */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.accuracy.heading')}</h2>
                  <p>{t('terms.accuracy.body')}</p>
                </div>

                {/* Links */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.links.heading')}</h2>
                  <p>{t('terms.links.body')}</p>
                </div>

                {/* Modifications */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.modifications.heading')}</h2>
                  <p>{t('terms.modifications.body')}</p>
                </div>

                {/* Governing Law */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.governingLaw.heading')}</h2>
                  <p>
                    <Trans
                      i18nKey="terms.governingLaw.body"
                      t={t}
                      components={{ link: <a href="/privacy" className="text-[#D2449D] font-medium hover:underline" /> }}
                    />
                  </p>
                </div>

                {/* Contact */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('terms.contact.heading')}</h2>
                  <p>{t('terms.contact.intro')}</p>
                  <p className="mt-2">
                    <strong>{t('terms.contact.emailLabel')}</strong> {t('terms.contact.email')}<br/>
                    <strong>{t('terms.contact.addressLabel')}</strong> {t('terms.contact.address')}
                  </p>
                </div>

                {/* Agreement */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm">
                    <strong>{t('terms.agreement')}</strong>
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.cta.heading')}</h2>
            <p className="text-gray-600 mb-6">{t('terms.cta.subheading')}</p>
            <a
              href="/register"
              className="inline-block bg-[#D2449D] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#B83884] transition-colors duration-300 shadow-md"
            >
              {t('terms.cta.button')}
            </a>
          </div>
        </section>

        <Suspense fallback={<div className="h-32 flex items-center justify-center"><Skeleton count={3} /></div>}>
          <Footer />
        </Suspense>
      </div>
    </>
  )
}
