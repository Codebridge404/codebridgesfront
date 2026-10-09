'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PauseCircle, PlayCircle, Trash2, User, Clock, ShoppingBag } from 'lucide-react';
import { HeldCart } from '../types';

interface PosHeldOrdersListProps {
  heldCarts: HeldCart[];
  onResumeCart: (cartId: string | number) => void;
  onDeleteCart: (cartId: string | number) => void;
}

export function PosHeldOrdersList({
  heldCarts,
  onResumeCart,
  onDeleteCart,
}: PosHeldOrdersListProps) {
  if (!heldCarts || heldCarts.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 flex flex-col items-center justify-center text-center text-slate-400 py-10 space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200/60">
          <PauseCircle className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold text-slate-700">No Held Orders</p>
        <p className="text-[11px] text-slate-400 max-w-xs">
          Suspended customer orders will appear here for fast recall and checkout.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <PauseCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">Held &amp; Suspended Carts</h4>
            <p className="text-[11px] text-slate-400 font-medium">
              {heldCarts.length} customer carts on hold
            </p>
          </div>
        </div>

        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          Ready to Resume
        </span>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        <AnimatePresence>
          {heldCarts.map((c) => {
            const itemsCount = c.items?.reduce((a, b) => a + (b.qty || 1), 0) || c.items?.length || 0;
            const cartTotal =
              c.total_amount ||
              c.items?.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0) ||
              0;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3.5 rounded-2xl bg-slate-200/40 border border-slate-300/60 hover:border-amber-400 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-200/60 border border-slate-300/60 text-slate-700 flex items-center justify-center shrink-0 font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs text-slate-900 truncate">
                      {c.customer_name || 'Walk-in Customer'}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{itemsCount} items</span>
                      <span>•</span>
                      <span className="font-bold text-brand">${Number(cartTotal).toFixed(2)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onResumeCart(c.id)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Resume</span>
                  </button>
                  <button
                    onClick={() => onDeleteCart(c.id)}
                    title="Discard Cart"
                    className="p-1.5 rounded-xl bg-transparent hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-300/60 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
