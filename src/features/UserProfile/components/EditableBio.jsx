import React from 'react';
import { Edit2, X, Check } from 'lucide-react';

export default function EditableBio({ bioInput, setBioInput, profile, updateProfileData, isEditingBio, setIsEditingBio }) {
  return (
    <section className="bg-gray-100 rounded-2xl p-5">
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-sm font-semibold text-gray-800">My Bio</h2>
        {!isEditingBio ? (
          <button onClick={() => setIsEditingBio(true)} className="text-pink-600 hover:text-pink-700 flex items-center">
            <Edit2 size={16} className="mr-1" />
            <span className="text-sm font-medium">Edit</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button onClick={() => {
              setIsEditingBio(false);
              setBioInput(profile.bio || '');
            }} className="text-gray-500 hover:text-gray-700">
              <X size={18} />
            </button>
            <button onClick={() => {
              updateProfileData('bio', bioInput.trim());
              setIsEditingBio(false);
            }} className="text-pink-600 hover:text-pink-700">
              <Check size={18} />
            </button>
          </div>
        )}
      </div>

      {isEditingBio ? (
        <div className="mt-2">
          <textarea
            value={bioInput}
            onChange={(e) => setBioInput(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 resize-none"
            rows={4}
            placeholder="Tell something about yourself..."
          />
        </div>
      ) : (
        <p className="text-sm text-gray-600 whitespace-pre-line">
          {profile.bio?.trim() || <span className="text-gray-400 italic">Click "Edit" to add your bio</span>}
        </p>
      )}
    </section>
  );
}
