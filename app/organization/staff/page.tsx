'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus } from 'lucide-react';
import { getUsersApi, updateUserApi, deleteUserApi, getOutletsApi, getRolePermissionsApi } from '@/lib/api';
import { UserFormModal, PermissionsMatrixModal, UserFormData } from '@/components/security/users';
import { cardStyles } from '@/lib/theme';
import { useConfirm, useToast } from '@/components/common';
import {
  WorkspaceStaffDirectory,
  WorkspaceStaffInviteSearch,
  WorkspaceStaffCreateForm,
  AVAILABLE_ROLES,
} from '@/components/launchpad/staff';

export default function OrganizationStaffPage() {
  const confirm = useConfirm();
  const toast = useToast();

  const [tab, setTab] = useState<'directory' | 'search' | 'add'>('directory');
  const [staff, setStaff] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Security UI Components: Edit & Permissions
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState<UserFormData>({
    name: '', email: '', password: '', role: 'cashier', outlet_id: '', pin_code: '',
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
        pin_code: editFormData.role === 'cashier' ? (editFormData.pin_code || '1234') : null,
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
    setTimeout(() => setTab('directory'), 1000);
  };

  return (
    <div className="space-y-6 w-full font-sans pb-10">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Workspace Staff &amp; Access Control</h1>
          <p className="text-xs text-slate-500 font-medium mt-1" suppressHydrationWarning>
            Manage employee logins, RBAC roles, cashier register PINs, and assigned store outlets for {orgName}.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setTab('directory')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              tab === 'directory' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff Directory ({staff.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('search')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              tab === 'search' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Invite Existing</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('add')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              tab === 'add' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className={`${cardStyles.base} p-6 sm:p-7`}>
        {tab === 'directory' && (
          <WorkspaceStaffDirectory
            staff={staff}
            loading={loading}
            activeOrgName={orgName}
            onToggleStatus={handleToggleStatus}
            onDeleteStaff={handleDeleteStaff}
            onEditStaff={handleOpenEdit}
            onOpenPermissionsMatrix={handleOpenPermissions}
            onOpenAddTab={() => setTab('add')}
            onOpenSearchTab={() => setTab('search')}
          />
        )}
        {tab === 'search' && (
          <WorkspaceStaffInviteSearch
            outlets={outlets}
            availableRoles={AVAILABLE_ROLES}
            onSuccess={handleSubSuccess}
            onOpenCreateNew={() => setTab('add')}
          />
        )}
        {tab === 'add' && (
          <WorkspaceStaffCreateForm
            outlets={outlets}
            availableRoles={AVAILABLE_ROLES}
            onSuccess={handleSubSuccess}
            onCancel={() => setTab('directory')}
          />
        )}
      </div>
    </div>
  );
}
