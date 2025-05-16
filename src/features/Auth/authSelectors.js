// authSelectors.js
// ----------------------
export const selectAuth = (state) => state.auth;
export const selectLoading = (state) => state.auth.isLoading;
export const selectSuccess = (state) => state.auth.isSuccess;
export const selectError = (state) => state.auth.isError;
export const selectMessage = (state) => state.auth.message;