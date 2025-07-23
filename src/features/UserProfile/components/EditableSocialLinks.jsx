import React from 'react';

const SOCIAL_PLATFORMS = ['IG', 'FB', 'Telegram', 'Line', 'Wechat', 'Other'];

const EditableSocialLinks = ({ socialLinks, onChange }) => {
  return (
    <div className="space-y-4 px-4">
      {SOCIAL_PLATFORMS.map((platform) => (
        <div key={platform} className="flex flex-col">
          <label className="mb-1 text-sm font-semibold text-gray-600">
            {platform}
          </label>
          <input
            type="text"
            name={platform}
            value={socialLinks[platform] || ''}
            onChange={(e) => onChange(platform, e.target.value)}
            placeholder={`Your ${platform} handle or link`}
            className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200 focus:outline-none transition-all duration-200"
          />
        </div>
      ))}
    </div>
  );
};

export default EditableSocialLinks;
