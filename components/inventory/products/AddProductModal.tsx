'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Package, Plus, X, AlertCircle, Loader2, Camera, Upload } from 'lucide-react';
import { createProductApi, createCategoryApi } from '@/lib/api';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  brands?: any[];
  onProductCreated: (productName: string) => void;
}

export function AddProductModal({
  isOpen,
  onClose,
  categories,
  brands = [],
  onProductCreated,
}: AddProductModalProps) {
  const [localCategories, setLocalCategories] = useState<any[]>(categories);
  const [showQuickAddCat, setShowQuickAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category_id: categories[0]?.id ? String(categories[0].id) : '',
    brand_id: '',
    expiry_date: '',
    selling_price: '',
    cost_price: '',
    min_reorder_point: '0',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (PNG, JPG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleQuickCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      setCreatingCat(true);
      setError(null);
      const res = await createCategoryApi({ name: newCatName.trim() });
      const newCat = res?.data || res;
      if (newCat?.id) {
        setLocalCategories((prev) => [...prev, newCat]);
        setFormData((prev) => ({ ...prev, category_id: String(newCat.id) }));
      }
      setNewCatName('');
      setShowQuickAddCat(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to create category.');
    } finally {
      setCreatingCat(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter a product name.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const generatedSku =
        formData.sku.trim() ||
        `SKU-${formData.name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const payload = {
        name: formData.name.trim(),
        sku: generatedSku,
        barcode: formData.barcode.trim() || undefined,
        category_id: formData.category_id || (categories[0]?.id ? String(categories[0].id) : undefined),
        brand_id: formData.brand_id || undefined,
        expiry_date: formData.expiry_date || undefined,
        selling_price: parseFloat(formData.selling_price) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        min_reorder_point: isNaN(parseInt(formData.min_reorder_point, 10)) ? 0 : Math.max(0, parseInt(formData.min_reorder_point, 10)),
        description: formData.description.trim() || undefined,
        image_url: imagePreview || undefined,
      };

      await createProductApi(payload);

      onProductCreated(payload.name);
      setImagePreview(null);
      onClose();

      // Reset
      setFormData({
        name: '',
        sku: '',
        barcode: '',
        category_id: categories[0]?.id ? String(categories[0].id) : '',
        brand_id: '',
        expiry_date: '',
        selling_price: '',
        cost_price: '',
        min_reorder_point: '0',
        description: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create product. Please check fields.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-subtle text-brand flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Add New Product</h3>
              <p className="text-xs text-slate-500 font-medium">Register a product into live catalog and inventory balances</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Photo Upload Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Product Photo <span className="text-slate-400 font-normal">(Optional — saved to MinIO S3)</span>
            </label>
            <div className="flex items-center gap-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand bg-slate-50 hover:bg-slate-100/80 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors shrink-0 relative group"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-slate-400 group-hover:text-brand" />
                    <span className="text-[9px] text-slate-400 font-bold mt-0.5">Upload</span>
                  </>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  {imagePreview ? 'Change Photo' : 'Select Image...'}
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="ml-2 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
                <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, or WebP up to 10MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Iced Caramel Macchiato"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                SKU Code <span className="text-slate-400 font-normal">(Auto-generated if empty)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. BEV-MAC-001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Category</label>
                <button
                  type="button"
                  onClick={() => setShowQuickAddCat(!showQuickAddCat)}
                  className="text-[11px] font-bold text-brand hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{showQuickAddCat ? 'Choose Existing' : '+ New Category'}</span>
                </button>
              </div>

              {showQuickAddCat ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="New category name..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-brand/40 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleQuickCreateCategory}
                    disabled={creatingCat || !newCatName.trim()}
                    className="px-2.5 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {creatingCat ? 'Adding...' : 'Add'}
                  </button>
                </div>
              ) : (
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-slate-50 focus:bg-white"
                >
                  {localCategories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  {localCategories.length === 0 && <option value="">No categories yet</option>}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
              <select
                value={formData.brand_id}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-slate-50 focus:bg-white"
              >
                <option value="">No Brand / Generic</option>
                {brands.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date (Optional)</label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cost Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Selling Price ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Safety Buffer</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={formData.min_reorder_point}
                onChange={(e) => setFormData({ ...formData, min_reorder_point: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              placeholder="Optional ingredients, storage instructions or notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl font-black text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Save &amp; Add to Inventory</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
