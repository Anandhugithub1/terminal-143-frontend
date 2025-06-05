
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
      const res = await fetchMyProfile();
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        // Profile doesn’t exist yet
        return rejectWithValue('Profile not found.');
      }
      return rejectWithValue(err.message);
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

        console.log("File type:", file.type);

        return { publicUrl, photoIndex };


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