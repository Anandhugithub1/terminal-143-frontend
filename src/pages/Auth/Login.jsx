import React, { useState } from 'react';
import { InputField } from '../../shared/common';
import { PasswordInput } from '../../shared/Passinput';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './State';
import { Button, GoogleButton } from '../../shared/Button'; // import the common button

export const Login = () => {
  const [emailPhone, setEmailPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailPhone || !password) {
      setError('Please enter email/phone and password');
      return;
    }

    setError('');
    const isEmail = emailPhone.includes('@');
    const payload = isEmail
      ? { email: emailPhone, password }
      : { phoneNumber: emailPhone, password };

    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Login failed');
      } else {
        login(result.accessToken);
        console.log('Login successful', result);
        navigate('/choose-category');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('Login failed, please try again');
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    // Implement your Google login logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-gradient-primary to-gradient-secondary p-3 rounded-full">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            value={emailPhone}
            onChange={(e) => setEmailPhone(e.target.value)}
            placeholder="Email or phone number"
          />
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <div className="text-right">
            <Link to='/forgot-password' className="text-text-pr font-semibold text-sm hover:underline">
              Forgot password?
            </Link>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button
            type="submit"
          >
            Log In
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className="flex-1 border-t border-border-clr"></div>
          <span className="px-4 text-sm text-gray-500">Or continue with</span>
          <div className="flex-1 border-t border-border-clr"></div>
        </div>


<GoogleButton onClick={handleGoogleLogin} >
</GoogleButton>



        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-text-pr font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};
