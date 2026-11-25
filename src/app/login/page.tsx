'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success) {
        if (res.isStaff) {
          router.push('/admin');
        } else {
          router.push('/account');
        }
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white p-8 rounded-sm border border-[#EAEAEA] shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C6AE91]">
            Nexstep Client Portal
          </span>
          <h1 className="text-2xl font-serif font-light text-[#111111]">Sign In</h1>
          <p className="text-xs text-[#858585]">
            Access your orders, saved sizes, and private reservations.
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
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#858585] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full text-xs pl-10 pr-3 py-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#111111]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#858585] hover:text-[#111111]"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#858585] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-3 py-2.5 border border-[#EAEAEA] rounded-sm focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#111111] text-white text-xs font-semibold tracking-luxury uppercase rounded-sm hover:bg-[#C6AE91] hover:text-[#111111] transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#EAEAEA] text-center text-xs text-[#858585]">
          <span>New to Nexstep Gallery? </span>
          <Link href="/register" className="text-[#111111] font-semibold hover:underline">
            Create an Account
          </Link>
        </div>

        <div className="p-3 bg-[#F8F7F4] rounded-sm text-[11px] text-[#858585] space-y-1">
          <p className="font-semibold text-[#111111]">Demo Credentials:</p>
          <p>• Super Admin: <code className="text-[#111111]">admin@nexstepgallery.com</code> / <code className="text-[#111111]">AdminPassword2026!</code></p>
          <p>• Client: <code className="text-[#111111]">customer@nexstepgallery.com</code> / <code className="text-[#111111]">CustomerPassword2026!</code></p>
        </div>
      </div>
    </div>
  );
}
