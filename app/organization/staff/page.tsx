'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  RefreshCw,
  ShieldCheck,
  Store,
  KeyRound,
  Shield,
  Building2,
  X,
} from 'lucide-react';
import { getUsersApi, updateUserApi, deleteUserApi, getOutletsApi, getRolePermissionsApi } from '@/lib/api';
import { UserFormModal, PermissionsMatrixModal, UserFormData } from '@/components/security/users';
import { useConfirm, useToast } from '@/components/common';
import { WorkspaceStaffDirectory } from '@/components/launchpad/staff/WorkspaceStaffDirectory';
import { WorkspaceStaffInviteSearch } from '@/components/launchpad/staff/WorkspaceStaffInviteSearch';
import { WorkspaceStaffCreateForm, AVAILABLE_ROLES } from '@/components/launchpad/staff/WorkspaceStaffCreateForm';

export default function OrganizationStaffPage() {
  const confirm = useConfirm();
  const toast = useToast();

  const [staff, setStaff] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Staff Popup Modal State (with 2 options: Create or Invite)
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalTab, setAddModalTab] = useState<'create' | 'invite'>('create');

  // Security UI Components: Edit & Permissions
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'cashier',
    outlet_id: '',
    pin_code: '',
  });

  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissionsMatrix, setPermissionsMatrix] = useState<any>(null);
  const [orgName, setOrgName] = useState<string>('Primary Organization');

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, outletsRes] = await Promise.allSettled([
        getUsersApi('all', undefined, 'staff'),
        getOutletsApi(),
      ]);
      if (usersRes.status === 'fulfilled') {
        const d = usersRes.value?.data ?? usersRes.value;
        setStaff(Array.isArray(d) ? d : []);
      }
      if (outletsRes.status === 'fulfilled') {
        const d = outletsRes.value?.data ?? outletsRes.value;
        setOutlets(Array.isArray(d) ? d : []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const active =
        localStorage.getItem('active_org') ||
        localStorage.getItem('cb_active_org_name') ||
        'Primary Organization';
      setOrgName(active);
    }
    loadData();
  }, []);

  const activeCount = useMemo(() => staff.filter((u) => u.is_active !== false).length, [staff]);
  const disabledCount = useMemo(() => staff.filter((u) => u.is_active === false).length, [staff]);
  const cashierCount = useMemo(() => staff.filter((u) => u.role === 'cashier').length, [staff]);
  const managerCount = useMemo(
    () =>
      staff.filter((u) =>
        ['owner', 'admin', 'organization', 'super_admin', 'outlet_manager', 'supervisor'].includes(
          (u.role || '').toLowerCase()
        )
      ).length,
    [staff]
  );

  const handleToggleStatus = async (user: any) => {
    try {
      const newStatus = !user.is_active;
      await updateUserApi(user.id, { is_active: newStatus });
      setStaff((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: newStatus } : u)));
      toast.success(`${user.name} is now ${newStatus ? 'active' : 'disabled'}.`);
    } catch {
      toast.error('Failed to update user status.');
    }
  };

  const handleDeleteStaff = async (id: number | string, name: string) => {
    const confirmed = await confirm({
      title: 'Remove Staff Member',
      description: `Are you sure you want to remove "${name}" from your workspace? They will immediately lose access to all store registers and assigned business modules.`,
      variant: 'danger',
      confirmText: 'Remove Staff',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;

    try {
      await deleteUserApi(id);
      setStaff((prev) => prev.filter((u) => u.id !== id));
      toast.success(`${name} was successfully removed from workspace.`);
    } catch {
      toast.error('Failed to remove user account.');
    }
  };

  const handleOpenEdit = (user: any) => {
    setEditingStaff(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'cashier',
      outlet_id: user.outlet_id ? String(user.outlet_id) : '',
      pin_code: user.pin_code || '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setSavingEdit(true);
    try {
      const payload: any = {
        name: editFormData.name,
        email: editFormData.email,
        role: editFormData.role,
        outlet_id: editFormData.outlet_id || null,
        pin_code: editFormData.role === 'cashier' ? editFormData.pin_code || '1234' : null,
      };
      if (editFormData.password) payload.password = editFormData.password;

      const res = await updateUserApi(editingStaff.id, payload);
      if (res?.status === 'success') {
        toast.success(`${editFormData.name} updated successfully!`);
        setEditingStaff(null);
        await loadData();
      } else {
        toast.error(res?.message || 'Failed to update staff account.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating staff account.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleOpenPermissions = async () => {
    if (!permissionsMatrix) {
      try {
        const res = await getRolePermissionsApi();
        setPermissionsMatrix(res?.data ?? res);
      } catch {
        setPermissionsMatrix(null);
      }
    }
    setShowPermissionsModal(true);
  };

  const handleSubSuccess = (msg: string) => {
    toast.success(msg);
    loadData();
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 w-full font-sans pb-16">
      {/* Security Modals */}
      <PermissionsMatrixModal
        isOpen={showPermissionsModal}
        permissionsMatrix={permissionsMatrix}
        onClose={() => setShowPermissionsModal(false)}
      />
      <UserFormModal
        isOpen={!!editingStaff}
        editingUser={editingStaff}
        formData={editFormData}
        setFormData={setEditFormData}
        onClose={() => setEditingStaff(null)}
        onSubmit={handleSaveEdit}
        saving={savingEdit}
        dynamicRoles={[]}
      />

      {/* Add Staff Popup Screen (Modal with 2 Options) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Add Staff Member</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure a new employee profile or invite an existing registered user
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2 Options Switcher */}
            <div className="px-6 pt-4 pb-2 border-b border-slate-100">
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setAddModalTab('create')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    addModalTab === 'create'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>Create New Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddModalTab('invite')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    addModalTab === 'invite'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Search className="w-4 h-4 text-indigo-600" />
                  <span>Invite Existing User</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {addModalTab === 'create' ? (
                <WorkspaceStaffCreateForm
                  outlets={outlets}
                  availableRoles={AVAILABLE_ROLES}
                  onSuccess={handleSubSuccess}
                  onCancel={() => setShowAddModal(false)}
                />
              ) : (
                <WorkspaceStaffInviteSearch
                  outlets={outlets}
                  availableRoles={AVAILABLE_ROLES}
                  onSuccess={handleSubSuccess}
                  onOpenCreateNew={() => setAddModalTab('create')}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-subtle text-brand border border-brand/20 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Workspace Identity &amp; RBAC</span>
            </span>
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <strong className="text-slate-700 font-extrabold" suppressHydrationWarning>
                {orgName}
              </strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Staff Roster &amp; Roles
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-2xl">
            Centralized management for employee accounts, frontline register PIN credentials, RBAC module capabilities, and store branch assignments.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-2xl border border-slate-300/80 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer shadow-2xs"
            title="Refresh Staff Roster"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenPermissions}
            className="px-4 py-2.5 rounded-2xl border border-slate-300/80 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 text-brand" />
            <span>Role Capabilities</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAddModalTab('create');
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Staff */}
        <div className="p-5 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Staff</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{staff.length}</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {activeCount} active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {disabledCount > 0 ? `${disabledCount} disabled accounts` : 'All team accounts operational'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Cashier Terminals & PINs */}
        <div className="p-5 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">POS Cashiers</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{cashierCount}</span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Live PINs
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Frontline cashier register access</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Store Outlets Covered */}
        <div className="p-5 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Store Outlets</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{outlets.length}</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Branches
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Physical stores &amp; warehouses</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Store className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Management & Supervisors */}
        <div className="p-5 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Managers &amp; Admin</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{managerCount}</span>
              <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Elevated
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Supervisors &amp; workspace admins</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Direct Staff Directory Canvas (No redundant tabs) */}
      <div className="w-full">
        <WorkspaceStaffDirectory
          staff={staff}
          loading={loading}
          activeOrgName={orgName}
          outlets={outlets}
          onToggleStatus={handleToggleStatus}
          onDeleteStaff={handleDeleteStaff}
          onEditStaff={handleOpenEdit}
          onOpenPermissionsMatrix={handleOpenPermissions}
          onOpenAddTab={() => {
            setAddModalTab('create');
            setShowAddModal(true);
          }}
          onOpenSearchTab={() => {
            setAddModalTab('invite');
            setShowAddModal(true);
          }}
        />
      </div>
    </div>
  );
}
