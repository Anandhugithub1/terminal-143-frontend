import { X, Image, MapPin, Loader2 } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { useMediaAttachments } from "../../hooks/useMediaAttachments";
import LocationInput from "../../../AddProfile/components/LocationInput";
import { getPresignedUrl } from "../../api/imageupload";
import BottomSheetModal from "../common/BottomSheetModal";

export default function EditPostModal({ isOpen, onClose, post, circleId, circleName, onSave, isSaving }) {
  const [content, setContent] = useState(post?.content || "");
  const [keptMedia, setKeptMedia] = useState(post?.media || []);
  const [showLocation, setShowLocation] = useState(!!post?.location?.placeName);
  const [location, setLocation] = useState(post?.location || {
    coordinates: { lat: null, lon: null },
    placeName: "",
    countryCode: "",
    admin1: "",
    h3: { r4: "" },
  });
  const [isEnrichingLocation, setIsEnrichingLocation] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { media: newMedia, addFiles, removeMedia: removeNewMedia, isValidating } = useMediaAttachments();

  const handleLocationSelect = useCallback((loc, detailsPromise) => {
    if (!loc) {
      setIsEnrichingLocation(false);
      setLocation({ coordinates: { lat: null, lon: null }, placeName: "", countryCode: "", admin1: "", h3: { r4: "" } });
      return;
    }
    setLocation({
      coordinates: { lat: loc.lat, lon: loc.lon },
      placeName: loc.placeName,
      countryCode: loc.countryCode,
      admin1: loc.admin1,
      h3: { r4: loc.h3Index || "" },
    });
    if (detailsPromise) {
      setIsEnrichingLocation(true);
      detailsPromise
        .then((enriched) => {
          if (!enriched) return;
          setLocation({
            coordinates: { lat: enriched.lat, lon: enriched.lon },
            placeName: enriched.placeName,
            countryCode: enriched.countryCode,
            admin1: enriched.admin1,
            h3: { r4: enriched.h3Index || "" },
          });
        })
        .finally(() => setIsEnrichingLocation(false));
    }
  }, []);

  const handleSave = async () => {
    if (!content.trim() || isEnrichingLocation || isValidating || isUploading) return;

    setIsUploading(true);
    try {
      const uploadedNew = await Promise.all(
        newMedia.map(async (item, index) => {
          const { data: { presignedUrl, publicUrl } } = await getPresignedUrl({
            fileType: item.file.type,
            kind: "postMedia",
            circleName,
            postId: post.postId,
            mediaIndex: keptMedia.length + index,
          });
          await fetch(presignedUrl, { method: "PUT", headers: { "Content-Type": item.file.type }, body: item.file });
          return { type: item.type, url: publicUrl };
        })
      );

      const finalMedia = [...keptMedia, ...uploadedNew];
      const payload = {
        content: content.trim(),
        media: finalMedia,
        ...(showLocation && location.placeName ? { location } : {}),
      };

      onSave(payload);
    } finally {
      setIsUploading(false);
    }
  };

  const busy = isUploading || isSaving || isEnrichingLocation || isValidating;

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      panelClassName="rounded-t-2xl sm:rounded-2xl sm:max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <h3 className="text-base font-bold text-gray-800">Edit Post</h3>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Content */}
        <textarea
          className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[120px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          autoFocus
        />

        {/* Existing media */}
        {keptMedia.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {keptMedia.map((item, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                {item.type === "video" ? (
                  <video src={item.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={item.url} className="w-full h-full object-cover" alt="" />
                )}
                <button
                  onClick={() => setKeptMedia((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New media previews */}
        {newMedia.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {newMedia.map((item) => (
              <div key={item.id} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                {item.type === "video" ? (
                  <video src={item.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={item.url} className="w-full h-full object-cover" alt="" />
                )}
                <button
                  onClick={() => removeNewMedia(item.id)}
                  className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Location */}
        <div>
          <button
            onClick={() => {
              if (showLocation) handleLocationSelect(null);
              setShowLocation((v) => !v);
            }}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
          >
            <MapPin className="w-4 h-4" />
            {showLocation ? "Remove Location" : "Add / Change Location"}
          </button>

          {showLocation && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <LocationInput formData={{ location }} onSelect={handleLocationSelect} />
              {location.placeName && (
                <p className="text-xs text-gray-500 mt-1">{location.placeName}{location.countryCode ? `, ${location.countryCode}` : ""}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 py-3 border-t border-gray-100 flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          title="Add photo / video"
        >
          <Image className="w-5 h-5 text-gray-600" />
        </button>

        <button
          onClick={handleSave}
          disabled={!content.trim() || busy}
          className="flex-1 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          {isUploading || isSaving ? "Saving..." : isEnrichingLocation ? "Fetching location..." : "Save"}
        </button>
      </div>
    </BottomSheetModal>
  );
}
