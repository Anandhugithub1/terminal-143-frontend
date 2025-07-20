import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TopNav from '../../components/Layout/TopNavigation';
import BottomNav from '../../components/Layout/BottomNavigation';
import placeholderImage from '../../assets/woman.png';

const platformIcons = {
  IG: '📸',
  Telegram: '✈️',
  FB: '👍',
  Line: '💬',
};

const genderIcon = {
  M: '♂️',
  F: '♀️',
};

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const MATCHES_API = 'https://userapi.terminal143.com/match/list';

  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await axios.get(MATCHES_API, { withCredentials: true });
        const data = response.data.matches;
        setMatches(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setIsError(true);
        setMatches([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMatches();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <TopNav />
        <div className="p-4 pt-6 space-y-4">
          <h1 className="text-2xl font-bold">Loading Matches...</h1>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl shadow-md p-4 bg-gray-50 flex gap-4 items-center">
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
    );
  }

  if (isError || !matches.length) {
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
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <TopNav />
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold mb-4">Your Matches</h1>

        <div className="grid grid-cols-1 gap-6">
          {matches.map((match) => (
            <div
              key={match.username || match.name}
              className="bg-white rounded-3xl p-4 shadow-md border border-gray-100 transition hover:shadow-lg"
            >
              <div className="flex gap-4">
                <a href={match.profileLink} target="_blank" rel="noopener noreferrer">
                  <img
                    src={match.photo || placeholderImage}
                    alt={`${match.name}'s profile`}
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
                      {match.name}, {match.age}
                    </a>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      {genderIcon[match.gender] && (
                        <span className="mr-1 text-blue-600">{genderIcon[match.gender]}</span>
                      )}
                      <span className="capitalize">{match.gender === 'M' ? 'Male' : 'Female'}</span>
                    </div>
                    {match.bio && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{match.bio}</p>
                    )}
                  </div>

                  {match.socialMediaLinks?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {match.socialMediaLinks.map((link, i) => {
                        const display = link.usernameOrLink.startsWith('@')
                          ? link.usernameOrLink
                          : `@${link.usernameOrLink}`;
                        const url = link.url || `https://www.google.com/search?q=${link.usernameOrLink}`;

                        return (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full border border-blue-200 hover:bg-blue-100 transition"
                          >
                            <span className="mr-1">{platformIcons[link.platform] || '🔗'}</span>
                            {display}
                          </a>
                        );
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
  );
}
