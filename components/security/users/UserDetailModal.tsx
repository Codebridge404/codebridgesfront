'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  Building2,
  Store,
  KeyRound,
  Calendar,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Edit3,
} from 'lucide-react';

interface UserDetailModalProps {
  user: any | null;
  onClose: () => void;
  onEdit: (user: any) => void;
  onResetPassword: (user: any) => void;
  onToggleStatus: (user: any) => void;
  tenantName?: string;
}

export function UserDetailModal({
  user,
  onClose,
  onEdit,
  onResetPassword,
  onToggleStatus,
  tenantName,
}: UserDetailModalProps) {
  if (!user) return null;

  const isActive = user.is_active === 1 || user.is_active === true;
  const orgTitle = tenantName || user.tenant_name || (user.tenant_id ? `Organization #${user.tenant_id}` : 'CodeBridges Platform (Root)');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-hover p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md text-white font-black text-xl flex items-center justify-center shadow-inner uppercase">
              {user.name ? user.name.substring(0, 2) : 'US'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-black tracking-tight">{user.name}</h3>
                {isActive ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active Account
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-400/30 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Suspended
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">User ID: #{user.id} {user.uuid ? `· ${user.uuid.slice(0, 8)}...` : ''}</p>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand" />
                Email Address
              </span>
              <p className="font-bold text-slate-900 font-mono break-all">{user.email || '—'}</p>
            </div>

            {/* Phone */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-brand" />
                Phone Number
              </span>
              <p className="font-bold text-slate-900">{user.phone || 'Not configured'}</p>
            </div>

            {/* Role */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-brand" />
                Assigned RBAC Role
              </span>
              <p className="font-extrabold text-slate-900 capitalize">
                {(user.role_name || user.role || 'employee').replace(/_/g, ' ')}
              </p>
            </div>

            {/* POS PIN */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brand" />
                POS 4-Digit PIN
              </span>
              <p className="font-bold text-slate-900 font-mono">
                {user.pin_code ? '•••• (PIN Configured)' : 'No POS PIN Set'}
              </p>
            </div>

            {/* Organization / Tenant */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand" />
                Tenant Workspace
              </span>
              <p className="font-bold text-slate-900">{orgTitle}</p>
            </div>

            {/* Assigned Outlet */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-brand" />
                Store Outlet
              </span>
              <p className="font-bold text-slate-900">{user.outlet_name || 'All Outlets / Global'}</p>
            </div>

            {/* Registration Date */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand" />
                Account Created
              </span>
              <p className="font-bold text-slate-900">
                {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
              </p>
            </div>

            {/* Security Status */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
                Account State
              </span>
              <p className={`font-bold ${isActive ? 'text-emerald-700' : 'text-rose-600'}`}>
                {isActive ? 'Active & Ready for Sign-in' : 'Suspended (Access Revoked)'}
              </p>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                onClose();
                onToggleStatus(user);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isActive
                  ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              {isActive ? 'Suspend User' : 'Activate User'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onResetPassword(user);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-brand" />
                <span>Reset Password</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
                className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand/20 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Account</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

