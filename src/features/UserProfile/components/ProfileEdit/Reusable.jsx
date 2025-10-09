import Skeleton from "react-loading-skeleton";
import { Suspense } from "react";
// ======== Reusable Components ========
export const LoadingSkeleton = ({ count = 3, height = 30 }) => (
  <Skeleton count={count} height={height} className="my-2" />
);

export const Section = ({ title, children, className = "" }) => (
  <section className={`bg-white border border-gray-200 rounded-2xl p-5 mb-6 ${className}`}>
    <h2 className="text-sm font-semibold text-gray-800 mb-3">{title}</h2>
    {children}
  </section>
);

export const ProfileAvatar = ({
  src, toggleUpload, showUpload, UploadOptionsComponent,
  galleryRef, cameraRef, handleFileChange, openCamera, openGallery, handleRemovePhoto, cancelUpload
}) => (
  <div className="relative w-32 h-32">
    <img src={src} className="w-full h-full rounded-full border-4 border-pink-400 object-cover" alt="avatar" />
    <button onClick={toggleUpload} className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow">
      <Edit2 size={16} className="text-gray-600" />
    </button>
    {showUpload && (
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-10">
        <UploadOptionsComponent
          onCamera={openCamera}
          onGallery={openGallery}
          onRemove={handleRemovePhoto}
          onCancel={cancelUpload}
        />
      </div>
    )}
    <input type="file" accept="image/*" ref={galleryRef} onChange={handleFileChange} className="hidden" />
    <input type="file" accept="image/*" capture="environment" ref={cameraRef} onChange={handleFileChange} className="hidden" />
  </div>
);

export const LazyWrapper = ({ children, fallbackCount = 3, fallbackHeight = 30 }) => (
  <Suspense fallback={<LoadingSkeleton count={fallbackCount} height={fallbackHeight} />}>
    {children}
  </Suspense>
);

export const AVATAR_PLACEHOLDER = "https://d36zx1g74mcorc.cloudfront.net/websitephotos/avatar.svg";
