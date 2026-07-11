import {
  X,
  Upload
} from "lucide-react";

import {
  useRef,
  useState,
  useEffect
} from "react";

import { useTranslation } from "react-i18next";

import {
  circleCategories
} from "../../constants/circleCategories";

import {
  useCreateCircle
} from "../../hooks/useCircles";

import {
  getPresignedUrl
} from "../../api/imageupload";
import { uploadToS3 } from "../../../../shared/utils/uploadToS3";

import LocationInput from "../../../AddProfile/components/LocationInput";
import { ensureNormalizedImage } from "../../../../utils/imageConversion";
import BottomSheetModal from "../common/BottomSheetModal";
import { useMyProfile } from "../../../UserProfile/Hooks/useMyProfile";
import { useLocationState } from "../../../../shared/hooks/useLocationState";

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
  const { t } = useTranslation("circles");
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

  const { location, setLocation, isEnrichingLocation, handleLocationSelect, resetLocation } = useLocationState();

  const { data: myProfile } = useMyProfile();

  useEffect(() => {
    if (isOpen && myProfile?.location?.placeName && !location.placeName) {
      setLocation(myProfile.location);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, myProfile]);

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
          t("createCircleModal.invalidImageType")
        );
        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        alert(
          t("createCircleModal.imageTooLarge")
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

    await uploadToS3(presignedUrl, uploadFile);

    return publicUrl;
  };

  const handleCreateCircle =
    async () => {
      try {
        if (
          !circleName.trim()
        ) {
          alert(
            t("createCircleModal.nameRequired")
          );
          return;
        }

        if (
          !description.trim()
        ) {
          alert(
            t("createCircleModal.descriptionRequired")
          );
          return;
        }

        if (
          !category
        ) {
          alert(
            t("createCircleModal.categoryRequired")
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

        resetLocation();

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
            t("createCircleModal.failedToCreate")
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
              {t("createCircleModal.header")}
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
            {t("createCircleModal.subheading")}
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("createCircleModal.imageLabel")}
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
                  alt={t("createCircleModal.coverPreviewAlt")}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />

                  <p className="text-sm text-gray-500">
                    <span className="text-primary font-semibold">
                      {t("createCircleModal.clickToUpload")}
                    </span>
                    {t("createCircleModal.orDragAndDrop")}
                  </p>

                  <p className="text-xs text-gray-400">
                    {t("createCircleModal.uploadHint")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("createCircleModal.nameLabel")}
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
              placeholder={t("createCircleModal.namePlaceholder")}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("createCircleModal.descriptionLabel")}
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
              placeholder={t("createCircleModal.descriptionPlaceholder")}
              rows={
                3
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("createCircleModal.categoryLabel")}
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
                {t("createCircleModal.selectCategory")}
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
              {t("common.cancel")}
            </button>

            <button
              onClick={
                handleCreateCircle
              }
              disabled={
                createCircleMutation.isPending ||
                isUploadingImage ||
                isEnrichingLocation
              }
              className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isUploadingImage
                ? t("createCircleModal.uploadingImage")
                : createCircleMutation.isPending
                ? t("createCircleModal.creating")
                : isEnrichingLocation
                ? t("createCircleModal.fetchingLocation")
                : t("createCircleModal.createCircle")}
            </button>
          </div>
        </div>
    </BottomSheetModal>
  );
}