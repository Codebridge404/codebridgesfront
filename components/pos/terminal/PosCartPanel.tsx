/**
 * Author: Antigravity Team
 * Date: 2026-11-17
 * Task: BD-0160 - POS Terminal & Current Order Dynamic Organization Receipt Template Integration
 */
'use client';

import React, { useState, useEffect } from 'react';
import { calculateCartTax, getPosTaxSettings, PosTaxSettings } from '@/lib/posTaxUtils';
import {
  formatReceiptNumber,
  getPosReceiptSettings,
  PosReceiptSettings,
} from '@/lib/posReceiptUtils';
import { ThermalReceiptPaper } from '@/components/receipt/ThermalReceiptPaper';
import { motion, AnimatePresence } from 'framer-motion';
import { appleSpring, pressSpring } from '@/lib/animations';
import {
  ShoppingBag,
  Trash2,
  PauseCircle,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  X,
  Package,
  Receipt,
  Printer,
} from 'lucide-react';
import { CartItem } from '../types';

function CartItemThumbnail({ item }: { item: CartItem }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = item.product?.image_url || item.product?.image;

  return (
    <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0 flex items-center justify-center">
      {imageUrl && !imgError ? (
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <Package className="w-4 h-4 text-slate-400" />
      )}
    </div>
  );
}

interface PosCartPanelProps {
  cart: CartItem[];
  appliedCoupon: any;
  couponError: string;
  onUpdateQty: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onOpenHoldModal: () => void;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  onOpenCheckout: (tender: 'cash' | 'khqr' | 'card') => void;
  isProcessing: boolean;
  customer?: any;
  table?: any;
  orderType?: string;
  cashier?: any;
  outlet?: any;
  receiptSettings?: PosReceiptSettings | null;
}

export function PosCartPanel({
  cart,
  appliedCoupon,
  couponError,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOpenHoldModal,
  onApplyCoupon,
  onRemoveCoupon,
  onOpenCheckout,
  isProcessing,
  customer,
  table,
  orderType,
  cashier,
  outlet,
  receiptSettings: propReceiptSettings,
}: PosCartPanelProps) {
  const [viewMode, setViewMode] = useState<'cart' | 'receipt'>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('cb_pos_cart_view_mode');
      if (savedMode === 'receipt' || savedMode === 'cart') return savedMode;
    }
    return 'cart';
  });

  const [receiptSettings, setReceiptSettings] = useState<PosReceiptSettings>(() => {
    return propReceiptSettings || getPosReceiptSettings();
  });

  useEffect(() => {
    if (propReceiptSettings) {
      setReceiptSettings(propReceiptSettings);
    }
  }, [propReceiptSettings]);

  const [couponInput, setCouponInput] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? (subtotal * appliedCoupon.value) / 100
      : appliedCoupon.value
    : 0;
  const [taxSettings, setTaxSettings] = useState<PosTaxSettings>(getPosTaxSettings);

  const handleSwitchViewMode = (mode: 'cart' | 'receipt') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_pos_cart_view_mode', mode);
    }
  };

  useEffect(() => {
    const handleSettingsUpdated = () => {
      setTaxSettings(getPosTaxSettings());
      setReceiptSettings(getPosReceiptSettings());
    };
    const handleStorage = (e: StorageEvent) => {
      if (
        !e.key ||
        e.key === 'cb_pos_terminal_settings' ||
        e.key === 'cb_tenant_tax_settings' ||
        e.key === 'cb_pos_receipt_header' ||
        e.key === 'cb_pos_receipt_footer' ||
        e.key === 'cb_active_org_logo'
      ) {
        setTaxSettings(getPosTaxSettings());
        setReceiptSettings(getPosReceiptSettings());
      }
    };
    window.addEventListener('cb_terminal_settings_updated', handleSettingsUpdated);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('cb_terminal_settings_updated', handleSettingsUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const { taxAmount: tax, grandTotal, taxLabel, isEnabled: isTaxEnabled } = calculateCartTax(
    subtotal,
    discountAmount,
    taxSettings
  );

  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const draftLines = cart.map((item) => ({
    product_name: item.name,
    quantity: item.qty,
    unit_price: item.price,
    subtotal: item.price * item.qty,
    discount_amount: 0,
  }));

  const draftSale = {
    receipt_number: formatReceiptNumber(
      receiptSettings.receiptStartNumber ?? 0,
      receiptSettings.receiptDigits ?? 5
    ),
    order_type: orderType || 'dine_in',
    table_name: table?.name || (orderType === 'dine_in' ? 'Open Table' : ''),
    customer_name: customer?.name || 'Walk-in Customer',
    cashier_name: cashier?.name || 'Cashier',
    subtotal: subtotal,
    discount_total: discountAmount,
    tax_total: tax,
    grand_total: grandTotal,
    tendered_amount: grandTotal,
    change_amount: 0,
  };

  const draftOutlet = {
    name: receiptSettings.storeName || outlet?.name,
    address: receiptSettings.storeAddress || outlet?.address || '',
    phone: receiptSettings.storePhone || outlet?.phone || '',
    receipt_header:
      receiptSettings.receiptHeader !== undefined && receiptSettings.receiptHeader !== null
        ? receiptSettings.receiptHeader
        : outlet?.receipt_header || '',
    receipt_footer:
      receiptSettings.receiptFooter !== undefined && receiptSettings.receiptFooter !== null
        ? receiptSettings.receiptFooter
        : outlet?.receipt_footer || '',
    logo_url:
      receiptSettings.receiptLogoUrl !== undefined && receiptSettings.receiptLogoUrl !== null
        ? receiptSettings.receiptLogoUrl
        : outlet?.receipt_logo_url || outlet?.logo_url || '',
    paper_width: receiptSettings.paperWidth || outlet?.paper_width || '80mm',
    vat_tin: receiptSettings.vatTin || outlet?.vat_tin || '',
    tax_label: receiptSettings.taxLabel || taxLabel,
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    onApplyCoupon(couponInput.trim());
    setCouponInput('');
  };

  return (
    <div className="bg-white/80 backdrop-blur-2xl backdrop-saturate-190 border border-white/60 shadow-lg rounded-2xl flex flex-col h-full overflow-hidden">
      {/* Printable CSS Rules for Thermal Slip */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-thermal-receipt,
          #printable-thermal-receipt * {
            visibility: visible !important;
          }
          #printable-thermal-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${receiptSettings.paperWidth === '58mm' ? '58mm' : '80mm'} !important;
            margin: 0 !important;
            padding: 10px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Compact Cart Header */}
      <div className="px-3 py-2.5 border-b border-slate-200/70 shrink-0 bg-transparent">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center font-bold shadow-xs shadow-brand/20 shrink-0">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-xs text-slate-900 leading-none truncate">
                Current Order
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in basket
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* View Mode Switcher: Cart Mode vs Receipt Slip Mode */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-[10px] font-extrabold">
              <button
                type="button"
                onClick={() => handleSwitchViewMode('cart')}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'cart'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Interactive touch basket"
              >
                <ShoppingBag className="w-3 h-3" />
                <span>Cart</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchViewMode('receipt')}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'receipt'
                    ? 'bg-white text-brand shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Preview order using organization receipt customization template"
              >
                <Receipt className="w-3 h-3 text-brand" />
                <span>Slip</span>
              </button>
            </div>

            {cart.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={onOpenHoldModal}
                  title="Hold this cart"
                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 active:scale-[0.93] text-amber-700 border border-amber-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <PauseCircle className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onClearCart}
                  title="Clear basket"
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 active:scale-[0.93] text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic View: Receipt Slip Mode vs Cart Line Items List */}
      {viewMode === 'receipt' ? (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col items-center custom-scrollbar space-y-3 bg-slate-50/70">
          <div className="w-full flex items-center justify-between text-xs px-1">
            <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-brand" />
              <span>Thermal Receipt Slip Template</span>
            </span>
            <button
              type="button"
              onClick={handlePrintSlip}
              disabled={cart.length === 0}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs font-bold text-[10px] cursor-pointer transition-all disabled:opacity-50"
              title="Print pre-bill check slip"
            >
              <Printer className="w-3 h-3 text-slate-600" />
              <span>Print Bill Slip</span>
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-100/80 flex items-center justify-center text-slate-400">
                <Receipt className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">Receipt is empty</p>
              <p className="text-[11px] text-slate-400 max-w-[180px]">
                Add products to the basket to see the live receipt template.
              </p>
            </div>
          ) : (
            <div className="scale-95 origin-top transition-transform pb-4">
              <ThermalReceiptPaper
                sale={draftSale}
                lines={draftLines}
                outlet={draftOutlet}
                cashier={cashier}
                formattedDate={new Date().toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
                hide_badge
              />
            </div>
          )}
        </div>
      ) : (
        /* Cart Line Items List */
        <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-100/80 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">Basket is empty</p>
              <p className="text-[11px] text-slate-400 max-w-[180px]">
                Tap products on the left or scan a barcode to start ringing.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {cart.map((item, idx) => (
                <motion.div
                  key={`${item.product_id}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: appleSpring }}
                  transition={appleSpring}
                  drag="x"
                  dragConstraints={{ left: -60, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -45) onRemoveItem(idx);
                  }}
                  className="p-2 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs flex items-center justify-between gap-2 group hover:bg-white transition-colors"
                >
                  <CartItemThumbnail item={item} />

                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono font-semibold">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(idx, -1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 active:scale-[0.92] text-slate-700 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-slate-900">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(idx, 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 active:scale-[0.92] text-slate-700 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right shrink-0 min-w-[50px]">
                    <span className="font-black text-xs text-slate-900 font-mono">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(idx)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Cart Footer: Discount, Totals & Checkout */}
      {cart.length > 0 && (
        <div className="p-3 border-t border-slate-200/70 bg-slate-50/60 backdrop-blur-sm shrink-0 space-y-2">
          {/* Collapsible Coupon Input */}
          {appliedCoupon ? (
            <div className="px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-extrabold">{appliedCoupon.code}</span>
                <span className="text-[10px] text-emerald-600">
                  (-${discountAmount.toFixed(2)})
                </span>
              </div>
              <button
                type="button"
                onClick={onRemoveCoupon}
                className="text-emerald-700 hover:text-rose-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : showCouponInput || couponError ? (
            <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Coupon code..."
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  autoFocus
                  className="w-full pl-8 pr-2 py-1 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={!couponInput.trim()}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.95] text-slate-800 border border-slate-200 font-extrabold text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCouponInput(false);
                  setCouponInput('');
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Cancel coupon"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : null}
          {couponError && (
            <p className="text-[10px] text-rose-600 font-medium">{couponError}</p>
          )}

          {/* Subtotal, Tax, and Grand Total */}
          <div className="space-y-1 text-xs text-slate-600 font-medium">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Subtotal</span>
                {!appliedCoupon && !showCouponInput && (
                  <button
                    type="button"
                    onClick={() => setShowCouponInput(true)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-200/70 hover:bg-slate-200 text-[10px] font-bold text-slate-600 transition-colors cursor-pointer"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    <span>+ Coupon</span>
                  </button>
                )}
              </div>
              <span className="font-bold text-slate-800 font-mono">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount</span>
                <span className="font-mono">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            {isTaxEnabled && (
              <div className="flex justify-between text-slate-500">
                <span>{taxLabel}</span>
                <span className="font-mono">${tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-200">
              <span>Grand Total</span>
              <span className="text-brand font-mono">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Primary Charge Button */}
          <motion.button
            whileHover={{ scale: 1.01, transition: appleSpring }}
            whileTap={{ scale: 0.98, transition: pressSpring }}
            type="button"
            disabled={isProcessing}
            onClick={() => onOpenCheckout('cash')}
            className="w-full py-2.5 rounded-2xl bg-brand hover:bg-brand-hover active:scale-[0.98] text-white font-black text-sm shadow-md shadow-brand/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>Charge ${grandTotal.toFixed(2)}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
