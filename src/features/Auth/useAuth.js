// src/features/auth/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import {
  apiVerifyOtp,
  apiResendOtp,
  apiForgotPassword,
  apiConfirmForgotPassword,
  apiLogin,
  apiRegister,
  signOut
} from './authApi';

export const useVerifyOtp = () =>
  useMutation({
    mutationFn: apiVerifyOtp,
    // OtpVerification.jsx already renders its own inline error for this
    // mutation — see useResendOtp below for why silent is needed.
    meta: { silent: true },
  });

  /* =========================
   LOGIN
========================= */
export const useLogin = () =>
  useMutation({
    mutationFn: apiLogin,
  });

/* =========================
   REGISTER
========================= */
export const useRegister = () =>
  useMutation({
    mutationFn: apiRegister,
  });

export const useResendOtp = () =>
  useMutation({
    mutationFn: apiResendOtp,
    // OtpVerification.jsx already renders its own inline error for this
    // mutation — without this, the global MutationCache handler in
    // shared/lib/client.js ALSO toasts the same message, showing the same
    // error twice on screen.
    meta: { silent: true },
  });


export const useSignOut = () =>
  useMutation({
    mutationFn: (action = 'signout') => signOut(action),
  });

  // ─── FORGOT PASSWORD ─────────────────────────
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: ({ email }) =>
      apiForgotPassword({ email }),
  });
};

// ─── CONFIRM FORGOT PASSWORD ─────────────────
export const useConfirmForgotPassword = () => {
  return useMutation({
    mutationFn: ({ email, code, newPassword }) =>
      apiConfirmForgotPassword({
        email,
        code,
        newPassword,
      }),
  });
};