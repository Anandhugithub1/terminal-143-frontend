import React, { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'

const Navbar = React.lazy(() => import('../../../components/Layout/Navbar'))
const Footer = React.lazy(() => import('../../../components/Layout/Footer'))

export default function Privacy() {
  const { t } = useTranslation('common')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
              <p className="text-gray-500 text-sm mb-8">Last updated: July 29, 2026</p>

              <div className="prose prose-lg max-w-none space-y-6 text-gray-700">

                {/* Introduction */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Introduction</h2>
                  <p>
                    PassorMatch ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                  </p>
                </div>

                {/* Information We Collect */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Information You Provide:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Account information (name, email, phone, date of birth)</li>
                    <li>Profile information (photos, bio, location preferences)</li>
                    <li>Communication data (messages, support inquiries)</li>
                    <li>Payment information (processed securely by third-party providers)</li>
                    <li>Preference information (interests, dating preferences, gender)</li>
                    <li>Reports, blocks, and safety-related information you or others submit about your account</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Automatically Collected Information:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Device information (IP address, device type, browser type)</li>
                    <li>Usage data (features accessed, time spent, actions taken)</li>
                    <li>Location data, used to show your approximate distance to other users and to match you with people nearby (if you grant permission)</li>
                    <li>Cookies and similar technologies</li>
                  </ul>
                </div>

                {/* Photos & Profile Visibility */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Photos & Profile Visibility</h2>
                  <p>
                    Your profile photos, bio, and other profile details you choose to display are visible to other users of the Service as part of its core matching functionality. We may use automated tools and human review to screen uploaded photos and content for policy violations (e.g. nudity, impersonation, or illegal content) before or after they become visible to other users.
                  </p>
                </div>

                {/* How We Use Information */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide and improve our services</li>
                    <li>Create and manage your account</li>
                    <li>Facilitate connections and matches</li>
                    <li>Send service-related updates and communications</li>
                    <li>Prevent fraud and ensure safety</li>
                    <li>Comply with legal obligations</li>
                    <li>Marketing and promotional purposes (with your consent)</li>
                  </ul>
                </div>

                {/* Data Sharing */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Data Sharing & Disclosure</h2>
                  <p>
                    We do not sell your personal information. We may share data with:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Service providers (hosting, payment processing, analytics)</li>
                    <li>Law enforcement (when legally required, including in response to safety reports involving harassment, threats, or suspected criminal activity)</li>
                    <li>Other users (profile information you choose to display, and limited details in connection with a report you file or that is filed against you)</li>
                  </ul>
                </div>

                {/* Security */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Data Security</h2>
                  <p>
                    We implement industry-standard security measures to protect your information, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure.
                  </p>
                </div>

                {/* Your Rights */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Your Privacy Rights</h2>
                  <p>Depending on your location, you may have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access your personal information</li>
                    <li>Request correction of inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Data portability</li>
                  </ul>
                </div>

                {/* Cookies */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Cookies & Tracking</h2>
                  <p>
                    We use cookies and similar technologies to enhance your experience, analyze usage, and personalize content. You can control cookie preferences through your browser settings.
                  </p>
                </div>

                {/* Children's Privacy */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Children's Privacy</h2>
                  <p>
                    PassorMatch is not intended for users under 18. We do not knowingly collect data from minors. If we become aware of such data, we will take steps to delete it promptly.
                  </p>
                </div>

                {/* Contact Us */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Contact Us</h2>
                  <p>
                    If you have privacy concerns or requests, please contact us at:
                  </p>
                  <p className="mt-2">
                    <strong>Email:</strong> privacy@passormatch.com<br/>
                    <strong>Address:</strong> PassorMatch, Bangkok, Thailand
                  </p>
                </div>

                {/* Changes to Policy */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Changes to This Policy</h2>
                  <p>
                    We may update this Privacy Policy periodically. Changes will be posted on this page with an updated "Last updated" date. Your continued use of our services indicates acceptance of the revised policy.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Have questions about your privacy?</h2>
            <p className="text-gray-600 mb-6">Our support team is here to help</p>
            <a 
              href="/register" 
              className="inline-block bg-[#D2449D] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#B83884] transition-colors duration-300 shadow-md"
            >
              Contact Support
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
