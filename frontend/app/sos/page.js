'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SOSPage() {
  const [status,    setStatus]    = useState('idle');
  const [message,   setMessage]   = useState('');
  const [countdown, setCountdown] = useState(null);
  const [isDemo,    setIsDemo]    = useState(false);
  const [demoEmail, setDemoEmail] = useState('');
  const [demoPhone, setDemoPhone] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) setIsDemo(true);
  }, []);

  // ── Real SOS (logged-in users) ───────────────────
  const handleRealSOS = async () => {
    if (status === 'sending' || status === 'sent') return;
    setStatus('sending');
    setMessage('Getting your location...');

    let lat, lng, addr;
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
      );
      lat  = pos.coords.latitude;
      lng  = pos.coords.longitude;
      addr = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    } catch {
      addr = 'Location not available';
    }

    setMessage('Sending SOS alert...');
    startCountdown();

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/sos`,
        { latitude: lat, longitude: lng, address: addr },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus('sent');
      setMessage(`✅ SOS sent! ${res.data.emailSent} contact${res.data.emailSent !== 1 ? 's' : ''} notified.`);
    } catch {
      setStatus('error');
      setMessage('❌ Failed to send. Please call 999 directly.');
    }
  };

  // ── Demo SOS (not logged in) ─────────────────────
  const handleDemoSOS = async () => {
    if (!demoEmail) {
      setMessage('Please enter your email first.');
      return;
    }
    setStatus('sending');
    setMessage('Getting your location...');

    let lat, lng;
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000 })
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch {
      // use backend default location
    }

    setMessage('Sending demo SOS email...');
    startCountdown();

    try {
      const res = await axios.post(`${API_URL}/api/sos/demo`, {
        email:     demoEmail,
        phone:     demoPhone || '',
        latitude:  lat,
        longitude: lng,
      });
      setStatus('sent');
      setMessage(`✅ ${res.data.message || `Demo SOS sent to ${demoEmail}! Check your inbox.`}`);
    } catch {
      setStatus('error');
      setMessage('❌ Failed to send demo. Try again.');
    }
  };

  const startCountdown = () => {
    let c = 3;
    setCountdown(c);
    const iv = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) clearInterval(iv);
    }, 1000);
  };

  const reset = () => {
    setStatus('idle');
    setMessage('');
    setCountdown(null);
  };

  const bgColor = {
    idle:    'bg-gradient-to-br from-pink-50 via-white to-orange-50',
    sending: 'bg-gradient-to-br from-indigo-50 via-white to-blue-50',
    sent:    'bg-gradient-to-br from-green-50 via-white to-teal-50',
    error:   'bg-gradient-to-br from-red-50 via-white to-orange-50',
  }[status];

  const btnColor = {
    idle:    'bg-pink-500 hover:bg-pink-600 shadow-pink-200',
    sending: 'bg-indigo-500 shadow-indigo-200 cursor-wait',
    sent:    'bg-green-500 shadow-green-200',
    error:   'bg-red-500 hover:bg-red-600 shadow-red-200',
  }[status];

  return (
    <main className={`min-h-screen ${bgColor} flex flex-col font-sans transition-colors duration-500`}>

      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl font-black text-pink-500">SafeHer</Link>
        <Link
          href={isDemo ? '/login' : '/dashboard'}
          className="text-sm text-gray-400 hover:text-pink-500 transition-colors"
        >
          {isDemo ? 'Login →' : '← Dashboard'}
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">

        <h1 className="font-serif text-3xl font-black text-indigo-900 mb-2">
          {isDemo ? 'SOS Demo' : 'Emergency SOS'}
        </h1>

        {/* Demo mode banner */}
        {isDemo && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6 max-w-sm">
            <p className="text-sm text-amber-700 font-medium">Demo Mode</p>
            <p className="text-xs text-amber-600 mt-1">
              You are not logged in. Enter your email below to receive a demo SOS alert.
            </p>
          </div>
        )}

        {!isDemo && (
          <p className="text-gray-400 text-sm mb-10 max-w-xs">
            Press the button to instantly send an alert to your trusted contacts.
          </p>
        )}

        {/* Demo email/phone inputs */}
        {isDemo && status === 'idle' && (
          <div className="w-full max-w-sm mb-8 space-y-3">
            <input
              type="email"
              value={demoEmail}
              onChange={e => setDemoEmail(e.target.value)}
              placeholder="Your email (SOS demo will be sent here)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-sm text-center"
            />
            <input
              type="tel"
              value={demoPhone}
              onChange={e => setDemoPhone(e.target.value)}
              placeholder="Your phone number (optional)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-sm text-center"
            />
          </div>
        )}

        {/* SOS Button */}
        <button
          onClick={isDemo ? handleDemoSOS : handleRealSOS}
          disabled={status === 'sending' || status === 'sent'}
          className={`w-48 h-48 rounded-full ${btnColor} text-white font-black shadow-2xl transition-all duration-300 transform active:scale-95 relative focus:outline-none focus:ring-4 focus:ring-pink-300`}
        >
          {status === 'sending' && (
            <>
              <span className="absolute inset-0 rounded-full border-4 border-white opacity-30 animate-ping" />
              <span className="absolute -inset-4 rounded-full border-2 border-white opacity-20 animate-ping" style={{ animationDelay: '0.3s' }} />
            </>
          )}

          <span className="flex flex-col items-center gap-1 relative z-10">
            {countdown !== null && countdown > 0 ? (
              <span className="text-6xl font-black">{countdown}</span>
            ) : status === 'sent' ? (
              <>
                <svg className="w-12 h-12" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Sent!</span>
              </>
            ) : status === 'sending' ? (
              <>
                <svg className="animate-spin w-10 h-10" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-sm">Sending</span>
              </>
            ) : (
              <>
                <span className="text-5xl font-black leading-none">SOS</span>
                <span className="text-xs opacity-90">
                  {isDemo ? 'Send Demo' : 'Tap to alert'}
                </span>
              </>
            )}
          </span>
        </button>

        {/* Status message */}
        {message && (
          <div className={`mt-8 max-w-sm px-6 py-3 rounded-2xl text-sm font-medium ${
            status === 'sent'  ? 'bg-green-100 text-green-700' :
            status === 'error' ? 'bg-red-100 text-red-700'     :
            'bg-gray-100 text-gray-600'
          }`}>
            {message}
          </div>
        )}

        {status === 'error' && (
          <button onClick={reset} className="mt-4 text-sm text-pink-500 underline">
            Try Again
          </button>
        )}

        {status === 'sent' && (
          <div className="mt-6 flex flex-col items-center gap-3">
            {isDemo ? (
              <>
                <button onClick={reset} className="text-sm text-pink-500 underline">Try Again</button>
                <Link
                  href="/register"
                  className="bg-indigo-900 text-white text-sm px-6 py-3 rounded-full hover:bg-indigo-800 transition-colors"
                >
                  Create Account →
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="bg-indigo-900 text-white text-sm px-6 py-3 rounded-full hover:bg-indigo-800 transition-colors"
              >
                Back to Dashboard
              </Link>
            )}
          </div>
        )}

        {isDemo && status === 'idle' && (
          <p className="mt-8 text-xs text-gray-400 max-w-xs">
            Want real SOS alerts?{' '}
            <Link href="/register" className="text-pink-500 hover:underline font-medium">
              Create a free account
            </Link>
          </p>
        )}
      </div>

      <div className="px-6 pb-6 text-center">
        <p className="text-xs text-gray-300">⚠️ Real SOS: Use only in genuine emergency situations</p>
        <a href="tel:999" className="text-xs text-red-400 font-medium mt-1 block">Emergency: Call 999</a>
      </div>
    </main>
  );
}