
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const emptyForm = { contactName: '', contactPhone: '', relation: '' };

export default function TrustedContacts() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = () => localStorage.getItem('token');

  const fetchContacts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/contacts`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setContacts(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    fetchContacts();
  }, [fetchContacts, router]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.contactName || !form.contactPhone || !form.relation) {
      return setError('Please fill in all fields.');
    }
    setLoading(true);
    try {
      if (editId) {
        await axios.put(`${API_URL}/api/contacts/${editId}`, form, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        setSuccess('Contact updated successfully.');
      } else {
        await axios.post(`${API_URL}/api/contacts`, form, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        setSuccess('Contact added successfully.');
      }
      setForm(emptyForm);
      setEditId(null);
      fetchContacts();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (c) => {
    setForm({ contactName: c.contactName, contactPhone: c.contactPhone, relation: c.relation });
    setEditId(c._id);
    setError(''); setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return;
    try {
      await axios.delete(`${API_URL}/api/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  const relations = ['Mother', 'Father', 'Brother', 'Sister', 'Husband', 'Friend', 'Other'];

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="font-serif text-xl font-black text-pink-500">SafeHer</Link>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-pink-500 transition-colors">← Dashboard</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-indigo-900">Trusted Contacts</h1>
          <p className="text-sm text-gray-400 mt-1">These contacts will receive SMS when you send SOS.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-medium text-gray-800 mb-4">{editId ? 'Update Contact' : 'Add New Contact'}</h2>
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl mb-4">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" name="contactName" value={form.contactName} onChange={handleChange} placeholder="Full Name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-sm" />
            <input type="tel" name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="Phone Number (01XXXXXXXXX)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-sm" />
            <select name="relation" value={form.relation} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-400 text-sm bg-white">
              <option value="">Select Relationship</option>
              {relations.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-2">
              <button type="submit" disabled={loading}
                className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white py-3 rounded-xl text-sm font-medium transition-colors">
                {loading ? 'Saving...' : editId ? 'Update Contact' : 'Add Contact'}
              </button>
              {editId && (
                <button type="button" onClick={() => { setEditId(null); setForm(emptyForm); }}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
              )}
            </div>
          </form>
        </div>

        <div className="space-y-3">
          {contacts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
              No contacts yet. Add one above.
            </div>
          ) : contacts.map((c) => (
            <div key={c._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold text-base shrink-0">
                {c.contactName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">{c.contactName}</p>
                <p className="text-xs text-gray-400">{c.contactPhone} · {c.relation}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleEdit(c)} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-500 hover:border-indigo-200 hover:text-indigo-600 transition-colors">Edit</button>
                <button onClick={() => handleDelete(c._id)} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-500 hover:border-red-200 hover:text-red-500 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}