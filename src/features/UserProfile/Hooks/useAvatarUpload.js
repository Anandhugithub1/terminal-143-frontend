import { useState, useRef } from 'react';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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
    if (!file) return;

    //  Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert('Invalid file format. Only JPG, JPEG, PNG, or WEBP images are allowed.');
      e.target.value = '';
      return;
    }

    uploadImage(file, userType === 'fm' ? 0 : undefined);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    updateProfileData('photo', '');
    setShowUpload(false);
  };

  return {
    showUpload,
    toggleUpload, 
    openGallery,
    openCamera,
    galleryRef,
    cameraRef,
    handleFileChange,
    handleRemovePhoto,
  };
}
