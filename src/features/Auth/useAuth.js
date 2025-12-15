// src/features/auth/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import {
  apiVerifyOtp,
  apiResendOtp,
  apiForgotPassword,
  apiConfirmForgotPassword,
  apiLogin,
  apiRegister
} from './authApi';

export const useVerifyOtp = () =>
  useMutation({
    mutationFn: apiVerifyOtp,
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
  });

export const useForgotPassword = () =>
  useMutation({
    mutationFn: apiForgotPassword,
  });

export const useConfirmForgotPassword = () =>
  useMutation({
    mutationFn: apiConfirmForgotPassword,
  });
