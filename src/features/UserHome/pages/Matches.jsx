import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useMatches } from '../api'

import TopNav from '../../../components/Layout/TopNavigation'
import BottomNav from '../../../components/Layout/BottomNavigation'

import { FaInstagram, FaTelegramPlane, FaFacebookF, FaLink } from 'react-icons/fa'
import { SiLine } from 'react-icons/si'
import { MdMale, MdFemale } from 'react-icons/md'

const platformIcons = {
  IG: FaInstagram,
  Telegram: FaTelegramPlane,
  FB: FaFacebookF,
  Line: SiLine
}

const genderIcon = {
  M: MdMale,
  F: MdFemale
}

export default function MatchesPage() {
  const { data: matches = [], isLoading, isError } = useMatches()

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <TopNav />
        <div className="p-4 pt-6 space-y-4">
          <h1 className="text-2xl font-bold">Loading Matches...</h1>

          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl shadow-md p-4 bg-gray-50 flex gap-4 items-center"
            >
              <Skeleton circle width={64} height={64} />
              <div className="flex-1">
                <Skeleton height={20} width="50%" />
                <Skeleton height={16} width="80%" />
                <Skeleton height={16} width="60%" />
              </div>
            </div>
          ))}
        </div>
        <BottomNav />
      </div>
    )
  }

  if (isError || matches.length === 0) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <TopNav />
        <div className="flex-1 flex items-center justify-center text-center p-6">
          <div className="bg-gray-100 p-6 rounded-xl shadow max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3" />
            <h2 className="text-lg font-bold">No Matches Found</h2>
            <p className="text-sm text-gray-500">
              {isError
                ? 'Could not load matches. Please try again later.'
                : 'Start swiping to find someone special.'}
            </p>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <TopNav />
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold mb-4">Your Matches</h1>

        <div className="grid grid-cols-1 gap-6">
          {matches.map(match => (
            <div
              key={match.username || match.name}
              className="bg-white rounded-3xl p-4 shadow-md border border-gray-100 transition hover:shadow-lg"
            >
              <div className="flex gap-4">
                <a
                  href={match.profileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={match.photo || match.photos[0]}
                    alt={`${match.name} profile`}
                    className="w-20 h-20 rounded-2xl object-cover"
                    loading="lazy"
                  />
                </a>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <a
                      href={match.profileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-bold text-gray-800 hover:underline"
                    >
                      {match.name}
                      {match.dob && (
                        <span className="ml-1 text-gray-500 text-sm">
                          {`, ${Math.floor(
                            (new Date() - new Date(match.dob)) /
                              (365.25 * 24 * 60 * 60 * 1000)
                          )}`}
                        </span>
                      )}
                    </a>

                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      {genderIcon[match.gender] && (
                        <span className="mr-1 text-blue-600">
                          {React.createElement(genderIcon[match.gender], {
                            size: 16
                          })}
                        </span>
                      )}
                      <span>
                        {match.gender === 'M'
                          ? 'Male'
                          : match.gender === 'F'
                          ? 'Female'
                          : ''}
                      </span>
                    </div>

                    {match.bio && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {match.bio}
                      </p>
                    )}
                  </div>

                  {Array.isArray(match.socialMediaLinks) &&
                    match.socialMediaLinks.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {match.socialMediaLinks.map((link, i) => {
                          const Icon =
                            platformIcons[link.platform] || FaLink

                          const display =
                            link.usernameOrLink?.startsWith('@')
                              ? link.usernameOrLink
                              : `@${link.usernameOrLink}`

                          const url =
                            link.url ||
                            `https://www.google.com/search?q=${link.usernameOrLink}`

                          return (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full border border-blue-200 hover:bg-blue-100 transition"
                            >
                              <Icon size={14} />
                              {display}
                            </a>
                          )
                        })}
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
