/**
 * Author: Antigravity Team
 * Date: 2026-11-04
 * Task: 2FA Recovery Codes & Email OTP UI (BD-0133)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldAlert,
  Copy,
  Check,
  Download,
  RefreshCw,
  X,
  Loader2,
  AlertTriangle,
  KeyRound,
} from 'lucide-react';
import { getTwoFactorRecoveryCodesApi, regenerateTwoFactorRecoveryCodesApi } from '@/lib/api/auth';

interface TwoFactorRecoveryCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCodes?: string[];
}

export function TwoFactorRecoveryCodesModal({
  isOpen,
  onClose,
  initialCodes,
}: TwoFactorRecoveryCodesModalProps) {
  const [mounted, setMounted] = useState(false);
  const [codes, setCodes] = useState<string[]>(initialCodes || []);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialCodes && initialCodes.length > 0) {
        setCodes(initialCodes);
      } else {
        loadRecoveryCodes();
      }
    } else {
      setConfirmRegenerate(false);
      setErrorMsg(null);
    }
  }, [isOpen, initialCodes]);

  const loadRecoveryCodes = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res: any = await getTwoFactorRecoveryCodesApi();
      const loadedCodes = res?.recovery_codes || res?.data?.recovery_codes || [];
      if (Array.isArray(loadedCodes) && loadedCodes.length > 0) {
        setCodes(loadedCodes);
      } else {
        setErrorMsg(res?.message || 'Failed to retrieve recovery codes.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error loading 2FA recovery codes.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateCodes = async () => {
    try {
      setRegenerating(true);
      setErrorMsg(null);
      const res: any = await regenerateTwoFactorRecoveryCodesApi();
      const newCodes = res?.recovery_codes || res?.data?.recovery_codes || [];
      if (Array.isArray(newCodes) && newCodes.length > 0) {
        setCodes(newCodes);
        setConfirmRegenerate(false);
      } else {
        setErrorMsg(res?.message || 'Failed to regenerate recovery codes.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error regenerating recovery codes.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyAll = () => {
    if (codes.length === 0) return;
    const text = [
      'CODEBRIDGES ENTERPRISE - 2FA EMERGENCY RECOVERY CODES',
      `Generated: ${new Date().toISOString()}`,
      '-------------------------------------------------------',
      'Each recovery code can be used ONCE if you lose your phone/authenticator device.',
      '',
      ...codes.map((c, i) => `${i + 1}. ${c}`),
      '-------------------------------------------------------',
      'Keep these codes strictly private and stored offline in a password manager or safe vault.',
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTxt = () => {
    if (codes.length === 0) return;
    const text = [
      'CODEBRIDGES ENTERPRISE - 2FA EMERGENCY RECOVERY CODES',
      `Generated: ${new Date().toISOString()}`,
      '-------------------------------------------------------',
      'Each recovery code can be used ONCE if you lose your phone/authenticator device.',
      '',
      ...codes.map((c, i) => `${i + 1}. ${c}`),
      '-------------------------------------------------------',
      'Store this file in a secure vault or offline storage device.',
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `codebridges-2fa-recovery-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen || !mounted || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 tracking-tight">
                2FA Emergency Recovery Codes
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                One-time backup codes for account recovery if you lose your authenticator app
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

        {/* Advisory Warning */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Keep your recovery codes secure</span>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Each code can only be used once. Store them in a password manager or physical safe vault.
              Never share them with anyone.
            </p>
          </div>
        </div>

        {/* Error Feedback */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
            <span className="text-xs font-bold">Decrypting emergency recovery codes...</span>
          </div>
        )}

        {/* Codes Display Grid */}
        {!loading && codes.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              {codes.map((code, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono font-bold text-slate-800 shadow-2xs"
                >
                  <span className="text-[10px] text-slate-400 select-none">#{idx + 1}</span>
                  <span className="tracking-wider">{code}</span>
                </div>
              ))}
            </div>

            {/* Copy & Download Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyAll}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy All Codes</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download .txt</span>
              </button>
            </div>
          </div>
        )}

        {/* Regenerate Warning Confirmation */}
        {confirmRegenerate ? (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Regenerating codes invalidates all current codes!</span>
            </div>
            <p className="text-[11px] text-rose-700">
              Are you sure you want to discard your existing codes and generate 8 brand new ones?
            </p>
            <div className="flex items-center gap-2 pt-1 justify-end">
              <button
                type="button"
                onClick={() => setConfirmRegenerate(false)}
                className="px-3 py-1 rounded-lg border border-rose-200 text-rose-700 bg-white hover:bg-rose-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegenerateCodes}
                disabled={regenerating}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {regenerating && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Yes, Regenerate Now</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-100">
            <button
              type="button"
              onClick={() => setConfirmRegenerate(true)}
              className="text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate New Codes</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              Done &amp; Saved
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

