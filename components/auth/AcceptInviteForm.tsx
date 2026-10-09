'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Lock,
  User,
  Phone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { verifyInviteApi, acceptInviteApi } from '@/lib/api/auth';

export function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Missing invitation token. Please check the invitation link provided.');
      setVerifying(false);
      setLoading(false);
      return;
    }

    const checkToken = async () => {
      try {
        setVerifying(true);
        const res = await verifyInviteApi(token);
        if (res.status === 'success' && res.data) {
          setInviteData(res.data);
        } else {
          setError(res.message || 'Invalid or expired invitation link.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to verify invitation link. It may have expired.');
      } finally {
        setVerifying(false);
        setLoading(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (pinCode && (pinCode.length < 4 || pinCode.length > 8)) {
      alert('POS PIN code must be between 4 and 8 digits.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await acceptInviteApi({
        token,
        name,
        password,
        pin_code: pinCode || '1234',
        phone: phone || undefined,
      });

      if (res.status === 'success') {
        router.push('/launchpad');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to accept invitation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || verifying) {
    return (
      <div className="text-center space-y-3 p-8">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-extrabold text-slate-600">Verifying secure staff invitation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-slate-200 shadow-xl p-8 max-w-md w-full text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Invitation Link Invalid</h2>
          <p className="text-xs text-slate-500 mt-2 font-medium">{error}</p>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="w-full py-3 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          Return to Sign In
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-brand via-brand-hover to-indigo-700 p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-100 bg-white/20 px-2 py-0.5 rounded">
              Staff Onboarding
            </span>
            <h1 className="text-2xl font-black tracking-tight">Join Your Team</h1>
          </div>
        </div>
        <p className="text-xs text-purple-100 font-medium">
          You've been invited to join <span className="font-extrabold text-white">{inviteData?.tenant_name || 'Store Workspace'}</span> as an authorized <span className="font-extrabold text-white capitalize">{inviteData?.role?.replace('_', ' ') || 'Staff'}</span>.
        </p>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-8 space-y-5">
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
            Invited Email Address
          </label>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{inviteData?.email}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Your Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g. Sokha Chan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="tel"
              placeholder="e.g. 012 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700">
              4-Digit POS Register PIN Code
            </label>
            <span className="text-[10px] text-brand font-extrabold">For Touch Register Quick-Switch</span>
          </div>
          <div className="relative">
            <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="password"
              maxLength={8}
              placeholder="e.g. 1234"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 tracking-widest focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-brand hover:bg-brand-hover text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Setting Up Account...</span>
              </>
            ) : (
              <>
                <span>Complete Setup & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
