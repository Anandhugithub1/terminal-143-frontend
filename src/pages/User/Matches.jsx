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
        <div className="px-4 pt-4 space-y-4 animate-pulse flex-1">
          <Skeleton height={30} width={120} />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton circle width={48} height={48} />
              <div className="flex-1 space-y-2">
                <Skeleton height={16} width="50%" />
                <Skeleton height={12} width="80%" />
              </div>
            </div>
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <TopNav />
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-gray-500 text-lg">No matches found</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <TopNav />

      <div className="px-4 pt-4 space-y-4">
        <h1 className="text-2xl font-semibold text-gray-800">Your Matches</h1>

        {matches.map(match => (
          <div
            key={match.id}
            className="flex items-start space-x-4 bg-gray-50 p-4 rounded-xl border hover:shadow-md transition duration-200"
          >
            <img
              src={placeholderImage}
              alt={match.name}
              className="w-14 h-14 rounded-full object-cover border"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-gray-800">
                  {match.name}, {match.age}
                </p>
                <span className="text-sm text-gray-500 italic">{match.gender}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{match.bio}</p>

              <div className="mt-2 text-sm space-y-1">
                {match.socialMediaLinks.map((link, i) => (
                  <div key={i}>
                    <span className="text-gray-600">{link.platform}:</span>{' '}
                    <a
                      href={
                        link.usernameOrLink.startsWith('http')
                          ? link.usernameOrLink
                          : '#'
                      }
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.usernameOrLink}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
