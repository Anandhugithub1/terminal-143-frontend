import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";
import FeatureCard from "../components/Cards/GlobalFeatureCard";
import { PrimaryButton, SecondaryButton } from "../shared/Button";
import { itemVariants ,containerVariants} from "../Utlis/animation_variants";
// Icons
import {
  
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";



// Main Page Component
export const HomePage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans text-gray-700 antialiased overflow-x-hidden">
      {/* Header */}
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Hero Section */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Find Meaningful Connections <br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gradient-primary to-gradient-secondary">
                Without the Games
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
            >
              Intelligent matchmaking for professionals seeking authentic
              relationships
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <PrimaryButton to="/register">Start Free Trial</PrimaryButton>
              <SecondaryButton to="/about">How It Works</SecondaryButton>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 rounded-2xl bg-white shadow-xl overflow-hidden"
          >
            <img
              src="https://via.placeholder.com/1200x600"
              alt="Professional couple using Terminal143 app"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
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

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8 text-center"
          >
            {[
              { value: "50K+", label: "Successful Matches" },
              { value: "98%", label: "Verified Profiles" },
              { value: "4.9", label: "Average Rating" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="p-6"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-indigo-100 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white rounded-2xl p-8 shadow-2xl border border-transparent bg-gradient-to-br from-white via-white to-indigo-50"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Join thousands of professionals who've found meaningful
              connections through Terminal143
            </p>
            <motion.div
              className="flex justify-center gap-4"
              whileInView={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PrimaryButton
                to="/register"
                className="!py-2 px-6 transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                Create Free Profile
              </PrimaryButton>
              <SecondaryButton to="/pricing">View Pricing</SecondaryButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

   <Footer/>
    </div>
  );
};
