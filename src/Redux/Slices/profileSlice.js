
// ==== src/redux/slices/profileSlice.js ====
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../apiClient';

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/users/profile');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);



const profileSlice = createSlice({
    name: 'profile',
    initialState: { data: null, status: 'idle', error: null },
    reducers: {},
    extraReducers: builder => {
      builder
        .addCase(fetchProfile.pending, state => { state.status = 'loading'; })
        .addCase(fetchProfile.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.data = action.payload;
        })
        .addCase(fetchProfile.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        });
    }
  });
  
  export default profileSlice.reducer;