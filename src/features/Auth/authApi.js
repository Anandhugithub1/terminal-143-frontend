// src/features/auth/authAPI.js
import client from '../../Utlis/client';
import axios from 'axios';
import {
  isNativeClient,
  setTokens,
  setSessionMeta,
  clearSession,
  getTokens,
  markSessionActive,
} from '../../shared/auth/tokenStore';
import { getErrorMessage } from '../../shared/api/getErrorMessage';
// REGISTER
export const apiRegister = async ({ emailPhone, password, gender, agreedToTerms, agreedToMatchingData }) => {
  const payload = {
    email: emailPhone.includes('@') ? emailPhone : '',
    phoneNumber: !emailPhone.includes('@') ? emailPhone : '',
    gender,
    password,
    agreedToTerms,
    agreedToMatchingData,
  };
  const { data } = await client.post('/v0.2/register', payload);
  return data;
};

// LOGIN
export const apiLogin = async ({ emailPhone, password }) => {
  const payload = emailPhone.includes('@')
    ? { email: emailPhone, password }
    : { phoneNumber: emailPhone, password };

  const { data } = await client.post('/v0.2/login', payload, {
    withCredentials: true,
    headers: isNativeClient() ? { 'X-Client-Type': 'capacitor' } : undefined,
  });

  if (isNativeClient() && data.tokens) {
    setTokens(data.tokens);
    setSessionMeta({ username: data.username, preferences: data.preferences });
  }

  // Web has no equivalent of native's stored tokens (its session lives in the
  // httpOnly cookie this response just set) — mark it unconditionally here,
  // on both platforms, so the 401 interceptor can tell "a session that
  // existed just died" apart from "this browser never logged in."
  markSessionActive();

  return data;
};

// OTP VERIFY
export const apiVerifyOtp = async ({ email, code }) => {
  const { data } = await client.post('/v0.2/confirm', {
    email,
    ConfirmationCode: code,
  });
  return data;
};

// RESEND OTP
export const apiResendOtp = async ({ email }) => {
  const { data } = await client.post('/v0.2/resend-otp', { email });
  return data;
};

// FORGOT PASSWORD
export const apiForgotPassword = async ({ email }) => {
  const { data } = await client.post('/v0.2/forgot-password', { email });
  return data;
};

export const signOut = async (action = 'signout') => {
  try {
    const headers = { 'Content-Type': 'application/json' };

    if (isNativeClient()) {
      const { accessToken, idToken, refreshToken } = getTokens();
      headers['X-Client-Type'] = 'capacitor';
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      if (idToken) headers['X-Id-Token'] = idToken;
      if (refreshToken) headers['X-Refresh-Token'] = refreshToken;
    }

    const response = await axios.post(
      'https://api.passormatch.com/auth/v0.2/signout',
      { action },
      {
        withCredentials: true,
        headers,
      }
    );
    clearSession();
    return response.data;
  } catch (err) {
    clearSession();
    throw new Error(getErrorMessage(err, 'server'));
  }
};

// CONFIRM FORGOT PASSWORD
export const apiConfirmForgotPassword = async ({
  email,
  code,
  newPassword,
}) => {
  const { data } = await client.post('/v0.2/confirm-forgot-password', {
    email,
    ConfirmationCode: code,
    Password: newPassword,
  });
  return data;
};