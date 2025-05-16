
/*
  Folder: src/features/auth/
*/

// authAPI.js
// ----------------------
import client from '../../Utlis/client';

export const apiRegister = async ({ emailPhone, password, gender }) => {
  const payload = {
    email: emailPhone.includes('@') ? emailPhone : '',
    phoneNumber: !emailPhone.includes('@') ? emailPhone : '',
    gender,
    password,
  };
  return client.post('/register', payload);
};

export const apiVerifyOtp = async ({ email, code }) =>
  client.post('/confirm', { email, ConfirmationCode: code });

export const apiResendOtp = async ({ email }) =>
  client.post('/resend-otp', { email });