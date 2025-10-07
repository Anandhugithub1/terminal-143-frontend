/* ================= features/profiles/thunk.js ================= */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getMatchProviders } from './profilesapi';

export const fetchProfiles = createAsyncThunk(
  'profiles/fetchProfiles',
  async ({ limit = 10, append = false } = {}, thunkAPI) => {
    try {
      // ✅ Call your existing API helper
      const profiles = await getMatchProviders({ limit });

      // Return both profiles + append flag
      return { profiles, append };
    } catch (err) {
      const status = err.response?.status;

      if (status === 401 || status === 403) {
        window.location.href = '/login';
        return thunkAPI.rejectWithValue('Unauthorized');
      }

      const message =
        typeof err.response?.data === 'string'
          ? err.response.data
          : err.response?.data?.message || err.message || 'Something went wrong';

      return thunkAPI.rejectWithValue(message);
    }
  }
);
