import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch user profile
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
     

      const response = await axios.get('http://localhost:4000/api/users/profile', {
        headers: {
        
        },
        withCredentials: true, 
      });
      return response.data;
    } catch (err) {
      // Return error message for rejected action
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Initial state for profile
const initialState = {
  data: {},
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const userProfileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Placeholder for other sync reducers, e.g., update local fields
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectProfile = (state) => state.userprofile.data;
export const selectProfileStatus = (state) => state.userprofile.status;
export const selectProfileError = (state) => state.userprofile.error;

export default userProfileSlice.reducer;
