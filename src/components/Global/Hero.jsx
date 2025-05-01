// src/components/Global/Hero.jsx
import React from 'react';
import heroimage from '../../assets/images/hero2.jpeg';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { itemVariants, containerVariants } from '../../Utlis/animation_variants';
import { PrimaryButton, SecondaryButton } from '../../shared/Button';

export default function Hero() {
  const { t } = useTranslation('home');

  return (
    <section className="relative w-full h-screen bg-gray-900 text-white overflow-hidden">
      <picture className="absolute inset-0 z-0 h-full w-full">
        <img
          src={heroimage}
          alt={t('hero.imageAlt')}
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60 z-10" />

      <div className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full justify-center text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl font-bold mb-4 leading-tight"
          >
            {t('hero.headingPart1')}
            <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gradient-primary to-gradient-secondary">
              {t('hero.headingHighlight')}
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl mb-8 text-gray-200"
          >
            {t('hero.subheading')}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <PrimaryButton to="/register" className="!py-3 px-8">
              {t('hero.buttons.trial')}
            </PrimaryButton>
            <SecondaryButton to="/about" className="!py-3 px-8">
              {t('hero.buttons.howItWorks')}
            </SecondaryButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
