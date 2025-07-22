// src/features/auth/authAPI.js
import client from '../../Utlis/client';

export const apiRegister = async ({ emailPhone, password, gender, userType }) => {
  const payload = {
    email: emailPhone.includes('@') ? emailPhone : '',
    phoneNumber: !emailPhone.includes('@') ? emailPhone : '',
    gender,
    password,
    userType,
  };
  return client.post('/register', payload);
};

export const apiVerifyOtp = async ({ email, code }) =>
  client.post('/confirm', { email, ConfirmationCode: code });

export const apiResendOtp = async ({ email }) =>
  client.post('/resend-otp', { email });

// ─── NEW: apiLogin ─────────────────────────────────────────────────────────
export const apiLogin = async ({ emailPhone, password }) => {
  // We’ll determine whether it’s email vs phone and send the correct payload:
  const isEmail = emailPhone.includes('@');
  const payload = isEmail
    ? { email: emailPhone, password }
    : { phoneNumber: emailPhone, password };

  // Note: client is pre‐configured with baseurl. If you need withCredentials, add it here or in Thunk.
  return client.post('/login', payload, {
    withCredentials: true,
    
    headers: { 'Content-Type': 'application/json' },
  });
};


// services/auth.js
export const signOut = async (action = 'signout') => {
  const res = await fetch('https://authapi.terminal143.com/signout', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to sign out');
  }

  return res.json();
};

