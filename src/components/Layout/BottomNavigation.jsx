import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  AiOutlineHome,
  AiFillHome,
  AiOutlineHeart,
  AiFillHeart,
} from 'react-icons/ai';
import { RiUserLine, RiUserFill, RiFileListLine, RiFileListFill } from 'react-icons/ri';
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
  const userType = localStorage.getItem('userType');
  const { t } = useTranslation('nav');

  let tabs = [];

  if (userType === 'mp') {
    tabs = [
      {
        name: t('home'),
        path: '/requests',
        icon: ({ isActive }) =>
          isActive ? <RiFileListFill size="1.4em" /> : <RiFileListLine size="1.4em" />,
      },
      {
        name: t('matches'),
        path: '/matches',
        icon: ({ isActive }) =>
          isActive ? <AiFillHeart size="1.4em" /> : <AiOutlineHeart size="1.4em" />,
      },
      {
        name: t('profile'),
        path: '/profile',
        icon: ({ isActive }) =>
          isActive ? <RiUserFill size="1.4em" /> : <RiUserLine size="1.4em" />,
      },
    ];
  } else {
    tabs = [
      {
        name: t('home'),
        path: '/home',
        icon: ({ isActive }) =>
          isActive ? <AiFillHome size="1.4em" /> : <AiOutlineHome size="1.4em" />,
      },
      {
        name: t('profile'),
        path: '/profile',
        icon: ({ isActive }) =>
          isActive ? <RiUserFill size="1.4em" /> : <RiUserLine size="1.4em" />,
      },
    ];

    if (userType === 'fm') {
      tabs.splice(1, 0, {
        name: t('matches'),
        path: '/matches',
        icon: ({ isActive }) =>
          isActive ? <AiFillHeart size="1.4em" /> : <AiOutlineHeart size="1.4em" />,
      });
    }
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 py-3 shadow-lg z-50">
      <div className="flex justify-around items-center">
        {tabs.map(tab => (
          <NavLink
            key={tab.name}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-colors duration-200 ${
                isActive ? 'text-text-pr' : 'text-gray-500 hover:text-gray-700'
              }`
            }
            aria-label={tab.name}
          >
            {({ isActive }) => (
              <>
                <div className="transition-transform duration-200 ease-in-out">
                  {tab.icon({ isActive })}
                </div>
                <span className="text-xs font-medium">{tab.name}</span>
                {isActive && (
                  <div className="w-4 h-1 bg-primary rounded-full mt-1 animate-bounce-indicator" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
