'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { validateGmail, validatePhone10 } from '@/utils/validation';
import logoImg from '@/assets/logo.png';

export const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { login } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailValidation = useMemo(() => {
    if (!formData.email.trim()) return null;
    return validateGmail(formData.email);
  }, [formData.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'phone') {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, phone: digits });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailCheck = validateGmail(formData.email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error || 'Invalid email.');
      return;
    }

    const phoneCheck = validatePhone10(formData.phone);
    if (!phoneCheck.isValid) {
      setError(phoneCheck.error || 'Invalid phone number.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      const { token, user } = response.data.data;
      login(user, token);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Email may already be registered.');
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
          Join NiVi Couture Atelier
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-stone-500 font-sans">
          Join our bespoke connoisseur club and enjoy exclusive bridal previews
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

          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Priya"
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Sharma"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Email Address
                </label>
                <span className="text-[11px] text-stone-400">Must be @gmail.com</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="priya@gmail.com"
                  className={`w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border rounded-xl text-xs sm:text-sm focus:outline-none transition ${
                    emailValidation?.isTypo
                      ? 'border-amber-400 bg-amber-50/40 text-amber-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500'
                      : emailValidation?.isValid
                      ? 'border-emerald-400 bg-emerald-50/30 text-emerald-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                      : formData.email && !emailValidation?.isValid
                      ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-[#0A4D40]'
                      : 'border-stone-300 focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40] focus:bg-white'
                  }`}
                />
              </div>
              {/* Real-time Email Helper & Spelling Warning */}
              {emailValidation?.isTypo && (
                <div className="mt-1.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span><strong>Spelling Check:</strong> You typed <code>@gamil.com</code>. Did you mean <strong>@gmail.com</strong>?</span>
                </div>
              )}
              {!emailValidation?.isTypo && formData.email && !emailValidation?.isValid && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Email must end with @gmail.com (e.g. yourname@gmail.com)</span>
                </p>
              )}
              {emailValidation?.isValid && (
                <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Valid @gmail.com address</span>
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Phone Number
                </label>
                <span className={`text-[11px] font-mono font-medium ${
                  formData.phone.length === 10
                    ? 'text-emerald-600'
                    : formData.phone.length > 0
                    ? 'text-amber-600'
                    : 'text-stone-400'
                }`}>
                  {formData.phone.length}/10 digits
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  name="phone"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className={`w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border rounded-xl font-mono text-xs sm:text-sm focus:outline-none transition ${
                    formData.phone.length === 10
                      ? 'border-emerald-400 bg-emerald-50/30 text-emerald-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                      : formData.phone.length > 0
                      ? 'border-amber-300 bg-amber-50/30 text-amber-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400'
                      : 'border-stone-300 focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40] focus:bg-white'
                  }`}
                />
              </div>
              {/* Real-time Phone Helper */}
              {formData.phone.length > 0 && formData.phone.length < 10 && (
                <p className="mt-1 text-xs text-amber-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Phone number count must be exactly 10 digits ({10 - formData.phone.length} more needed)</span>
                </p>
              )}
              {formData.phone.length === 10 && (
                <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Valid 10-digit mobile number</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40] focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center py-3.5 px-6 rounded-full shadow-lg shadow-[#062E28]/25 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#D4AF37] bg-gradient-to-r from-[#062E28] to-[#0A4D40] hover:from-[#0A4D40] hover:to-[#062E28] hover:shadow-xl active:scale-[0.99] disabled:opacity-50 transition-all duration-200 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#0A4D40] hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
