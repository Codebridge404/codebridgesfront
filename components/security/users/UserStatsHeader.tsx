'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Grid, UserPlus, Users, CheckCircle2, Shield } from 'lucide-react';

interface UserStatsHeaderProps {
  totalUsers: number;
  activeUsersCount: number;
  superAdminsCount: number;
  onOpenPermissionsModal: () => void;
  onOpenCreateModal: () => void;
  onOpenInviteModal?: () => void;
}

export function UserStatsHeader({
  totalUsers,
  activeUsersCount,
  superAdminsCount,
  onOpenPermissionsModal,
  onOpenCreateModal,
  onOpenInviteModal,
}: UserStatsHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-subtle text-brand border border-brand/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            Users & Staff Management (RBAC)
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Manage operational staff accounts, access credentials, and role permission boundaries
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenPermissionsModal}
            className="px-3.5 py-2.5 rounded-xl bg-transparent border border-slate-300/80 text-slate-700 hover:bg-slate-200/50 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors backdrop-blur-sm"
          >
            <Grid className="w-4 h-4 text-brand" />
            Permissions Matrix
          </motion.button>

          {onOpenInviteModal && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenInviteModal}
              className="px-3.5 py-2.5 rounded-xl bg-brand-subtle hover:bg-brand-subtle/80 border border-brand/20 text-brand font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Invite Link
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-bold text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </motion.button>
        </div>
      </motion.div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl bg-transparent border border-slate-300/80 flex items-center justify-between transition-all"
        >
          <div>
            <h4 className="text-2xl font-black text-slate-900">{totalUsers}</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Total Staff Registered</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-brand-subtle text-brand border border-brand/20 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl bg-transparent border border-slate-300/80 flex items-center justify-between transition-all"
        >
          <div>
            <h4 className="text-2xl font-black text-slate-900">{activeUsersCount}</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Active User Accounts</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl bg-transparent border border-slate-300/80 flex items-center justify-between transition-all"
        >
          <div>
            <h4 className="text-2xl font-black text-slate-900">{superAdminsCount}</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Admins & Super Admins</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
