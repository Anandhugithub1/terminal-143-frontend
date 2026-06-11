import {
  X,
  Image,
  MapPin,
  Send,
  Smile,
  Hash,
  Video,
  Play,
  Pause,
  Clock,
} from "lucide-react";
import { useState, useRef } from "react";
import { suggestedTags, visibilityOptions, activityTypes } from "../../constants/postOptions";

export default function CreatePostModal({ isOpen, onClose, onSubmit, circleName, circleId, authorData }) {
  const [postContent, setPostContent] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [media, setMedia] = useState([]); // Array of { url, type, durationSec, compressed }
  const [visibility, setVisibility] = useState("all");
  const [activityType, setActivityType] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [location, setLocation] = useState({
    coordinates: { lat: null, lon: null },
    placeName: "",
    countryCode: "",
    admin1: "",
    h3: { r4: "" }
  });

  const videoRef = useRef(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  if (!isOpen) return null;

  const handleAddTag = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddCustomTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags([...selectedTags, tagInput.trim()]);
      setTagInput("");
      setShowTagInput(false);
    }
  };

  // Handle media upload (image/video)
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      // Check file type
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        alert("Only image and video files are allowed");
        return;
      }

      // Check media limit (max 5)
      if (media.length >= 5) {
        alert("Maximum 5 media files allowed");
        return;
      }

      setUploadingMedia(true);

      // Create object URL for preview
      const url = URL.createObjectURL(file);
      const type = isImage ? "image" : "video";

      const newMedia = {
        url,
        type,
        durationSec: 0,
        compressed: false,
        file, // Keep file reference for upload
      };

      // If video, check duration
      if (isVideo) {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          const duration = Math.round(video.duration);
          if (duration > 60) {
            alert("Video must be 60 seconds or less");
            URL.revokeObjectURL(url);
            setUploadingMedia(false);
            return;
          }
          newMedia.durationSec = duration;
          setMedia((prev) => [...prev, newMedia]);
          setUploadingMedia(false);
        };
        video.src = url;
      } else {
        setMedia((prev) => [...prev, newMedia]);
        setUploadingMedia(false);
      }
    });
  };

  // Remove media
  const handleRemoveMedia = (index) => {
    setMedia((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Revoke object URL for removed media
      URL.revokeObjectURL(prev[index].url);
      return updated;
    });
  };

  // Toggle video play/pause for preview
  const toggleVideoPlay = (index) => {
    if (playingVideo === index) {
      videoRef.current?.pause();
      setPlayingVideo(null);
    } else {
      setPlayingVideo(index);
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle submit
  const handleSubmit = () => {
    const postData = {
      circleId: circleId || "demo-circle-id",
      authorId: authorData?.id || "demo-user-id",
      authorName: authorData?.name || "Your Name",
      authorImage: authorData?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      authorGenderGroup: authorData?.genderGroup || "OT",
      authorPreferenceGroups: authorData?.preferenceGroups || [],
      body: postContent,
      media: media.map(({ url, type, durationSec, compressed }) => ({
        url,
        type,
        durationSec,
        compressed,
      })),
      visibility,
      activityType,
      location: showLocationInput ? location : undefined,
      createdAtEpoch: Math.floor(Date.now() / 1000),
      tags: selectedTags,
    };

    console.log("Creating post:", postData);

    // Call onSubmit prop if provided
    if (onSubmit) {
      onSubmit(postData);
    }

    // Reset form
    setPostContent("");
    setSelectedTags([]);
    setMedia([]);
    setVisibility("all");
    setActivityType("");
    setShowLocationInput(false);
    setLocation({
      coordinates: { lat: null, lon: null },
      placeName: "",
      countryCode: "",
      admin1: "",
      h3: { r4: "" }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Create Post</h3>
            {circleName && (
              <p className="text-xs text-gray-500 mt-0.5">in {circleName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <img
              src={authorData?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"}
              alt={authorData?.name || "Your avatar"}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h4 className="font-semibold text-gray-800">{authorData?.name || "Your Name"}</h4>
              <p className="text-xs text-gray-500">Post to circle</p>
            </div>
          </div>

          {/* Post Input */}
          <textarea
            value={postContent}
            onChange={(e) => {
              if (e.target.value.length <= 1000) {
                setPostContent(e.target.value);
              }
            }}
            placeholder="Share your running experience, tips, or ask a question..."
            rows={5}
            maxLength={1000}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
          />
          <div className="flex justify-end">
            <span className={`text-xs ${postContent.length > 900 ? "text-red-500" : "text-gray-400"}`}>
              {postContent.length}/1000
            </span>
          </div>

          {/* Media Upload Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Add Photos & Videos <span className="text-gray-400 font-normal">(Max 5, videos ≤ 60s)</span>
            </label>

            {/* Media Preview Grid */}
            {media.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {media.map((item, index) => (
                  <div key={index} className="relative group">
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="relative w-full h-24 bg-gray-900 rounded-lg overflow-hidden">
                        <video
                          ref={playingVideo === index ? videoRef : null}
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <button
                            onClick={() => toggleVideoPlay(index)}
                            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                          >
                            {playingVideo === index ? (
                              <Pause className="w-4 h-4 text-gray-800" />
                            ) : (
                              <Play className="w-4 h-4 text-gray-800" />
                            )}
                          </button>
                        </div>
                        {item.durationSec > 0 && (
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(item.durationSec)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveMedia(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {/* Video indicator */}
                    {item.type === "video" && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-purple-500/90 rounded text-xs text-white flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        Video
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload Buttons */}
            {media.length < 5 && (
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-gray-50 transition-colors">
                    <Image className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-500">Add Photos</span>
                  </div>
                </label>

                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-purple-500 hover:bg-purple-50 transition-colors">
                    <Video className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-500">Add Video (≤60s)</span>
                  </div>
                </label>
              </div>
            )}

            {uploadingMedia && (
              <p className="text-xs text-primary mt-2">Processing media...</p>
            )}
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Activity Type
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
            >
              <option value="">Select activity (optional)</option>
              {activityTypes.map((activity) => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Visibility
            </label>
            <div className="grid grid-cols-3 gap-2">
              {visibilityOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setVisibility(option.value)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      visibility === option.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${
                      visibility === option.value ? "text-primary" : "text-gray-400"
                    }`} />
                    <span className="text-xs font-medium block">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location Toggle */}
          <div>
            <button
              onClick={() => setShowLocationInput(!showLocationInput)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
            >
              <MapPin className="w-4 h-4" />
              {showLocationInput ? "Remove Location" : "Add Location"}
            </button>

            {showLocationInput && (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={location.placeName}
                  onChange={(e) => setLocation({ ...location, placeName: e.target.value })}
                  placeholder="Place name (e.g., Benjakitti Park)"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={location.countryCode}
                  onChange={(e) => setLocation({ ...location, countryCode: e.target.value })}
                  placeholder="Country code (e.g., TH)"
                  maxLength={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags
            </label>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                  >
                    <Hash className="w-3 h-3" />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedTags
                .filter((tag) => !selectedTags.includes(tag))
                .map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
                  >
                    <Hash className="w-3 h-3 inline mr-1" />
                    {tag}
                  </button>
                ))}
            </div>

            {/* Add Custom Tag */}
            {showTagInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Enter custom tag..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddCustomTag();
                    }
                  }}
                />
                <button
                  onClick={handleAddCustomTag}
                  className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowTagInput(false)}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTagInput(true)}
                className="text-primary text-xs font-medium hover:underline"
              >
                + Add custom tag
              </button>
            )}
          </div>

          {/* Post Options */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700">Add to your post</h4>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                <Image className="w-4 h-4 text-green-500" />
                Photo
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMediaUpload}
                  className="hidden"
                />
              </label>
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                <Video className="w-4 h-4 text-purple-500" />
                Video
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowLocationInput(!showLocationInput)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <MapPin className="w-4 h-4 text-red-500" />
                Location
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                <Smile className="w-4 h-4 text-yellow-500" />
                Activity
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!postContent.trim() && media.length === 0}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                postContent.trim() || media.length > 0
                  ? "bg-primary text-white hover:shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
