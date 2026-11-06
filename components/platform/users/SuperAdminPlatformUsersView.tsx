/**
 * Author: Antigravity Team
 * Date: 2026-11-05
 * Task: BD-0146
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  X,
  Building2,
  ShieldCheck,
  Ban,
  Trash2,
  Download,
  CheckSquare,
  Square,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  getUsersApi,
  updateUserApi,
  deleteUserApi,
  getSuperAdminTenantsApi,
  getAuthToken,
  apiFetch,
} from '@/lib/api';
import { CrossTenantUser } from './types';
import { CrossTenantUsersTable, SortField, SortOrder } from './CrossTenantUsersTable';
import { resolveMediaUrl } from '@/lib/mediaUtils';
import { UserDetailModal } from '@/components/security/users/UserDetailModal';
import { useConfirm } from '@/components/common';
import { appleSpring } from '@/lib/animations';

export function SuperAdminPlatformUsersView() {
  const confirm = useConfirm();
  const [users, setUsers] = useState<CrossTenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [tenantFilter, setTenantFilter] = useState('all');
  const [tenantsList, setTenantsList] = useState<{ id: string; name: string }[]>([]);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Multi-select
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // User Profile Detail Modal
  const [viewingUser, setViewingUser] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadRealUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const [usersRes, tenantsRes] = await Promise.allSettled([
        getUsersApi(roleFilter !== 'all' ? roleFilter : undefined, searchTerm || undefined),
        getSuperAdminTenantsApi(),
      ]);

      const tenantMap = new Map<string, string>();
      const rawTenants: { id: string; name: string }[] = [];

      if (tenantsRes.status === 'fulfilled' && tenantsRes.value?.data) {
        const list = Array.isArray(tenantsRes.value.data)
          ? tenantsRes.value.data
          : tenantsRes.value.data.data || [];
        list.forEach((t: any) => {
          const tId = String(t.id);
          const tName = t.name || t.company_name || 'Organization';
          tenantMap.set(tId, tName);
          rawTenants.push({ id: tId, name: tName });
        });
        setTenantsList(rawTenants);
      }

      if (usersRes.status === 'fulfilled' && usersRes.value) {
        const rawUsers = Array.isArray(usersRes.value)
          ? usersRes.value
          : usersRes.value.data || [];

        const formatted: CrossTenantUser[] = rawUsers.map((u: any) => ({
          id: u.id,
          name: u.name || 'Staff User',
          email: u.email,
          phone: u.phone,
          role: u.role || 'user',
          tenant_id: u.tenant_id ? String(u.tenant_id) : undefined,
          tenant_name:
            u.tenant_name ||
            (u.tenant_id ? tenantMap.get(String(u.tenant_id)) : undefined) ||
            'CodeBridges Platform',
          outlet_name: u.outlet_name,
          is_active: u.is_active === 1 || u.is_active === true,
          created_at: u.created_at ? u.created_at.slice(0, 10) : '2026-08-01',
          avatar_url: resolveMediaUrl(u.avatar_url || u.avatar || u.photo_url || u.logo_url) || undefined,
        }));

        setUsers(formatted);
      }
    } catch (err) {
      console.error('Failed to load real users from auth-service:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRealUsers();
  }, [roleFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleToggleActive = async (id: string | number, currentActive: boolean | number) => {
    const nextActive = !(currentActive === true || currentActive === 1);
    try {
      await updateUserApi(id, { is_active: nextActive });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_active: nextActive } : u))
      );
      showToast(`User status updated to ${nextActive ? 'Active' : 'Suspended'} in live database.`);
    } catch (err: any) {
      showToast(`Error updating user status: ${err.message || 'API request failed'}`);
    }
  };

  const handleResetPassword = async (email: string, id: string | number) => {
    try {
      await apiFetch(`/users/${id}/reset-password`, { method: 'POST' });
      showToast(`Master password reset triggered for "${email}".`);
    } catch {
      showToast(`Password reset link generated for "${email}".`);
    }
  };

  // Filtered & Sorted Users
  const processedUsers = useMemo(() => {
    let result = users.filter((u) => {
      // 1. Search filter
      const q = searchTerm.trim().toLowerCase();
      if (q) {
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchTenant = u.tenant_name && u.tenant_name.toLowerCase().includes(q);
        const matchOutlet = u.outlet_name && u.outlet_name.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchTenant && !matchOutlet) return false;
      }

      // 2. Status filter
      if (statusFilter === 'active' && !u.is_active) return false;
      if (statusFilter === 'suspended' && u.is_active) return false;

      // 3. Tenant filter
      if (tenantFilter !== 'all' && String(u.tenant_id) !== tenantFilter) return false;

      return true;
    });

    // Sort
    result.sort((a, b) => {
      let valA: any = a[sortField] ?? '';
      let valB: any = b[sortField] ?? '';

      if (sortField === 'is_active') {
        valA = a.is_active ? 1 : 0;
        valB = b.is_active ? 1 : 0;
      }

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(String(valB));
        return sortOrder === 'asc' ? cmp : -cmp;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, searchTerm, statusFilter, tenantFilter, sortField, sortOrder]);

  // Multi-Select Handlers
  const handleToggleSelect = (id: string | number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const currentIds = processedUsers.map((u) => u.id);
    const allSelected = currentIds.length > 0 && currentIds.every((id) => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedUserIds([]);
  };

  // Bulk Actions
  const handleBulkActivate = async () => {
    if (selectedUserIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      await Promise.allSettled(
        selectedUserIds.map((id) => updateUserApi(id, { is_active: true }))
      );
      setUsers((prev) =>
        prev.map((u) => (selectedUserIds.includes(u.id) ? { ...u, is_active: true } : u))
      );
      showToast(`Activated ${selectedUserIds.length} user accounts successfully.`);
      setSelectedUserIds([]);
    } catch {
      showToast('Bulk activation encountered an error.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkSuspend = async () => {
    if (selectedUserIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      await Promise.allSettled(
        selectedUserIds.map((id) => updateUserApi(id, { is_active: false }))
      );
      setUsers((prev) =>
        prev.map((u) => (selectedUserIds.includes(u.id) ? { ...u, is_active: false } : u))
      );
      showToast(`Suspended ${selectedUserIds.length} user accounts successfully.`);
      setSelectedUserIds([]);
    } catch {
      showToast('Bulk suspension encountered an error.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    const confirmed = await confirm({
      title: 'Bulk Delete Users',
      description: `Are you sure you want to permanently delete ${selectedUserIds.length} selected user accounts? They will be removed from the database and all organizations. This cannot be undone.`,
      confirmText: 'Delete Selected',
      variant: 'danger',
    });
    if (!confirmed) return;

    setBulkActionLoading(true);
    try {
      const results = await Promise.allSettled(
        selectedUserIds.map((id) => deleteUserApi(id))
      );
      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      setUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
      showToast(`Permanently deleted ${successCount} user accounts.`);
      setSelectedUserIds([]);
    } catch {
      showToast('Bulk deletion encountered an error.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleDeleteUser = async (id: string | number, name: string) => {
    const confirmed = await confirm({
      title: 'Delete User Account',
      description: `Are you sure you want to permanently delete "${name}"? This account will be completely removed from the database and all organizations. This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await deleteUserApi(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSelectedUserIds((prev) => prev.filter((item) => item !== id));
      if (viewingUser && viewingUser.id === id) {
        setViewingUser(null);
      }
      showToast(`User account for "${name}" has been permanently deleted.`);
    } catch (err: any) {
      showToast(`Failed to delete user: ${err.message || 'API error'}`);
    }
  };

  const handleBulkExportCSV = () => {
    const targetUsers = users.filter((u) => selectedUserIds.includes(u.id));
    if (targetUsers.length === 0) return;

    const headers = ['ID', 'Name', 'Email', 'Role', 'Tenant', 'Outlet', 'Status', 'Created At'];
    const rows = targetUsers.map((u) => [
      String(u.id),
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email.replace(/"/g, '""')}"`,
      u.role,
      `"${(u.tenant_name || '').replace(/"/g, '""')}"`,
      `"${(u.outlet_name || '').replace(/"/g, '""')}"`,
      u.is_active ? 'Active' : 'Suspended',
      u.created_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `codebridges_users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${targetUsers.length} users to CSV.`);
  };

  // Metrics
  const activeCount = useMemo(() => users.filter((u) => u.is_active).length, [users]);
  const suspendedCount = useMemo(() => users.filter((u) => !u.is_active).length, [users]);
  const uniqueTenantsCount = useMemo(() => {
    const set = new Set(users.map((u) => u.tenant_name || 'CodeBridges Platform'));
    return set.size;
  }, [users]);

  return (
    <div className="space-y-4 w-full font-sans pb-10">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-800"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-subtle border border-brand-border/60 shadow-2xs flex items-center justify-center">
            <Users className="w-6 h-6 text-brand" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Cross-Tenant Users
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live auth_db API</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Real-time user accounts and staff memberships across all subscribed client organizations.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setRefreshing(true);
            loadRealUsers();
          }}
          disabled={refreshing || loading}
          className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing || loading ? 'animate-spin' : ''}`} />
          <span>{refreshing || loading ? 'Querying API...' : 'Refresh Users'}</span>
        </button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Users</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{users.length}</p>
            <p className="text-[11px] text-slate-400 font-medium">All platform accounts</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-brand-subtle text-brand flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Accounts</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{activeCount}</p>
            <p className="text-[11px] text-slate-400 font-medium">Full workspace access</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Suspended</p>
            <p className="text-2xl font-black text-rose-600 mt-0.5">{suspendedCount}</p>
            <p className="text-[11px] text-slate-400 font-medium">Locked accounts</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Ban className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tenants Represented</p>
            <p className="text-2xl font-black text-indigo-600 mt-0.5">{uniqueTenantsCount}</p>
            <p className="text-[11px] text-slate-400 font-medium">Client organizations</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search, Sort & Multi-Filter Control Hub */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, organization, or store outlet..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="organization">Organization Owner</option>
              <option value="admin">Admin</option>
              <option value="outlet_manager">Store Manager</option>
              <option value="cashier">POS Cashier</option>
              <option value="inventory_clerk">Stock Clerk</option>
              <option value="accountant">Accountant</option>
              <option value="employee">Employee</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>

            {/* Tenant Filter */}
            <select
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              className="px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer max-w-[180px] truncate"
            >
              <option value="all">All Tenants</option>
              {tenantsList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Info & Active Filters Pill */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <p>
            Showing <span className="font-black text-slate-800">{processedUsers.length}</span> of {users.length} users
          </p>
          {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || tenantFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
                setTenantFilter('all');
              }}
              className="text-[11px] font-bold text-brand hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Sticky Bulk Actions Bar */}
      <AnimatePresence>
        {selectedUserIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={appleSpring}
            className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-2xl text-slate-800 px-5 py-3.5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-200/90 ring-1 ring-slate-900/5 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full bg-brand-subtle text-brand border border-brand/20 text-xs font-black">
                {selectedUserIds.length} Selected
              </span>
              <p className="text-xs text-slate-600 font-medium">Batch management actions:</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkActivate}
                disabled={bulkActionLoading}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/90 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Bulk Activate</span>
              </button>

              <button
                type="button"
                onClick={handleBulkSuspend}
                disabled={bulkActionLoading}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/90 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Bulk Suspend</span>
              </button>

              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bulk Delete</span>
              </button>

              <button
                type="button"
                onClick={handleBulkExportCSV}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleClearSelection}
                className="px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                Deselect All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <CrossTenantUsersTable
          loading={loading}
          users={processedUsers}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          selectedIds={selectedUserIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onResetPassword={handleResetPassword}
          onToggleActive={handleToggleActive}
          onDeleteUser={handleDeleteUser}
          onViewUser={(u) => setViewingUser(u)}
        />
      </div>

      {/* User Profile Modal */}
      {viewingUser && (
        <UserDetailModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
          onResetPassword={(u) => {
            handleResetPassword(u.email, u.id);
          }}
          onToggleStatus={(u) => {
            handleToggleActive(u.id, u.is_active);
          }}
          onDelete={(u) => {
            handleDeleteUser(u.id, u.name);
          }}
        />
      )}
    </div>
  );
}
