'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Search,
} from 'lucide-react';
import {
  getMaterialsApi,
  createMaterialApi,
  updateMaterialApi,
  deleteMaterialApi,
  MaterialItem,
} from '@/lib/api/meetings';
import { cardStyles } from '@/lib/theme';
import { useToast } from '@/components/common';

export function MeetingEquipmentView() {
  const toast = useToast();
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaterialItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'av',
    total_quantity: 10,
    unit: 'piece',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const res = await getMaterialsApi();
      if (res?.data) {
        setMaterials(res.data);
      }
    } catch {
      toast.error('Failed to load equipment inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      sku: `EQ-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'av',
      total_quantity: 10,
      unit: 'piece',
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: MaterialItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category,
      total_quantity: item.total_quantity,
      unit: item.unit,
      is_active: Boolean(item.is_active),
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        const res = await updateMaterialApi(editingItem.id, {
          ...formData,
          is_active: formData.is_active ? 1 : 0,
        });
        if (res?.status === 'success') {
          toast.success('Equipment updated.');
          setModalOpen(false);
          loadMaterials();
        }
      } else {
        const res = await createMaterialApi({
          ...formData,
          available_quantity: formData.total_quantity,
          is_active: formData.is_active ? 1 : 0,
        });
        if (res?.status === 'success') {
          toast.success('New equipment added to inventory.');
          setModalOpen(false);
          loadMaterials();
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save equipment.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}" from logistics inventory?`)) return;
    try {
      const res = await deleteMaterialApi(id);
      if (res?.status === 'success') {
        toast.success('Equipment removed.');
        loadMaterials();
      }
    } catch {
      toast.error('Failed to delete item.');
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || m.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 w-full pb-10 font-sans">
      {/* Header Banner */}
      <div className={`${cardStyles.base} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Logistics &amp; Hardware
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Atomic Auto-Restock Guarantee</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Equipment &amp; Catering Inventory
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage AV equipment, microphones, projectors, and catering allocations reserved during booking.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadMaterials}
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
            <span>Add Equipment</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equipment or SKU..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 text-xs">
          {['all', 'av', 'presentation', 'catering', 'stationery', 'furniture'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 font-semibold">
            Loading logistics inventory...
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="col-span-full py-16 text-center space-y-2">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No equipment items found</p>
          </div>
        ) : (
          filteredMaterials.map((item) => {
            const isDepleted = item.available_quantity === 0;
            const isLow = item.available_quantity > 0 && item.available_quantity <= 2;
            const reserved = item.total_quantity - item.available_quantity;

            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isDepleted
                          ? 'bg-rose-100 text-rose-800'
                          : isLow
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isDepleted ? 'Depleted' : isLow ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">{item.name}</h3>
                    <p className="text-[10px] font-mono text-slate-400">SKU: {item.sku}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Total</p>
                      <p className="text-sm font-black text-slate-800">{item.total_quantity}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Reserved</p>
                      <p className="text-sm font-black text-amber-600">{reserved}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Free</p>
                      <p className="text-sm font-black text-emerald-600">{item.available_quantity}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Unit: {item.unit}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Item"
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

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {editingItem ? 'Edit Equipment' : 'Add New Equipment'}
                </h3>
                <p className="text-xs text-slate-500">Logistics resource catalog</p>
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
                <label className="font-bold text-slate-700">Equipment Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. 4K Wireless Presentation Bar"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-hidden bg-white"
                  >
                    <option value="av">Audio / Visual</option>
                    <option value="presentation">Presentation</option>
                    <option value="catering">Catering &amp; Refreshments</option>
                    <option value="stationery">Stationery</option>
                    <option value="furniture">Furniture</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Total Stock Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.total_quantity}
                    onChange={(e) => setFormData({ ...formData, total_quantity: Number(e.target.value) })}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Unit Type</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="piece / set / tray"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-hidden"
                  />
                </div>
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
                  {saving ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
