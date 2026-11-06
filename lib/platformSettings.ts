/**
 * Author: Antigravity Team
 * Date: 2026-11-06
 * Task: Super Admin Dynamic Platform Settings Suite (BD-0151)
 *
 * Central Dynamic Governance & Configuration Engine.
 * Eliminates static code constants for Tier Quotas, NBC Exchange Rates,
 * Rounding Rules, Platform VAT, Maintenance Mode, SMTP, and Alerting.
 */

import { updateTenantProfileApi } from '@/lib/api/tenants';

export type CashRoundingMode = 'exact' | 'round_down_100' | 'round_up_100' | 'round_500';

export interface TierQuotaBlueprint {
  maxOutlets: number;
  maxRegisters: number;
  maxUsers: number;
  trialDays: number;
  gracePeriodDays: number;
}

export interface PlatformSettings {
  // 1. General & Maintenance Mode
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceStartAt: string;
  maintenanceEndAt: string;
  allowAdminBypass: boolean;
  platformName: string;
  supportEmail: string;
  helpDeskUrl: string;
  termsUrl: string;
  privacyUrl: string;
  copyrightFooter: string;

  // 2. Dual-Currency & NBC Exchange Engine
  baseCurrency: 'USD' | 'KHR';
  exchangeRateUsdToKhr: number;
  nbcAutoSync: boolean;
  cashRoundingMode: CashRoundingMode;
  lastNbcSyncAt?: string;

  // 3. Tax / VAT Defaults
  defaultTaxRate: number;
  taxAgencyName: string;
  taxInvoicePrefix: string;
  taxCalculationMode: 'exclusive' | 'inclusive';

  // 4. Tier Blueprints & Onboarding Quotas
  tierBlueprints: {
    enterprise_org: TierQuotaBlueprint;
    business_runner: TierQuotaBlueprint;
    free_personal: TierQuotaBlueprint;
  };

  // 5. Gateways & Integrations
  bakongMerchantId: string;
  bakongBankName: string;
  bakongSecret: string;
  smsGatewayProvider: string;
  smsApiKey: string;

  // 6. Transactional Email & SMTP
  smtpHost: string;
  smtpPort: number;
  smtpEncryption: 'tls' | 'ssl' | 'none';
  smtpUsername: string;
  smtpPassword?: string;
  senderName: string;
  senderEmail: string;

  // 7. Security & Session Policies
  enforce2FA: boolean;
  allowCashierPinSwitch: boolean;
  sessionTimeoutMinutes: number;
  failedLoginLockoutAttempts: number;
  lockoutDurationMinutes: number;
  passwordExpiryDays: number;

  // 8. Incident Alerting Webhooks
  telegramBotToken: string;
  telegramChatId: string;
  slackWebhookUrl: string;
  alertOnStorageHigh: boolean;
  alertOnHighErrors: boolean;
  alertOnBruteForce: boolean;

  // 9. Data Retention & Storage Lifecycle
  auditRetentionDays: number; // 30, 60, 90, 180, 365, 0 (indefinite)
  autoPruneEnabled: boolean;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  // General & Maintenance
  isMaintenanceMode: false,
  maintenanceMessage: 'System upgrade in progress. Platform services will resume shortly.',
  maintenanceStartAt: '',
  maintenanceEndAt: '',
  allowAdminBypass: true,
  platformName: 'CodeBridges Cloud Suite',
  supportEmail: 'support@codebridges.com',
  helpDeskUrl: 'https://docs.codebridges.com',
  termsUrl: 'https://codebridges.com/terms',
  privacyUrl: 'https://codebridges.com/privacy',
  copyrightFooter: '© 2026 CodeBridges Enterprise Ecosystem. All rights reserved.',

  // Currency & NBC Exchange Engine
  baseCurrency: 'USD',
  exchangeRateUsdToKhr: 4100,
  nbcAutoSync: true,
  cashRoundingMode: 'round_down_100',
  lastNbcSyncAt: new Date().toISOString(),

  // Tax Defaults
  defaultTaxRate: 10,
  taxAgencyName: 'General Department of Taxation (GDT Cambodia)',
  taxInvoicePrefix: 'TAX-INV-',
  taxCalculationMode: 'exclusive',

  // Tier Blueprints
  tierBlueprints: {
    enterprise_org: {
      maxOutlets: 50,
      maxRegisters: 200,
      maxUsers: 500,
      trialDays: 30,
      gracePeriodDays: 7,
    },
    business_runner: {
      maxOutlets: 5,
      maxRegisters: 15,
      maxUsers: 50,
      trialDays: 14,
      gracePeriodDays: 3,
    },
    free_personal: {
      maxOutlets: 1,
      maxRegisters: 2,
      maxUsers: 5,
      trialDays: 14,
      gracePeriodDays: 3,
    },
  },

  // Gateways
  bakongMerchantId: 'CODEBRIDGES_MASTER_HQ',
  bakongBankName: 'ABA Bank (National Bank of Cambodia)',
  bakongSecret: '',
  smsGatewayProvider: 'plasgate',
  smsApiKey: '',

  // SMTP
  smtpHost: 'smtp.sendgrid.net',
  smtpPort: 587,
  smtpEncryption: 'tls',
  smtpUsername: 'apikey',
  smtpPassword: '',
  senderName: 'CodeBridges Platform',
  senderEmail: 'no-reply@codebridges.com',

  // Security
  enforce2FA: true,
  allowCashierPinSwitch: true,
  sessionTimeoutMinutes: 120,
  failedLoginLockoutAttempts: 5,
  lockoutDurationMinutes: 15,
  passwordExpiryDays: 90,

  // Alerting
  telegramBotToken: '',
  telegramChatId: '',
  slackWebhookUrl: '',
  alertOnStorageHigh: true,
  alertOnHighErrors: true,
  alertOnBruteForce: true,

  // Retention
  auditRetentionDays: 90,
  autoPruneEnabled: true,
};

const STORAGE_KEY = 'cb_platform_settings';

/**
 * Retrieve active platform settings with safe fallbacks.
 */
export function getPlatformSettings(): PlatformSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_PLATFORM_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PLATFORM_SETTINGS;

    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PLATFORM_SETTINGS,
      ...parsed,
      tierBlueprints: {
        ...DEFAULT_PLATFORM_SETTINGS.tierBlueprints,
        ...(parsed.tierBlueprints || {}),
      },
    };
  } catch (err) {
    console.warn('[PlatformSettings] Error reading from localStorage:', err);
    return DEFAULT_PLATFORM_SETTINGS;
  }
}

/**
 * Save updated platform settings to localStorage, dispatch reactive window events,
 * and seamlessly sync dynamic credentials with the active tenant profile API.
 */
export async function savePlatformSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
  const current = getPlatformSettings();
  const merged: PlatformSettings = {
    ...current,
    ...updates,
    tierBlueprints: {
      ...current.tierBlueprints,
      ...(updates.tierBlueprints || {}),
    },
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      // Also update linked POS tax settings bridge for seamless POS continuity
      localStorage.setItem(
        'cb_tenant_tax_settings',
        JSON.stringify({
          tax_enabled: true,
          tax_rate: merged.defaultTaxRate,
          tax_calculation_mode: merged.taxCalculationMode,
          tax_label: 'VAT',
        })
      );
      // Dispatch reactive broadcast to all components
      window.dispatchEvent(new CustomEvent('cb_platform_settings_updated', { detail: merged }));
    } catch (err) {
      console.warn('[PlatformSettings] Failed to persist to localStorage:', err);
    }
  }

  // Attempt backend persistence through existing /tenants/profile API bridge without changing backend code
  try {
    await updateTenantProfileApi({
      payment_settings: {
        bakong_merchant_id: merged.bakongMerchantId,
        bakong_bank_name: merged.bakongBankName,
        bakong_secret: merged.bakongSecret,
        sms_gateway_provider: merged.smsGatewayProvider,
        sms_api_key: merged.smsApiKey,
      },
      currency: merged.baseCurrency,
    });
  } catch (err) {
    // Graceful silent fallback if user is offline or not logged into a tenant
    console.warn('[PlatformSettings] Backend sync skipped or unavailable:', err);
  }

  return merged;
}

/**
 * Reset all platform settings back to system factory defaults.
 */
export function resetPlatformSettings(): PlatformSettings {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('cb_platform_settings_updated', { detail: DEFAULT_PLATFORM_SETTINGS }));
  }
  return DEFAULT_PLATFORM_SETTINGS;
}

/**
 * Helper to dynamically resolve tier default quotas.
 */
export function getTierDefaultQuotas(tier?: string | null): TierQuotaBlueprint {
  const settings = getPlatformSettings();
  const normalizedTier = tier || 'free_personal';

  if (normalizedTier === 'enterprise_org') {
    return settings.tierBlueprints.enterprise_org;
  }
  if (normalizedTier === 'business_runner') {
    return settings.tierBlueprints.business_runner;
  }
  return settings.tierBlueprints.free_personal;
}

/**
 * Cash rounding calculator according to Cambodian POS standard policies.
 */
export function roundKhrCash(amountKhr: number, mode: CashRoundingMode = 'round_down_100'): number {
  if (isNaN(amountKhr) || amountKhr <= 0) return 0;

  switch (mode) {
    case 'round_down_100':
      return Math.floor(amountKhr / 100) * 100;
    case 'round_up_100':
      return Math.ceil(amountKhr / 100) * 100;
    case 'round_500':
      return Math.round(amountKhr / 500) * 500;
    case 'exact':
    default:
      return Math.round(amountKhr);
  }
}

