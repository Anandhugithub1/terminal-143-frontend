import React, { useState, useRef } from 'react';

export function useAvatarUpload(uploadImage, updateProfileData) {
  const [showUpload, setShowUpload] = useState(false);
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);

  const toggleUpload = () => setShowUpload(prev => !prev);

  const openGallery = () => {
    galleryRef.current?.click();
    setShowUpload(false);
  };

  const openCamera = () => {
    cameraRef.current?.click();
    setShowUpload(false);
  };

  const handleFileChange = (e, userType) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file, userType === 'fm' ? 0 : undefined);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    updateProfileData('photo', '');
    setShowUpload(false);
  };

  return {
    showUpload,
    toggleUpload, // ✅ return this
    setShowUpload,
    openGallery,
    openCamera,
    galleryRef,
    cameraRef,
    handleFileChange,
    handleRemovePhoto,
  };
}
