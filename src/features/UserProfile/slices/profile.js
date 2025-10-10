/* ========== features/UserProfile/slice.js ========== */
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchProfile,
  updateProfile,
  uploadProfileImage,
  completeProfile,
} from '../thunks/profile';

const initialState = {
  currentUser: null,
  status: 'idle',
  error: null,
  updateStatus: 'idle',
  uploadStatus: 'idle',
  completeStatus: 'idle',
  uploadError: null,
};

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: { 
   resetProfileState: (state) => {
      state.currentUser = null;
      state.status = 'idle';
      state.error = null;
      state.updateStatus = 'idle';
      state.uploadStatus = 'idle';
      state.completeStatus = 'idle';
      state.uploadError = null;
    },
  
  },
  extraReducers: (builder) => {
    builder
      // fetchProfile
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentUser = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        if (action.payload === 'Profile not found.') {
          state.status = 'notFound';
          state.error = null;
        } else {
          state.status = 'failed';
          state.error = action.payload;
        }
      })

      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.updateStatus = 'loading';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        state.currentUser = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload;
      })

      // uploadProfileImage
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
      })

      // completeProfile
      .addCase(completeProfile.pending, (state) => {
        state.completeStatus = 'loading';
        state.error = null;
      })
      .addCase(completeProfile.fulfilled, (state, action) => {
        state.completeStatus = 'succeeded';
        state.currentUser = action.payload;
      })
      .addCase(completeProfile.rejected, (state, action) => {
        state.completeStatus = 'failed';
        state.error = action.payload;
      });
  },
});
export const { resetProfileState } = userProfileSlice.actions; 

export default userProfileSlice.reducer;