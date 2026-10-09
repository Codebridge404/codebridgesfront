'use client';

import React, { useState } from 'react';
import { QrCode, Smartphone, Eye, EyeOff } from 'lucide-react';

interface IntegrationsSettingsTabProps {
  bakongMerchantId: string;
  setBakongMerchantId: (val: string) => void;
  bakongBankName: string;
  setBakongBankName: (val: string) => void;
  bakongSecret: string;
  setBakongSecret: (val: string) => void;
  title?: string;
  description?: string;
  merchantIdLabel?: string;
  merchantIdPlaceholder?: string;
  secretKeyLabel?: string;
  secretKeyPlaceholder?: string;
  showSmsGateway?: boolean;
  smsGatewayProvider?: string;
  setSmsGatewayProvider?: (val: string) => void;
  smsApiKey?: string;
  setSmsApiKey?: (val: string) => void;
}

export function IntegrationsSettingsTab({
  bakongMerchantId,
  setBakongMerchantId,
  bakongBankName,
  setBakongBankName,
  bakongSecret,
  setBakongSecret,
  title = 'NBC Bakong KHQR Gateway',
  description = 'Configure credentials to process dynamic KHQR interbank payments.',
  merchantIdLabel = 'Bakong Account ID / Merchant ID',
  merchantIdPlaceholder = '',
  secretKeyLabel = 'Bakong Secret Key / API Token',
  secretKeyPlaceholder = '',
  showSmsGateway = true,
  smsGatewayProvider = 'plasgate',
  setSmsGatewayProvider,
  smsApiKey = '',
  setSmsApiKey,
}: IntegrationsSettingsTabProps) {
  const [showSecret, setShowSecret] = useState(false);
  const [showSmsKey, setShowSmsKey] = useState(false);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-brand-subtle/60 border border-brand/20 flex items-start gap-3">
        <img
          src="/BakongKHQR/Bakong.png"
          alt="Bakong KHQR"
          className="w-5 h-5 rounded-md object-contain shrink-0 mt-0.5 shadow-2xs"
        />
        <div>
          <p className="text-xs font-black text-brand">
            {title}
          </p>
          <p className="text-[11px] text-slate-600 mt-0.5">
            {description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {merchantIdLabel}
          </label>
          <input
            type="text"
            value={bakongMerchantId}
            onChange={(e) => setBakongMerchantId(e.target.value)}
            placeholder={merchantIdPlaceholder}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Acquiring Settlement Bank
          </label>
          <input
            type="text"
            value={bakongBankName}
            onChange={(e) => setBakongBankName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {secretKeyLabel}
          </label>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={bakongSecret}
              onChange={(e) => setBakongSecret(e.target.value)}
              placeholder={secretKeyPlaceholder}
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title={showSecret ? 'Hide token' : 'Show token'}
              aria-label={showSecret ? 'Hide token' : 'Show token'}
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {showSmsGateway && (
        <>
          <hr className="border-slate-100 my-4" />

          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-500" />
            <span>SMS OTP Gateway (Staff 2FA &amp; Receipts)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                SMS Gateway Provider
              </label>
              <select
                value={smsGatewayProvider}
                onChange={(e) => setSmsGatewayProvider?.(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="plasgate">Plasgate (Cambodia Direct Route)</option>
                <option value="twilio">Twilio Global SMS</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Master SMS API Token
              </label>
              <div className="relative">
                <input
                  type={showSmsKey ? 'text' : 'password'}
                  value={smsApiKey}
                  onChange={(e) => setSmsApiKey?.(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowSmsKey(!showSmsKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={showSmsKey ? 'Hide key' : 'Show key'}
                  aria-label={showSmsKey ? 'Hide key' : 'Show key'}
                >
                  {showSmsKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
