import React, { useRef, useState, useEffect } from 'react';
import { useWizard } from '../../contexts/ProfileWizard';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './Progess';
import PhotoGrid from '../../components/PhotoGrid';
import { set, get } from 'idb-keyval';

const Step3PhotoUpload = () => {
  const { formData, setFormData } = useWizard();
  const userType = localStorage.getItem('userType');
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const maxSlots = userType === 'mp' ? 3 : 1;
  const uploadedPhotos = userType === 'mp' ? formData.profilePhotos || [] : [formData.profilePhoto];

  // Load persisted photos from IndexedDB
  useEffect(() => {
    const loadPhotos = async () => {
      if (userType === 'mp') {
        const photos = await get('profilePhotos');
        if (photos?.length) setFormData((prev) => ({ ...prev, profilePhotos: photos }));
      } else {
        const photo = await get('profilePhoto');
        if (photo) setFormData((prev) => ({ ...prev, profilePhoto: photo }));
      }
    };
    loadPhotos();
  }, [setFormData, userType]);

  const handleSlotClick = (index) => {
    setSelectedSlot(index);
    inputRef.current?.click();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate upload

    if (userType === 'mp') {
      const existingPhotos = formData.profilePhotos || [];
      let newPhotos;

      if (selectedSlot !== null && existingPhotos[selectedSlot]) {
        // Replace photo
        newPhotos = existingPhotos.map((p, idx) => (idx === selectedSlot ? file : p));
      } else if (existingPhotos.length < maxSlots) {
        // Add new photo
        newPhotos = [...existingPhotos, file];
      } else {
        newPhotos = existingPhotos;
      }

      setFormData((prev) => ({ ...prev, profilePhotos: newPhotos }));
      await set('profilePhotos', newPhotos);
    } else {
      setFormData((prev) => ({ ...prev, profilePhoto: file }));
      await set('profilePhoto', file);
    }

    setUploading(false);
    setSelectedSlot(null);
  };

  const handleRemove = async (index) => {
    if (userType === 'mp') {
      const newPhotos = [...(formData.profilePhotos || [])];
      newPhotos.splice(index, 1);
      setFormData((prev) => ({ ...prev, profilePhotos: newPhotos }));
      await set('profilePhotos', newPhotos);
    } else {
      setFormData((prev) => ({ ...prev, profilePhoto: null }));
      await set('profilePhoto', null);
    }
  };

  const handleNext = () => navigate('/complete/tags');
  const handleBack = () => navigate('/complete/bio');

  // Validation for mp users
  const mpPhotosValid = userType !== 'mp' || (uploadedPhotos.length >= maxSlots);

  return (
    <div className="animate-fade-in">
      <ProgressBar step={3} totalSteps={4} />

      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {userType === 'mp' ? 'Show Your Sparkle ✨' : 'Upload Your Photo'}
        </h2>
        <p className="text-gray-500">
          {userType === 'mp'
            ? `Upload at least ${maxSlots} photos to get started`
            : 'Upload photo to get started'}
        </p>
      </div>

      {userType === 'mp' && !mpPhotosValid && (
        <p className="text-red-500 text-sm mb-4">
          Please upload at least {maxSlots} photos to proceed.
        </p>
      )}

      <PhotoGrid
        photos={uploadedPhotos}
        maxSlots={maxSlots}
        onSlotClick={handleSlotClick}
        onRemove={handleRemove}
        uploading={uploading}
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleBack}
          className="flex-1 py-3 px-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!mpPhotosValid}
          className={`flex-1 text-white font-semibold py-3 px-6 rounded-xl transition-all
            ${mpPhotosValid
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
              : 'bg-gray-300 cursor-not-allowed'
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step3PhotoUpload;
