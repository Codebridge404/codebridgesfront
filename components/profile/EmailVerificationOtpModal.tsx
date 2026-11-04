/**
 * Author: Antigravity Team
 * Date: 2026-11-04
 * Task: 2FA Recovery Codes & Email OTP UI (BD-0133)
 */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Mail,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  sendEmailVerificationNotificationApi,
  verifyEmailCodeApi,
  getCurrentUserApi,
} from '@/lib/api/auth';

interface EmailVerificationOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSuccess?: () => void;
}

export function EmailVerificationOtpModal({
  isOpen,
  onClose,
  email,
  onSuccess,
}: EmailVerificationOtpModalProps) {
  const [mounted, setMounted] = useState(false);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setErrorMsg(null);
      setSuccessMsg(null);
      // Auto-focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    // Handle paste of full 6 digits
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    newDigits[index] = value;
    setDigits(newDigits);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    try {
      setResending(true);
      setErrorMsg(null);
      const res: any = await sendEmailVerificationNotificationApi(email);
      setSuccessMsg(res?.message || 'A new verification code has been dispatched to your email.');
      setCooldown(60);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the confirmation code.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res: any = await verifyEmailCodeApi(email, code);

      if (res?.status === 'success' || res?.message?.includes('verified')) {
        setSuccessMsg('Email address verified successfully!');
        await getCurrentUserApi();
        if (onSuccess) {
          onSuccess();
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg(res?.message || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted || typeof window === 'undefined') return null;

  const isComplete = digits.every((d) => d !== '');

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 tracking-tight">
                Verify Email Address
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[240px]">
                {email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Banner */}
        <p className="text-xs text-slate-600 leading-relaxed">
          We sent a 6-digit verification code to <strong className="text-slate-900">{email}</strong>.
          Enter the code below to verify your account identity.
        </p>

        {/* Error Feedback */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Feedback */}
        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 6-Digit OTP Form */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="flex items-center justify-center gap-2 sm:gap-2.5">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-black text-slate-900 bg-slate-50 border border-slate-300/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white transition-all shadow-2xs"
              />
            ))}
          </div>

          {/* Resend Action */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 font-medium">Didn&apos;t receive the code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="text-brand hover:underline font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:no-underline"
            >
              {resending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isComplete}
              className="px-6 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover text-white text-xs font-black shadow-md shadow-brand/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Verify Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

