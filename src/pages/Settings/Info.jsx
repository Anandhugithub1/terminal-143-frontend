import React from 'react';
import { HeartHandshake, Globe, Users } from 'lucide-react';
import PageHeader from '../../shared/components/PageHeader';
import { useTranslation } from 'react-i18next';
import '@fontsource-variable/inter';

const Infopage = () => {
  const { t } = useTranslation('common');

  const infoItems = [
    {
      icon: <HeartHandshake size={24} />,
      title: t('missionTitle'),
      description: t('missionDesc'),
    },
    {
      icon: <Users size={24} />,
      title: t('communityTitle'),
      description: t('communityDesc'),
    },
    {
      icon: <Globe size={24} />,
      title: t('globalTitle'),
      description: t('globalDesc'),
    },
  ];

  return (
    <div className="min-h-screen bg-white font-inter">
      <PageHeader title={t('aboutApp')} />

      <div className="p-4 space-y-6">
        <p className="text-gray-700 text-base leading-relaxed">
          {t('intro')}
        </p>

        <div className="space-y-4">
          {infoItems.map(({ icon, title, description }, idx) => (
            <div key={idx} className="flex items-start space-x-4">
              <div className="text-pink-500">{icon}</div>
              <div>
                <h3 className="text-md font-semibold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-8 text-center">
          © {new Date().getFullYear()} Terminal143. {t('rightsReserved')}
        </p>
      </div>
    </div>
  );
};

export default Infopage;
