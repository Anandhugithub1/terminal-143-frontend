/*
  Redux Toolkit slice for user registration/authentication
*/
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseurl } from '../../Utlis/utlis';

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ emailPhone, password, gender }, { rejectWithValue }) => {
    try {
      const payload = {
        email: emailPhone.includes('@') ? emailPhone : '',
        phoneNumber: !emailPhone.includes('@') ? emailPhone : '',
        gender,
        password,
      };
      const response = await axios.post(`${baseurl}/register`, payload);
      // Optionally store token or other data
      return response.data;
    } catch (err) {
      // Return error payload
      return rejectWithValue(err.response?.data || { error: 'Registration failed' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
  },
  reducers: {
    resetAuthState(state) {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message || 'Registered successfully';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.error || 'Registration failed';
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;