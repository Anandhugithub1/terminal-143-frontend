import { itemVariants ,containerVariants} from "../../Utlis/animation_variants";
import {motion} from 'framer-motion';
import FeatureCard from "../../components/Cards/GlobalFeatureCard";

import React from 'react'
// Icons
import {
  
    ShieldCheckIcon,
    SparklesIcon,
    UserGroupIcon,
  } from "@heroicons/react/24/outline";

const Features = () => {
  return (
    <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="text-center mb-16"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          Why Choose Terminal143
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-gray-600 max-w-2xl mx-auto"
        >
          A modern approach to meaningful connections
        </motion.p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={SparklesIcon}
          title="Smart Matching"
          desc="Our AI-powered algorithm analyzes thousands of data points to find truly compatible matches"
        />
        <FeatureCard
          icon={ShieldCheckIcon}
          title="Verified Members"
          desc="All profiles undergo rigorous verification to ensure authenticity and safety"
        />
        <FeatureCard
          icon={UserGroupIcon}
          title="Quality First"
          desc="Focus on meaningful connections rather than endless swiping"
        />
      </div>
    </div>
  </section>
  )
}

export default Features