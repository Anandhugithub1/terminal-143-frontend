import React from 'react';
import { HeartHandshake, Globe, Users } from 'lucide-react';
import PageHeader from '../../shared/components/PageHeader';
import { useTranslation } from 'react-i18next';
import '@fontsource-variable/inter';

const Infopage = () => {
  const { t } = useTranslation('common');

  const infoItems = [
    {
      icon: <HeartHandshake size={20} />,
      title: t('missionTitle'),
      description: t('missionDesc'),
    },
    {
      icon: <Users size={20} />,
      title: t('communityTitle'),
      description: t('communityDesc'),
    },
    {
      icon: <Globe size={20} />,
      title: t('globalTitle'),
      description: t('globalDesc'),
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-gray-50 font-inter">
      <PageHeader title={t('aboutApp')} />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
          <img
            src="/images/logo.png"
            alt="PassorMatch"
            className="w-14 h-14 rounded-2xl object-contain mb-4"
          />
          <h2 className="text-lg font-bold text-gray-900 mb-2">{t('aboutApp')}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            {t('intro')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {infoItems.map(({ icon, title, description }, idx) => (
            <div key={idx} className="flex items-start gap-3.5 p-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center pt-2">
          © {new Date().getFullYear()} PassorMatch. {t('rightsReserved')}
        </p>
      </div>
    </div>
  );
};

export default Infopage;
