import React, { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'

const Navbar = React.lazy(() => import('../../../components/Layout/Navbar'))
const Footer = React.lazy(() => import('../../../components/Layout/Footer'))

export default function Privacy() {
  const { t } = useTranslation('legal')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const provided = t('privacy.infoCollect.provided', { returnObjects: true })
  const auto = t('privacy.infoCollect.auto', { returnObjects: true })
  const howWeUseItems = t('privacy.howWeUse.items', { returnObjects: true })
  const sharingItems = t('privacy.sharing.items', { returnObjects: true })
  const retentionItems = t('privacy.retention.items', { returnObjects: true })
  const rightsItems = t('privacy.rights.items', { returnObjects: true })

  return (
    <>
      <div className="min-h-screen font-sans text-gray-700 antialiased overflow-x-hidden">
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Skeleton count={5} /></div>}>
          <Navbar />
        </Suspense>

        {/* Privacy Policy Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-8 border-l-4 border-[#D2449D]">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('privacy.pageTitle')}</h1>
              <p className="text-gray-500 text-sm mb-8">{t('privacy.lastUpdated')}</p>

              <div className="prose prose-lg max-w-none space-y-6 text-gray-700">

                {/* Introduction */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.introduction.heading')}</h2>
                  <p>{t('privacy.introduction.body')}</p>
                </div>

                {/* Information We Collect */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.infoCollect.heading')}</h2>

                  <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">{t('privacy.infoCollect.providedHeading')}</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {Object.values(provided).map((item, i) => <li key={i}>{item}</li>)}
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">{t('privacy.infoCollect.autoHeading')}</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {Object.values(auto).map((item, i) => <li key={i}>{item}</li>)}
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">{t('privacy.infoCollect.analyticsHeading')}</h3>
                  <p>{t('privacy.infoCollect.analyticsBody1')}</p>
                  <p className="mt-3">
                    <strong>{t('privacy.infoCollect.analyticsBody2Strong')}</strong> {t('privacy.infoCollect.analyticsBody2Rest')}
                  </p>
                </div>

                {/* Photos & Profile Visibility */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.photos.heading')}</h2>
                  <p>{t('privacy.photos.body')}</p>
                </div>

                {/* Age Assurance & Biometric Data */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.ageAssurance.heading')}</h2>
                  <p>{t('privacy.ageAssurance.body1')}</p>
                  <p className="mt-3">{t('privacy.ageAssurance.body2')}</p>
                  <p className="mt-3">{t('privacy.ageAssurance.body3')}</p>
                </div>

                {/* Sensitive Information & Circles */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.circles.heading')}</h2>
                  <p>{t('privacy.circles.body1')}</p>
                  <p className="mt-3">
                    <strong>{t('privacy.circles.body2Strong')}</strong> {t('privacy.circles.body2Rest')}
                  </p>
                  <p className="mt-3">{t('privacy.circles.body3')}</p>
                  <p className="mt-3">{t('privacy.circles.body4')}</p>
                </div>

                {/* Health Disclosures */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.health.heading')}</h2>
                  <p>{t('privacy.health.body1')}</p>
                  <p className="mt-3">
                    <strong>{t('privacy.health.body2Strong')}</strong> {t('privacy.health.body2Rest')}
                  </p>
                  <p className="mt-3">{t('privacy.health.body3')}</p>
                </div>

                {/* How We Use Information */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.howWeUse.heading')}</h2>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {Object.values(howWeUseItems).map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                  <p className="mt-3">
                    <strong>{t('privacy.howWeUse.scanningStrong')}</strong> {t('privacy.howWeUse.scanningRest')}
                  </p>
                </div>

                {/* Data Sharing */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.sharing.heading')}</h2>
                  <p>{t('privacy.sharing.intro')}</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {Object.values(sharingItems).map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                  <p className="mt-3">
                    <strong>{t('privacy.sharing.exceptionStrong')}</strong> {t('privacy.sharing.exceptionRest')}
                  </p>
                </div>

                {/* Security */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.security.heading')}</h2>
                  <p>{t('privacy.security.body')}</p>
                </div>

                {/* Data Retention */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.retention.heading')}</h2>
                  <p>{t('privacy.retention.intro')}</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {Object.values(retentionItems).map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                  <p className="mt-3">{t('privacy.retention.outro')}</p>
                </div>

                {/* Your Rights */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.rights.heading')}</h2>
                  <p>{t('privacy.rights.intro')}</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {Object.values(rightsItems).map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                  <p className="mt-3">
                    <strong>{t('privacy.rights.withdrawStrong')}</strong> {t('privacy.rights.withdrawRest')}
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mt-5 mb-2">{t('privacy.rights.thailandHeading')}</h3>
                  <p>{t('privacy.rights.thailandBody')}</p>

                  <h3 className="text-xl font-semibold text-gray-800 mt-5 mb-2">{t('privacy.rights.gdprHeading')}</h3>
                  <p>{t('privacy.rights.gdprBody')}</p>

                  <h3 className="text-xl font-semibold text-gray-800 mt-5 mb-2">{t('privacy.rights.ccpaHeading')}</h3>
                  <p>{t('privacy.rights.ccpaBody')}</p>
                  <p className="mt-3">{t('privacy.rights.exerciseRights')}</p>
                </div>

                {/* Cookies */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.cookies.heading')}</h2>
                  <p>{t('privacy.cookies.body')}</p>
                </div>

                {/* Children's Privacy */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.children.heading')}</h2>
                  <p>{t('privacy.children.body')}</p>
                </div>

                {/* Contact Us */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.contact.heading')}</h2>
                  <p>{t('privacy.contact.intro')}</p>
                  <p className="mt-2">
                    <strong>{t('privacy.contact.emailLabel')}</strong> {t('privacy.contact.email')}<br/>
                    <strong>{t('privacy.contact.addressLabel')}</strong> {t('privacy.contact.address')}
                  </p>
                </div>

                {/* Changes to Policy */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('privacy.changes.heading')}</h2>
                  <p>{t('privacy.changes.body')}</p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.cta.heading')}</h2>
            <p className="text-gray-600 mb-6">{t('privacy.cta.subheading')}</p>
            <a
              href="/support"
              className="inline-block bg-[#D2449D] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#B83884] transition-colors duration-300 shadow-md"
            >
              {t('privacy.cta.button')}
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
