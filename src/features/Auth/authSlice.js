import { createSlice } from '@reduxjs/toolkit';
import { registerUser, verifyOtp, resendOtp } from './authThunks';

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== REGISTER ==========
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

      // ========== VERIFY OTP ==========
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

      // ========== RESEND OTP ==========
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
      });
  },
});

export const { resetAuthState } = authSlice.actions;

export default authSlice.reducer;
