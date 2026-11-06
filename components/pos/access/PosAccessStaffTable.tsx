/**
 * Author: Antigravity Team
 * Date: 2026-11-05
 * Task: BD-0141
 */

'use client';

import React, { useState } from 'react';
import { Users, Check, AlertCircle, KeyRound, Lock, ShieldCheck, Eye } from 'lucide-react';
import { UserDetailModal } from '@/components/security/users/UserDetailModal';
import { resolveMediaUrl } from '@/lib/mediaUtils';

interface StaffUser {
  id: string | number;
  name: string;
  email: string;
  role: string;
  pin_code?: string;
  has_pin?: boolean;
  avatar_url?: string;
  avatar?: string;
  outlet_name?: string;
}

interface PosAccessStaffTableProps {
  users: StaffUser[];
  staffPermissions: { [userId: string]: any };
  onTogglePermission: (userId: number | string, key: string) => void;
  onOpenPinModal: (staff: StaffUser) => void;
}

export function PosAccessStaffTable({
  users,
  staffPermissions,
  onTogglePermission,
  onOpenPinModal,
}: PosAccessStaffTableProps) {
  const [viewingStaff, setViewingStaff] = useState<StaffUser | null>(null);
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-4 h-4 text-brand" />
          <span>Active Register Operators ({users.length})</span>
        </h3>
        <span className="text-[10px] font-bold text-slate-400">Click &quot;Set PIN&quot; to configure register access</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase bg-slate-50/50">
              <th className="py-3 px-4">Operator</th>
              <th className="py-3 px-2 text-center">4-Digit PIN</th>
              <th className="py-3 px-2 text-center">Void Items</th>
              <th className="py-3 px-2 text-center">Refunds</th>
              <th className="py-3 px-2 text-center">Discounts</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                  No frontline POS operators (Cashier, Supervisor, Store Manager) found.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const perms = staffPermissions[u.id] || {};
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name & Role */}
                    <td className="py-3.5 px-4">
                      <div
                        className="flex items-center gap-3 cursor-pointer group/op"
                        onClick={() => setViewingStaff(u)}
                        title="Click to view operator profile"
                      >
                        <div className="relative w-8 h-8 rounded-xl bg-brand text-white font-black text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none">
                          <span>{u.name ? u.name.slice(0, 2).toUpperCase() : 'OP'}</span>
                          {resolveMediaUrl(u.avatar_url || u.avatar) && (
                            <img
                              src={resolveMediaUrl(u.avatar_url || u.avatar)!}
                              alt={u.name}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 group-hover/op:text-brand group-hover/op:underline transition-colors">{u.name}</p>
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                            {u.role ? u.role.replace('_', ' ') : 'Staff'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 4-Digit PIN Status */}
                    <td className="py-3.5 px-2 text-center">
                      {perms.hasPin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold">
                          <AlertCircle className="w-3 h-3" />
                          <span>Not Set</span>
                        </span>
                      )}
                    </td>

                    {/* Void Items Toggle */}
                    <td className="py-3.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => onTogglePermission(u.id, 'canVoidLine')}
                        className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer ${
                          perms.canVoidLine ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    {/* Refunds Toggle */}
                    <td className="py-3.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => onTogglePermission(u.id, 'canApproveRefund')}
                        className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer ${
                          perms.canApproveRefund ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    {/* Discounts Toggle */}
                    <td className="py-3.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => onTogglePermission(u.id, 'canManualDiscount')}
                        className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer ${
                          perms.canManualDiscount ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    {/* Action: Profile & Set / Reset PIN */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingStaff(u)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-brand hover:border-brand/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer bg-slate-50 hover:bg-white"
                          title="Display Operator Profile"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand" />
                          <span>Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenPinModal(u)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-brand" />
                          <span>{perms.hasPin ? 'Change PIN' : 'Set PIN'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Operator Profile Modal */}
      {viewingStaff && (
        <UserDetailModal
          user={viewingStaff}
          onClose={() => setViewingStaff(null)}
          readOnly
        />
      )}
    </div>
  );
}
