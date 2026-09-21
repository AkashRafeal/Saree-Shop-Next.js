'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import logoImg from '@/assets/logo.png';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Return url if redirected from protected route
  const from = searchParams.get('from') || '/';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });

      const { token, user } = response.data.data;
      login(user, token);

      if (user.role === 'ROLE_ADMIN' || user.roles?.includes('ROLE_ADMIN')) {
        router.push('/admin');
      } else {
        router.push(from);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF8F5] flex flex-col justify-start sm:justify-center pt-4 pb-12 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center mt-2 sm:mt-0">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <img
            src={typeof logoImg === 'string' ? logoImg : (logoImg as any)?.src || '/logo.png'}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== '/logo.png') {
                target.src = '/logo.png';
              }
            }}
            alt="NiVi Couture"
            className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-[#D4AF37]"
          />
        </Link>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#062E28] tracking-tight">
          Welcome to NiVi Couture
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-stone-500 font-sans">
          Sign in to access your orders, saved wishlists, and VIP privileges
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-9 px-8 shadow-xl shadow-stone-200/60 rounded-3xl border border-stone-200/80 sm:px-10">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Please reset your password or contact support at care@nivicouture.com');
                  }}
                  className="text-xs text-[#0A4D40] hover:underline font-medium"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FAF8F5] border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40] focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 px-6 rounded-full shadow-lg shadow-[#062E28]/25 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#D4AF37] bg-gradient-to-r from-[#062E28] to-[#0A4D40] hover:from-[#0A4D40] hover:to-[#062E28] hover:shadow-xl active:scale-[0.99] disabled:opacity-50 transition-all duration-200 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to NiVi Couture'}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              Don't have an account yet?{' '}
              <Link href="/register" className="font-semibold text-[#0A4D40] hover:underline ml-1">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const LoginPage: React.FC = () => {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-400">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
};
