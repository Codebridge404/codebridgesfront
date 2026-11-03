'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Grid, X, Check } from 'lucide-react';

interface PermissionsMatrixModalProps {
  isOpen: boolean;
  permissionsMatrix: any | null;
  onClose: () => void;
}

export function PermissionsMatrixModal({
  isOpen,
  permissionsMatrix,
  onClose,
}: PermissionsMatrixModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !permissionsMatrix || !mounted) return null;

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-brand-subtle text-brand border-brand/30';
      case 'organization':
      case 'admin':
      case 'administrator':
      case 'owner':
        return 'bg-brand-subtle text-brand-dark border-brand/30';
      case 'outlet_manager':
      case 'manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'supervisor':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'cashier':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'inventory_clerk':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'accountant':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'meeting_organizer':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'employee':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-4xl rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-5 font-sans my-8 relative z-10"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-subtle text-brand flex items-center justify-center">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">RBAC Permissions Matrix</h3>
              <p className="text-xs text-slate-400">System capabilities mapped against assigned platform roles</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto max-h-[60vh] scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="p-3 font-extrabold text-slate-900 sticky left-0 bg-slate-50 z-10">Role Definition</th>
                <th className="p-3 font-extrabold text-slate-900">System Code</th>
                <th className="p-3 font-extrabold text-slate-900">Assigned Capabilities &amp; Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(permissionsMatrix).map(([roleKey, data]: [string, any]) => (
                <tr key={roleKey} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 font-extrabold text-slate-900 whitespace-nowrap sticky left-0 bg-white hover:bg-slate-50/60 z-10">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize inline-block ${getRoleBadgeStyle(roleKey)}`}>
                      {data.name || roleKey}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{roleKey}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5 max-w-xl">
                      {Array.isArray(data.capabilities) && data.capabilities.length > 0 ? (
                        data.capabilities.map((cap: string) => (
                          <span
                            key={cap}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200/80"
                          >
                            <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            {cap}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No specific capabilities assigned</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
          >
            Close Matrix
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
