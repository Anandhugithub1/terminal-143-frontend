import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ChatList = () => {
  const navigate = useNavigate();

  const [demoChats] = useState([
    {
      id: 'alice',
      name: 'Alice',
      age: 25,
      location: 'New York',
      distance: '2 miles away',
      interests: ['Travel', 'Photography', 'Coffee'],
      avatar: 'https://i.pravatar.cc/150?u=alice',
      lastMessage: 'Hey! How was your weekend?',
      timestamp: '2025-06-02T13:20:00Z',
      online: true,
      unread: 3,
      matchStrength: 92
    },
    {
      id: 'bob',
      name: 'Bob',
      age: 28,
      location: 'Brooklyn',
      distance: '5 miles away',
      interests: ['Cooking', 'Hiking', 'Movies'],
      avatar: 'https://i.pravatar.cc/150?u=bob',
      lastMessage: 'Are we still on for dinner tonight?',
      timestamp: '2025-06-02T12:10:00Z',
      online: false,
      unread: 0,
      matchStrength: 87
    },
    {
      id: 'charlie',
      name: 'Charlie',
      age: 23,
      location: 'Manhattan',
      distance: '1 mile away',
      interests: ['Art', 'Music', 'Dancing'],
      avatar: 'https://i.pravatar.cc/150?u=charlie',
      lastMessage: 'Sent you some photos from the concert!',
      timestamp: '2025-06-01T18:45:00Z',
      online: true,
      unread: 0,
      matchStrength: 95
    },
    {
      id: 'diana',
      name: 'Diana',
      age: 30,
      location: 'Queens',
      distance: '8 miles away',
      interests: ['Yoga', 'Reading', 'Wine'],
      avatar: 'https://i.pravatar.cc/150?u=diana',
      lastMessage: 'That restaurant you recommended was amazing!',
      timestamp: '2025-05-31T10:15:00Z',
      online: false,
      unread: 1,
      matchStrength: 78
    },
    {
      id: 'ethan',
      name: 'Ethan',
      age: 26,
      location: 'New Jersey',
      distance: '15 miles away',
      interests: ['Gaming', 'Tech', 'Basketball'],
      avatar: 'https://i.pravatar.cc/150?u=ethan',
      lastMessage: 'Want to video chat later?',
      timestamp: '2025-05-30T16:30:00Z',
      online: true,
      unread: 0,
      matchStrength: 85
    },
    {
      id: 'fiona',
      name: 'Fiona',
      age: 27,
      location: 'Upper East Side',
      distance: '3 miles away',
      interests: ['Dogs', 'Running', 'Brunch'],
      avatar: 'https://i.pravatar.cc/150?u=fiona',
      lastMessage: 'My dog would love to meet yours!',
      timestamp: '2025-05-29T09:45:00Z',
      online: false,
      unread: 0,
      matchStrength: 90
    }
  ]);

  useEffect(() => {
    document.title = 'Messages | HeartLink';
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex flex-col">
      {/* Header with branding */}
      <header className="bg-white shadow-sm py-5 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">HeartLink</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="max-w-3xl mx-auto w-full px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Your Matches</h1>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search matches..." 
              className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white shadow rounded-xl mx-4 mb-6 max-w-3xl mx-auto w-full">
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          <div className="py-4 text-center">
            <div className="text-2xl font-bold text-pink-600">12</div>
            <div className="text-sm text-gray-500">Matches</div>
          </div>
          <div className="py-4 text-center">
            <div className="text-2xl font-bold text-pink-600">6</div>
            <div className="text-sm text-gray-500">Online</div>
          </div>
          <div className="py-4 text-center">
            <div className="text-2xl font-bold text-pink-600">4</div>
            <div className="text-sm text-gray-500">New</div>
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto pb-8 px-4 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Recent Conversations</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                All
              </button>
              <button className="px-3 py-1 text-sm rounded-full hover:bg-gray-100 transition-colors">
                Online
              </button>
              <button className="px-3 py-1 text-sm rounded-full hover:bg-gray-100 transition-colors">
                Unread
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {demoChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className={`p-4 flex items-start gap-4 cursor-pointer transition-all hover:bg-pink-50 ${chat.unread > 0 ? 'bg-pink-50' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="relative">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-16 h-16 rounded-xl border-2 border-white shadow-md object-cover"
                    />
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {chat.matchStrength}%
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-bold text-gray-900 text-lg flex items-center">
                        {chat.name}, <span className="font-normal text-gray-600 ml-1">{chat.age}</span>
                      </h2>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {chat.distance}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-400">
                        {formatTime(chat.timestamp)}
                      </span>
                      {chat.unread > 0 && (
                        <span className="mt-1 bg-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-2">
                    {chat.lastMessage}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {chat.interests.map((interest, idx) => (
                      <span key={idx} className="text-xs bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 px-2 py-1 rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Empty State */}
        <div className="mt-8 text-center py-12 px-4 bg-white rounded-2xl shadow-sm">
          <div className="mx-auto bg-gradient-to-br from-pink-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Start a conversation</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            You have great matches waiting! Start conversations and see where they lead.
          </p>
          <button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium py-3 px-6 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Discover More Matches
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatList;