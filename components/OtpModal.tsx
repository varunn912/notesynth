import React, { useState } from 'react';

interface OtpModalProps {
  onVerify: (otp: string) => void;
  onClose: () => void;
  email: string;
}

export const OtpModal: React.FC<OtpModalProps> = ({ onVerify, onClose, email }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  
  const DEMO_OTP = '123456';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === DEMO_OTP) {
      onVerify(otp);
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-base-100 bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-base-200 rounded-lg p-8 shadow-2xl w-full max-w-md border border-base-300">
        <h2 className="text-2xl font-bold text-center text-base-content mb-2">Verify Your Account</h2>
        <p className="text-center text-base-content-secondary mb-4">
          A verification code has been sent to <span className="font-bold text-brand-primary">{email}</span>.
        </p>
        <div className="my-4 p-3 bg-yellow-900/50 text-yellow-300 border border-yellow-700 rounded-lg text-center">
            <p className="font-semibold">This is a demo application.</p>
            <p>Your verification code is: <strong className="text-white">{DEMO_OTP}</strong></p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="otp" className="block text-sm font-medium text-base-content-secondary mb-1">
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => {
                  setOtp(e.target.value);
                  setError('');
              }}
              className="w-full p-3 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none"
              maxLength={6}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <button type="submit" className="w-full bg-brand-primary text-white p-3 rounded-lg font-semibold hover:bg-brand-primary/80 transition-colors">
            Verify & Register
          </button>
        </form>
        <button onClick={onClose} className="w-full text-center mt-4 text-sm text-base-content-secondary hover:text-base-content">
          Cancel
        </button>
      </div>
    </div>
  );
};