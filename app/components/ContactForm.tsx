"use client"

import { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('Message sent! Thanks!');
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus(data.message || 'Failed to send message.');
      }
    } catch (error) {
      console.error(error);
      setStatus('Failed to send message.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mx-auto my-auto">
      <div className="flex flex-col mb-4">
        <label htmlFor="name" className="mb-1">Full name</label>
        <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
            className="border p-2 rounded"
        />
      </div>
      <div className="flex flex-col mb-4">
        <label htmlFor="email" className="mb-1">Email</label>
        <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email} 
            onChange={handleChange}
            required
            className="border p-2 rounded"
        />
      </div>
      <div className="flex flex-col mb-4">
        <label htmlFor="Message" className="mb-1">Message</label>
        <textarea
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            required
            className="border p-2 rounded h-32"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white p-2 rounded cursor-pointer hover:bg-blue-600 transition duration-200 transform hover:scale-105">
        Send Message
      </button>
      {status && <p className="text-center mt-2">{status}</p>}
    </form>
  );
}
