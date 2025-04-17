import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Navbar from "../components/Layout/Navbar";

// Icons
import {
  HeartIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

// Optimized Button Components
const baseButtonClasses =
  "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105 active:scale-95";

const PrimaryButton = ({ children, to, className = "", ...props }) => (
  <Link
    to={to}
    className={`${baseButtonClasses} bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white px-6 py-4 hover:shadow-xl ${className}`}
    {...props}
  >
    {children}
  </Link>
);

const SecondaryButton = ({ children, to, className = "", ...props }) => (
  <Link
    to={to}
    className={`${baseButtonClasses} border-2 border-gray-200 bg-white text-gray-700 hover:border-indigo-100 hover:bg-indigo-50 px-6 py-4 ${className}`}
    {...props}
  >
    {children}
  </Link>
);

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Optimized Feature Card
const FeatureCard = ({ title, icon, desc }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    rootMargin: "-50px 0px",
    threshold: 0.1,
  });

  const Icon = icon;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={itemVariants}
      className="p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-xl transition-all duration-300"
    >
      <motion.div
        className="w-12 h-12 bg-gradient-to-r from-gradient-primary to-gradient-secondary rounded-xl flex items-center justify-center mb-6"
        whileHover={{ scale: 1.05 }}
      >
        <Icon className="w-6 h-6 text-white" />
      </motion.div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </motion.div>
  );
};

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

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900 text-gray-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-gradient-to-r from-gradient-primary to-gradient-secondary p-2 rounded-lg">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">
                  Terminal143
                </span>
              </motion.div>
              <p className="text-sm">
                Making meaningful connections since 2024
              </p>
            </div>

            {[
              { title: "Company", links: ["about", "careers", "blog"] },
              { title: "Legal", links: ["privacy", "terms", "security"] },
              { title: "Connect", links: ["contact", "faq", "press"] },
            ].map((section) => (
              <div key={section.title} className="space-y-2">
                <h4 className="text-sm font-semibold text-white">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <motion.li key={link} whileHover={{ x: 5 }}>
                      <Link
                        to={`/${link}`}
                        className="hover:text-indigo-400 transition-colors duration-300 capitalize"
                      >
                        {link}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="border-t border-gray-800 mt-12 pt-8 text-center text-sm"
          >
            <p>&copy; 2024 Terminal143. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};
