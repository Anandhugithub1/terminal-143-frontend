// components/EditableBio.jsx
import { Edit2 } from "lucide-react";

export default function EditableBio({
  profile,
  setActiveField,
  editLabel = "Edit",
  emptyText = 'Click "Edit" to add your bio',
}) {
  return (
    <section className="bg-gray-100 rounded-2xl p-5">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-sm font-semibold text-gray-800">My Bio</h2>

        <button
          onClick={() =>
            setActiveField({
              key: "bio",
              label: "Bio",
              value: profile.bio || "",
            })
          }
          className="text-pink-600 hover:text-pink-700 flex items-center"
        >
          <Edit2 size={16} className="mr-1" />
          <span className="text-sm font-medium">{editLabel}</span>
        </button>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-600 whitespace-pre-line mt-2">
        {profile.bio?.trim() || (
          <span className="text-gray-400 italic">{emptyText}</span>
        )}
      </p>
    </section>
  );
}
