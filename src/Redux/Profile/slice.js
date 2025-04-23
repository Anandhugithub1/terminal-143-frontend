// ==== src/redux/slices/profileSlice.js ====
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import profileClient from '../clients/profileClient';

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await profileClient.get('/user/profile');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: { data: null, status: 'idle', error: null },
  extraReducers: builder => {
    builder
      .addCase(fetchProfile.pending, state => { state.status = 'loading'; })
      .addCase(fetchProfile.fulfilled, (state, { payload }) => {
        state.status = 'succeeded';
        state.data = payload;
      })
      .addCase(fetchProfile.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload;
      });
  }
});

export default profileSlice.reducer;