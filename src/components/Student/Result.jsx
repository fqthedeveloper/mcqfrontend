import React, { useState, useEffect } from 'react';
import { authPost } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiClock, FiArrowLeft, FiLock, FiCheck } from 'react-icons/fi';
import '../CSS/OTP.css';

export default function OTPPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  // Cooldown timer for resend OTP
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Handle sending OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;

    if (!email) {
      setMessage({ text: 'Please enter your email', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await authPost('/api/send-otp/', { email });
      setMessage({ 
        text: res.message || 'OTP sent to your email', 
        type: 'success' 
      });
      setOtpSent(true);
      setCooldown(60);
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.error || 'Failed to send OTP', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Result Page";
  }, []);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only numbers allowed

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Autofocus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setMessage({ text: 'Please enter a 6-digit OTP', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await authPost('/api/verify-otp/', { email, otp: fullOtp });
      setMessage({ text: res.message || 'Verification successful!', type: 'success' });

      // Redirect to dashboard after success
      setTimeout(() => {
        navigate('/dashboard');  // Change to your dashboard route if different
      }, 1000);

    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Invalid OTP code', type: 'error' });
      setOtp(['', '', '', '', '', '']);
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft size={20} /> Back
        </button>

        {!otpSent ? (
          <>
            <div className="auth-icon">
              <FiMail size={48} className="text-primary" />
            </div>

            <h2>Send OTP to Your Email</h2>
            <p className="auth-subtext">
              Enter your email address to receive a one-time password
            </p>

            <form onSubmit={handleSendOtp} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || cooldown > 0}
                  autoFocus
                />
              </div>

              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                className="auth-button"
                disabled={isLoading || cooldown > 0}
              >
                {isLoading ? (
                  <span>Sending...</span>
                ) : cooldown > 0 ? (
                  <span>
                    <FiClock className="icon-spin" /> Resend in {cooldown}s
                  </span>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="auth-icon">
              <FiLock size={48} className="text-primary" />
            </div>

            <h2>Verify OTP</h2>
            <p className="auth-subtext">
              Enter the 6-digit code sent to your email
              <span className="email-highlight"> {email}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="otp-container">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[index] && index > 0) {
                        const prevInput = document.getElementById(`otp-${index - 1}`);
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    disabled={isLoading}
                    autoFocus={index === 0}
                    className="otp-input"
                  />
                ))}
              </div>

              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <FiCheck size={18} /> Verify Code
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              Didn't receive code?{' '}
              <button
                className="text-link"
                disabled={isLoading || cooldown > 0}
                onClick={handleSendOtp}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
