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
              <p className="text-gray-500 text-sm mb-8">Last updated: August 10, 2026</p>

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
                  <p className="mt-3">
                    <strong>Your location is never shown to other users as an exact address or precise coordinate.</strong> Any distance or location shown to other users is approximate ("fuzzed" — for example, rounded to the nearest few kilometers or shown as a general area), not your exact position, and is not sufficient on its own to identify your precise home, workplace, or real-time location.
                  </p>
                </div>

                {/* Photos & Profile Visibility */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Photos & Profile Visibility</h2>
                  <p>
                    Your profile photos, bio, and other profile details you choose to display are visible to other users of the Service as part of its core matching functionality. We may use automated tools and human review to screen uploaded photos and content for policy violations (e.g. nudity, impersonation, or illegal content) before or after they become visible to other users.
                  </p>
                </div>

                {/* Sensitive Information & Circles */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Sensitive Information & Community Groups ("Circles")</h2>
                  <p>
                    The Service lets you join optional interest- and identity-based community groups ("Circles"), some of which may reveal sensitive personal information about you — for example, your sexual orientation or gender identity (such as an LGBTQ+-oriented Circle) or your religion (such as a Religion & Spirituality Circle).
                  </p>
                  <p className="mt-3">
                    <strong>We never share your membership in a sensitive Circle — or the fact that it reveals your sexual orientation, religion, or any similar sensitive category — with advertising partners, ad networks, or analytics/tracking partners.</strong> This information is used solely for in-app purposes: to show you relevant Circles, to power in-app matching and content within the Service, and for safety and moderation. It is never sold, and never used to build advertising profiles, whether by us or by any third party.
                  </p>
                  <p className="mt-3">
                    We also do not use your sensitive Circle membership to enrich or supplement location-based profiling of you — for example, we do not combine your Circle memberships with location data to infer or share more precise information about where you spend time.
                  </p>
                  <p className="mt-3">
                    You choose which Circles to join, and you may leave a Circle at any time; leaving removes it from your visible memberships going forward.
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
                  <p className="mt-3">
                    <strong>Automated content & message scanning:</strong> To detect violations of our Acceptable Use Policy — such as harassment, scams, explicit or illegal content, and other safety risks — content and messages you post or send through the Service may be automatically scanned using third-party moderation tools. This scanning is used for trust and safety purposes only, is not used for advertising, and does not replace your ability to report content or users directly.
                  </p>
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
                  <p className="mt-3">
                    <strong>Exception for sensitive Circle membership:</strong> As described in "Sensitive Information & Community Groups" above, your membership in a Circle that reveals sexual orientation, religion, or a similar sensitive category is never shared with our advertising or analytics service providers, and is excluded from the analytics sharing described above.
                  </p>
                </div>

                {/* Security */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Data Security</h2>
                  <p>
                    We implement industry-standard security measures to protect your information, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure.
                  </p>
                </div>

                {/* Data Retention */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Data Retention</h2>
                  <p>
                    When you delete your account, we delete your account data within 30 days, except for data we are required or permitted to retain longer for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Safety purposes (e.g. records related to reports, blocks, bans, or safety investigations, to prevent banned users from rejoining)</li>
                    <li>Legal obligations (e.g. tax, accounting, or regulatory recordkeeping requirements)</li>
                    <li>Fraud prevention (e.g. information needed to detect and prevent fraudulent accounts or payments)</li>
                  </ul>
                  <p className="mt-3">
                    Data retained for these purposes is kept only as long as necessary for that purpose and is subject to the same security protections described above.
                  </p>
                </div>

                {/* Your Rights */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Your Privacy Rights</h2>
                  <p>Depending on your location, you may have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access your personal information</li>
                    <li>Request correction of inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Data portability</li>
                  </ul>
                  <p className="mt-3">
                    <strong>Withdrawing your consent to gender-based matching:</strong> At signup, you separately agree to let us use your gender to show you and other users relevant matches. Because gender-based matching is core to how the Service works, the way to withdraw this consent is to delete your account in Settings — this immediately stops all matching and removes your profile from other users' view. We do not currently offer a way to keep an active account while opting out of matching alone.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mt-5 mb-2">Thailand — Personal Data Protection Act (PDPA)</h3>
                  <p>
                    If you are located in Thailand, we process your personal data as a data controller under the Personal Data Protection Act B.E. 2562 (2019). In addition to the rights above, you have the right to withdraw consent at any time (where processing is based on consent), the right to object to processing, and the right to lodge a complaint with the Personal Data Protection Committee (PDPC). Sensitive data under the PDPA (which includes data revealing sexual orientation and religion, such as certain Circle memberships described above) is processed only with your explicit consent or another legal basis permitted under the PDPA, and is handled with the heightened protections the PDPA requires.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mt-5 mb-2">European Economic Area & UK — GDPR</h3>
                  <p>
                    If you are located in the EEA or UK, we process your personal data in accordance with the General Data Protection Regulation (GDPR) / UK GDPR. Our legal bases for processing include your consent, performance of our contract with you (providing the Service), our legitimate interests (such as safety and fraud prevention), and compliance with legal obligations. You have the right to access, rectify, erase, restrict, or port your data, to object to processing (including profiling), to withdraw consent at any time, and to lodge a complaint with your local supervisory authority. Special category data (including data revealing sexual orientation and religion) is processed only where a valid GDPR condition applies, such as your explicit consent.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-800 mt-5 mb-2">United States — CCPA/CPRA and other state privacy laws</h3>
                  <p>
                    If you are a California resident, the California Consumer Privacy Act (CCPA), as amended by the CPRA, and other applicable U.S. state privacy laws give you the right to know what personal information we collect, use, and disclose; to request deletion or correction of your information; to opt out of the "sale" or "sharing" of personal information (we do not sell your personal information, and do not share sensitive Circle membership with advertising or analytics partners as described above); and to not be discriminated against for exercising these rights. Sensitive personal information under the CCPA — which includes data revealing sexual orientation and religious beliefs — is used only as necessary to provide the Service and is not used to infer characteristics about you for advertising purposes.
                  </p>
                  <p className="mt-3">
                    To exercise any of these rights, contact us using the details in the "Contact Us" section below. We may need to verify your identity before fulfilling a request.
                  </p>
                </div>

                {/* Cookies */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Cookies & Tracking</h2>
                  <p>
                    We use cookies and similar technologies to enhance your experience, analyze usage, and personalize content. You can control cookie preferences through your browser settings.
                  </p>
                </div>

                {/* Children's Privacy */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Children's Privacy</h2>
                  <p>
                    PassorMatch is strictly for users 18 years of age and older. It is not intended for, and may not be used by, anyone under 18. We do not knowingly collect data from minors. If we become aware that we have collected personal data from someone under 18, we will take steps to delete it promptly and, where applicable, terminate the associated account.
                  </p>
                </div>

                {/* Contact Us */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Contact Us</h2>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Changes to This Policy</h2>
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
