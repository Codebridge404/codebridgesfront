/**
 * [BD-0125] Dynamic POS & Multi-Tenant Tax / VAT Engine
 * Provides flexible tax calculation (exclusive, inclusive, or tax-exempt)
 * configured directly from the Organization and POS Terminal Settings UI.
 */

export interface PosTaxSettings {
  taxEnabled: boolean;
  taxRate: number; // percentage, e.g. 10 for 10%
  taxCalculationMode: 'exclusive' | 'inclusive';
  taxLabel: string; // e.g. "VAT", "Sales Tax", "GST"
}

export const DEFAULT_TAX_SETTINGS: PosTaxSettings = {
  taxEnabled: false,
  taxRate: 10,
  taxCalculationMode: 'exclusive',
  taxLabel: 'VAT',
};

/**
 * Retrieve active tax settings from localStorage terminal settings or tenant defaults.
 */
export function getPosTaxSettings(): PosTaxSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_TAX_SETTINGS;
  }

  try {
    // 1. Check local POS terminal settings
    const terminalRaw = localStorage.getItem('cb_pos_terminal_settings');
    if (terminalRaw) {
      const parsed = JSON.parse(terminalRaw);
      if (parsed.taxEnabled !== undefined) {
        return {
          taxEnabled: Boolean(parsed.taxEnabled),
          taxRate: typeof parsed.taxRate === 'number' ? parsed.taxRate : Number(parsed.taxRate || 10),
          taxCalculationMode: parsed.taxCalculationMode === 'inclusive' ? 'inclusive' : 'exclusive',
          taxLabel: parsed.taxLabel || 'VAT',
        };
      }
    }

    // 2. Fallback to organization workspace tax settings
    const tenantTaxRaw = localStorage.getItem('cb_tenant_tax_settings');
    if (tenantTaxRaw) {
      const parsed = JSON.parse(tenantTaxRaw);
      return {
        taxEnabled: Boolean(parsed.tax_enabled ?? parsed.taxEnabled),
        taxRate: Number(parsed.tax_rate ?? parsed.taxRate ?? 10),
        taxCalculationMode: (parsed.tax_calculation_mode ?? parsed.taxCalculationMode) === 'inclusive' ? 'inclusive' : 'exclusive',
        taxLabel: parsed.tax_label || parsed.taxLabel || 'VAT',
      };
    }
  } catch (err) {
    console.warn('[posTaxUtils] Failed to parse tax settings from storage:', err);
  }

  return DEFAULT_TAX_SETTINGS;
}

export const getCartTaxSettings = getPosTaxSettings;

export interface CalculatedTaxResult {
  taxAmount: number;
  grandTotal: number;
  taxableSubtotal: number;
  taxLabel: string;
  taxRate: number;
  isInclusive: boolean;
  isEnabled: boolean;
  isTaxEnabled: boolean;
}

/**
 * Calculate cart tax and grand total dynamically based on tenant tax configuration.
 *
 * Modes:
 * - Disabled (taxEnabled = false): taxAmount = 0, grandTotal = taxableSubtotal
 * - Exclusive: Tax is added on top of subtotal: grandTotal = subtotal + taxAmount
 * - Inclusive: Tax is already included inside subtotal: grandTotal = subtotal, tax extracted
 */
export function calculateCartTax(
  subtotal: number,
  discountAmount: number = 0,
  overrideSettings?: Partial<PosTaxSettings>
): CalculatedTaxResult {
  const currentSettings = getPosTaxSettings();
  const settings: PosTaxSettings = {
    ...currentSettings,
    ...(overrideSettings || {}),
  };

  const taxableSubtotal = Math.max(0, subtotal - discountAmount);

  if (!settings.taxEnabled || settings.taxRate <= 0) {
    return {
      taxAmount: 0,
      grandTotal: taxableSubtotal,
      taxableSubtotal,
      taxLabel: settings.taxLabel || 'VAT',
      taxRate: 0,
      isInclusive: false,
      isEnabled: false,
      isTaxEnabled: false,
    };
  }

  const rate = settings.taxRate / 100;

  if (settings.taxCalculationMode === 'inclusive') {
    // Tax is already included in shelf prices
    // Net Base = Total / (1 + rate), Tax = Total - Net Base
    const netBase = taxableSubtotal / (1 + rate);
    const taxAmount = Math.round((taxableSubtotal - netBase) * 100) / 100;
    return {
      taxAmount,
      grandTotal: taxableSubtotal,
      taxableSubtotal: Math.round(netBase * 100) / 100,
      taxLabel: `${settings.taxLabel || 'VAT'} (${settings.taxRate}% Inc.)`,
      taxRate: settings.taxRate,
      isInclusive: true,
      isEnabled: true,
      isTaxEnabled: true,
    };
  }

  // Tax Exclusive: Added on top
  const taxAmount = Math.round(taxableSubtotal * rate * 100) / 100;
  const grandTotal = Math.round((taxableSubtotal + taxAmount) * 100) / 100;
  return {
    taxAmount,
    grandTotal,
    taxableSubtotal,
    taxLabel: `${settings.taxLabel || 'VAT'} (${settings.taxRate}%)`,
    taxRate: settings.taxRate,
    isInclusive: false,
    isEnabled: true,
    isTaxEnabled: true,
  };
}
