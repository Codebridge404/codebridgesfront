'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Phone,
  Mail,
  X,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react';
import {
  getStaffApi,
  createStaffApi,
  updateStaffApi,
  deleteStaffApi,
  StaffItem,
} from '@/lib/api/meetings';
import { cardStyles } from '@/lib/theme';
import { useToast } from '@/components/common';

export function MeetingStaffView() {
  const toast = useToast();
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'AV Technician',
    email: '',
    phone: '',
    is_available: true,
  });
  const [saving, setSaving] = useState(false);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await getStaffApi();
      if (res?.data) {
        setStaffList(res.data);
      }
    } catch {
      toast.error('Failed to load support staff roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const openCreateModal = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      role: 'AV Technician',
      email: '',
      phone: '',
      is_available: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: StaffItem) => {
    setEditingStaff(item);
    setFormData({
      name: item.name,
      role: item.role,
      email: item.email,
      phone: item.phone || '',
      is_available: Boolean(item.is_available),
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingStaff) {
        const res = await updateStaffApi(editingStaff.id, {
          ...formData,
          is_available: formData.is_available ? 1 : 0,
        });
        if (res?.status === 'success') {
          toast.success('Staff specialist updated.');
          setModalOpen(false);
          loadStaff();
        }
      } else {
        const res = await createStaffApi({
          ...formData,
          is_available: formData.is_available ? 1 : 0,
        });
        if (res?.status === 'success') {
          toast.success('New specialist registered.');
          setModalOpen(false);
          loadStaff();
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save staff record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Remove "${name}" from support roster?`)) return;
    try {
      const res = await deleteStaffApi(id);
      if (res?.status === 'success') {
        toast.success('Staff member removed.');
        loadStaff();
      }
    } catch {
      toast.error('Failed to remove staff.');
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || s.role.toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 w-full pb-10 font-sans">
      {/* Header Banner */}
      <div className={`${cardStyles.base} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Operations Roster
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Certified Support Personnel</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Support Specialists &amp; Facilitators
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage certified technicians, catering leads, and conference facilitators available for sessions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadStaff}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Specialist</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role or email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 text-xs">
          {['all', 'technician', 'catering', 'facilitator', 'it'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all cursor-pointer ${
                roleFilter === role
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {role === 'all' ? 'All Roles' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 font-semibold">
            Loading support staff roster...
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="col-span-full py-16 text-center space-y-2">
            <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No support specialists registered</p>
          </div>
        ) : (
          filteredStaff.map((person) => {
            const isAvail = Boolean(person.is_available);
            return (
              <div
                key={person.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {person.role}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isAvail ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isAvail ? 'On-Duty' : 'Off-Duty'}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900">{person.name}</h3>

                  <div className="space-y-1 text-[11px] text-slate-500">
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{person.email}</span>
                    </p>
                    {person.phone && (
                      <p className="flex items-center gap-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{person.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-[10px] font-bold text-slate-400">Certified Specialist</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(person)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      title="Edit Specialist"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(person.id, person.name)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Specialist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {editingStaff ? 'Edit Specialist' : 'Register Specialist'}
                </h3>
                <p className="text-xs text-slate-500">Support Operations Roster</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Marcus Vance"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Operational Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-hidden bg-white"
                >
                  <option value="AV Technician">AV Technician (Acoustics &amp; Displays)</option>
                  <option value="Catering Lead">Catering &amp; Refreshments Lead</option>
                  <option value="Meeting Facilitator">Meeting Facilitator / Scribe</option>
                  <option value="IT Systems Support">IT Systems Support</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 555-0192"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="staff_avail"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
                <label htmlFor="staff_avail" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Available for session assignments (On-Duty)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  {saving ? 'Saving...' : 'Save Specialist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
