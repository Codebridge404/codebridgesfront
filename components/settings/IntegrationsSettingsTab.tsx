/**
 * Author: Antigravity Team
 * Date: 2026-11-06
 * Task: Super Admin Dynamic Platform Settings Suite (BD-0151)
 */

'use client';

import React, { useState } from 'react';
import { Smartphone, Eye, EyeOff, Save, Check, Loader2, QrCode } from 'lucide-react';
import { buttonStyles } from '@/lib/theme';
import { PlatformSettings } from '@/lib/platformSettings';

interface IntegrationsSettingsTabProps {
  settings?: PlatformSettings;
  onChange?: <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => void;
  // Legacy prop support
  bakongMerchantId?: string;
  setBakongMerchantId?: (val: string) => void;
  bakongBankName?: string;
  setBakongBankName?: (val: string) => void;
  bakongSecret?: string;
  setBakongSecret?: (val: string) => void;
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
  saving?: boolean;
  saved?: boolean;
  onSave?: (e: React.FormEvent) => void;
}

export function IntegrationsSettingsTab({
  settings,
  onChange,
  bakongMerchantId,
  setBakongMerchantId,
  bakongBankName,
  setBakongBankName,
  bakongSecret,
  setBakongSecret,
  title = 'NBC Bakong KHQR Gateway',
  description = 'Configure master acquiring credentials for central platform transactions and invoice settlements.',
  merchantIdLabel = 'Bakong Account ID / Merchant ID',
  merchantIdPlaceholder = '',
  secretKeyLabel = 'Bakong Secret Key / API Token',
  secretKeyPlaceholder = '',
  showSmsGateway = true,
  smsGatewayProvider = 'plasgate',
  setSmsGatewayProvider,
  smsApiKey = '',
  setSmsApiKey,
  saving = false,
  saved = false,
  onSave,
}: IntegrationsSettingsTabProps) {
  const [showSecret, setShowSecret] = useState(false);
  const [showSmsKey, setShowSmsKey] = useState(false);

  // Unified getters
  const currentMerchantId = settings ? settings.bakongMerchantId : (bakongMerchantId ?? '');
  const currentBankName = settings ? settings.bakongBankName : (bakongBankName ?? '');
  const currentSecret = settings ? settings.bakongSecret : (bakongSecret ?? '');
  const currentSmsProvider = settings ? settings.smsGatewayProvider : (smsGatewayProvider ?? 'plasgate');
  const currentSmsApiKey = settings ? settings.smsApiKey : (smsApiKey ?? '');

  const handleMerchantIdChange = (val: string) => {
    if (onChange) onChange('bakongMerchantId', val);
    if (setBakongMerchantId) setBakongMerchantId(val);
  };

  const handleBankNameChange = (val: string) => {
    if (onChange) onChange('bakongBankName', val);
    if (setBakongBankName) setBakongBankName(val);
  };

  const handleSecretChange = (val: string) => {
    if (onChange) onChange('bakongSecret', val);
    if (setBakongSecret) setBakongSecret(val);
  };

  const handleSmsProviderChange = (val: string) => {
    if (onChange) onChange('smsGatewayProvider', val);
    if (setSmsGatewayProvider) setSmsGatewayProvider(val);
  };

  const handleSmsApiKeyChange = (val: string) => {
    if (onChange) onChange('smsApiKey', val);
    if (setSmsApiKey) setSmsApiKey(val);
  };

  return (
    <form onSubmit={onSave} className="space-y-6">
      {/* Bakong KHQR Container */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-brand" />
            <span>National Bank of Cambodia (NBC) Bakong KHQR</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {description}
          </p>
        </div>

        {/* Bakong Banner */}
        <div className="p-4 rounded-2xl bg-brand-subtle/30 border border-brand/20 flex items-start gap-3">
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
              Direct settlement connection with NBC Bakong network for zero-fee interbank transactions in USD and KHR.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              {merchantIdLabel}
            </label>
            <input
              type="text"
              value={currentMerchantId}
              onChange={(e) => handleMerchantIdChange(e.target.value)}
              placeholder={merchantIdPlaceholder}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-mono font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
            <p className="text-[11px] text-slate-400">Master merchant identifier registered with the National Bank.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Acquiring Settlement Bank
            </label>
            <input
              type="text"
              value={currentBankName}
              onChange={(e) => handleBankNameChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
            <p className="text-[11px] text-slate-400">Primary banking partner (e.g. ABA Bank, Acleda, Wing).</p>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700">
              {secretKeyLabel}
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={currentSecret}
                onChange={(e) => handleSecretChange(e.target.value)}
                placeholder={secretKeyPlaceholder}
                className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-mono font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">Cryptographic token for signing dynamic merchant payment requests.</p>
          </div>
        </div>

        {/* SMS Provider */}
        {showSmsGateway && (
          <div className="space-y-4 pt-5 border-t border-slate-200/80">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-brand" />
                <span>SMS Notification Provider</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Automated SMS gateway used for platform OTPs, staff invites, and billing receipts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Telecom Provider
                </label>
                <select
                  value={currentSmsProvider}
                  onChange={(e) => handleSmsProviderChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all cursor-pointer"
                >
                  <option value="plasgate" className="text-slate-900 bg-white">Plasgate Telecom Gateway (Cambodia)</option>
                  <option value="twilio" className="text-slate-900 bg-white">Twilio Global SMS Gateway</option>
                  <option value="aws_sns" className="text-slate-900 bg-white">AWS Simple Notification Service (SNS)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  SMS API Token / Secret
                </label>
                <div className="relative">
                  <input
                    type={showSmsKey ? 'text' : 'password'}
                    value={currentSmsApiKey}
                    onChange={(e) => handleSmsApiKeyChange(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-mono font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmsKey(!showSmsKey)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showSmsKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={saving}
            className={`${buttonStyles.primary} px-6 py-2.5 text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Integrations...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Changes Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Master Integrations</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
