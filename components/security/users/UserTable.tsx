'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Users,
  Shield,
  Lock,
  Building2,
  KeyRound,
  Edit3,
  UserX,
  Phone,
  Store,
  Calendar,
  Check,
  Copy,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  CheckCircle2,
  Ban,
  Trash2,
} from 'lucide-react';

interface UserTableProps {
  users: any[];
  loading: boolean;
  onViewUser: (user: any) => void;
  onResetPassword: (user: any) => void;
  onEditUser: (user: any) => void;
  onToggleStatus: (user: any) => void;
  onDeleteUser: (id: number | string, name: string) => void;
  tenantMap?: Map<string, string>;
}

export function UserTable({
  users,
  loading,
  onViewUser,
  onResetPassword,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
  tenantMap,
}: UserTableProps) {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopyEmail = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-brand-subtle text-brand border-brand/20';
      case 'organization':
      case 'admin':
      case 'administrator':
      case 'owner':
        return 'bg-brand-subtle text-brand border-brand/20';
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

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: Math.min(i * 0.02, 0.3), duration: 0.25, ease: 'easeOut' as const },
    }),
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden flex flex-col font-sans">
      {/* Scroll Helper / Controls Subheader */}
      <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-800">{users.length} Total Users</span>
          <span className="text-slate-300">|</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            User Name, Email &amp; Master Actions are pinned
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-brand font-bold">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Scroll horizontally for full user telemetry</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 font-medium space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin mx-auto" />
          <p>Querying live user records across microservices...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="p-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-subtle text-brand flex items-center justify-center mx-auto mb-1">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-900 font-extrabold">No user accounts found</p>
          <p className="text-xs text-slate-500 font-medium">Try adjusting your search query, role filter, or organization scope.</p>
        </div>
      ) : (
        /* Horizontal Scroll Viewport */
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
          <table className="w-full text-left text-xs border-collapse min-w-[1360px]">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200/90 select-none">
              <tr>
                {/* 1. PINNED COLUMN 1: User Name */}
                <th
                  scope="col"
                  className="sticky left-0 z-30 bg-slate-50 w-[200px] min-w-[200px] max-w-[200px] px-4 py-3.5 border-r border-slate-200/80 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"
                >
                  User Account &amp; Identity
                </th>

                {/* 2. PINNED COLUMN 2: Email Address */}
                <th
                  scope="col"
                  className="sticky left-[200px] z-30 bg-slate-50 w-[220px] min-w-[220px] max-w-[220px] px-4 py-3.5 border-r border-slate-200/80"
                >
                  Email Address
                </th>

                {/* 3. PINNED COLUMN 3: Master Actions (stay right after email) */}
                <th
                  scope="col"
                  className="sticky left-[420px] z-30 bg-slate-50 w-[160px] min-w-[160px] max-w-[160px] px-3.5 py-3.5 text-center border-r border-slate-200 shadow-[4px_0_10px_-3px_rgba(0,0,0,0.08)]"
                >
                  Master Actions
                </th>

                {/* 4. SCROLLABLE: Phone */}
                <th scope="col" className="px-5 py-3.5 min-w-[150px]">
                  Phone Contact
                </th>

                {/* 5. SCROLLABLE: Role */}
                <th scope="col" className="px-5 py-3.5 min-w-[170px]">
                  Assigned Role (RBAC)
                </th>

                {/* 6. SCROLLABLE: Organization / Tenant */}
                <th scope="col" className="px-5 py-3.5 min-w-[190px]">
                  Organization / Tenant
                </th>

                {/* 7. SCROLLABLE: Assigned Outlet */}
                <th scope="col" className="px-5 py-3.5 min-w-[160px]">
                  Store Outlet
                </th>

                {/* 8. SCROLLABLE: POS PIN Code */}
                <th scope="col" className="px-5 py-3.5 min-w-[130px]">
                  POS PIN
                </th>

                {/* 9. SCROLLABLE: Account Status */}
                <th scope="col" className="px-5 py-3.5 min-w-[140px]">
                  Status
                </th>

                {/* 10. SCROLLABLE: Registered Date */}
                <th scope="col" className="px-5 py-3.5 min-w-[150px]">
                  Registered At
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
              {users.map((user, idx) => {
                const isActive = user.is_active === 1 || user.is_active === true;
                const orgName =
                  user.tenant_name ||
                  (tenantMap && user.tenant_id ? tenantMap.get(String(user.tenant_id)) : null) ||
                  (user.tenant_id ? `Organization #${user.tenant_id}` : 'CodeBridges Platform (Root)');

                return (
                  <motion.tr
                    key={user.id ? `user-row-${user.id}` : idx}
                    custom={idx}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="hover:bg-slate-50/90 transition-colors group cursor-pointer"
                    onClick={() => onViewUser(user)}
                  >
                    {/* 1. PINNED COLUMN 1: User Name */}
                    <td className="sticky left-0 z-20 bg-white group-hover:bg-slate-50 w-[200px] min-w-[200px] max-w-[200px] px-4 py-3.5 border-r border-slate-200/80 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand to-brand-hover text-white font-black flex items-center justify-center text-xs shrink-0 shadow-2xs uppercase">
                          {user.name ? user.name.substring(0, 2) : 'US'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-slate-900 text-xs truncate group-hover:text-brand transition-colors">
                            {user.name || 'Unnamed User'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            ID #{user.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 2. PINNED COLUMN 2: Email Address */}
                    <td className="sticky left-[200px] z-20 bg-white group-hover:bg-slate-50 w-[220px] min-w-[220px] max-w-[220px] px-4 py-3.5 border-r border-slate-200/80 transition-colors">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-mono text-[11px] text-slate-600 truncate">
                          {user.email || '—'}
                        </span>
                        {user.email && (
                          <button
                            type="button"
                            onClick={(e) => handleCopyEmail(user.email, e)}
                            className="p-1 rounded-md text-slate-400 hover:text-brand hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                            title="Copy email address"
                          >
                            {copiedEmail === user.email ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* 3. PINNED COLUMN 3: Master Actions (stay right after email) */}
                    <td
                      className="sticky left-[420px] z-20 bg-white group-hover:bg-slate-50 w-[160px] min-w-[160px] max-w-[160px] px-3.5 py-3.5 text-center border-r border-slate-200 shadow-[4px_0_10px_-3px_rgba(0,0,0,0.08)] transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => onViewUser(user)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View Complete User Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Reset Password */}
                        <button
                          type="button"
                          onClick={() => onResetPassword(user)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-brand-subtle transition-colors cursor-pointer"
                          title="Reset Master Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Edit User */}
                        <button
                          type="button"
                          onClick={() => onEditUser(user)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-brand-subtle transition-colors cursor-pointer"
                          title="Edit User Details & Roles"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete User */}
                        <button
                          type="button"
                          onClick={() => onDeleteUser(user.id, user.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete / Deactivate User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    {/* 4. SCROLLABLE: Phone Contact */}
                    <td className="px-5 py-3.5 min-w-[150px] text-slate-600">
                      {user.phone ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-xs text-slate-700">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{user.phone}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    {/* 5. SCROLLABLE: Role (RBAC) */}
                    <td className="px-5 py-3.5 min-w-[170px]">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border tracking-wider shadow-2xs ${getRoleBadgeStyle(
                          user.role
                        )}`}
                      >
                        <Shield className="w-3 h-3" />
                        <span className="truncate max-w-[130px]">
                          {user.role_name || (user.role || 'employee').replace(/_/g, ' ')}
                        </span>
                      </span>
                    </td>

                    {/* 6. SCROLLABLE: Organization / Tenant */}
                    <td className="px-5 py-3.5 min-w-[190px]">
                      <div className="flex items-center gap-1.5 text-xs text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-brand shrink-0" />
                        <span className="font-bold truncate max-w-[150px]">{orgName}</span>
                      </div>
                    </td>

                    {/* 7. SCROLLABLE: Store Outlet */}
                    <td className="px-5 py-3.5 min-w-[160px] text-slate-600">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                        <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[130px]">{user.outlet_name || 'All Outlets'}</span>
                      </span>
                    </td>

                    {/* 8. SCROLLABLE: POS PIN Code */}
                    <td className="px-5 py-3.5 min-w-[130px]">
                      {user.pin_code ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] font-mono">
                          <Lock className="w-3 h-3 text-brand" />
                          <span>PIN Set</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">None</span>
                      )}
                    </td>

                    {/* 9. SCROLLABLE: Status with Quick Toggle */}
                    <td
                      className="px-5 py-3.5 min-w-[140px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onToggleStatus(user)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                        title={isActive ? 'Click to Suspend Account' : 'Click to Activate Account'}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                          }`}
                        />
                        <span>{isActive ? 'Active' : 'Suspended'}</span>
                      </button>
                    </td>

                    {/* 10. SCROLLABLE: Registration Date */}
                    <td className="px-5 py-3.5 min-w-[150px] text-slate-500 text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </span>
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
