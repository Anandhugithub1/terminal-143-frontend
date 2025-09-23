/* eslint-disable no-unused-vars */
import React from 'react'
import { itemVariants, containerVariants } from "../../../../Utlis/animation_variants";
import { plans, } from "../../../../Utlis/Global/pricing";
import { CheckIcon } from "@heroicons/react/24/outline";
import { PrimaryButton } from '../../../../shared/Button';
import { motion } from 'framer-motion';

const PricingCard = () => {
  return (

<>
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

</>

  )
}

export default PricingCard