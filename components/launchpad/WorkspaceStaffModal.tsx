'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Users, Search, UserPlus, ShieldCheck, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { getUsersApi, updateUserApi, deleteUserApi, getOutletsApi, getRolePermissionsApi } from '@/lib/api';
import { badgeStyles } from '@/lib/theme';
import { useConfirm, useToast } from '@/components/common';
import { UserFormModal, PermissionsMatrixModal, UserFormData } from '@/components/security/users';
import { WorkspaceStaffDirectory } from './staff/WorkspaceStaffDirectory';
import { WorkspaceStaffInviteSearch } from './staff/WorkspaceStaffInviteSearch';
import { WorkspaceStaffCreateForm, AVAILABLE_ROLES } from './staff/WorkspaceStaffCreateForm';

interface WorkspaceStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrgName: string;
  isHrmEnabled: boolean;
  onStaffUpdated?: () => void;
}

export function WorkspaceStaffModal({
  isOpen,
  onClose,
  activeOrgName,
  isHrmEnabled,
  onStaffUpdated,
}: WorkspaceStaffModalProps) {
  const confirm = useConfirm();
  const toast = useToast();

  const [tab, setTab] = useState<'directory' | 'search' | 'add'>('directory');
  const [staff, setStaff] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Security UI Components Integration: Edit & Permissions
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState<UserFormData>({
    name: '', email: '', password: '', role: 'cashier', outlet_id: '', pin_code: '',
  });

  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissionsMatrix, setPermissionsMatrix] = useState<any>(null);

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
    if (isOpen) {
      loadData();
      setTab('directory');
      setEditingStaff(null);
    }
  }, [isOpen]);

  const handleToggleStatus = async (user: any) => {
    try {
      const newStatus = !user.is_active;
      await updateUserApi(user.id, { is_active: newStatus });
      setStaff((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: newStatus } : u)));
      onStaffUpdated?.();
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
      onStaffUpdated?.();
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
      role: user.role_slug || user.role || 'cashier',
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
        onStaffUpdated?.();
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
    onStaffUpdated?.();
    setTimeout(() => setTab('directory'), 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Existing Security Modal: Permissions Matrix */}
      <PermissionsMatrixModal
        isOpen={showPermissionsModal}
        permissionsMatrix={permissionsMatrix}
        onClose={() => setShowPermissionsModal(false)}
      />

      {/* Existing Security Modal: Edit User Role & Profile */}
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

      <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Workspace Staff &amp; Access</h2>
              <span className={badgeStyles.brand}>{staff.length} Active</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Manage accounts, cashier credentials, and outlet access for {activeOrgName}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Context Banner */}
        {isHrmEnabled && (
          <div className="px-6 py-2 bg-brand-subtle/50 border-b border-brand/10 flex items-center justify-between text-xs font-medium text-brand">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand" />
              HR &amp; Workforce Suite is enabled for this workspace.
            </span>
            <Link href="/hrm" onClick={onClose} className="inline-flex items-center gap-1 font-bold underline hover:text-brand-dark">
              Payroll &amp; Leaves <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Tab Selection */}
        <div className="px-6 pt-3 flex items-center gap-1 border-b border-slate-100 overflow-x-auto">
          <button
            type="button"
            onClick={() => setTab('directory')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              tab === 'directory' ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Staff Directory ({staff.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('search')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              tab === 'search' ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Find &amp; Invite Existing
          </button>
          <button
            type="button"
            onClick={() => setTab('add')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 ${
              tab === 'add' ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create Account
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {tab === 'directory' && (
            <WorkspaceStaffDirectory
              staff={staff}
              loading={loading}
              activeOrgName={activeOrgName}
              outlets={outlets}
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
    </div>
  );
}
