'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();

  const [regMethod, setRegMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(false);
    setError(null);

    if (regMethod === 'email' && !formData.email) {
      setError('Please enter your email address.');
      return;
    }

    if (regMethod === 'phone' && !formData.phone) {
      setError('Please enter your phone number.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please check your password inputs.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await registerApi({
        name: formData.name,
        email: regMethod === 'email' ? formData.email : undefined,
        phone: regMethod === 'phone' ? formData.phone : undefined,
        password: formData.password,
        role: 'user',
      });

      if (res.status === 'success' || res.token) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('active_org');
        }
        setSuccess(true);
        setTimeout(() => {
          router.push('/launchpad');
        }, 1500);
      } else {
        setError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Registration Error:', err);
      setError(err.message || 'An error occurred during account registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-lg bg-white/90 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-8 shadow-2xl shadow-brand/10 space-y-6 relative overflow-hidden"
    >
      {/* Top Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/login"
          className="text-xs font-bold text-slate-500 hover:text-brand flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </Link>
      </div>

      {/* Header Branding */}
      <div className="text-center space-y-2 pt-1">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-subtle border border-brand/20 shadow-md shadow-brand/10 mb-1"
        >
          <div className="w-full h-full rounded-[14px] flex items-center justify-center">
            <UserPlus className="w-7 h-7 text-brand" />
          </div>
        </motion.div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Create User Account
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Register your staff or customer account to access the CodeBridges POS Suite
        </p>
      </div>

      {/* Success Alert */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-extrabold">Account Registered Successfully!</p>
              <p className="text-[11px] text-emerald-700 font-medium">Redirecting you to your workspace dashboard...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g. Vibol Sen"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
            />
          </div>
        </div>

        {/* Email / Phone Mode Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
          <button
            type="button"
            onClick={() => setRegMethod('email')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              regMethod === 'email' ? 'bg-white text-brand shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Register with Email
          </button>
          <button
            type="button"
            onClick={() => setRegMethod('phone')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              regMethod === 'phone' ? 'bg-white text-brand shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" /> Register with Phone
          </button>
        </div>

        {regMethod === 'email' ? (
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                placeholder="vibol@codebridges.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="tel"
                required
                placeholder="+855 12 345 678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Confirm Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full py-3 rounded-2xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span>Creating Account...</span>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Register User Account</span>
            </>
          )}
        </button>
      </form>

      {/* Footer Link */}
      <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
        Already registered?{' '}
        <Link href="/login" className="font-bold text-brand hover:underline">
          Sign In to your Account
        </Link>
      </div>
    </motion.div>
  );
}
