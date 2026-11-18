/**
 * Author: Antigravity Team
 * Date: 2026-11-17
 * Task: BD-0161 & BD-0162 - Passkey Login & Strict 2FA Challenge Flow
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  loginApi,
  verify2faChallengeApi,
  getPasskeyAuthOptionsApi,
  verifyPasskeyAuthApi,
} from '@/lib/api';
import { getPasskeyAssertion, isWebAuthnSupported } from '@/lib/webauthn';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Fingerprint,
  ShieldCheck,
} from 'lucide-react';
import { QuickFillSection } from './QuickFillSection';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [twoFactorChallengeId, setTwoFactorChallengeId] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPasskeySupported(isWebAuthnSupported());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await loginApi(identifier, password);
      // Deterministically route to launchpad on login success per task requirement
      router.push('/launchpad');
    } catch (err: any) {
      console.error('Login Error:', err);
      const challengeId = err?.payload?.challenge_id || err?.payload?.challenge_token;
      if ((err?.code === 'TWO_FACTOR_REQUIRED' || err?.payload?.two_factor_required) && challengeId) {
        setTwoFactorChallengeId(String(challengeId));
        setTwoFactorCode('');
        setError(null);
        return;
      }
      if (err?.message === 'Failed to fetch' || err?.name === 'TypeError') {
        setError('Backend cloud server is connecting or waking up from standby. Please try again in a few seconds.');
      } else {
        setError(err?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorChallengeId || !twoFactorCode.trim()) return;
    setLoading(true);
    setError(null);

    try {
      await verify2faChallengeApi(twoFactorChallengeId, twoFactorCode.trim());
      router.push('/launchpad');
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired two-factor code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    setError(null);

    try {
      const emailFilter = loginMethod === 'email' && identifier.trim() ? identifier.trim() : undefined;
      const optionsRes = await getPasskeyAuthOptionsApi(emailFilter);
      const { challenge_id, options } = optionsRes.data;
      const assertion = await getPasskeyAssertion(options);

      await verifyPasskeyAuthApi({
        challenge_id,
        device_name: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : 'Web Browser',
        id: assertion.id,
        response: assertion.response,
      });

      router.push('/launchpad');
    } catch (err: any) {
      console.error('Passkey Login Error:', err);
      setError(err?.message || 'Passkey sign-in failed or was cancelled.');
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleQuickFill = (quickValue: string, quickPass: string = 'password') => {
    setIdentifier(quickValue);
    setPassword(quickPass);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-md bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl p-8 shadow-2xl shadow-brand/10 space-y-6 relative overflow-hidden ring-1 ring-white/30"
    >
      {/* Top Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/launchpad"
          className="text-xs font-bold text-slate-600 hover:text-brand flex items-center gap-1.5 transition-colors bg-white/40 px-2.5 py-1 rounded-full border border-white/60 backdrop-blur-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Launchpad
        </Link>
        <span className="text-[10px] font-extrabold text-brand bg-white/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-brand/20 uppercase tracking-widest">
          SSO Auth
        </span>
      </div>

      {/* Header Branding */}
      <div className="text-center space-y-2 pt-1">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-md p-1.5 shadow-md shadow-brand/20 mb-1 border border-white/80 overflow-hidden"
        >
          <img src="/logo/Codebridge.png" alt="CodeBridges Logo" className="w-full h-full object-contain" />
        </motion.div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          CodeBridges Enterprise <span className="text-brand">Suite</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium">Single Sign-On authentication for POS, Inventory, HR &amp; Finance</p>
      </div>

      {/* Redirect Target Banner */}
      {redirectUrl && redirectUrl !== '/launchpad' && redirectUrl !== '/' && redirectUrl !== '/login' && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Sign in to access: <strong className="font-extrabold">{redirectUrl}</strong></span>
        </div>
      )}

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-start gap-2.5 overflow-hidden"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2FA Challenge Step vs Standard + Passkey Login Form */}
      {twoFactorChallengeId ? (
        <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
          <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-extrabold text-slate-900">Two-Factor Authentication Required</p>
              <p className="text-slate-600">
                Enter the 6-digit code from your authenticator app or an 8-character recovery code.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Verification Code *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="123456 or ABCD-EFGH"
              className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur-md border border-slate-300/60 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all text-sm font-mono font-bold tracking-widest text-center"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setTwoFactorChallengeId(null);
                setTwoFactorCode('');
                setError(null);
              }}
              className="px-4 py-3 rounded-xl bg-white/60 hover:bg-white border border-slate-300/70 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Back
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !twoFactorCode.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs shadow-md shadow-brand/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Verifying Code...' : 'Verify & Sign In'}
            </motion.button>
          </div>
        </form>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Phone Mode Switcher Tabs */}
            <div className="flex bg-slate-900/5 backdrop-blur-md p-1 rounded-xl text-xs font-bold border border-white/50">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  loginMethod === 'email' ? 'bg-white/80 text-brand shadow-xs font-extrabold backdrop-blur-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  loginMethod === 'phone' ? 'bg-white/80 text-brand shadow-xs font-extrabold backdrop-blur-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Phone className="w-3.5 h-3.5" /> Phone
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                {loginMethod === 'email' ? <Mail className="w-3.5 h-3.5 text-slate-400" /> : <Phone className="w-3.5 h-3.5 text-slate-400" />}
                {loginMethod === 'email' ? 'Email Address *' : 'Phone Number *'}
              </label>
              <input
                type={loginMethod === 'email' ? 'email' : 'tel'}
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={loginMethod === 'email' ? 'user@codebridges.com' : '+855 12 345 678'}
                className="w-full px-4 py-3 rounded-xl bg-white/45 backdrop-blur-md border border-slate-300/60 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white/70 transition-all text-xs font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Password
                </label>
                <span className="text-[11px] text-brand font-bold hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-white/45 backdrop-blur-md border border-slate-300/60 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white/70 transition-all text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md text-brand focus:ring-brand/30 border-slate-300"
                />
                <span>Remember session</span>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || passkeyLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs shadow-md shadow-brand/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating SSO...
                </>
              ) : (
                'Sign In to Enterprise Platform'
              )}
            </motion.button>
          </form>

          {passkeySupported && (
            <button
              type="button"
              onClick={handlePasskeyLogin}
              disabled={passkeyLoading || loading}
              className="w-full py-3 px-4 rounded-xl bg-white/70 hover:bg-white border border-slate-300/80 text-slate-800 font-extrabold text-xs shadow-2xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Fingerprint className="w-4 h-4 text-brand" />
              <span>{passkeyLoading ? 'Waiting for Passkey...' : 'Sign in with Passkey (Touch ID / Face ID)'}</span>
            </button>
          )}
        </>
      )}

      {/* Quick Demo Login Preset Buttons */}
      <QuickFillSection onQuickFill={handleQuickFill} />

      {/* Registration Links Footer */}
      <div className="pt-3 border-t border-slate-200/50 space-y-1.5 text-center text-xs">
        <p className="text-slate-500 font-medium">
          Don't have a staff account?{' '}
          <Link href="/register" className="font-extrabold text-brand hover:underline">
            Register Account Here
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
