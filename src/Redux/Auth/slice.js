
// ==== src/redux/slices/authSlice.js ====
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authClient from './client';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await authClient.post('/users/login', credentials);
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
      .addCase(login.fulfilled, (state, { payload }) => {
        state.status = 'succeeded';
        state.accessToken = payload.accessToken;
        state.userType = payload.userType;
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error = payload;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
