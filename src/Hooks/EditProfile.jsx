import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile, uploadProfileImage } from '../features/UserProfile';

export function useEditableProfile() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.userProfile.currentUser);
  const status = useSelector((state) => state.userProfile.status);

  const [localAvatar, setLocalAvatar] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProfile());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (status === 'succeeded' && profile) {
      setLocalAvatar(profile.photo || '');
    }
  }, [status, profile]);

  const updateProfileData = (key, value) => {
    const payload = { [key]: value };
    dispatch(updateProfile(payload));
  };

  const uploadImage = async (file, photoIndex = 0) => {
    const localURL = URL.createObjectURL(file);
    setLocalAvatar(localURL); // temporary preview
    try {
      const result = await dispatch(uploadProfileImage({ file, photoIndex })).unwrap();
      
      await dispatch(updateProfile({ photo: result.publicUrl }));
      setLocalAvatar(result.publicUrl);

       // ✅ Force full reload after update is done
    setTimeout(() => {
      window.location.reload(); // full hard reload to reset cache
    }, 300);

      // ✅ Refetch profile to ensure cache busting, latest photo, etc.
      await dispatch(fetchProfile());
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return {
    profile,
    status,
    localAvatar,
    updateProfileData,
    uploadImage,
  };
}
