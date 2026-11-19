/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: BD-0156
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Laptop,
  Store,
  Boxes,
  Server,
  X,
  KeyRound,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { ApiClientType } from '@/lib/api/apiClients';
import { Portal } from '@/components/ui/Portal';

interface CreateApiClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; client_type: ApiClientType; client_key?: string }) => void;
  submitting: boolean;
}

export function CreateApiClientModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
}: CreateApiClientModalProps) {
  const [name, setName] = useState('');
  const [clientType, setClientType] = useState<ApiClientType>('mobile_pos');
  const [customKey, setCustomKey] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      client_type: clientType,
      client_key: customKey.trim() || undefined,
    });
  };

  const clientTypes: { type: ApiClientType; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      type: 'mobile_pos',
      label: 'Flutter POS / Mobile Terminal',
      desc: 'Mobile cash register, tablet checkout, or touch register terminal',
      icon: <Store className="w-4 h-4 text-emerald-600" />,
    },
    {
      type: 'web',
      label: 'Web Console / Single-Page App',
      desc: 'Next.js admin portal, operations management, or web POS',
      icon: <Laptop className="w-4 h-4 text-blue-600" />,
    },
    {
      type: 'kiosk',
      label: 'Self-Service Customer Kiosk',
      desc: 'Unattended customer ordering kiosk or digital menu terminal',
      icon: <Smartphone className="w-4 h-4 text-purple-600" />,
    },
    {
      type: 'integration',
      label: 'Third-Party ERP / Delivery Integration',
      desc: 'E-commerce webhook, Grab/Foodpanda sync, or external CRM connector',
      icon: <Boxes className="w-4 h-4 text-amber-600" />,
    },
    {
      type: 'service',
      label: 'Backend Microservice / Daemon',
      desc: 'Server-to-server daemon, background queue worker, or telemetry agent',
      icon: <Server className="w-4 h-4 text-slate-700" />,
    },
  ];

  return (
    <Portal><div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 cb-modal-backdrop animate-fade-in font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 space-y-5 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-subtle text-brand flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Register API Client Application</h3>
              <p className="text-xs text-slate-400 font-medium">Issue public client credentials and X-App-Key token</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Application Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Flutter POS Main Register, Delivery Sync Daemon"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand font-medium placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-2">
              Client Application Architecture *
            </label>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {clientTypes.map((item) => {
                const isSelected = clientType === item.type;
                return (
                  <div
                    key={item.type}
                    onClick={() => setClientType(item.type)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-brand/5 border-brand/40 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-50 shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`font-extrabold text-xs ${isSelected ? 'text-brand' : 'text-slate-900'}`}>
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Custom Client Key (Optional)
            </label>
            <input
              type="text"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="Leave empty to auto-generate 64-char cryptographic key"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand font-mono text-[11px] placeholder-slate-400"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              If omitted, CodeBridges auto-generates a secure 64-character SHA-256 key matching the platform gateway security scheme.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-brand/20 active:scale-95 transition-all"
            >
              {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Register Application</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div></Portal>
  );
}

