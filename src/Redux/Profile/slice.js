/* ========== features/profiles/profilesSlice.js ========== */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching profiles
export const fetchProfiles = createAsyncThunk(
  'profiles/fetchProfiles',
  async ({ preferences,  userType, }, thunkAPI) => {
    try {
      const response = await axios.get(
        'http://localhost:4000/api/users/matchproviders/all',
        {
          params: {
            limit: 10,
            preferences: JSON.stringify(preferences),
          },
          headers: {
            'x-user-type':userType ,
          },
          withCredentials: true,     // ✅ include cookies
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




// Helper to format “last seen” into relative text
function formatLastSeen(isoString) {
  if (!isoString) return 'Unknown';
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;

  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (diffMs < minute) {
    return 'Active just now';
  } else if (diffMs < hour) {
    const mins = Math.floor(diffMs / minute);
    return `Active ${mins} minute${mins > 1 ? 's' : ''} ago`;
  } else if (diffMs < day) {
    const hrs = Math.floor(diffMs / hour);
    return `Active ${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  } else {
    // For anything >24h ago, show full locale date
    return new Date(isoString).toLocaleDateString();
  }
}

const profilesSlice = createSlice({
  name: 'profiles',
  initialState: {
    list: [],
    status: 'idle',    // 'idle' | 'loading' | 'succeeded' | 'failed'
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
          // age calculation
          const birth = new Date(raw.dob);
          const age = Math.floor(
            (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
          );

          // std status & last tested
          const std = raw.healthStatus?.stdStatus ?? 'Unknown';
          const lastDate = raw.healthStatus?.lastTestedDate
            ? new Date(raw.healthStatus.lastTestedDate).toLocaleDateString()
            : 'Unknown';

          return {
            name: raw.name,
            age,
            images: raw.photos || [],
            about: raw.bio,
            gender:
              raw.gender === 'M'
                ? 'Male'
                : raw.gender === 'F'
                ? 'Female'
                : raw.gender,
            top: raw.popularity || 0,
            compatibility: raw.popularity || 0,
            distance: raw.distance || 'N/A',
            location: raw.location || 'Unknown',

            // our new, human-readable lastSeen
            lastSeen: formatLastSeen(raw.lastSeen),

            job: raw.jobTitle || '',
            languages: raw.languagesKnown?.length
              ? raw.languagesKnown
              : [raw.language],
            interests: raw.interest || [],
            stdStatus: std,
            lastTestedDate: lastDate,
            healthStatus: { status: std, lastTestedDate: lastDate },
            userId: raw.userId,
          };
        });

        // debug: verify our formatting
        console.log('Mapped profiles with lastSeen:', state.list);
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});




export default profilesSlice.reducer;
