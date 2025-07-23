import React, { useState } from 'react';

const SOCIAL_PLATFORMS = ['IG', 'FB', 'Telegram', 'Line', 'Wechat', 'Other'];

const EditableSocialLinks = ({ socialLinks, onChange }) => {
  const [expanded, setExpanded] = useState(false);

  // Show filled platforms first, then default to first two if none
  const filled = SOCIAL_PLATFORMS.filter((p) => socialLinks[p]);
  const defaultVisible = filled.length > 0 ? filled : SOCIAL_PLATFORMS.slice(0, 2);

  const visiblePlatforms = expanded ? SOCIAL_PLATFORMS : defaultVisible;

  return (
    <div className="space-y-4 px-4">
      {visiblePlatforms.map((platform) => (
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

      {/* Toggle Button */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-pink-600 text-sm mt-2 hover:underline"
        >
          Show more
        </button>
      )}
    </div>
  );
};

export default EditableSocialLinks;
