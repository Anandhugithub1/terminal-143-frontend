import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 1️⃣ Thunk to PATCH any profile field(s)
export const updateProfileData = createAsyncThunk(
  'profiles/updateProfileData',
  async (payload, thunkAPI) => {
    const accessToken = localStorage.getItem('accessToken');
    const userType = localStorage.getItem('userType');
    const idToken = localStorage.getItem('idToken');
    try {
      const response = await axios.patch(
        'http://localhost:4000/api/users/update',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            'x-user-type': userType,
            'x-id-token': idToken,
          },
        }
      );
      return response.data; // updated user object
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || 'Failed to update profile data.'
      );
    }
  }
);

// 2️⃣ Thunk to get a presigned URL for image uploads
export const fetchPresignedUrl = createAsyncThunk(
  'profiles/fetchPresignedUrl',
  async ({ fileType, photoIndex }, thunkAPI) => {
    const accessToken = localStorage.getItem('accessToken');
    const userType = localStorage.getItem('userType');
    const idToken = localStorage.getItem('idToken');
    try {
      const response = await axios.post(
        'http://localhost:4000/api/users/presigned-url',
        { fileType, photoIndex },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            'x-user-type': userType,
            'x-id-token': idToken,
          },
        }
      );
      return response.data; // { presignedUrl, publicUrl }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || 'Failed to get presigned URL.'
      );
    }
  }
);

// 3️⃣ Thunk to upload file to S3 then PATCH user record
export const uploadProfileImage = createAsyncThunk(
  'profiles/uploadProfileImage',
  async ({ file, photoIndex }, thunkAPI) => {
    try {
      const { presignedUrl, publicUrl } = await thunkAPI
        .dispatch(fetchPresignedUrl({ fileType: file.type, photoIndex }))
        .unwrap();

      await axios.put(presignedUrl, file, {
        headers: { 'Content-Type': file.type },
      });

      // Prepare payload based on userType from localStorage
      const userType = localStorage.getItem('userType');
      const payload =
        userType === 'fm'
          ? { profilePhoto: publicUrl }
          : { photos: { index: photoIndex, url: publicUrl } };

      const updatedProfile = await thunkAPI
        .dispatch(updateProfileData(payload))
        .unwrap();

      return { updatedProfile, publicUrl };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Image upload failed.');
    }
  }
);

const updateProfileSlice = createSlice({
  name: 'profiles',
  initialState: {
    currentUser: null,
    list: [],
    status: 'idle',
    error: null,
    updateStatus: 'idle',
    uploadStatus: 'idle',
    uploadError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // updateProfileData handlers
      .addCase(updateProfileData.pending, (state) => {
        state.updateStatus = 'loading';
        state.error = null;
      })
      .addCase(updateProfileData.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        state.currentUser = action.payload;
      })
      .addCase(updateProfileData.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload;
      })

      // uploadProfileImage handlers
      .addCase(uploadProfileImage.pending, (state) => {
        state.uploadStatus = 'loading';
        state.uploadError = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.uploadStatus = 'succeeded';
        state.currentUser = action.payload.updatedProfile;
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.uploadStatus = 'failed';
        state.uploadError = action.payload;
      });
  },
});

export default updateProfileSlice.reducer;
