'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SOSPage() {
  const router = useRouter();
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/login');
  }, [router]);

  const handleSOS = async () => {
    if (status === 'sending' || status === 'sent') return;
    setStatus('sending');
    setMessage('Sending SOS...');

    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) clearInterval(interval);
    }, 1000);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/sos`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus('sent');
      setMessage('✅ SOS sent successfully! Your trusted contacts have been notified via SMS.');
      setCountdown(null);
    } catch {
      setStatus('error');
      setMessage('❌ Failed to send SOS. Please try again.');
      setCountdown(null);
    }
  };

  const bgColor = {
    idle: 'bg-gradient-to-br from-pink-50 via-white to-orange-50',
    sending: 'bg-gradient-to-br from-indigo-50 via-white to-blue-50',
    sent: 'bg-gradient-to-br from-green-50 via-white to-teal-50',
    error: 'bg-gradient-to-br from-red-50 via-white to-orange-50',
  }[status];

  const btnColor = {
    idle: 'bg-pink-500 hover:bg-pink-600 shadow-pink-200',
    sending: 'bg-indigo-500 shadow-indigo-200 cursor-wait',
    sent: 'bg-green-500 shadow-green-200',
    error: 'bg-red-500 hover:bg-red-600 shadow-red-200',
  }[status];

  return (
    <main className={`min-h-screen ${bgColor} flex flex-col font-sans transition-colors duration-500`}>
      <nav className="px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl font-black text-pink-500">SafeHer</Link>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-pink-500">← Dashboard</Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="font-serif text-3xl font-black text-indigo-900 mb-2">Emergency SOS</h1>
        <p className="text-gray-400 text-sm mb-12 max-w-xs">
          Press the button below to instantly send an SMS alert to all your trusted contacts.
        </p>

        {/* SOS Button */}
        <button
          onClick={handleSOS}
          disabled={status === 'sending'}
          className={`w-48 h-48 rounded-full ${btnColor} text-white font-black text-4xl shadow-2xl transition-all duration-300 transform active:scale-95 relative`}
        >
          {countdown !== null && countdown > 0 ? (
            <span className="text-6xl">{countdown}</span>
          ) : status === 'sent' ? '✓' : status === 'sending' ? '📨' : 'SOS'}

          {status === 'sending' && (
            <>
              <span className="absolute inset-0 rounded-full border-4 border-current opacity-30 animate-ping"></span>
              <span className="absolute -inset-4 rounded-full border-2 border-current opacity-20 animate-ping" style={{ animationDelay: '0.3s' }}></span>
            </>
          )}
        </button>

        {/* Status Message */}
        <div className="mt-10 max-w-sm">
          {message && (
            <p className={`text-sm font-medium px-6 py-3 rounded-2xl ${
              status === 'sent' ? 'bg-green-100 text-green-700' :
              status === 'error' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>{message}</p>
          )}
        </div>

        {status === 'error' && (
          <button onClick={() => { setStatus('idle'); setMessage(''); }} className="mt-6 text-sm text-pink-500 underline">
            Try Again
          </button>
        )}

        {status === 'sent' && (
          <Link href="/dashboard" className="mt-6 bg-indigo-900 text-white text-sm px-6 py-3 rounded-full hover:bg-indigo-800 transition-colors">
            Back to Dashboard
          </Link>
        )}
      </div>

      <div className="px-6 pb-6 text-center">
        <p className="text-xs text-gray-300">⚠️ Use only in real emergency situations</p>
      </div>
    </main>
  );
}