/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Check, Copy } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

export interface NewKeyData {
  key: string;
  name: string;
  expires_at?: string;
}

interface RevealApiKeyModalProps {
  newKeyData: NewKeyData | null;
  onClose: () => void;
  copied: boolean;
  onCopy: (key: string) => void;
}

export function RevealApiKeyModal({
  newKeyData,
  onClose,
  copied,
  onCopy,
}: RevealApiKeyModalProps) {
  if (!newKeyData) return null;

  return (
    <Portal><div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 cb-modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-8 space-y-6"
      >
        <div className="flex items-center gap-3 text-emerald-600">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">API Key Created Successfully!</h3>
            <p className="text-xs text-slate-500 font-medium">{newKeyData.name}</p>
          </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Save this key immediately.</strong> For security reasons, you will not be able to view this full secret key again after closing this window.
          </span>
        </div>

        <div>
          <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">
            Your Secret API Key
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={newKeyData.key}
              className="flex-1 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-black text-slate-900 select-all"
            />
            <button
              onClick={() => onCopy(newKeyData.key)}
              className="px-4 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand/20 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-brand hover:bg-brand-hover-hover text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            I Have Saved My Secret API Key
          </button>
        </div>
      </motion.div>
    </div></Portal>
  );
}
