// components/EditableBio.jsx
import { Edit2, X, Check } from 'lucide-react';

export default function EditableBio({
  bioInput,
  setBioInput,
  profile,
  updateProfileData,
  isEditingBio,
  setIsEditingBio,
  editLabel = 'Edit',
  placeholderText = 'Tell something about yourself...',
  emptyText = 'Click "Edit" to add your bio',
}) {
  return (
    <div>
      {!isEditingBio ? (
        <button
          onClick={() => setIsEditingBio(true)}
          className="text-pink-600 hover:text-pink-700 flex items-center"
        >
          <Edit2 size={16} className="mr-1" />
          <span className="text-sm font-medium">{editLabel}</span>
        </button>
      ) : (
        <div className="flex space-x-2 mt-1">
          <button
            onClick={() => {
              setIsEditingBio(false);
              setBioInput(profile.bio || '');
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </button>
          <button
            onClick={() => {
              updateProfileData('bio', bioInput.trim());
              setIsEditingBio(false);
            }}
            className="text-pink-600 hover:text-pink-700"
          >
            <Check size={18} />
          </button>
        </div>
      )}

      {isEditingBio ? (
        <div className="mt-2">
          <textarea
            value={bioInput}
            onChange={(e) => setBioInput(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 resize-none"
            rows={4}
            placeholder={placeholderText}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-600 whitespace-pre-line mt-2">
          {profile.bio?.trim() || (
            <span className="text-gray-400 italic">{emptyText}</span>
          )}
        </p>
      )}
    </div>
  );
}
