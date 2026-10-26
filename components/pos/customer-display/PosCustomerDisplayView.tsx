'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  Maximize2,
  Minimize2,
  Monitor,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { getPersistentCart } from '@/lib/offlineStore';
import { CfdItemsList } from './CfdItemsList';
import { CfdPaymentCard } from './CfdPaymentCard';

export function PosCustomerDisplayView() {
  const [cart, setCart] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Restore cart on initial mount
  useEffect(() => {
    getPersistentCart().then((saved) => {
      if (saved && Array.isArray(saved.items)) {
        setCart(saved.items);
      }
    });

    // Listen to live BroadcastChannel from POS Terminal
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('cb_pos_cart_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'CART_UPDATED') {
          setCart(event.data.cart || []);
          setAppliedCoupon(event.data.appliedCoupon || null);
        }
      };

      const handleFullscreenChange = () => {
        setIsFullscreen(Boolean(document.fullscreenElement));
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);

      return () => {
        channel.close();
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
      };
    }
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen request declined:', err);
    }
  };

  const formattedItems = cart.map((i) => ({
    name: i.name || i.product?.name || 'Item',
    qty: Number(i.qty || 1),
    price: Number(i.price || 0),
    subtotal: Number(i.price || 0) * Number(i.qty || 1),
  }));

  const subtotal = formattedItems.reduce((acc, item) => acc + item.subtotal, 0);
  const discount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? (subtotal * appliedCoupon.value) / 100
      : appliedCoupon.value
    : 0;
  const tax = Math.max(0, subtotal - discount) * 0.1;
  const grandTotal = Math.max(0, subtotal - discount) + tax;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col justify-between p-6 sm:p-8 select-none">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-slate-800/90 border border-slate-700/80 p-5 rounded-3xl shadow-lg backdrop-blur-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center shadow-md shadow-brand/30">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>CodeBridges Cloud POS</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand/20 text-brand-subtle border border-brand/40">
                Customer Display
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Live shopper bill projection &bull; Real-time dynamic KHQR settlement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="px-3.5 py-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Toggle fullscreen kiosk display"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Kiosk' : 'Fullscreen Kiosk'}</span>
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>TERMINAL SYNCED</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.opener) {
                window.close();
              } else {
                window.location.href = '/pos/settings?tab=terminals';
              }
            }}
            className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl border border-slate-700 hover:bg-rose-900/40 hover:border-rose-500/50 hover:text-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Close Customer-Facing Display"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close CFD</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {cart.length === 0 ? (
        <div className="my-auto py-16 text-center max-w-xl mx-auto space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Welcome to CodeBridges</h2>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            Please place your items on the counter. Your itemized receipt and Bakong KHQR dynamic payment code will project right here as items are scanned.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider">
            <Monitor className="w-4 h-4 text-brand" />
            <span>Secondary Display Kiosk Active</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-auto py-6">
          <CfdItemsList cart={formattedItems} />
          <CfdPaymentCard subtotal={subtotal} tax={tax} grandTotal={grandTotal} />
        </div>
      )}

      {/* Footer Branding */}
      <div className="text-center text-xs text-slate-500 font-medium border-t border-slate-800 pt-4 flex items-center justify-between">
        <span>Powered by CodeBridges Enterprise Cloud ERP</span>
        <span>Secure NBC Bakong &amp; EMV KHQR Verified</span>
      </div>
    </div>
  );
}
