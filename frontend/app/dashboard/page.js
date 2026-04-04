'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const initialized = useRef(false);

  const fetchContacts = useCallback(async (token) => {
    const res = await axios.get(`${API_URL}/api/contacts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!stored || !token) {
      router.push('/login');
      return;
    }

    Promise.all([
      Promise.resolve(JSON.parse(stored)),
      fetchContacts(token),
    ]).then(([parsedUser, fetchedContacts]) => {
      setUser(parsedUser);
      setContacts(fetchedContacts);
    }).catch(() => {
      router.push('/login');
    });
  }, [router, fetchContacts]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="font-serif text-xl font-black text-pink-500">SafeHer</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Hello, {user?.name || 'User'} 👋</span>
          <button onClick={handleLogout} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-500 hover:border-red-200 hover:text-red-500 transition-colors">Logout</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        <div className="bg-linear-to-r from-indigo-900 to-indigo-700 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-white">Are you in danger?</h2>
            <p className="text-indigo-300 text-sm mt-1">Send SOS now — your trusted contacts will be alerted</p>
          </div>
          <Link href="/sos" className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-colors animate-pulse">
            🆘 Send SOS
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Trusted Contacts', value: contacts.length, color: 'text-pink-500' },
            { label: 'Account Active', value: '✓', color: 'text-green-500' },
            { label: 'Stay Safe', value: '🛡️', color: 'text-indigo-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className={`font-serif text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/contacts" className="bg-white rounded-2xl border border-gray-100 hover:border-pink-200 p-5 flex items-center gap-4 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-2xl group-hover:bg-pink-100 transition-colors">👥</div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Trusted Contacts</h3>
              <p className="text-xs text-gray-400 mt-0.5">{contacts.length} contacts added</p>
            </div>
            <span className="ml-auto text-gray-300 group-hover:text-pink-400">→</span>
          </Link>
          <Link href="/sos" className="bg-white rounded-2xl border border-gray-100 hover:border-red-200 p-5 flex items-center gap-4 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-2xl group-hover:bg-red-100 transition-colors">🆘</div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Send SOS</h3>
              <p className="text-xs text-gray-400 mt-0.5">Get help in emergency situations</p>
            </div>
            <span className="ml-auto text-gray-300 group-hover:text-red-400">→</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Trusted Contacts</h3>
            <Link href="/contacts" className="text-xs text-pink-500 hover:underline">View all →</Link>
          </div>
          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No contacts added yet.</p>
              <Link href="/contacts" className="inline-block mt-3 bg-pink-500 text-white text-xs px-4 py-2 rounded-full hover:bg-pink-600 transition-colors">Add Contact</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.slice(0, 3).map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-medium text-sm">{c.contactName?.[0]}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.contactName}</p>
                    <p className="text-xs text-gray-400">{c.contactPhone} · {c.relation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}