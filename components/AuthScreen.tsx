import React, { useState } from 'react';
import { OtpModal } from './OtpModal';
import { LogoIcon } from './icons';
import * as dbService from '../services/dbService';

interface AuthScreenProps {
  onLoginSuccess: (email: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (email && password) {
      if (dbService.loginUser(email, password)) {
        onLoginSuccess(email);
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } else {
      setError('Please enter your email and password.');
    }
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (email && password) {
      if (dbService.registerUser(email, password)) {
        setShowOtpModal(true);
      } else {
        setError('An account with this email already exists.');
      }
    } else {
      setError('Please fill in all fields.');
    }
  };

  const handleOtpVerify = () => {
    setShowOtpModal(false);
    setSuccessMessage('Verification successful! You can now log in.');
    setIsLoginView(true);
    // Clear password fields for security
    setPassword('');
    setConfirmPassword('');
  };
  
  const formToShow = isLoginView ? (
    <form onSubmit={handleLogin} className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-base-content">Welcome Back</h2>
      {successMessage && <p className="text-green-400 text-center bg-green-900/50 p-3 rounded-lg">{successMessage}</p>}
      <div>
        <label className="block text-sm font-medium text-base-content-secondary">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 p-3 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all" />
      </div>
      <div>
        <label className="block text-sm font-medium text-base-content-secondary">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full mt-1 p-3 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all" />
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <button type="submit" className="w-full bg-brand-primary text-white p-3 rounded-lg font-semibold hover:bg-brand-primary/80 transition-colors">Log In</button>
      <p className="text-center text-sm">
        Don't have an account?{' '}
        <button type="button" onClick={() => { setIsLoginView(false); setError(''); setSuccessMessage(''); }} className="font-semibold text-brand-secondary hover:underline">Register</button>
      </p>
    </form>
  ) : (
    <form onSubmit={handleRegister} className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-base-content">Create Account</h2>
      <div>
        <label className="block text-sm font-medium text-base-content-secondary">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 p-3 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all" />
      </div>
      <div>
        <label className="block text-sm font-medium text-base-content-secondary">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full mt-1 p-3 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all" />
      </div>
      <div>
        <label className="block text-sm font-medium text-base-content-secondary">Confirm Password</label>
        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full mt-1 p-3 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all" />
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <button type="submit" className="w-full bg-brand-secondary text-white p-3 rounded-lg font-semibold hover:bg-brand-secondary/80 transition-colors">Register</button>
      <p className="text-center text-sm">
        Already have an account?{' '}
        <button type="button" onClick={() => { setIsLoginView(true); setError(''); }} className="font-semibold text-brand-secondary hover:underline">Log In</button>
      </p>
    </form>
  );

  return (
    <div className="min-h-screen w-screen bg-base-100 flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-center text-base-content flex items-center gap-3 justify-center">
            <LogoIcon className="w-10 h-10"/>
            NOTESYNTH
        </h1>
        <p className="text-base-content-secondary mt-2">Your AI-powered research space.</p>
      </div>
      <div className="w-full max-w-md bg-base-200 p-8 rounded-xl shadow-2xl border border-base-300/50">
        {formToShow}
      </div>
      {showOtpModal && <OtpModal onVerify={handleOtpVerify} onClose={() => setShowOtpModal(false)} email={email} />}
    </div>
  );
};