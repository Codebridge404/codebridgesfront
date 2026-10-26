'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { getCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi } from '@/lib/api';
import { Tag, Plus, Search, Layers, X, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { CategoryItem, CategoryFormData } from './types';
import { CategoryModal } from './CategoryModal';
import { CategoryTable } from './CategoryTable';

function CategoriesContent() {
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [parentCategories, setParentCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({ name: '', parent_id: '' });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const urlType = searchParams.get('type') || '';
    setTypeFilter(urlType);
  }, [searchParams]);

  useEffect(() => {
    loadCategories();
    loadParentOptions();
  }, [typeFilter]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await getCategoriesApi(typeFilter || undefined, search || undefined);
      setCategories(res.data || []);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadParentOptions = async () => {
    try {
      const res = await getCategoriesApi('main');
      setParentCategories(res.data || []);
    } catch (err: any) {
      console.error('Failed to load parent categories:', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCategories();
  };

  const handleOpenCreateModal = (isSub: boolean = false) => {
    setEditingCategory(null);
    setFormData({
      name: '',
      parent_id: isSub && parentCategories[0] ? String(parentCategories[0].id) : '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      parent_id: cat.parent_id ? String(cat.parent_id) : '',
    });
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setNotification(null);

      if (editingCategory) {
        await updateCategoryApi(editingCategory.id, {
          name: formData.name,
          parent_id: formData.parent_id ? parseInt(formData.parent_id, 10) : null,
        });
        setNotification({ type: 'success', message: 'Category updated successfully.' });
      } else {
        await createCategoryApi({
          name: formData.name,
          parent_id: formData.parent_id ? parseInt(formData.parent_id, 10) : null,
        });
        setNotification({ type: 'success', message: 'Category created successfully.' });
      }

      setIsModalOpen(false);
      loadCategories();
      loadParentOptions();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to save category.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await deleteCategoryApi(id);
      setNotification({ type: 'success', message: `Category "${name}" deleted.` });
      loadCategories();
      loadParentOptions();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to delete category.' });
    }
  };

  const mainCatCount = categories.filter((c) => !c.parent_id).length;
  const subCatCount = categories.filter((c) => c.parent_id).length;
  const totalProductsAssigned = categories.reduce((sum, c) => sum + (c.products_count || 0), 0);

  return (
    <div className="h-full flex flex-col bg-transparent p-2.5 sm:p-3 rounded-xl border border-slate-300/80 font-sans gap-2 overflow-hidden">
      {/* 1. Header Bar */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-300/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-subtle flex items-center justify-center text-brand">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <span>Categories &amp; Taxonomy</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-subtle text-brand border border-brand/20">
                {categories.length} Categories
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Organize catalog items into main categories and nested sub-categories
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleOpenCreateModal(true)}
            className="px-3.5 py-2 bg-transparent hover:bg-slate-200/50 text-slate-700 hover:text-slate-900 border border-slate-300/80 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs backdrop-blur-sm"
          >
            <Layers className="w-4 h-4 text-brand" />
            <span>Add Sub-Category</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreateModal(false)}
            className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl font-black text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Main Category</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive KPI Filter Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setTypeFilter(typeFilter === 'main' ? '' : 'main')}
          className={`px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
            typeFilter === 'main'
              ? 'bg-brand-subtle/90 border-brand/30 ring-2 ring-brand/20 shadow-2xs'
              : 'bg-transparent border-slate-300/80 hover:bg-slate-200/40'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Tag className={`w-3.5 h-3.5 shrink-0 ${typeFilter === 'main' ? 'text-brand' : 'text-slate-400'}`} />
            <span className="text-[11px] font-bold text-slate-600 truncate">Main Categories</span>
          </div>
          <span className="text-xs font-black text-slate-900 bg-slate-200/50 px-1.5 py-0.2 rounded font-mono border border-slate-300/60 shrink-0">
            {mainCatCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTypeFilter(typeFilter === 'sub' ? '' : 'sub')}
          className={`px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
            typeFilter === 'sub'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-2xs'
              : 'bg-transparent border-slate-300/80 hover:bg-slate-200/40'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Layers className={`w-3.5 h-3.5 shrink-0 ${typeFilter === 'sub' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span className="text-[11px] font-bold text-indigo-700 truncate">Sub-Categories</span>
          </div>
          <span className="text-xs font-black text-indigo-800 bg-indigo-100/80 px-1.5 py-0.2 rounded font-mono border border-indigo-200/60 shrink-0">
            {subCatCount}
          </span>
        </button>

        <div className="px-2.5 py-1.5 rounded-lg border border-slate-300/80 bg-transparent flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Package className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span className="text-[11px] font-bold text-emerald-700 truncate">Assigned Products</span>
          </div>
          <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded font-mono border border-emerald-200/60 shrink-0">
            {totalProductsAssigned}
          </span>
        </div>
      </div>

      {/* 3. Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-transparent p-2 sm:p-2.5 rounded-xl border border-slate-300/80 shrink-0">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px] max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search category name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-transparent border border-slate-300/80 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand shadow-2xs backdrop-blur-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                loadCategories();
              }}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-1 bg-transparent border border-slate-300/80 p-0.5 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setTypeFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              typeFilter === '' ? 'bg-brand text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            All ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('main')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'main' ? 'bg-brand text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Main
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('sub')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'sub' ? 'bg-brand text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Sub-Categories
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border backdrop-blur-sm shrink-0 ${
            notification.type === 'success'
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-800'
              : 'bg-rose-50/90 border-rose-300 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="cursor-pointer text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Categories Data Grid Table */}
      <div className="flex-1 min-h-0 relative overflow-auto border border-slate-300/80 rounded-xl">
        <CategoryTable
          categories={categories}
          loading={loading}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteCategory}
        />
      </div>

      <CategoryModal
        isModalOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingCategory={editingCategory}
        formData={formData}
        setFormData={setFormData}
        parentCategories={parentCategories}
        onSave={handleSaveCategory}
        saving={saving}
      />
    </div>
  );
}

export function SuperAdminCategoriesView() {
  return (
    <div className="h-full flex flex-col w-full font-sans text-slate-900 overflow-hidden">
      <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading categories...</div>}>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}
