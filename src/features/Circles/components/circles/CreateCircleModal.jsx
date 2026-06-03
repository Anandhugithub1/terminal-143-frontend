// components/circles/CreateCircleModal.jsx
import { X, Upload, Users, MapPin } from "lucide-react";
import { useState } from "react";

export default function CreateCircleModal({ isOpen, onClose }) {
  const [circleName, setCircleName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  if (!isOpen) return null;

  const categories = [
    "Sports & Fitness",
    "Learning & Education",
    "Arts & Culture",
    "Music & Entertainment",
    "Food & Dining",
    "Travel & Adventure",
    "Technology",
    "Games & Gaming",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 pb-4 border-b border-gray-100 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Create a Circle</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Create a community around your interests
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Circle Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Circle Image
            </label>
            <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary transition-colors cursor-pointer bg-gray-50">
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  <span className="text-primary font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Circle Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Circle Name
            </label>
            <input
              type="text"
              value={circleName}
              onChange={(e) => setCircleName(e.target.value)}
              placeholder="e.g., Morning Runners"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this circle about?"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add a location (optional)"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Privacy
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 border-2 border-primary bg-primary/5 rounded-xl text-left transition-all">
                <Users className="w-5 h-5 text-primary mb-2" />
                <h3 className="font-semibold text-gray-800">Public</h3>
                <p className="text-xs text-gray-500 mt-1">Anyone can join</p>
              </button>
              <button className="p-4 border-2 border-gray-200 rounded-xl text-left transition-all hover:border-gray-300">
                <Users className="w-5 h-5 text-gray-400 mb-2" />
                <h3 className="font-semibold text-gray-800">Private</h3>
                <p className="text-xs text-gray-500 mt-1">Invite only</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white p-6 pt-4 border-t border-gray-100 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all">
              Create Circle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}