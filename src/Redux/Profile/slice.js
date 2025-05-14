/* ========== features/profiles/profilesSlice.js ========== */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching profiles
export const fetchProfiles = createAsyncThunk(
  'profiles/fetchProfiles',
  async ({ preferences, accessToken, userType, idToken }, thunkAPI) => {
    try {
      const response = await axios.get(
        'http://localhost:4000/api/users/matchproviders/all',
        {
          params: { limit: 10, preferences: JSON.stringify(preferences) },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-user-type': userType,
            'x-id-token': idToken,
          },
        }
      );
      return response.data.items || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || 'Unable to fetch profiles.'
      );
    }
  }
);






const profilesSlice = createSlice({
  name: 'profiles',
  initialState: {
    list: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfiles.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.map((raw) => {
          const birth = new Date(raw.dob);
          const age = Math.floor(
            (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
          );
          const std = raw.healthStatus?.stdStatus ?? 'Unknown';
          const lastDate = raw.healthStatus?.lastTestedDate
            ? new Date(raw.healthStatus.lastTestedDate).toLocaleDateString()
            : 'Unknown';
          return {
            name: raw.name,
            age,
            images: raw.photos || [],
            about: raw.bio,
            gender: raw.gender === 'M' ? 'Male' : raw.gender === 'F' ? 'Female' : raw.gender,
            top: raw.popularity || 0,
            compatibility: raw.popularity || 0,
            distance: raw.distance || 'N/A',
            location: raw.location,
            
            job: raw.jobTitle || '',
            languages: raw.languagesKnown?.length ? raw.languagesKnown : [raw.language],
            interests: raw.interest || [],
            stdStatus: std,
            lastTestedDate: lastDate,
            healthStatus: { status: std, lastTestedDate: lastDate },
            userId: raw.userId,
          };
        });
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});





export default profilesSlice.reducer;
