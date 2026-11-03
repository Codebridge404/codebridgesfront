'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, Store, Truck, QrCode } from 'lucide-react';
import { ShopProduct } from './ShopProductGrid';

export interface CartItem {
  product: ShopProduct;
  quantity: number;
}

interface ShopCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  deliveryType: 'pickup' | 'delivery';
  setDeliveryType: (type: 'pickup' | 'delivery') => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  taxLabel?: string;
  isTaxEnabled?: boolean;
  grandTotal: number;
  isSubmitting: boolean;
  onSubmitCheckout: (e: React.FormEvent) => void;
}

export const ShopCartDrawer: React.FC<ShopCartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  deliveryType,
  setDeliveryType,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  deliveryAddress,
  setDeliveryAddress,
  subtotal,
  deliveryFee,
  taxAmount,
  taxLabel = "Tax",
  isTaxEnabled = true,
  grandTotal,
  isSubmitting,
  onSubmitCheckout,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand" />
                <h2 className="font-bold text-sm text-white">Your Shopping Cart</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items & Customer Form */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {/* Cart Items List */}
              {cart.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-xs font-semibold">Your cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 bg-slate-850 border border-slate-800 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-xs text-white">{item.product.name}</p>
                        <p className="text-[11px] text-slate-400">
                          ${item.product.price.toFixed(2)} x {item.quantity} = $
                          {(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg p-1">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded-md bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded-md bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Fulfillment Selection & Form */}
              {cart.length > 0 && (
                <form onSubmit={onSubmitCheckout} className="space-y-4 pt-4 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                      Fulfillment Option
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('pickup')}
                        className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          deliveryType === 'pickup'
                            ? 'bg-brand text-white shadow-xs shadow-brand/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Store className="w-4 h-4" /> Store Pickup
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryType('delivery')}
                        className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          deliveryType === 'delivery'
                            ? 'bg-brand text-white shadow-xs shadow-brand/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Truck className="w-4 h-4" /> Delivery (+$1.50)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter full name..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="012 345 6789..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    />
                  </div>

                  {deliveryType === 'delivery' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Delivery Address *
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Street, House No, Phnom Penh..."
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                      />
                    </div>
                  )}

                  {/* Summary Totals */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {isTaxEnabled && (
                      <div className="flex justify-between text-slate-400">
                        <span>{taxLabel}:</span>
                        <span>${taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span>Delivery Fee:</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-800 pt-1.5 flex justify-between font-extrabold text-sm text-white">
                      <span>Total Due:</span>
                      <span className="text-brand">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    Pay ${grandTotal.toFixed(2)} via Bakong KHQR
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
