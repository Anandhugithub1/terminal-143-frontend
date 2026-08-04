import React, { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'

const Navbar = React.lazy(() => import('../../../components/Layout/Navbar'))
const Footer = React.lazy(() => import('../../../components/Layout/Footer'))

export default function Terms() {
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

        {/* Terms of Service Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-8 border-l-4 border-[#D2449D]">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
              <p className="text-gray-500 text-sm mb-8">Last updated: August 4, 2026</p>

              <div className="prose prose-lg max-w-none space-y-6 text-gray-700">

                {/* Introduction */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                  <p>
                    By accessing and using PassorMatch ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </div>

                {/* Use License */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Use License</h2>
                  <p>
                    Permission is granted to temporarily download one copy of the materials (information or software) on PassorMatch for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Modifying or copying the materials</li>
                    <li>Using the materials for any commercial purpose or for any public display</li>
                    <li>Attempting to decompile or reverse engineer any software contained on the site</li>
                    <li>Removing any copyright or other proprietary notations from the materials</li>
                    <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
                  </ul>
                </div>

                {/* User Accounts */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">3. User Accounts</h2>
                  <p>
                    When you create an account on PassorMatch, you must:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide accurate and complete information</li>
                    <li>Be at least 18 years of age — PassorMatch is strictly for adults 18 and older, with no exceptions, and we do not permit accounts for anyone under 18</li>
                    <li>Maintain the confidentiality of your password</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Use genuine photos and information</li>
                    <li>Create only one account for your own personal use — accounts may not be shared, sold, or transferred</li>
                  </ul>
                </div>

                {/* No Guarantee of Matches */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">4. No Guarantee of Matches or Compatibility</h2>
                  <p>
                    PassorMatch is a platform that helps you connect with other users; it is not a matchmaking, background-check, or dating-coaching service. We do not guarantee that you will find a match, that any match will be compatible with you, or that any interaction with another user will be safe, truthful, or appropriate. You are solely responsible for your interactions with other users, both on and off the Service.
                  </p>
                </div>

                {/* Acceptable Use */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Acceptable Use Policy</h2>
                  <p>
                    You agree not to use PassorMatch to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Harass, abuse, or threaten other users</li>
                    <li>Post false, misleading, or fraudulent information</li>
                    <li>Impersonate any person, or create a profile using another person's photos or identity ("catfishing")</li>
                    <li>Engage in sexual exploitation or trafficking</li>
                    <li>Spam, scam, or phishing attempts, including requests for money, gift cards, or financial information from other users</li>
                    <li>Violate intellectual property rights</li>
                    <li>Engage in illegal activities</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Post explicit, nude, or illegal content, or content involving minors</li>
                    <li>Solicit or advertise commercial services, including sex work, to other users</li>
                  </ul>
                </div>

                {/* Dating Safety & In-Person Meetings */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Dating Safety & In-Person Meetings</h2>
                  <p>
                    PassorMatch does not conduct criminal background checks on its users and cannot verify the identity, intentions, or truthfulness of any user. You are responsible for exercising your own judgment and caution when communicating with other users and when deciding whether to meet someone in person. We strongly recommend that you:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Never send money, gift cards, or financial information to someone you have not met in person</li>
                    <li>Meet for the first time in a public place, and arrange your own transportation</li>
                    <li>Tell a friend or family member where you are going and who you are meeting</li>
                    <li>Avoid sharing sensitive personal information (home address, financial details, workplace) until you have established trust</li>
                    <li>Trust your instincts and end contact with anyone who makes you feel unsafe or uncomfortable</li>
                  </ul>
                  <p className="mt-3">
                    PassorMatch is not responsible for the conduct of any user, whether online or in person, and disclaims all liability for any interactions, meetings, or relationships arising from use of the Service, to the fullest extent permitted by law.
                  </p>
                </div>

                {/* Reporting, Blocking & Enforcement */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Reporting, Blocking & Enforcement</h2>
                  <p>
                    PassorMatch provides tools to block and report other users. If you encounter behavior that violates these Terms — including harassment, fraud, impersonation, or inappropriate content — please report it through the in-app reporting feature or by contacting us directly. We reserve the right, at our sole discretion, to investigate reports, remove content, and suspend or permanently terminate any account that violates these Terms, without prior notice and without refund of any paid features.
                  </p>
                </div>

                {/* Content Ownership */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Content Ownership & Rights</h2>
                  <p>
                    You retain ownership of content you post, but grant PassorMatch a worldwide, non-exclusive license to use, reproduce, and display your profile information for operating the Service. By posting content, you warrant that you own or have permission to use such content, that any photos are genuinely of you, and that your content does not depict any other identifiable person without their consent.
                  </p>
                </div>

                {/* Liability Disclaimer */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Disclaimer of Warranties</h2>
                  <p>
                    The materials on PassorMatch are provided on an 'as is' basis. PassorMatch makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                  </p>
                </div>

                {/* Limitation of Liability */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Limitation of Liability</h2>
                  <p>
                    In no event shall PassorMatch or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, personal injury, or due to business interruption) arising out of the use or inability to use the materials on PassorMatch, or out of any interaction, meeting, or relationship with another user, even if PassorMatch or an authorized representative has been notified orally or in writing of the possibility of such damage.
                  </p>
                </div>

                {/* Accuracy of Materials */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Accuracy of Materials</h2>
                  <p>
                    The materials appearing on PassorMatch could include technical, typographical, or photographic errors. PassorMatch does not warrant that any of the materials on its website are accurate, complete, or current. PassorMatch may make changes to the materials contained on its website at any time without notice.
                  </p>
                </div>

                {/* Links */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">12. Links</h2>
                  <p>
                    PassorMatch has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by PassorMatch of the site. Use of any such linked website is at the user's own risk.
                  </p>
                </div>

                {/* Modifications */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">13. Modifications</h2>
                  <p>
                    PassorMatch may revise these Terms of Service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these Terms of Service.
                  </p>
                </div>

                {/* Governing Law */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">14. Governing Law</h2>
                  <p>
                    These Terms and Conditions are governed by and construed in accordance with the laws of Thailand, and you irrevocably submit to the exclusive jurisdiction of the courts in Bangkok. This does not affect any mandatory data protection rights you may have under the laws of the country where you live, including Thailand's Personal Data Protection Act (PDPA), the EU/UK General Data Protection Regulation (GDPR), or the California Consumer Privacy Act (CCPA), as described in our <a href="/privacy" className="text-[#D2449D] font-medium hover:underline">Privacy Policy</a>.
                  </p>
                </div>

                {/* Contact */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">15. Contact Information</h2>
                  <p>
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <p className="mt-2">
                    <strong>Email:</strong> legal@passormatch.com<br/>
                    <strong>Address:</strong> PassorMatch, Bangkok, Thailand
                  </p>
                </div>

                {/* Agreement */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm">
                    <strong>By using PassorMatch, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong>
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
            <p className="text-gray-600 mb-6">Join thousands of singles finding meaningful connections</p>
            <a 
              href="/register" 
              className="inline-block bg-[#D2449D] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#B83884] transition-colors duration-300 shadow-md"
            >
              Create Account
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
