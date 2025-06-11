import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../features/UserProfile';
import { updateProfile, uploadProfileImage } from '../features/UserProfile';

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
      setLocalAvatar(profile.profilePhoto || profile.photo || '');
    }
  }, [status, profile]);

  const updateProfileData = (key, value) => {
    // For interests, we need to handle array to object conversion if needed
    const payload = key === 'interest' && Array.isArray(value) 
      ? { [key]: value } 
      : { [key]: value };
    
    dispatch(updateProfile(payload));
    window.location.reload(); // 🔁 Force full page reload after update

  };

  const uploadImage = (file, photoIndex) => {
    setLocalAvatar(URL.createObjectURL(file));
    dispatch(uploadProfileImage({ file, photoIndex }));
  };

  return {
    profile,
    status,
    localAvatar,
    updateProfileData,
    uploadImage,
  };
}