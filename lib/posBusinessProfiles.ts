export type PosBusinessTypeId = 'retail_mart' | 'restaurant_fnb' | 'cafe_qsr' | 'boutique_retail';

export interface PosBusinessProfile {
  id: PosBusinessTypeId;
  title: string;
  shortTitle: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: string;
  bestFor: string;
  enabledFeatures: string[];
  hiddenFeatures: string[];
  presets: {
    tablesEnabled: boolean;
    kdsEnabled: boolean;
    cfdEnabled: boolean;
    barcodeContinuousMode: boolean;
  };
}

export const POS_BUSINESS_PROFILES: Record<PosBusinessTypeId, PosBusinessProfile> = {
  retail_mart: {
    id: 'retail_mart',
    title: 'Retail Mart, Supermarket & Minimart',
    shortTitle: 'Retail Mart / Minimart',
    subtitle: 'High-speed barcode checkout, cash drawer kick, and dynamic KHQR customer display.',
    badge: 'High Throughput',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: 'ShoppingCart',
    bestFor: 'Minimarts, Supermarkets, Grocery Stores, Convenience Stores & Wholesale Marts',
    enabledFeatures: [
      'Continuous barcode scanning (UPC / EAN / GS1)',
      'Cash drawer RJ11 automatic pulse kick',
      'Customer Facing Display (CFD) with live KHQR',
      'Electronic weighing scale & produce barcodes',
      'Fast cashier register ringing',
    ],
    hiddenFeatures: [
      'Tables & Dining Floor Plans (Hidden from sidebar)',
      'Kitchen Display System (KDS tickets hidden)',
      'Course firing & split dining bills',
    ],
    presets: {
      tablesEnabled: false,
      kdsEnabled: false,
      cfdEnabled: true,
      barcodeContinuousMode: true,
    },
  },
  restaurant_fnb: {
    id: 'restaurant_fnb',
    title: 'Restaurant & F&B Dining',
    shortTitle: 'Restaurant & Bar',
    subtitle: 'Multi-zone floor plan, table occupancy tracker, KDS kitchen tickets, and bill splitting.',
    badge: 'Hospitality',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    icon: 'UtensilsCrossed',
    bestFor: 'Dine-in Restaurants, Bars, Lounges, Bistros & Food Courts',
    enabledFeatures: [
      'Visual floor plans (Main Dining, Patio, VIP)',
      'Live table occupancy (Vacant ➔ Dining ➔ Bill)',
      'Kitchen Display System (KDS) & Chit routing',
      'Course firing (Starters ➔ Mains ➔ Desserts)',
      'Split bill by seat, merge tables & tips',
    ],
    hiddenFeatures: [
      'Rapid supermarket batch-scan mode',
    ],
    presets: {
      tablesEnabled: true,
      kdsEnabled: true,
      cfdEnabled: true,
      barcodeContinuousMode: false,
    },
  },
  cafe_qsr: {
    id: 'cafe_qsr',
    title: 'Café, Bakery & Quick-Service (QSR)',
    shortTitle: 'Café & Quick-Service',
    subtitle: 'Fast touch tiles with drink modifiers, token pickup buzzer numbers, and barista screen.',
    badge: 'Quick Service',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: 'Coffee',
    bestFor: 'Coffee Shops, Bubble Tea, Bakeries, Takeaway Counters & Food Trucks',
    enabledFeatures: [
      'Large touchscreen SKU item tiles',
      'Drink & food modifiers (Less Ice, Oat Milk, Sweetness)',
      'Pickup Token / Buzzer number on receipt',
      'Barista & drink preparation KDS screen',
      'Customer Facing Screen (CFD) with KHQR',
    ],
    hiddenFeatures: [
      'Multi-zone dining floor plan (Counter takeaway flow)',
    ],
    presets: {
      tablesEnabled: false,
      kdsEnabled: true,
      cfdEnabled: true,
      barcodeContinuousMode: false,
    },
  },
  boutique_retail: {
    id: 'boutique_retail',
    title: 'Boutique, Fashion & Specialty Retail',
    shortTitle: 'Boutique & Retail',
    subtitle: 'Product variant matrix (Size/Color), barcode tag lookups, and customer VIP loyalty points.',
    badge: 'Specialty Retail',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: 'Shirt',
    bestFor: 'Apparel, Clothing, Shoe Stores, Cosmetics, Electronics & Gift Boutiques',
    enabledFeatures: [
      'Product Matrix Variant selector (Size / Color / Style)',
      'Barcode label & tag scanning',
      'Customer Loyalty lookup by phone & points redemption',
      'Store credit refunds & exchanges',
      'Thermal receipt branding',
    ],
    hiddenFeatures: [
      'Tables & Dining Floor Plans (Hidden from sidebar)',
      'Kitchen Display System (KDS hidden)',
    ],
    presets: {
      tablesEnabled: false,
      kdsEnabled: false,
      cfdEnabled: true,
      barcodeContinuousMode: true,
    },
  },
};

/**
 * Get active business type for POS. Defaults to 'retail_mart'.
 */
export function getPosBusinessType(orgName?: string): PosBusinessTypeId {
  if (typeof window === 'undefined') return 'retail_mart';
  try {
    const raw = localStorage.getItem('cb_pos_terminal_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.businessType && parsed.businessType in POS_BUSINESS_PROFILES) {
        return parsed.businessType as PosBusinessTypeId;
      }
    }
    if (orgName) {
      const orgType = localStorage.getItem(`cb_pos_business_type_${orgName}`);
      if (orgType && orgType in POS_BUSINESS_PROFILES) {
        return orgType as PosBusinessTypeId;
      }
    }
  } catch {}
  return 'retail_mart';
}

/**
 * Save business type and apply feature presets.
 */
export function setPosBusinessType(type: PosBusinessTypeId, orgName?: string) {
  if (typeof window === 'undefined') return;
  const profile = POS_BUSINESS_PROFILES[type];
  if (!profile) return;

  try {
    let currentSettings: any = {};
    const raw = localStorage.getItem('cb_pos_terminal_settings');
    if (raw) {
      try {
        currentSettings = JSON.parse(raw);
      } catch {}
    }

    const updatedSettings = {
      ...currentSettings,
      businessType: type,
      tablesEnabled: profile.presets.tablesEnabled,
      kdsEnabled: profile.presets.kdsEnabled,
      cfdEnabled: profile.presets.cfdEnabled,
      barcodeContinuousMode: profile.presets.barcodeContinuousMode,
    };

    localStorage.setItem('cb_pos_terminal_settings', JSON.stringify(updatedSettings));
    if (orgName) {
      localStorage.setItem(`cb_pos_business_type_${orgName}`, type);
    }

    if (currentSettings.outletId) {
      import('@/lib/api/tenants').then(({ updateOutletTerminalSettingsApi }) => {
        updateOutletTerminalSettingsApi(currentSettings.outletId, {
          business_type: type,
          is_kds_enabled: profile.presets.kdsEnabled,
          is_cfd_enabled: profile.presets.cfdEnabled,
          terminal_settings: updatedSettings,
        }).catch(() => {});
      });
    }

    window.dispatchEvent(new CustomEvent('cb_terminal_settings_updated', { detail: updatedSettings }));
    return updatedSettings;
  } catch (err) {
    console.warn('[posBusinessProfiles] Failed to set business type:', err);
  }
}

/**
 * Check whether Tables & Dining should be visible in navigation.
 */
export function isTablesAndDiningEnabled(businessType?: PosBusinessTypeId): boolean {
  const type = businessType || getPosBusinessType();
  return POS_BUSINESS_PROFILES[type]?.presets?.tablesEnabled ?? false;
}
