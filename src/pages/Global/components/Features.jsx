// src/components/Global/Features.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

import InView from '../../../shared/components/InView';
import FeatureCard from './Cards/GlobalFeatureCard';

// Icons
import {
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function Features() {
  const { t } = useTranslation('home');

  // pull out your cards data via the translation file
  const cards = [
    {
      icon: SparklesIcon,
      title: t('cards.smartMatching.title'),
      desc:  t('cards.smartMatching.desc'),
    },
    {
      icon: ShieldCheckIcon,
      title: t('cards.verifiedMembers.title'),
      desc:  t('cards.verifiedMembers.desc'),
    },
    {
      icon: UserGroupIcon,
      title: t('cards.qualityFirst.title'),
      desc:  t('cards.qualityFirst.desc'),
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InView className="text-center mb-16">
          <InView as="h2" className="text-3xl font-bold text-gray-900 mb-4">
            {t('heading')}
          </InView>
          <InView as="p" delayMs={150} className="text-gray-600 max-w-2xl mx-auto">
            {t('subheading')}
          </InView>
        </InView>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((c, i) => (
            <FeatureCard
              key={i}
              icon={c.icon}
              title={c.title}
              desc={c.desc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
