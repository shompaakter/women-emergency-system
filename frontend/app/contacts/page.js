'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL   = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const emptyForm = { contactName: '', contactPhone: '', email: '', relation: '' };
const relations = ['Mother', 'Father', 'Brother', 'Sister', 'Husband', 'Friend', 'Other'];

export default function TrustedContacts() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [form,     setForm]     = useState(emptyForm);
  const [editId,   setEditId]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  const token = () => localStorage.getItem('token');

  const fetchContacts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/contacts`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setContacts(res.data);
    } catch (e) { console.error(e); }
    finally { setFetching(false); }
  }, []);

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    fetchContacts();
  }, [fetchContacts, router]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.contactName || !form.contactPhone || !form.relation)
      return setError('Name, phone and relationship are required.');
    if (!form.email)
      return setError('Email is required — SOS alert will be sent here.');
    if (contacts.length >= 5 && !editId)
      return setError('Maximum 5 trusted contacts allowed.');
    setLoading(true);
    try {
      if (editId) {
        await axios.put(`${API_URL}/api/contacts/${editId}`, form, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        setSuccess('Contact updated.');
      } else {
        await axios.post(`${API_URL}/api/contacts`, form, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        setSuccess('Contact added.');
      }
      setForm(emptyForm); setEditId(null);
      fetchContacts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  const handleEdit = c => {
    setForm({ contactName: c.contactName, contactPhone: c.contactPhone, email: c.email || '', relation: c.relation });
    setEditId(c._id); setError(''); setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async id => {
    if (!confirm('Delete this contact?')) return;
    try {
      await axios.delete(`${API_URL}/api/contacts/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      fetchContacts();
    } catch (e) { console.error(e); }
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <Link href="/" className="font-serif text-xl font-black text-pink-500">SafeHer</Link>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-pink-500 transition-colors">← Dashboard</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-indigo-900">Trusted Contacts</h1>
          <p className="text-sm text-gray-400 mt-1">
            These contacts receive <span className="text-pink-500 font-medium">Email + Google Maps location</span> when you press SOS. Max 5 contacts.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-5">
            {editId ? '✏️ Update Contact' : '+ Add New Contact'}
          </h2>
          {error   && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl mb-4 border border-green-100">✓ {success}</div>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name *</label>
                <input type="text" name="contactName" value={form.contactName} onChange={handleChange}
                  placeholder="e.g. Sarah Ahmed"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone Number *</label>
                <input type="tel" name="contactPhone" value={form.contactPhone} onChange={handleChange}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Email Address * <span className="font-normal text-pink-500">(SOS alert will be sent here)</span>
              </label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="contact@email.com"
                className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-sm bg-pink-50/30" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Relationship *</label>
              <select name="relation" value={form.relation} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-400 text-sm bg-white text-gray-700">
                <option value="">Select relationship</option>
                {relations.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={loading}
                className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95">
                {loading ? 'Saving...' : editId ? '✓ Update Contact' : '+ Add Contact'}
              </button>
              {editId && (
                <button type="button" onClick={() => { setEditId(null); setForm(emptyForm); setError(''); }}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Contact list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 text-sm">{contacts.length} / 5 contacts</h3>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < contacts.length ? 'bg-pink-400' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>

          {fetching ? (
            <div className="space-y-3">
              {[1,2].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse flex gap-4">
                  <div className="w-11 h-11 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-4xl mb-2">👥</p>
              <p className="text-gray-400 text-sm">No contacts yet. Add one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map(c => (
                <div key={c._id} className="bg-white rounded-2xl border border-gray-100 hover:border-pink-100 p-4 flex items-center gap-4 transition-colors">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center text-pink-700 font-bold text-base shrink-0">
                    {c.contactName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 text-sm truncate">{c.contactName}</p>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">{c.relation}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">📱 {c.contactPhone}</p>
                    {c.email
                      ? <p className="text-xs text-pink-500 mt-0.5">📧 {c.email} <span className="text-gray-300">← SOS alert goes here</span></p>
                      : <p className="text-xs text-red-400 mt-0.5">⚠️ No email — SOS alert won't be sent</p>
                    }
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleEdit(c)}
                      className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all">Edit</button>
                    <button onClick={() => handleDelete(c._id)}
                      className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all">Delete</button>
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