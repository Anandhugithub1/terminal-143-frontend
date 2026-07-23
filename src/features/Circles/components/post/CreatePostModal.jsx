import {
  X,
  Image,
  MapPin,
  Send,
  Hash,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { suggestedTags } from "../../constants/postOptions";
import { MAX_MEDIA_ITEMS } from "../../constants/mediaConfig";
import { useMediaAttachments } from "../../hooks/useMediaAttachments";
import { createPost } from "../../api/postsApi";
import { getPresignedUrl } from "../../api/imageupload";
import { uploadToS3 } from "../../../../shared/utils/uploadToS3";
import { DEFAULT_AVATAR } from "../../utils/postDisplay";
import BottomSheetModal from "../common/BottomSheetModal";
import { useMyProfile } from "../../../UserProfile/Hooks/useMyProfile";

export default function CreatePostModal({ isOpen, onClose, onSubmit, circleName, circleId, authorData }) {
  const { t } = useTranslation("circles");
  const { data: myProfile } = useMyProfile();
  const [postContent, setPostContent] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [includeLocation, setIncludeLocation] = useState(true);

  const profileLocation = myProfile?.location ?? null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { media, addFiles, removeMedia, reset: resetMedia, isValidating } = useMediaAttachments();

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

  const handleMediaUpload = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleRemoveMedia = (id) => {
    removeMedia(id);
  };

  // Handle submit
  const handleSubmit = async () => {
    if ((!postContent.trim() && media.length === 0) || isValidating || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const postId = crypto.randomUUID();

      const uploadedMedia = await Promise.all(
        media.map(async (item, index) => {
          const {
            data: { presignedUrl, publicUrl },
          } = await getPresignedUrl({
            fileType: item.file.type,
            fileSize: item.file.size,
            kind: "postMedia",
            circleName,
            postId,
            mediaIndex: index,
          });

          await uploadToS3(presignedUrl, item.file);

          return { type: item.type, url: publicUrl };
        })
      );

      const payload = {
        content: postContent,
        media: uploadedMedia,
        visibility: "all",
        tags: selectedTags,
        location: includeLocation && profileLocation ? profileLocation : undefined,
        authorImage: myProfile?.profilePhoto || "",
        circleName: circleName || "",
      };

      const res = await createPost(circleId, payload);

      if (onSubmit) {
        onSubmit(res.data);
      }

      setPostContent("");
      setSelectedTags([]);
      resetMedia();
      setIncludeLocation(true);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || t("createPostModal.failedToCreate"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      animated
      panelClassName="max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col h-[100dvh] sm:h-auto sm:max-h-[90vh]"
    >
      {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{t("createPostModal.header")}</h3>
                {circleName && (
                  <p className="text-xs text-gray-500 mt-0.5">{t("createPostModal.inCircle")}{circleName}</p>
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
                  src={myProfile?.profilePhoto || DEFAULT_AVATAR}
                  alt={myProfile?.name || t("createPostModal.yourAvatarAlt")}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{myProfile?.name || t("createPostModal.you")}</h4>
                  <p className="text-xs text-gray-500">{t("createPostModal.postToCircle")}</p>
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
                placeholder={t("createPostModal.placeholder")}
                rows={5}
                maxLength={1000}
                className="w-full px-4 py-3 bg-white text-gray-800 placeholder-gray-400 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
              />
              <div className="flex items-center justify-between gap-2">
                {/* Nudge toward tags while they're writing — tags are a
                    separate field, never parsed out of the text below. */}
                <span className="text-xs text-gray-400">
                  {selectedTags.length === 0 ? t("createPostModal.tagsHint") : " "}
                </span>
                <span className={`text-xs shrink-0 ${postContent.length > 900 ? "text-red-500" : "text-gray-400"}`}>
                  {postContent.length}/1000
                </span>
              </div>

              {/* Media Upload Area */}
              <div>
                <p className="text-xs text-gray-400 mb-2">
                  {t("createPostModal.maxPhotosLabel", { maxItems: MAX_MEDIA_ITEMS })}
                </p>

                {/* Media Preview Grid */}
                {media.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <AnimatePresence initial={false}>
                      {media.map((item) => (
                        <motion.div
                          key={item.id}
                          className="relative group"
                          layout
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.2 }}
                        >
                          <img
                            src={item.url}
                            alt="Upload preview"
                            className="w-full h-24 object-cover rounded-lg"
                          />

                          {/* Remove button */}
                          <button
                            onClick={() => handleRemoveMedia(item.id)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Upload Button — images only */}
                {media.length < MAX_MEDIA_ITEMS && (
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                    <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-gray-50 transition-colors">
                      <Image className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500">{t("createPostModal.addPhotos")}</span>
                    </div>
                  </label>
                )}
              </div>

              {/* Location — auto-filled from profile, dismissible */}
              {profileLocation?.placeName && (
                <div className="flex items-center gap-2">
                  {includeLocation ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {profileLocation.placeName}
                      {profileLocation.countryCode && `, ${profileLocation.countryCode}`}
                      <button
                        onClick={() => setIncludeLocation(false)}
                        className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                        aria-label={t("createPostModal.removeLocation")}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setIncludeLocation(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {t("createPostModal.addLocation")}
                    </button>
                  )}
                </div>
              )}

              {/* Tags Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("createPostModal.tags")}
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
                      placeholder={t("createPostModal.customTagPlaceholder")}
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
                      {t("createPostModal.add")}
                    </button>
                    <button
                      onClick={() => setShowTagInput(false)}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200"
                    >
                      {t("createPostModal.cancel")}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="text-primary text-xs font-medium hover:underline"
                  >
                    {t("createPostModal.addCustomTag")}
                  </button>
                )}
              </div>

              {/* Post Options */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700">{t("createPostModal.addToYourPost")}</h4>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                    <Image className="w-4 h-4 text-green-500" />
                    {t("createPostModal.photo")}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </label>
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
                  {t("createPostModal.cancel")}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={(!postContent.trim() && media.length === 0) || isValidating || isSubmitting}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    (postContent.trim() || media.length > 0) && !isValidating && !isSubmitting
                      ? "bg-primary text-white hover:shadow-lg"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isSubmitting ? t("createPostModal.posting") : t("createPostModal.post")}
                </button>
              </div>
            </div>
    </BottomSheetModal>
  );
}
