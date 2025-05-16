// authThunks.js
// ----------------------
import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiRegister, apiVerifyOtp, apiResendOtp } from './authApi';

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