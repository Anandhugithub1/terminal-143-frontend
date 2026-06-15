import {
  X,
  Upload
} from "lucide-react";

import {
  useRef,
  useState,
  useCallback
} from "react";

import {
  circleCategories
} from "../../constants/circleCategories";

import {
  useCreateCircle
} from "../../hooks/useCircles";

import {
  getPresignedUrl
} from "../../api/imageupload";

import LocationInput from "../../../AddProfile/components/LocationInput";
import { ensureNormalizedImage } from "../../../../utils/imageConversion";
import BottomSheetModal from "../common/BottomSheetModal";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
];

export default function CreateCircleModal({
  isOpen,
  onClose
}) {
  const [
    circleName,
    setCircleName
  ] = useState("");

  const [
    description,
    setDescription
  ] = useState("");

  const [
    category,
    setCategory
  ] = useState("");

  const [
    location,
    setLocation
  ] = useState({
    coordinates: { lat: null, lon: null },
    placeName: "",
    countryCode: "",
    admin1: "",
    h3: { r4: "" }
  });

  const [
    coverFile,
    setCoverFile
  ] = useState(null);

  const [
    coverPreview,
    setCoverPreview
  ] = useState("");

  const [
    isUploadingImage,
    setIsUploadingImage
  ] = useState(false);

  const fileInputRef =
    useRef(null);

  const createCircleMutation =
    useCreateCircle();

  const handleImageChange =
    e => {
      const file =
        e.target.files?.[0];

      if (!file) return;

      if (
        !ALLOWED_IMAGE_TYPES.includes(
          file.type
        )
      ) {
        alert(
          "Please select a JPG, PNG, or WEBP image"
        );
        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        alert(
          "Image must be under 5MB"
        );
        return;
      }

      setCoverFile(
        file
      );
      setCoverPreview(
        URL.createObjectURL(
          file
        )
      );
    };

  const handleLocationSelect = useCallback((loc, detailsPromise) => {
    if (!loc) {
      setLocation({
        coordinates: { lat: null, lon: null },
        placeName: "",
        countryCode: "",
        admin1: "",
        h3: { r4: "" },
      });
      return;
    }

    setLocation({
      coordinates: { lat: loc.lat, lon: loc.lon },
      placeName: loc.placeName,
      countryCode: loc.countryCode,
      admin1: loc.admin1,
      h3: { r4: loc.h3Index || "" },
    });

    detailsPromise?.then((enriched) => {
      if (!enriched) return;
      setLocation({
        coordinates: { lat: enriched.lat, lon: enriched.lon },
        placeName: enriched.placeName,
        countryCode: enriched.countryCode,
        admin1: enriched.admin1,
        h3: { r4: enriched.h3Index || "" },
      });
    });
  }, []);

 const uploadCoverPhoto =
  async () => {

    const uploadFile =
      await ensureNormalizedImage(
        coverFile
      );

    const {
      data: {
        presignedUrl,
        publicUrl
      }
    } =
      await getPresignedUrl(
        {
          fileType:
            uploadFile.type,
          kind:
            'circleCover',
          circleName:
            circleName.trim()
        }
      );

    const uploadRes =
      await fetch(
        presignedUrl,
        {
          method:
            'PUT',

          headers: {
            'Content-Type':
              uploadFile.type
          },

          body:
            uploadFile
        }
      );

    if (
      !uploadRes.ok
    ) {
      throw new Error(
        'Upload failed'
      );
    }

    return publicUrl;
  };

  const handleCreateCircle =
    async () => {
      try {
        if (
          !circleName.trim()
        ) {
          alert(
            "Circle name is required"
          );
          return;
        }

        if (
          !description.trim()
        ) {
          alert(
            "Description is required"
          );
          return;
        }

        if (
          !category
        ) {
          alert(
            "Please select category"
          );
          return;
        }

        let coverPhoto =
          "";

        if (
          coverFile
        ) {
          setIsUploadingImage(
            true
          );

          try {
            coverPhoto =
              await uploadCoverPhoto();
          } finally {
            setIsUploadingImage(
              false
            );
          }
        }

        const payload =
          {
            name:
              circleName.trim(),

            description:
              description.trim(),

            category,

            visibility:
              "public",

            tags:
              location.placeName
                ? [
                    location
                      .placeName
                      .trim()
                      .toLowerCase(),
                  ]
                : [],

            location,

            coverPhoto,
          };

        await createCircleMutation.mutateAsync(
          payload
        );

        setCircleName(
          ""
        );

        setDescription(
          ""
        );

        setCategory(
          ""
        );

        handleLocationSelect(null);

        setCoverFile(
          null
        );
        setCoverPreview(
          ""
        );

        onClose();
      } catch (
        err
      ) {
        console.error(
          err
        );

        alert(
          err
            ?.response
            ?.data
            ?.error ||
            "Failed to create circle"
        );
      }
    };

  if (
    !isOpen
  )
    return null;

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      panelClassName="rounded-t-2xl sm:rounded-2xl sm:max-w-md max-h-[90vh] overflow-y-auto"
    >
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 pb-4 border-b border-gray-100 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Create a
              Circle
            </h2>

            <button
              onClick={
                onClose
              }
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-1">
            Create a
            community
            around your
            interests
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Circle
              Image
            </label>

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
              onChange={
                handleImageChange
              }
              className="hidden"
            />

            <div
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary transition-colors cursor-pointer bg-gray-50 overflow-hidden"
            >
              {coverPreview ? (
                <img
                  src={
                    coverPreview
                  }
                  alt="Circle cover preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />

                  <p className="text-sm text-gray-500">
                    <span className="text-primary font-semibold">
                      Click
                      to
                      upload
                    </span>{" "}
                    or drag
                    and
                    drop
                  </p>

                  <p className="text-xs text-gray-400">
                    PNG,
                    JPG
                    up to
                    5MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Circle
              Name
            </label>

            <input
              type="text"
              value={
                circleName
              }
              onChange={e =>
                setCircleName(
                  e
                    .target
                    .value
                )
              }
              placeholder="e.g., Weekend Hikers"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>

            <textarea
              value={
                description
              }
              onChange={e =>
                setDescription(
                  e
                    .target
                    .value
                )
              }
              placeholder="What's this circle about?"
              rows={
                3
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>

            <select
              value={
                category
              }
              onChange={e =>
                setCategory(
                  e
                    .target
                    .value
                )
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white"
            >
              <option value="">
                Select
                a
                category
              </option>

              {circleCategories.map(
                cat => (
                  <option
                    key={
                      cat
                    }
                    value={
                      cat
                    }
                  >
                    {
                      cat
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {/* Location */}
          <LocationInput
            formData={{ location }}
            onSelect={handleLocationSelect}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white p-6 pt-4 border-t border-gray-100 rounded-b-none sm:rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={
                onClose
              }
              className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={
                handleCreateCircle
              }
              disabled={
                createCircleMutation.isPending ||
                isUploadingImage
              }
              className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isUploadingImage
                ? "Uploading image..."
                : createCircleMutation.isPending
                ? "Creating..."
                : "Create Circle"}
            </button>
          </div>
        </div>
    </BottomSheetModal>
  );
}