import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  AiOutlineHome,
  AiFillHome,
  AiOutlineHeart,
  AiFillHeart
} from 'react-icons/ai'
import {
  RiUserLine,
  RiUserFill,
  RiFileListLine,
  RiFileListFill,
  RiGroup2Line,
  RiGroup2Fill
} from 'react-icons/ri'
import { useTranslation } from 'react-i18next'

const BottomNav = () => {
  const { t } = useTranslation('nav')

  const tabs = [
    {
      name: t('home'),
      path: '/home',
      icon: ({ isActive }) =>
        isActive ? <AiFillHome size="1.4em" /> : <AiOutlineHome size="1.4em" />
    },
    {
      name: t('requests'),
      path: '/requests',
      icon: ({ isActive }) =>
        isActive ? (
          <RiFileListFill size="1.4em" />
        ) : (
          <RiFileListLine size="1.4em" />
        )
    },
    {
      name: t('circles'),
      path: '/circles',
      icon: ({ isActive }) =>
        isActive ? (
          <RiGroup2Fill size="1.4em" />
        ) : (
          <RiGroup2Line size="1.4em" />
        )
    },
    {
      name: t('matches'),
      path: '/matches',
      icon: ({ isActive }) =>
        isActive ? <AiFillHeart size="1.4em" /> : <AiOutlineHeart size="1.4em" />
    },
    {
      name: t('profile'),
      path: '/profile',
      icon: ({ isActive }) =>
        isActive ? <RiUserFill size="1.4em" /> : <RiUserLine size="1.4em" />
    }
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 py-3 shadow-lg z-50">
      <div className="flex justify-around items-center px-1">
        {tabs.map(tab => (
          <NavLink
            key={tab.name}
            to={tab.path}
            end={tab.path === '/profile'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 min-w-0 px-0.5 transition-colors duration-200 ${
                isActive
                  ? 'text-text-pr'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
            aria-label={tab.name}
          >
            {({ isActive }) => (
              <>
                <div className="transition-transform duration-200 ease-in-out">
                  {tab.icon({ isActive })}
                </div>
                <span className="text-[10px] leading-tight font-medium whitespace-nowrap">{tab.name}</span>
                {isActive && (
                  <div className="w-4 h-1 bg-primary rounded-full mt-1 animate-bounce-indicator" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav