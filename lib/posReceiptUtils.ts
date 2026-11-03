/**
 * [BD-0126] POS Receipt Customization & Thermal Branding Resolver
 * Harmonizes store branding, slogan headers, return policies, receipt logos,
 * VAT TIN, and paper width across the POS Terminal, checkout slips, and order reprints.
 */

export interface PosReceiptSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  receiptHeader: string;
  receiptFooter: string;
  receiptLogoUrl: string;
  paperWidth: '80mm' | '58mm';
  autoPrintReceipt: boolean;
  vatTin?: string;
  taxLabel?: string;
}

export const DEFAULT_RECEIPT_SETTINGS: PosReceiptSettings = {
  storeName: 'CodeBridges Store',
  storeAddress: 'Main Commercial Ave, Phnom Penh',
  storePhone: '+855 23 888 999',
  receiptHeader: '',
  receiptFooter: 'Thank you for your purchase! Please come again.',
  receiptLogoUrl: '',
  paperWidth: '80mm',
  autoPrintReceipt: true,
  vatTin: '',
  taxLabel: 'VAT',
};

export function getPosReceiptSettings(): PosReceiptSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_RECEIPT_SETTINGS;
  }

  let terminalSettings: any = {};
  try {
    const raw = localStorage.getItem('cb_pos_terminal_settings');
    if (raw) terminalSettings = JSON.parse(raw);
  } catch {}

  let authUser: any = null;
  try {
    const rawUser = localStorage.getItem('pos_user');
    if (rawUser) authUser = JSON.parse(rawUser);
  } catch {}

  const activeOrgName = localStorage.getItem('active_org') || localStorage.getItem('cb_active_org_name');
  const activeLogo = localStorage.getItem('cb_active_org_logo');
  const savedHeader = localStorage.getItem('cb_pos_receipt_header');
  const savedFooter = localStorage.getItem('cb_pos_receipt_footer');

  const storeName =
    terminalSettings.outletName ||
    authUser?.outlet?.name ||
    authUser?.active_outlet?.name ||
    authUser?.tenant_name ||
    authUser?.company_name ||
    activeOrgName ||
    DEFAULT_RECEIPT_SETTINGS.storeName;

  const storeAddress =
    terminalSettings.outletAddress ||
    authUser?.outlet?.address ||
    authUser?.active_outlet?.address ||
    DEFAULT_RECEIPT_SETTINGS.storeAddress;

  const storePhone =
    terminalSettings.outletPhone ||
    authUser?.outlet?.phone ||
    authUser?.active_outlet?.phone ||
    DEFAULT_RECEIPT_SETTINGS.storePhone;

  const receiptHeader =
    terminalSettings.receiptHeader !== undefined && terminalSettings.receiptHeader !== null
      ? terminalSettings.receiptHeader
      : (savedHeader !== null ? savedHeader : DEFAULT_RECEIPT_SETTINGS.receiptHeader);

  const receiptFooter =
    terminalSettings.receiptFooter !== undefined && terminalSettings.receiptFooter !== null
      ? terminalSettings.receiptFooter
      : (savedFooter !== null ? savedFooter : DEFAULT_RECEIPT_SETTINGS.receiptFooter);

  const receiptLogoUrl =
    terminalSettings.receiptLogoUrl ||
    activeLogo ||
    authUser?.outlet?.logo_url ||
    authUser?.tenant_logo ||
    '';

  const paperWidth = terminalSettings.paperWidth === '58mm' ? '58mm' : '80mm';
  const autoPrintReceipt = terminalSettings.autoPrintReceipt !== undefined ? Boolean(terminalSettings.autoPrintReceipt) : true;
  const vatTin = terminalSettings.vat_tin || terminalSettings.vatTin || '';
  const taxLabel = terminalSettings.taxLabel || 'VAT';

  return {
    storeName,
    storeAddress,
    storePhone,
    receiptHeader,
    receiptFooter,
    receiptLogoUrl,
    paperWidth,
    autoPrintReceipt,
    vatTin,
    taxLabel,
  };
}

export function mergeReceiptOutlet(outlet?: any): any {
  const defaults = getPosReceiptSettings();
  return {
    ...defaults,
    ...(outlet || {}),
    name: outlet?.name || defaults.storeName,
    address: outlet?.address || defaults.storeAddress,
    phone: outlet?.phone || defaults.storePhone,
    receipt_header: outlet?.receipt_header !== undefined && outlet?.receipt_header !== null && outlet?.receipt_header !== ''
      ? outlet.receipt_header
      : defaults.receiptHeader,
    receipt_footer: outlet?.receipt_footer !== undefined && outlet?.receipt_footer !== null && outlet?.receipt_footer !== ''
      ? outlet.receipt_footer
      : defaults.receiptFooter,
    logo_url: outlet?.logo_url || outlet?.receipt_logo_url || defaults.receiptLogoUrl,
    vat_tin: outlet?.vat_tin || defaults.vatTin,
    paper_width: outlet?.paper_width || defaults.paperWidth,
  };
}

