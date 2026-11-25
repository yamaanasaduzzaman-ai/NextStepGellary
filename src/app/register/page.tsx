'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BANGLADESH_DIVISIONS } from '@/lib/bangladesh-geo';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [street, setStreet] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const res = await register({
        name,
        email,
        phone,
        password,
        street,
        division,
        district,
      });

      if (res.success) {
        router.push('/account');
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  const currentDivObj = BANGLADESH_DIVISIONS.find((d) => d.name === division);
  const districts = currentDivObj ? currentDivObj.districts : ['Dhaka'];

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="bg-white p-8 rounded-sm border border-[#EAEAEA] shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C6AE91]">
            Membership Privilege
          </span>
          <h1 className="text-2xl font-serif font-light text-[#111111]">Join Nexstep Gallery</h1>
          <p className="text-xs text-[#858585]">
            Enjoy private releases, member-only privileges, and swift checkout.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] block mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#858585] absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tanvir Hossain"
                className="w-full text-xs pl-10 pr-3 py-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] block mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#858585] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tanvir@example.com"
                  className="w-full text-xs pl-10 pr-3 py-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] block mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#858585] absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017..."
                  className="w-full text-xs pl-10 pr-3 py-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111] block mb-1">
              Password (minimum 6 characters) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#858585] absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-3 py-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#EAEAEA]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#858585] mb-2">
              Default Shipping Address (Optional)
            </p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[10px] uppercase text-[#858585] block mb-0.5">Division</label>
                <select
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value);
                    const d = BANGLADESH_DIVISIONS.find((div) => div.name === e.target.value);
                    if (d && d.districts.length > 0) setDistrict(d.districts[0]);
                  }}
                  className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm bg-white"
                >
                  {BANGLADESH_DIVISIONS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-[#858585] block mb-0.5">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs p-2 border border-[#EAEAEA] rounded-sm bg-white"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <input
              type="text"
              placeholder="Street, House, Area"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#111111] text-white text-xs font-semibold tracking-luxury uppercase rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Membership...' : 'Register'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#EAEAEA] text-center text-xs text-[#858585]">
          <span>Already registered? </span>
          <Link href="/login" className="text-[#111111] font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
