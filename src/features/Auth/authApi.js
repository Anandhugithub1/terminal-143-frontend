// src/features/auth/authAPI.js
import client from '../../Utlis/client';
import axios from 'axios';
// REGISTER
export const apiRegister = async ({ emailPhone, password, gender, agreedToTerms }) => {
  const payload = {
    email: emailPhone.includes('@') ? emailPhone : '',
    phoneNumber: !emailPhone.includes('@') ? emailPhone : '',
    gender,
    password,
    agreedToTerms,
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
  });
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
    const response = await axios.post(
      'https://api.passormatch.com/auth/v0.2/signout',
      { action },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      'Failed to sign out';
    throw new Error(message);
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