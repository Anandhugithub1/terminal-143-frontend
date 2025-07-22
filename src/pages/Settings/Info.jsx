import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HeartHandshake, Globe, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '@fontsource-variable/inter';

const Infopage = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

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
      <header className="flex items-center px-4 py-3 border-b border-gray-200">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-4 text-lg font-semibold">{t('aboutApp')}</h1>
      </header>

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
