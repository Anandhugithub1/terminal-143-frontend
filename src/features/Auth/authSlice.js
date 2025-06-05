// src/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { registerUser, verifyOtp, resendOtp, loginUser } from './authThunks';

const initialState = {
  // Tracks the login status and any returned user data:
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',

  accessToken: null,
  idToken: null,
  userType: null,
  username: null,
  preferences: [],
  profileCompleted:false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // If you ever want to manually reset auth state (e.g. on logout), you can use this:
    resetAuthState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.accessToken = null;
      state.idToken = null;
      state.userType = null;
      state.username = null;
      state.preferences = [];
    },
  },
  extraReducers: (builder) => {
    // ─── REGISTER ───────────────────────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload?.message || 'Registration successful';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.error || 'Registration failed';
      })

      // ─── VERIFY OTP ───────────────────────────────────────────────────────
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message =
          typeof action.payload === 'string'
            ? action.payload
            : action.payload?.message || 'OTP verified successfully';
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.error || 'OTP verification failed';
      })

      // ─── RESEND OTP ───────────────────────────────────────────────────────
      .addCase(resendOtp.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message =
          typeof action.payload === 'string'
            ? action.payload
            : action.payload?.message || 'OTP resent successfully';
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.error || 'Resend OTP failed';
      })

      // ─── LOGIN ────────────────────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.accessToken = action.payload.accessToken;
        state.idToken = action.payload.idToken;
        state.userType = action.payload.userType;
        state.username = action.payload.username;
        state.preferences = action.payload.preferences || [];
        state.profileCompleted =action.payload.profileCompleted;
        state.message = 'Login successful';
        localStorage.setItem('userType', action.payload.userType);

      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        // The server might send { error: 'Invalid credentials' } or { message: '...' }
        state.message = action.payload?.error || action.payload?.message || 'Login failed';
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;
