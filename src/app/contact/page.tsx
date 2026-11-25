'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || 'Thank you. A client concierge will respond promptly.');
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
      } else {
        setError(data.error || 'Failed to submit inquiry.');
      }
    } catch (err: any) {
      setError('Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center space-y-2 mb-14">
        <span className="text-xs font-semibold tracking-[0.25em] text-[#C6AE91] uppercase">
          Client Concierge
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-light text-[#111111] uppercase tracking-tight">
          Connect With Our Atelier
        </h1>
        <p className="text-xs text-[#858585] max-w-md mx-auto">
          Whether you require bespoke sizing counsel, order assistance, or bridal appointments, our team is at your disposal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-sm border border-[#EAEAEA] shadow-sm space-y-4">
            <h3 className="text-xs font-semibold tracking-luxury uppercase text-[#111111]">
              Direct Assistance
            </h3>

            <div className="space-y-4 text-xs text-[#858585]">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#C6AE91] mt-0.5" />
                <div>
                  <strong className="text-[#111111] block">Phone Consultation</strong>
                  <p>+880 1700-112233</p>
                  <p className="text-[11px] text-[#858585]">10:00 AM - 9:00 PM (Daily)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#C6AE91] mt-0.5" />
                <div>
                  <strong className="text-[#111111] block">Email Concierge</strong>
                  <p>support@nexstepgallery.com</p>
                  <p className="text-[11px] text-[#858585]">Average response time &lt; 2 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C6AE91] mt-0.5" />
                <div>
                  <strong className="text-[#111111] block">Flagship Atelier & Lounge</strong>
                  <p>Plot 14, Road 11, Banani / Gulshan 2</p>
                  <p>Dhaka 1213, Bangladesh</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EAEAEA]">
              <a
                href="https://wa.me/8801700112233"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#111111] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-sm border border-[#EAEAEA] shadow-sm">
          <h2 className="text-xs font-semibold tracking-luxury uppercase text-[#111111] mb-6">
            Send an Editorial Inquiry
          </h2>

          {success ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm space-y-2 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-700" />
              <p className="font-semibold">{success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-sm border border-red-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tanvir Hossain"
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tanvir@example.com"
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017..."
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] block mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Size Consultation / Order Inquiry"
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] block mb-1">
                  Message *
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How may our concierges assist you today?"
                  className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#111111] text-white text-xs font-semibold tracking-luxury uppercase rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center justify-center gap-2"
              >
                <span>{submitting ? 'Transmitting...' : 'Send Inquiry'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
