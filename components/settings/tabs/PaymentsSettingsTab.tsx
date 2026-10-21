'use client';

import React, { useState, useEffect } from 'react';
import { Save, Check, Loader2, AlertCircle, QrCode } from 'lucide-react';
import { IntegrationsSettingsTab } from '../IntegrationsSettingsTab';
import { getTenantProfileApi, updateTenantProfileApi, createBankAccountApi } from '@/lib/api';
import { buttonStyles } from '@/lib/theme';

export function PaymentsSettingsTab() {
  const [bakongMerchantId, setBakongMerchantId] = useState('');
  const [bakongBankName, setBakongBankName] = useState('');
  const [bakongSecret, setBakongSecret] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check local storage
    if (typeof window !== 'undefined') {
      const localMerchant = localStorage.getItem('cb_bakong_merchant_id') || '';
      const localBank = localStorage.getItem('cb_bakong_bank_name') || '';
      const localSecret = localStorage.getItem('cb_bakong_secret') || '';
      if (localMerchant) setBakongMerchantId(localMerchant);
      if (localBank) setBakongBankName(localBank);
      if (localSecret) setBakongSecret(localSecret);
    }

    // 2. Fetch from backend profile
    getTenantProfileApi()
      .then((res) => {
        if (res?.success && res.data?.payment_settings) {
          const pay =
            typeof res.data.payment_settings === 'string'
              ? JSON.parse(res.data.payment_settings)
              : res.data.payment_settings;

          if (pay.bakong_merchant_id !== undefined) {
            setBakongMerchantId(pay.bakong_merchant_id);
            if (typeof window !== 'undefined') {
              localStorage.setItem('cb_bakong_merchant_id', pay.bakong_merchant_id);
            }
          }
          if (pay.bakong_bank_name !== undefined) {
            setBakongBankName(pay.bakong_bank_name);
            if (typeof window !== 'undefined') {
              localStorage.setItem('cb_bakong_bank_name', pay.bakong_bank_name);
            }
          }
          if (pay.bakong_secret !== undefined) {
            setBakongSecret(pay.bakong_secret);
            if (typeof window !== 'undefined') {
              localStorage.setItem('cb_bakong_secret', pay.bakong_secret);
            }
          }
        }
      })
      .catch((err) => {
        console.warn('Could not load tenant payment settings from API:', err);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      const existingTax = typeof window !== 'undefined' ? localStorage.getItem('cb_org_tax_id') || '' : '';
      const existingTz = typeof window !== 'undefined' ? localStorage.getItem('cb_org_timezone') || '' : '';

      const paymentPayload = {
        bakong_merchant_id: bakongMerchantId,
        bakong_bank_name: bakongBankName,
        bakong_secret: bakongSecret,
        tax_id: existingTax,
        timezone: existingTz,
      };

      // 1. Save to tenant profile API
      await updateTenantProfileApi({
        payment_settings: paymentPayload,
      });

      // 2. Sync to localStorage for instant POS & modal pickup
      if (typeof window !== 'undefined') {
        localStorage.setItem('cb_bakong_merchant_id', bakongMerchantId);
        localStorage.setItem('cb_bakong_bank_name', bakongBankName);
        localStorage.setItem('cb_bakong_secret', bakongSecret);

        window.dispatchEvent(
          new CustomEvent('cb_bakong_changed', {
            detail: { merchantId: bakongMerchantId, bankName: bakongBankName },
          })
        );
      }

      // 3. Sync acquiring bank account
      if (bakongMerchantId && bakongBankName) {
        try {
          await createBankAccountApi({
            bank_name: bakongBankName,
            account_name: 'Primary Bakong Settlement Account',
            account_number: bakongMerchantId,
            currency: 'USD',
            status: 'connected',
          });
        } catch (bankErr) {
          console.warn('Sync bank account err:', bankErr);
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save payment configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-brand" />
            <span>NBC Bakong KHQR Payment Gateway</span>
          </h2>
          <p className="text-xs text-slate-500">
            Configure centralized merchant credentials for dynamic USD/KHR QR code payments across all registers
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`${buttonStyles.primary} px-5 py-2 text-xs font-black shadow-xs flex items-center gap-1.5`}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Gateway...</span>
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Payment Keys Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Payment Gateway</span>
            </>
          )}
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <IntegrationsSettingsTab
        bakongMerchantId={bakongMerchantId}
        setBakongMerchantId={setBakongMerchantId}
        bakongBankName={bakongBankName}
        setBakongBankName={setBakongBankName}
        bakongSecret={bakongSecret}
        setBakongSecret={setBakongSecret}
        showSmsGateway={false}
      />
    </form>
  );
}
