/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/Layout/Navbar";
import Footer from "../../components/Layout/Footer";
import { PrimaryButton, SecondaryButton } from "../../shared/Button";
import { itemVariants, containerVariants } from "../../Utlis/animation_variants";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { plans, faqs } from "../../Utlis/Global/pricing";

const PricingPage = () => {
    
  return (
    <div className="min-h-screen font-sans text-gray-700 antialiased overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Reduced spacing */}
      <section className="bg-gradient-to-b from-gray-50 to-white pt-16 pb-12 sm:pt-20 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-5"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight"
            >
              Straightforward Pricing
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Choose the plan that works best for you<br className="hidden sm:block" /> 
              <span className="whitespace-nowrap">Cancel anytime</span>
            </motion.p>
            
            {/* Added decorative element */}
            <motion.div 
              variants={itemVariants}
              className="mt-6 flex justify-center"
            >
              <div className="h-1 w-16 bg-gradient-to-r from-gradient-primary to-gradient-secondary rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards with enhanced visual hierarchy */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={itemVariants}
                className={`relative group ${
                  plan.featured
                    ? "ring-2 ring-offset-2 ring-gradient-secondary shadow-2xl"
                    : "ring-1 ring-gray-200 hover:ring-gray-300"
                } rounded-xl bg-white p-6 transition-all duration-200 ease-out`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {plan.featured && (
                  <div className="absolute -top-4 inset-x-0 mx-auto w-fit bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-base">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="text-4xl font-bold text-gray-900 flex items-end justify-center">
                    {plan.price === "Custom" ? (
                      <span>{plan.price}</span>
                    ) : (
                      <>
                        <span className="text-3xl mr-1">฿</span>
                        {plan.price}
                        <span className="text-lg text-gray-600 ml-2">/{plan.billing}</span>
                      </>
                    )}
                  </div>
                  {plan.originalPrice && (
                    <div className="mt-3 text-center">
                      <span className="text-gray-500 line-through mr-2">
                        ฿{plan.originalPrice}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        Save 20%
                      </span>
                    </div>
                  )}
                </div>

                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <span className="ml-3 text-gray-700 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <PrimaryButton
                  to="/register"
                  className="w-full justify-center !py-3.5 font-medium shadow-lg hover:shadow-none"
                >
                  {plan.cta}
                </PrimaryButton>
              </motion.div>
            ))}
          </motion.div>

          {/* Added helper text */}
          <p className="text-center text-gray-500 mt-8 text-sm">
            All plans include a 7-day free trial. No credit card required.
          </p>
        </div>
      </section>

     {/* Feature Comparison Table */}
<section className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl shadow-lg ring-1 ring-gray-900/5 overflow-hidden"
    >
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
    </motion.div>
  </div>
</section>

      {/* FAQ Section with animated chevrons */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold text-center text-gray-900 mb-10"
            >
              Frequently Asked Questions
            </motion.h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  variants={itemVariants}
                  className="group"
                >
                  <details className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <summary className="flex justify-between items-center p-5 cursor-pointer">
                      <span className="text-lg font-medium text-gray-900">
                        {faq.question}
                      </span>
                      <motion.span
                        initial={false}
                        className="ml-4 flex-shrink-0"
                        animate={{ rotate: index === 0 ? 180 : 0 }}
                      >
                        <ChevronDownIcon className="w-6 h-6 text-gray-400 group-hover:text-gray-500 group-open:text-gradient-primary transition-colors" />
                      </motion.span>
                    </summary>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-5 pb-5 pt-2 text-gray-600 border-t border-gray-100"
                    >
                      {faq.answer}
                    </motion.div>
                  </details>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA with enhanced gradient */}
      <section className="bg-gradient-to-br from-gradient-primary to-gradient-secondary py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="text-white space-y-6"
          >
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
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;