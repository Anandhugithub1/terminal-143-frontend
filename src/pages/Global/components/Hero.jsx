// src/components/Global/Hero.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PrimaryButton, SecondaryButton } from '../../../shared/Button';

export default function Hero() {
  const { t } = useTranslation('home');
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <section className="relative w-full h-screen bg-gray-900 text-white overflow-hidden">
      {/* Background image with smooth fade-in */}
      <picture className="absolute inset-0 z-0 h-full w-full">
        <img
          src="https://d36zx1g74mcorc.cloudfront.net/websitephotos/hero2.jpg"
          alt={t('hero.imageAlt')}
          className={`w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          loading="eager"
          fetchPriority="high"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60 z-10" />

      <div className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full justify-center text-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight animate-fade-in-down">
            {t('hero.headingPart1')}
            <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gradient-primary to-gradient-secondary">
              {t('hero.headingHighlight')}
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl mb-8 text-gray-200 animate-fade-in-down"
            style={{ animationDelay: '150ms', animationFillMode: 'backwards' }}
          >
            {t('hero.subheading')}
          </p>

          <div
            className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-down"
            style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}
          >
            <PrimaryButton to="/choose-category" className="!py-3 px-8">
              {t('hero.buttons.trial')}
            </PrimaryButton>
            <SecondaryButton to="/about" className="!py-3 px-8">
              {t('hero.buttons.howItWorks')}
            </SecondaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}
