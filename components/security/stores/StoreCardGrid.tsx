'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Building2, Phone, MapPin, Monitor, Users, Power, Edit3 } from 'lucide-react';

interface StoreCardGridProps {
  stores: any[];
  loading: boolean;
  onToggleActive: (store: any) => void;
  onEdit: (store: any) => void;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: 'easeOut' as const },
  }),
};

export const StoreCardGrid: React.FC<StoreCardGridProps> = ({
  stores,
  loading,
  onToggleActive,
  onEdit,
}) => {
  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 font-medium">
        Loading store outlets...
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="p-12 text-center space-y-3 bg-transparent rounded-2xl border border-slate-300/80">
        <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">No store outlets registered yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stores.map((st, idx) => (
        <motion.div
          key={st.id}
          custom={idx}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className={`p-5 rounded-2xl bg-transparent border transition-all flex flex-col justify-between space-y-4 ${
            st.is_active ? 'border-slate-300/80 hover:border-slate-400' : 'border-slate-300/60 opacity-60'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{st.name}</h3>
                <p className="font-mono text-[10px] text-slate-400 mt-0.5">{st.code}</p>
              </div>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  st.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200/50 text-slate-600 border border-slate-300/60'
                }`}
              >
                {st.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 font-medium">
              {st.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{st.phone}</span>
                </p>
              )}
              {st.address && (
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{st.address}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-300/60 text-xs">
              <div className="flex items-center gap-2 bg-slate-200/40 border border-slate-300/60 p-2 rounded-xl">
                <Monitor className="w-4 h-4 text-brand" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Registers</p>
                  <p className="font-mono font-bold text-slate-800">{st.registers_count || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-200/40 border border-slate-300/60 p-2 rounded-xl">
                <Users className="w-4 h-4 text-brand" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Staff</p>
                  <p className="font-mono font-bold text-slate-800">{st.staff_count || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-300/60 flex items-center justify-between">
            <button
              onClick={() => onToggleActive(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                st.is_active ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50' : 'text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {st.is_active ? 'Deactivate' : 'Activate'}
            </button>

            <button
              onClick={() => onEdit(st)}
              className="px-3 py-1 rounded-lg bg-slate-200/50 hover:bg-slate-200 border border-slate-300/60 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
