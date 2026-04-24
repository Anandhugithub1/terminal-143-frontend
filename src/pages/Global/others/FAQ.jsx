import React, { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'

const Navbar = React.lazy(() => import('../../../components/Layout/Navbar'))
const Footer = React.lazy(() => import('../../../components/Layout/Footer'))

export default function FAQ() {
  const { t } = useTranslation('common')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const faqCards = [
    {
      icon: '💰',
      title: 'Is PassorMatch really free?',
      answer: 'Yep! Sign up, create your profile, browse members, and send messages — all free, plenty of people find love without spending a baht. 💖'
    },
    {
      icon: '✅',
      title: 'Are profiles verified? (no bots, please)',
      answer: 'We hate bots too. That\'s why we added photo verification + AI moderation. Verified members get a blue checkmark. You can filter to see only verified profiles. It\'s not 100% perfect, but we remove fake accounts daily. Real people first. 🙌'
    },
    {
      icon: '❤️',
      title: 'How does matching work?',
      answer: 'Simple: you see profiles based on your age, distance, and interests. Swipe right to "heart" someone. If they heart you back → instant match! You can also send a first message with a compliment. No endless waiting. 💬'
    },
    {
      icon: '🔒',
      title: 'Is my data safe?',
      answer: 'We never sell your info. You control who sees your photos. Also, you can hide your profile anytime. Safety first, always. 🛡️'
    }
  ]

  const thaiDatingFaqCards = [
    {
      emoji: '🇹🇭🤝',
      title: 'Is dating in Thailand safe for travelers & expats?',
      answer: 'Absolutely — millions of people date safely here every year. Just like anywhere else: meet in public (cafés, malls, markets), tell a friend where you\'re going, and trust your gut. On PassorMatch, we encourage video chat before the first date. Most people are genuinely looking for connection, but a little caution goes a long way. 😊'
    },
    {
      emoji: '🏙️',
      title: 'Which Thai city is best for dating?',
      answer: 'Bangkok is the most active — endless options. Phuket is great for beach vibes and international crowd. We have dedicated guides for Bangkok and Phuket dating.'
    },
    {
      emoji: '🙏',
      title: 'What\'s Thai dating culture really like?',
      answer: 'Warm, family-oriented, and full of smiles. 😄 Don\'t rush physical intimacy — many Thais prefer to take things slow. Public displays of affection are fine (holding hands), but too much is frowned upon. Also, showing respect to elders and being "jai yen" (cool heart) matters a lot. Learn a few Thai words like "Khob khun" (thank you) — it melts hearts. 💕'
    },
    {
      emoji: '💬',
      title: 'How to meet Thai singles (online + offline)?',
      answer: 'Online: PassorMatch is the easiest — you filter by city and interests. Offline: try language exchange meetups, fitness classes, night markets, or even volunteering. Thai people are generally friendly, but many are shy to approach foreigners first. A genuine smile and a simple "Sawasdee" works wonders. ✨'
    }
  ]

  return (
    <>
      <div className="min-h-screen font-sans text-gray-700 antialiased overflow-x-hidden">
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Skeleton count={5} /></div>}>
          <Navbar />
        </Suspense>

        <main>
          {/* HERO (human & friendly) */}
          <section className="px-5 py-16 md:py-20 text-center border-b border-pink-100" style={{background: 'linear-gradient(135deg, #FFF5F9 0%, #FFEAF1 100%)'}}>
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-gray-700 border border-pink-200 shadow-sm mb-5">
                <span></span> <span>Real answers · No fluff</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
                Dating FAQ & App Guide
              </h1>
              <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
                We've gathered the most honest answers — from <strong className="text-[#D2449D]">how PassorMatch works</strong> to real Thai dating culture.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a href="#app-faq" className="bg-white text-gray-800 px-5 py-2.5 rounded-full shadow-sm border border-gray-200 font-medium hover:shadow-md transition">📱 App questions</a>
                <a href="#thai-dating-faq" className="bg-white text-gray-800 px-5 py-2.5 rounded-full shadow-sm border border-gray-200 font-medium hover:shadow-md transition">🇹🇭 Dating in Thailand</a>
                <a href="/register" className="bg-[#D2449D] text-white px-5 py-2.5 rounded-full shadow-md font-medium hover:bg-[#b8387e] transition">✨ Meet singles today</a>
              </div>
            </div>
          </section>

          {/* APP FAQ SECTION */}
          <section id="app-faq" className="max-w-6xl mx-auto px-5 py-16 md:py-20">
            <div className="text-center mb-12">
              <span className="text-sm font-semibold uppercase tracking-wider text-[#D2449D]/70 bg-pink-50 px-3 py-1 rounded-full">App guide</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-3">How PassorMatch actually works</h2>
              <p className="text-gray-500 mt-2 max-w-xl mx-auto">No hidden tricks — just real features that help you connect.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-7">
              {faqCards.map((card, idx) => (
                <div key={idx} className="faq-card bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="bg-pink-50 w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0">{card.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold">{card.title}</h3>
                      <p className="text-gray-600 mt-2 leading-relaxed">{card.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* DATING IN THAILAND FAQ */}
          <section id="thai-dating-faq" className="bg-gray-50/60 border-t border-gray-100">
            <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
              <div className="text-center mb-12">
                <span className="text-sm font-semibold uppercase tracking-wider text-[#D2449D]/70 bg-white px-3 py-1 rounded-full shadow-sm">Culture & tips</span>
                <h2 className="text-3xl md:text-4xl font-bold mt-3">Dating in Thailand — what nobody tells you</h2>
                <p className="text-gray-500 mt-2 max-w-2xl mx-auto">Real insights from locals + expats who've been there.</p>
              </div>

              <div className="space-y-6">
                {thaiDatingFaqCards.map((card, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-wrap gap-3 items-start">
                      <span className="text-3xl">{card.emoji}</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">{card.title}</h3>
                        <p className="text-gray-600 mt-2 leading-relaxed">{card.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* BLOG / RELATED GUIDES */}
          <section className="max-w-6xl mx-auto px-5 py-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold">📖 From our dating blog</h2>
              <p className="text-gray-500 mt-2">Deep dives, real stories, and practical tips.</p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              <a href="/blog/dating-in-thailand-guide" className="group block bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all">
                <span className="text-3xl">🇹🇭</span>
                <h3 className="font-bold text-lg mt-3 group-hover:text-[#D2449D] transition">Dating in Thailand Guide</h3>
                <p className="text-gray-500 text-sm mt-1">Complete beginner's guide — dos & don'ts</p>
              </a>
              <a href="/blog/thai-dating-culture-guide" className="group block bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all">
                <span className="text-3xl">🎎</span>
                <h3 className="font-bold text-lg mt-3 group-hover:text-[#D2449D] transition">Thai Dating Culture</h3>
                <p className="text-gray-500 text-sm mt-1">Family, respect, and "greng jai" explained</p>
              </a>
              <a href="/blog/how-to-meet-thai-women" className="group block bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all">
                <span className="text-3xl">💃</span>
                <h3 className="font-bold text-lg mt-3 group-hover:text-[#D2449D] transition">How to Meet Thai Women</h3>
                <p className="text-gray-500 text-sm mt-1">Real advice from local women & success stories</p>
              </a>
            </div>
          </section>

          {/* SAFETY NOTE */}
          <div className="max-w-5xl mx-auto px-5 pb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-wrap md:flex-nowrap gap-5 items-center justify-between">
              <div className="flex gap-3 items-start">
                <span className="text-3xl">🧡</span>
                <div>
                  <h3 className="font-bold">From our team: date smart, date happy</h3>
                  <p className="text-gray-600 text-sm">We're real people who built PassorMatch because we believe in authentic connections. If you ever feel unsure, reach out to our support — we reply within hours.</p>
                </div>
              </div>
            </div>
          </div>

          {/* FINAL CTA */}
          <section className="mx-5 my-12 rounded-3xl text-white overflow-hidden shadow-xl" style={{background: 'linear-gradient(to right, #D2449D, #ff85c1)'}}>
            <div className="px-6 py-14 md:py-20 text-center">
              <span className="text-4xl md:text-5xl mb-3 inline-block">💕</span>
              <h2 className="text-3xl md:text-4xl font-extrabold">Ready to meet someone amazing?</h2>
              <p className="text-white/90 text-lg mt-3 max-w-xl mx-auto">Join 15,000+ singles who found friendship, romance, and love on PassorMatch.</p>
              <div className="mt-8">
                <a href="/register" className="inline-block bg-white text-[#D2449D] font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-transform transform hover:scale-105">
                  Create free profile →
                </a>
                <p className="text-white/80 text-sm mt-4">No credit card · 2 minutes setup</p>
              </div>
            </div>
          </section>
        </main>

        <Suspense fallback={<div className="h-32 flex items-center justify-center"><Skeleton count={3} /></div>}>
          <Footer />
        </Suspense>
      </div>

      <style>{`
        .faq-card {
          transition: all 0.2s ease;
        }
        .faq-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 20px -12px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  )
}
