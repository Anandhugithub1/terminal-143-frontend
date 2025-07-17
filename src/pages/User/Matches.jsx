import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TopNav from '../../components/Layout/TopNavigation';
import BottomNav from '../../components/Layout/BottomNavigation';
import placeholderImage from '../../assets/woman.png';

const demoMatches = [
  {
    id: 1,
    name: 'Alice',
    age: 25,
    gender: 'Female',
    bio: 'Loves hiking and outdoor adventures.',
    socialMediaLinks: [
      { platform: 'IG', usernameOrLink: '@alice_hikes' },
      { platform: 'Telegram', usernameOrLink: '@aliceTG' },
    ],
  },
  {
    id: 2,
    name: 'Bob',
    age: 28,
    gender: 'Male',
    bio: 'Coffee enthusiast and book lover.',
    socialMediaLinks: [
      { platform: 'FB', usernameOrLink: 'fb.com/bob.latte' },
    ],
  },
  {
    id: 3,
    name: 'Clara',
    age: 22,
    gender: 'Female',
    bio: 'Tech geek who enjoys painting on weekends.',
    socialMediaLinks: [
      { platform: 'Line', usernameOrLink: '@claraPaints' },
      { platform: 'IG', usernameOrLink: '@clara.tech' },
    ],
  },
];

const platformIcons = {
  IG: '📸',
  Telegram: '✈️',
  FB: '👍',
  Line: '💬',
};

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMatches(demoMatches);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <TopNav />
        <main className="px-4 pt-6 pb-20">
          <h1 className="text-2xl font-bold mb-5">Loading Matches...</h1>
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl shadow-sm">
                <Skeleton circle width={64} height={64} />
                <div className="flex-1 space-y-2">
                  <Skeleton height={20} width="40%" />
                  <Skeleton height={16} width="80%" />
                  <Skeleton height={16} width="60%" />
                  <Skeleton height={16} width="70%" />
                </div>
              </div>
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 flex items-center justify-center px-6 pb-20">
          <div className="text-center p-8 bg-gray-100 rounded-2xl max-w-sm shadow">
            <div className="w-16 h-16 bg-gray-300 border-dashed border-2 rounded-xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-1">No matches yet</h2>
            <p className="text-gray-600">Start swiping to find your perfect match!</p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <TopNav />
      <main className="px-4 pt-4">
        <h1 className="text-2xl font-semibold mb-6">Your Matches</h1>

        <div className="space-y-5">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow hover:shadow-md transition"
            >
              <div className="flex gap-4 items-start">
                <div className="relative">
                  <img
                    src={placeholderImage}
                    alt={`${match.name}'s avatar`}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow"
                    loading="lazy"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
                    {match.age}
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-lg font-bold">{match.name}</h2>
                  <p className="text-gray-600 text-sm mt-1 mb-3">{match.bio}</p>

                  {match.socialMediaLinks.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium uppercase">Connect</p>
                      <div className="flex flex-wrap gap-2">
                        {match.socialMediaLinks.map((link, i) => {
                          const isUrl = link.usernameOrLink.startsWith('http');
                          const linkText = link.usernameOrLink.replace(/^@/, '');
                          const fallbackLink = `https://www.google.com/search?q=${link.usernameOrLink}`;
                          return (
                            <a
                              key={i}
                              href={isUrl ? link.usernameOrLink : fallbackLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:bg-blue-50 transition"
                            >
                              <span className="text-base">{platformIcons[link.platform] || '🔗'}</span>
                              <span className="text-blue-600 font-medium">@{linkText}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
