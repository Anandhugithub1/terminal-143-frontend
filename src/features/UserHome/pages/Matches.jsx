  import React, { useState } from 'react'
  import Skeleton from 'react-loading-skeleton'
  import 'react-loading-skeleton/dist/skeleton.css'
  import { useMatches, SendProfileFeeback } from '../api'
  import { useNavigate } from 'react-router-dom'

  import TopNav from '../../../components/Layout/TopNavigation'
  import BottomNav from '../../../components/Layout/BottomNavigation'
import { AiOutlineLike, AiOutlineDislike, AiFillLike, AiFillDislike } from "react-icons/ai"
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

    const [sentFeedback, setSentFeedback] = useState({})
    const [loadingUser, setLoadingUser] = useState(null)

    const { mutate: sendFeedback } = SendProfileFeeback()

    const navigate = useNavigate()

    function handleFeedback(username, liked) {

      if (loadingUser) return

      setLoadingUser(username)

      sendFeedback(
        { targetUsername: username, liked },
        {
          onSuccess: () => {
            setSentFeedback(prev => ({
              ...prev,
              [username]: liked ? "liked" : "disliked"
            }))
          },
          onSettled: () => {
            setLoadingUser(null)
          }
        }
      )
    }

    const goToProfile = link => {
      try {
        const url = new URL(link)
        navigate(url.pathname)
      } catch {
        navigate(link)
      }
    }

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

          <h1 className="text-2xl font-bold mb-4">
            Your Matches
          </h1>

          <div className="grid grid-cols-1 gap-6">

            {matches.map(match => {

              const username = match.PK
              const feedbackState = sentFeedback[username] || match.feedback

              return (

                <div
                  key={username}
                  className="bg-white rounded-3xl p-4 shadow-md border border-gray-100 transition hover:shadow-lg"
                >

                  <div className="flex gap-4">

                    <img
                      src={match.photos?.[0]?.url}
                      alt={`${match.name} profile`}
                      className="w-20 h-20 rounded-2xl object-cover cursor-pointer"
                      loading="lazy"
                      onClick={() => goToProfile(match.profileLink)}
                    />

                    <div className="flex-1 flex flex-col justify-between">

                      <div>

                        <span
                          onClick={() => goToProfile(match.profileLink)}
                          className="text-lg font-bold text-gray-800 hover:underline cursor-pointer"
                        >
                          {match.name}
                        </span>

                        {match.dob && (
                          <span className="ml-1 text-gray-500 text-sm">
                            {`, ${Math.floor(
                              (new Date() - new Date(match.dob)) /
                              (365.25 * 24 * 60 * 60 * 1000)
                            )}`}
                          </span>
                        )}

                        <div className="flex items-center text-sm text-gray-500 mt-1">

                          {genderIcon[match.gender] && (
                            <span className="mr-1 text-blue-600">
                              {React.createElement(
                                genderIcon[match.gender],
                                { size: 16 }
                              )}
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

<div className="flex gap-3 mt-3">
  <button
    disabled={loadingUser === username || feedbackState === "liked"}
    onClick={() => handleFeedback(username, true)}
    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150 shadow-md
    ${
      feedbackState === "liked"
        ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg scale-105"
        : "bg-white text-gray-600 border border-gray-300 hover:bg-yellow-50 hover:border-yellow-300 active:scale-95"
    }`}
  >
    {feedbackState === "liked" ? <AiFillLike size={20} /> : <AiOutlineLike size={20} />}
  </button>

  <button
    disabled={loadingUser === username || feedbackState === "disliked"}
    onClick={() => handleFeedback(username, false)}
    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150 shadow-md
    ${
      feedbackState === "disliked"
        ? "bg-gradient-to-r from-gray-500 to-gray-700 text-white shadow-lg scale-105"
        : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 hover:border-gray-400 active:scale-95"
    }`}
  >
    {feedbackState === "disliked" ? <AiFillDislike size={20} /> : <AiOutlineDislike size={20} />}
  </button>
</div>

                    </div>

                  </div>

                </div>

              )

            })}

          </div>

        </div>

        <BottomNav />

      </div>
    )
  }