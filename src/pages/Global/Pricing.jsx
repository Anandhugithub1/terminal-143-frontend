import React from "react";

import { PrimaryButton, SecondaryButton } from "../../shared/Button";
import InView from "../../shared/components/InView";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { plans, faqs } from "../../Utlis/Global/pricing";
import PricingCard from "./components/Cards/PricingCard";

// Lazy-loaded components
const Navbar   = React.lazy(() => import('../../components/Layout/Navbar'));

const Footer   = React.lazy(() => import('../../components/Layout/Footer'));
const PricingPage = () => {
    
  return (
    <div className="min-h-screen font-sans text-gray-700 antialiased overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Reduced spacing */}
      <section className="bg-gradient-to-b from-gray-50 to-white pt-16 pb-12 sm:pt-20 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-5">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight animate-fade-in-down">
              Straightforward Pricing
            </h1>
            <p
              className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-down"
              style={{ animationDelay: "100ms", animationFillMode: "backwards" }}
            >
              Choose the plan that works best for you<br className="hidden sm:block" />
              <span className="whitespace-nowrap">Cancel anytime</span>
            </p>

            {/* Added decorative element */}
            <div
              className="mt-6 flex justify-center animate-fade-in-down"
              style={{ animationDelay: "200ms", animationFillMode: "backwards" }}
            >
              <div className="h-1 w-16 bg-gradient-to-r from-gradient-primary to-gradient-secondary rounded-full" />
            </div>
          </div>
        </div>
      </section>

 <PricingCard/>

     {/* Feature Comparison Table */}
<section className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <InView className="bg-white rounded-xl shadow-lg ring-1 ring-gray-900/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left py-6 pl-8 pr-6 text-gray-600 font-semibold text-sm uppercase tracking-wide">
                Features
              </th>
              {plans.map((plan) => (
                <th
                  key={plan.name}
                  className="text-center py-6 px-8 text-gray-900 font-semibold text-lg"
                >
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              "Basic matching algorithm",
              "5 matches/week",
              "Profile verification",
              "Limited message history",
              "Priority verification",
              "Unlimited matches",
              "Dedicated account manager",
            ].map((feature) => (
              <tr 
                key={feature}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="py-5 pl-8 pr-6 text-gray-700 font-medium text-base">
                  {feature}
                </td>
                {plans.map((plan) => (
                  <td key={plan.name} className="text-center py-5 px-8">
                    <div className="flex justify-center items-center">
                      {plan.features.includes(feature) ? (
                        <CheckIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </InView>
  </div>
</section>

      {/* FAQ Section with animated chevrons */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <InView>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  className="group"
                >
                  <details className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <summary className="flex justify-between items-center p-5 cursor-pointer">
                      <span className="text-lg font-medium text-gray-900">
                        {faq.question}
                      </span>
                      <span
                        className={`ml-4 flex-shrink-0 transition-transform duration-200 ${
                          index === 0 ? "rotate-180" : ""
                        }`}
                      >
                        <ChevronDownIcon className="w-6 h-6 text-gray-400 group-hover:text-gray-500 group-open:text-gradient-primary transition-colors" />
                      </span>
                    </summary>
                    <div className="px-5 pb-5 pt-2 text-gray-600 border-t border-gray-100">
                      {faq.answer}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </InView>
        </div>
      </section>

      {/* Final CTA with enhanced gradient */}
      <section className="bg-gradient-to-br from-gradient-primary to-gradient-secondary py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <InView className="text-white space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Ready for Authentic Connections?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 max-w-xl mx-auto">
              Join thousands of professionals finding meaningful relationships
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <PrimaryButton
                to="/register"
                className="!bg-white  hover:!bg-gray-50 shadow-lg !px-8 !py-3.5 text-base"
              >
                Start Free Trial
              </PrimaryButton>
              <SecondaryButton
                to="/about"
                className="!border-white/30 !text-gradient-secondary hover:!bg-white/5 !px-8 !py-3.5 text-base"
              >
                Login Now
              </SecondaryButton>
            </div>
            <p className="text-sm text-white/80 mt-4">
              No credit card required • 7-day free trial • Cancel anytime
            </p>
          </InView>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;