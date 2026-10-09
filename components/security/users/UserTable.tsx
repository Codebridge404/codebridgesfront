'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Users,
  Shield,
  Lock,
  Building2,
  KeyRound,
  Edit3,
  UserX,
} from 'lucide-react';

interface UserTableProps {
  users: any[];
  loading: boolean;
  onResetPassword: (user: any) => void;
  onEditUser: (user: any) => void;
  onDeactivateUser: (id: number | string, name: string) => void;
}

export function UserTable({
  users,
  loading,
  onResetPassword,
  onEditUser,
  onDeactivateUser,
}: UserTableProps) {
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
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.04, duration: 0.3, ease: 'easeOut' as const },
    }),
  };

  return (
    <div className="rounded-2xl bg-transparent border border-slate-300/80 overflow-hidden">
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-medium">
          Loading user profiles...
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-subtle text-brand flex items-center justify-center mx-auto mb-1">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-900 font-extrabold">No user accounts found</p>
          <p className="text-xs text-slate-500 font-medium">Configure and register team members to populate RBAC staff accounts.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs bg-transparent">
            <thead className="bg-transparent border-b border-slate-300/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4">User Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Assigned Role (RBAC)</th>
                <th className="py-3.5 px-4">PIN Code</th>
                <th className="py-3.5 px-4">Outlet</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300/60 font-medium text-slate-700 bg-transparent">
              {users.map((user, idx) => (
                <motion.tr
                  key={user.id}
                  custom={idx}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  className="hover:bg-slate-200/40 transition-colors"
                >
                  {/* Name + Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand to-brand-hover text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs uppercase">
                        {user.name ? user.name.substring(0, 2) : 'US'}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ID #{user.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                    {user.email}
                  </td>

                  {/* Role Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border tracking-wider ${getRoleBadgeStyle(
                        user.role
                      )}`}
                    >
                      <Shield className="w-3 h-3" />
                      {user.role_name || (user.role || 'employee').replace(/_/g, ' ')}
                    </span>
                  </td>

                  {/* PIN Code */}
                  <td className="py-3.5 px-4 font-mono text-xs">
                    {user.pin_code ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/50 border border-slate-300/60 text-slate-700 font-bold text-[10px]">
                        <Lock className="w-3 h-3 text-brand" />
                        PIN Set
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">No PIN</span>
                    )}
                  </td>

                  {/* Outlet */}
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {user.outlet_name || 'All Outlets'}
                    </span>
                  </td>

                  {/* Active Status */}
                  <td className="py-3.5 px-4">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onResetPassword(user)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-brand-subtle transition-colors cursor-pointer"
                        title="Reset Password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditUser(user)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-brand-subtle transition-colors cursor-pointer"
                        title="Edit User Role / Details / PIN"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {user.is_active && (
                        <button
                          onClick={() => onDeactivateUser(user.id, user.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Deactivate Account"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
