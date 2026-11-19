/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PauseCircle, X, PlayCircle, Trash2 } from 'lucide-react';
import { CartItem } from '../types';
import { Portal } from '@/components/ui/Portal';

interface PosHoldCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  heldCarts: any[];
  onConfirmHold: (customerName: string) => Promise<void>;
  onResumeCart: (cartId: string) => Promise<void>;
  onDeleteHeldCart: (cartId: string) => Promise<void>;
}

export function PosHoldCartModal({
  isOpen,
  onClose,
  cart,
  heldCarts,
  onConfirmHold,
  onResumeCart,
  onDeleteHeldCart,
}: PosHoldCartModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleHold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    try {
      setIsProcessing(true);
      await onConfirmHold(customerName.trim() || 'Walk-in Guest');
      setCustomerName('');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to hold cart');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Portal><AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] cb-modal-backdrop flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/90 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                <PauseCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 leading-tight">
                  Held Orders & Suspended Carts
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Park current basket or resume previous customer order
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Park Current Active Cart Section */}
          {cart.length > 0 && (
            <form onSubmit={handleHold} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-amber-900">
                <span>Hold Current Basket</span>
                <span>{cart.length} items</span>
              </div>
              <input
                type="text"
                placeholder="Customer name or Table # (e.g. John / Table 4)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {isProcessing ? 'Parking Cart...' : 'Park Active Order'}
              </button>
            </form>
          )}

          {/* List of Previously Held Carts */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Parked Orders ({heldCarts.length})
            </h4>

            {heldCarts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-100">
                No orders currently on hold.
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2 custom-scrollbar">
                {heldCarts.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-extrabold text-xs text-slate-900 truncate">
                        {item.customer_name || 'Held Cart'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {item.items_count || (item.cart_data ? JSON.parse(item.cart_data).length : 0)} items •{' '}
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onResumeCart(item.id);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <PlayCircle className="w-3 h-3" />
                        <span>Resume</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteHeldCart(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence></Portal>
  );
}
