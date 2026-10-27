'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  PauseCircle,
  Plus,
  Minus,
  Banknote,
  QrCode,
  CreditCard,
  Tag,
  ArrowRight,
  X,
  Sparkles,
  Package,
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
}: PosCartPanelProps) {
  const [couponInput, setCouponInput] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? (subtotal * appliedCoupon.value) / 100
      : appliedCoupon.value
    : 0;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = taxableSubtotal * 0.1; // 10% VAT
  const grandTotal = taxableSubtotal + tax;

  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    onApplyCoupon(couponInput.trim());
    setCouponInput('');
  };

  return (
    <div className="bg-transparent border border-slate-300/80 rounded-2xl flex flex-col h-full overflow-hidden">
      {/* Cart Header */}
      <div className="p-4 border-b border-slate-300/60 flex items-center justify-between shrink-0 bg-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-bold shadow-xs shadow-brand/20">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-slate-900 leading-none">
              Current Order
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in basket
            </span>
          </div>
        </div>

        {cart.length > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenHoldModal}
              title="Hold this cart"
              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <PauseCircle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClearCart}
              title="Clear basket"
              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Cart Line Items List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-3 rounded-xl bg-transparent border border-slate-300/70 flex items-center justify-between gap-3 group hover:bg-slate-200/30 transition-colors"
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
                    className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-black text-slate-900">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQty(idx, 1)}
                    className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
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
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Cart Footer: Discount, Totals & Checkout */}
      {cart.length > 0 && (
        <div className="p-4 border-t border-slate-300/60 bg-transparent shrink-0 space-y-3">
          {/* Coupon Input */}
          {appliedCoupon ? (
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
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
                className="text-emerald-700 hover:text-rose-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Coupon code..."
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="w-full pl-8 pr-2 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={!couponInput.trim()}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-extrabold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                Apply
              </button>
            </form>
          )}
          {couponError && (
            <p className="text-[10px] text-rose-600 font-medium">{couponError}</p>
          )}

          {/* Subtotal, Tax, and Grand Total */}
          <div className="space-y-1.5 text-xs text-slate-600 font-medium">
            <div className="flex justify-between">
              <span>Subtotal</span>
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
            <div className="flex justify-between text-slate-500">
              <span>VAT Tax (10%)</span>
              <span className="font-mono">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-1.5 border-t border-slate-200">
              <span>Grand Total</span>
              <span className="text-brand font-mono">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Direct Tender Triggers */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onOpenCheckout('cash')}
              className="py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cash</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenCheckout('khqr')}
              className="py-2 rounded-xl bg-brand-subtle hover:bg-brand/10 border border-brand/20 text-brand text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-brand" />
              <span>KHQR</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenCheckout('card')}
              className="py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Card</span>
            </button>
          </div>

          {/* Primary Charge Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={isProcessing}
            onClick={() => onOpenCheckout('cash')}
            className="w-full py-3 rounded-2xl bg-brand hover:bg-brand-hover text-white font-black text-sm shadow-md shadow-brand/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>Charge ${grandTotal.toFixed(2)}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
