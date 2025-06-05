/* ================= features/profiles/slice.js ================= */
import { createSlice } from '@reduxjs/toolkit';
import { fetchProfiles } from './thunk';
import { formatLastSeen } from './utlis';

const initialState = {
  list: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    resetStatus(state) {
      state.status = 'idle';
      state.error = null;
    },
  },
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
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetStatus } = profilesSlice.actions;
export default profilesSlice.reducer;