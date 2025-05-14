import React, { useState } from 'react';
import axios from 'axios';
import { InputField } from '../../shared/common';
import { PasswordInput } from '../../shared/Passinput';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../shared/Button';
import { ChevronDown } from 'lucide-react';
import { baseurl } from '../../Utlis/utlis';
export const Register = () => {
  const [emailPhone, setEmailPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    if (!gender) {
      setError('Please select your gender');
      return;
    }
    setError('');
    setLoading(true);
    setMessage('');

    const payload = {
      email: emailPhone.includes('@') ? emailPhone : '',
      phoneNumber: !emailPhone.includes('@') ? emailPhone : '',
      gender,
      password,
    };

    try {
      const { data } = await axios.post(`${baseurl}/register`, payload);
      navigate('/verify', { state: { email: emailPhone } });
      setMessage(`User registered successfully. An OTP has been sent to ${emailPhone}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Find Your Match
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            value={emailPhone}
            onChange={(e) => setEmailPhone(e.target.value)}
            placeholder="Email or phone number"
          />

<div>
  <label htmlFor="gender" className="block text-gray-700 text-sm font-semibold mb-2">
    Gender
  </label>
  <div className="relative">
    <select
      id="gender"
      value={gender}
      onChange={(e) => setGender(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all appearance-none pr-10 bg-white hover:border-gray-400"
    >
      <option value="">— select —</option>
  <option value="MALE">Male</option>
  <option value="FEMALE">Female</option>
  <option value="TO_FEMALE">Trans Female</option>
  <option value="TO_MALE">Trans Male</option>
  <option value="OTHERS">Other</option>
    </select>
    <ChevronDown 
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      size={20}
    />
  </div>
</div>

          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create password"
          />

          <div className="text-xs text-gray-500">
            Contains at least 1 number, 1 lowercase letter, 1 special character, and 1 uppercase letter.
          </div>

          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Get Started'}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className="flex-1 border-t border-border-clr"></div>
          <span className="px-4 text-sm text-gray-500">Or continue with</span>
          <div className="flex-1 border-t border-border-clr"></div>
        </div>

        {/* onClick={handleGoogleLogin} /> */}

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-pink-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
