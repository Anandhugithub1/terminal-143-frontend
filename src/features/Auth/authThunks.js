// src/features/auth/authThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiRegister, apiVerifyOtp, apiResendOtp, apiLogin } from './authApi';

// ─── REGISTER ───────────────────────────────────────────────────────────────
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (args, { rejectWithValue }) => {
    try {
      const { data } = await apiRegister(args);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Registration failed' });
    }
  }
);

// ─── VERIFY OTP ───────────────────────────────────────────────────────────────
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (args, { rejectWithValue }) => {
    try {
      const { data } = await apiVerifyOtp(args);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'OTP verification failed' });
    }
  }
);

// ─── RESEND OTP ───────────────────────────────────────────────────────────────
export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (args, { rejectWithValue }) => {
    try {
      const { data } = await apiResendOtp(args);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Resend OTP failed' });
    }
  }
);

// ─── NEW: LOGIN ───────────────────────────────────────────────────────────────
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  /**
   * args: { emailPhone: string, password: string }
   */
  async ({ emailPhone, password }, { rejectWithValue }) => {
    try {
      const { data } = await apiLogin({ emailPhone, password });
      // data should include: accessToken, idToken, userType, preferences, username, etc.
      return data;
    } catch (err) {
      // If server returned something like { error: 'Invalid credentials' }
      return rejectWithValue(err.response?.data || { error: 'Login failed' });
    }
  }
);
