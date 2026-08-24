import React, { Suspense, useEffect } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'

const Navbar = React.lazy(() => import('../../../components/Layout/Navbar'))
const Footer = React.lazy(() => import('../../../components/Layout/Footer'))

// Child Safety Standards page.
// Required by Google Play's Child Safety Standards policy for social/dating apps.
// Publicly reachable at /child-safety. Content reflects the platform's actual
// enforcement (18+ gate, backend rejection, moderation detection, in-app reporting).
const CONTACT_EMAIL = 'support23@passormatch.com'

export default function ChildSafety() {
  const { t } = useTranslation('legal')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const adultsItems = t('childSafety.adults.items', { returnObjects: true })
  const prohibitedItems = t('childSafety.prohibited.items', { returnObjects: true })
  const detectionItems = t('childSafety.detection.items', { returnObjects: true })
  const reportingSteps = t('childSafety.reporting.steps', { returnObjects: true })

  const asArray = (v) => (Array.isArray(v) ? v : Object.values(v || {}))

  const emailLink = (
    <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#D2449D] font-semibold hover:underline">
      {CONTACT_EMAIL}
    </a>
  )

  return (
    <>
      <div className="min-h-screen font-sans text-gray-700 antialiased overflow-x-hidden">
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Skeleton count={5} /></div>}>
          <Navbar />
        </Suspense>

        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-8 border-l-4 border-[#D2449D]">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('childSafety.pageTitle')}</h1>
              <p className="text-gray-500 text-sm mb-8">{t('childSafety.lastUpdated')}</p>

              <div className="prose prose-lg max-w-none space-y-6 text-gray-700">

                {/* Commitment */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('childSafety.commitment.heading')}</h2>
                  <p>{t('childSafety.commitment.body')}</p>
                </div>

                {/* Adults only */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('childSafety.adults.heading')}</h2>
                  <p>{t('childSafety.adults.body')}</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {asArray(adultsItems).map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>

                {/* Prohibited */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('childSafety.prohibited.heading')}</h2>
                  <p>{t('childSafety.prohibited.body')}</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {asArray(prohibitedItems).map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>

                {/* Detection & moderation */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('childSafety.detection.heading')}</h2>
                  <p>{t('childSafety.detection.body')}</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {asArray(detectionItems).map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>

                {/* In-app reporting */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('childSafety.reporting.heading')}</h2>
                  <p>{t('childSafety.reporting.body')}</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {asArray(reportingSteps).map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                  <p>
                    <Trans i18nKey="childSafety.reporting.emailNote" t={t} components={{ email: emailLink }} />
                  </p>
                </div>

                {/* Reporting to authorities */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('childSafety.authorities.heading')}</h2>
                  <p>{t('childSafety.authorities.body')}</p>
                </div>

                {/* Point of contact */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('childSafety.contact.heading')}</h2>
                  <p>{t('childSafety.contact.body')}</p>
                  <p>{emailLink}</p>
                </div>

              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={<div className="h-40" />}>
          <Footer />
        </Suspense>
      </div>
    </>
  )
}
