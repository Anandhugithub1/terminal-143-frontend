import React from 'react';

const EditableSocialLinks = ({ socialLinks, onChange }) => {
  const platforms = ['instagram', 'twitter', 'snapchat', 'linkedin'];

  return (
    <div className="space-y-3">
      {platforms.map((platform) => (
        <div key={platform}>
          <label className="block text-sm font-medium capitalize text-gray-700">
            {platform}
          </label>
          <input
            type="text"
            name={platform}
            value={socialLinks[platform] || ''}
            onChange={(e) => onChange(platform, e.target.value)}
            placeholder={`Enter your ${platform} handle or URL`}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-pink-500 focus:outline-none"
          />
        </div>
      ))}
    </div>
  );
};

export default EditableSocialLinks;
