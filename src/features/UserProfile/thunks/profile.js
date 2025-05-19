
/* ========== features/UserProfile/thunks.js ========== */
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchMyProfile,
  updateProfileData as apiUpdate,
  getPresignedUrl,completeProfileApi
} from '../api/profile';
import axios from 'axios';

export const fetchProfile = createAsyncThunk(
  'userProfile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchMyProfile();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'userProfile/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await apiUpdate(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchPresignedUrl = createAsyncThunk(
  'userProfile/fetchPresignedUrl',
  async ({ fileType, photoIndex }, { rejectWithValue }) => {
    try {
      const { data } = await getPresignedUrl({ fileType, photoIndex });
      return data; // { presignedUrl, publicUrl }
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const uploadProfileImage = createAsyncThunk(
  'userProfile/uploadProfileImage',
  async ({ file, photoIndex }, thunkAPI) => {
    try {
      const { presignedUrl, publicUrl } = await thunkAPI
        .dispatch(fetchPresignedUrl({ fileType: file.type, photoIndex }))
        .unwrap();

      await axios.put(presignedUrl, file, {
        headers: { 'Content-Type': file.type },
      });

      const payload = { photos: { index: photoIndex, url: publicUrl } };
      const updated = await thunkAPI.dispatch(updateProfile(payload)).unwrap();
      return { updatedProfile: updated, publicUrl };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Upload failed');
    }
  }
);

/** Thunk to complete profile (final submission) */
export const completeProfile = createAsyncThunk(
  'userProfile/completeProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await completeProfileApi(formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);