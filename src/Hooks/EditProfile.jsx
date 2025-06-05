import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../features/UserProfile';
import { updateProfileData, uploadProfileImage } from '../features/UserProfile';

export function useEditableProfile() {
  const dispatch = useDispatch();
  // Inline selectors instead of importing a separate "selectProfile" file
  const profile = useSelector((state) => state.userProfile.currentUser);
  const status = useSelector((state) => state.userProfile.status);

  const [localAvatar, setLocalAvatar] = useState('');
  const [localBio, setLocalBio] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProfile());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (status === 'succeeded' && profile) {
      setLocalAvatar(profile.profilePhoto || profile.photo || '');
      setLocalBio(profile.bio || '');
    }
  }, [status, profile]);

  const editField = (key, currentValue) => {
    const updated = window.prompt(
      `Update ${key.charAt(0).toUpperCase() + key.slice(1)}:`,
      currentValue
    );
    if (updated !== null) {
      dispatch(updateProfileData({ [key]: updated }));
    }
  };

  const editBio = () => {
    const updated = window.prompt('Update your bio:', localBio);
    if (updated !== null) {
      setLocalBio(updated);
      dispatch(updateProfileData({ bio: updated }));
    }
  };

  const uploadImage = (file, photoIndex) => {
    setLocalAvatar(URL.createObjectURL(file));
    dispatch(uploadProfileImage({ file, photoIndex }));
  };

  return {
    profile,
    status,
    localAvatar,
    localBio,
    editField,
    editBio,
    uploadImage,
  };
}
