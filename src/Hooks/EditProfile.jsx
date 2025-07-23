// Hooks/EditProfile.js
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProfile,      // you already have this
  updateProfile,
  uploadProfileImage,
} from '../features/UserProfile';

export function useEditableProfile() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.userProfile.currentUser);
  const reduxStatus = useSelector((state) => state.userProfile.status);

  const [localAvatar, setLocalAvatar] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (reduxStatus === 'idle') {
      fetchProfileData();
    }
  }, [reduxStatus]);

  useEffect(() => {
    if (reduxStatus === 'succeeded' && profile) {
      setLocalAvatar(profile.photo || '');
    }
  }, [reduxStatus, profile]);

  const fetchProfileData = async () => {
    try {
      setIsFetching(true);
      await dispatch(fetchProfile()).unwrap();
    } catch (err) {
      console.error('Profile fetch failed:', err);
    } finally {
      setIsFetching(false);
    }
  };

  // ← Updated:
  const updateProfileData = async (key, value) => {
    try {
      // 1️⃣ Update on server
      await dispatch(updateProfile({ [key]: value })).unwrap();

      // 2️⃣ If removing photo, clear local state immediately
      if (key === 'photo' && !value) {
        setLocalAvatar('');
      }

      // 3️⃣ Re-fetch to sync Redux store
      await fetchProfileData();
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  const uploadImage = async (file, photoIndex = 0) => {
    const localURL = URL.createObjectURL(file);
    setLocalAvatar(localURL);
    setIsUploading(true);

    try {
      const result = await dispatch(uploadProfileImage({ file, photoIndex })).unwrap();
      const timestampedUrl = `${result.publicUrl}?t=${Date.now()}`;

      await dispatch(updateProfile({ photo: timestampedUrl })).unwrap();
      setLocalAvatar(timestampedUrl);

      await fetchProfileData();
      window.location.reload();
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    profile,
    status: reduxStatus,
    isUploading,
    isFetching,
    localAvatar,
    updateProfileData,
    uploadImage,
    refetch: fetchProfileData,
  };
}
