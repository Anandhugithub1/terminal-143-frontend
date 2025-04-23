// ==== src/redux/slices/authSlice.js ====
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../apiClient';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/users/login', credentials);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: { accessToken: null, userType: null, status: 'idle', error: null },
  reducers: {
    logout(state) {
      state.accessToken = null;
      state.userType = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => { state.status = 'loading'; })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.accessToken;
        state.userType = action.payload.userType;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});
export const { logout } = authSlice.actions;
export default authSlice.reducer;
