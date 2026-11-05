/**
 * Author: Antigravity Team
 * Date: 2026-11-05
 * Task: BD-0141
 */

'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Copy,
  Check,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';

export interface UserDetailModalProps {
  user: any | null;
  onClose: () => void;
  onEdit?: (user: any) => void;
  onResetPassword?: (user: any) => void;
  onToggleStatus?: (user: any) => void;
  tenantName?: string;
  readOnly?: boolean;
}

export function UserDetailModal({
  user,
  onClose,
  onEdit,
  onResetPassword,
  onToggleStatus,
  tenantName,
  readOnly = false,
}: UserDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user || !mounted) return null;

  const isActive =
    user.is_active === 1 ||
    user.is_active === true ||
    user.status === 'active' ||
    user.status === 1;

  const displayName =
    user.name ||
    [user.first_name, user.last_name].filter(Boolean).join(' ') ||
    'Unnamed User';

  const avatarUrl =
    user.avatar_url ||
    user.avatar ||
    user.photo_url ||
    user.logo_url ||
    user.image ||
    null;

  const orgTitle =
    tenantName ||
    user.tenant_name ||
    user.company_name ||
    user.organization_name ||
    (user.tenant_id ? `Organization #${user.tenant_id}` : 'CodeBridges Platform (Root)');

  const roleName = (user.role_name || user.role || 'employee').replace(/_/g, ' ');

  const handleCopy = (text: string, key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const hasWriteActions = !readOnly && (Boolean(onEdit) || Boolean(onResetPassword) || Boolean(onToggleStatus));

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
        className="w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden font-sans my-8 relative z-10"
      >
        {/* Header with Avatar & Identity */}
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
            <div className="relative w-16 h-16 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md text-white font-black text-xl flex items-center justify-center shadow-inner uppercase overflow-hidden shrink-0 select-none">
              <span>{displayName.slice(0, 2).toUpperCase()}</span>
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-black tracking-tight truncate">{displayName}</h3>
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

              <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-300 font-mono">
                <span>User ID: #{user.id}</span>
                {user.uuid && <span>· {user.uuid.slice(0, 8)}...</span>}
                <button
                  type="button"
                  onClick={(e) => handleCopy(String(user.uuid || user.id), 'id', e)}
                  className="p-1 rounded-md hover:bg-white/10 text-slate-300 transition-colors"
                  title="Copy User ID"
                >
                  {copiedKey === 'id' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Email */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand" />
                  Email Address
                </span>
                {user.email && (
                  <button
                    type="button"
                    onClick={(e) => handleCopy(user.email, 'email', e)}
                    className="p-1 rounded-md hover:bg-slate-200 text-slate-400 transition-colors"
                    title="Copy Email"
                  >
                    {copiedKey === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
              <p className="font-bold text-slate-900 font-mono break-all">{user.email || '—'}</p>
            </div>

            {/* Phone */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand" />
                  Phone Number
                </span>
                {user.phone && (
                  <button
                    type="button"
                    onClick={(e) => handleCopy(user.phone, 'phone', e)}
                    className="p-1 rounded-md hover:bg-slate-200 text-slate-400 transition-colors"
                    title="Copy Phone"
                  >
                    {copiedKey === 'phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
              <p className="font-bold text-slate-900">{user.phone || 'Not configured'}</p>
            </div>

            {/* Role */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-brand" />
                Assigned RBAC Role
              </span>
              <p className="font-extrabold text-slate-900 capitalize">
                {roleName}
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
              <p className="font-bold text-slate-900 truncate">{orgTitle}</p>
            </div>

            {/* Assigned Outlet */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-brand" />
                Store Outlet Branch
              </span>
              <p className="font-bold text-slate-900 truncate">{user.outlet_name || 'All Outlets / Global'}</p>
            </div>

            {/* Designation / Department if HRM */}
            {(user.designation || user.department_name || user.department) && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-brand" />
                  Department &amp; Title
                </span>
                <p className="font-bold text-slate-900 truncate">
                  {user.designation || 'Staff'} {user.department_name ? `(${user.department_name})` : ''}
                </p>
              </div>
            )}

            {/* Employment Type & Salary if available */}
            {user.employment_type && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand" />
                  Employment Type
                </span>
                <p className="font-bold text-slate-900">
                  {user.employment_type} {user.salary ? `· $${user.salary}/mo` : ''}
                </p>
              </div>
            )}

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
            {hasWriteActions ? (
              <>
                {onToggleStatus && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onToggleStatus(user);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      isActive
                        ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {isActive ? 'Suspend User' : 'Activate User'}
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  {onResetPassword && (
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
                  )}

                  {onEdit && (
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
                  )}
                </div>
              </>
            ) : (
              <div className="w-full flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand" />
                  Read-Only Profile View
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

export { UserDetailModal as UserProfileModal };
