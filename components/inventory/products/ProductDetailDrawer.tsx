'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Package,
  Barcode,
  Tag,
  DollarSign,
  TrendingUp,
  Layers,
  Calendar,
  Edit3,
  SlidersHorizontal,
  History,
  Trash2,
  Camera,
  Loader2,
  Check,
  Copy,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { uploadProductImageApi } from '@/lib/api';
import { useToast } from '@/components/common';

export interface ProductDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
  onEdit?: (product: any) => void;
  onDelete?: (product: any) => void;
  onAdjustStock?: (product: any) => void;
  onViewMovements?: (product: any) => void;
  onProductUpdated?: () => void;
}

export function ProductDetailDrawer({
  isOpen,
  onClose,
  product,
  onEdit,
  onDelete,
  onAdjustStock,
  onViewMovements,
  onProductUpdated,
}: ProductDetailDrawerProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [copiedSku, setCopiedSku] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  // Sync image URL when product changes
  React.useEffect(() => {
    if (product) {
      setCurrentImageUrl(product.image_url || null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const stock = parseFloat(product.stock_on_hand ?? product.quantity ?? '0');
  const cost = parseFloat(product.cost_price ?? '0');
  const selling = parseFloat(product.selling_price ?? product.price ?? '0');
  const minBuffer = Number(product.min_reorder_point ?? 0);

  const isOutOfStock = stock <= 0;
  const isLowStock = !isOutOfStock && minBuffer > 0 && stock <= minBuffer;

  const marginDollar = selling - cost;
  const marginPercent = selling > 0 ? (marginDollar / selling) * 100 : 0;
  const totalValuation = stock * cost;
  const isActive = product.is_active !== false;

  const handleCopySku = () => {
    if (!product.sku) return;
    navigator.clipboard.writeText(product.sku);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
    toast.success('SKU copied to clipboard');
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    try {
      setUploadingImage(true);
      const res = await uploadProductImageApi(product.id, file);
      const newUrl = res?.data?.image_url || res?.image_url;
      if (newUrl) {
        setCurrentImageUrl(newUrl);
        product.image_url = newUrl;
      }
      toast.success('Product image uploaded successfully to MinIO S3!');
      onProductUpdated?.();
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      toast.error(err?.message || 'Failed to upload product image.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden font-sans select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200"
          >
            {/* 1. Header */}
            <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand flex items-center justify-center font-bold shrink-0 border border-brand/20">
                  <Package className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-slate-900 truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[11px] font-bold text-slate-500">
                      {product.sku || 'SKU-N/A'}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.2 rounded-full border ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {isActive ? 'Active SKU' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Product Hero Image / Photo Uploader */}
              <div className="relative rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-slate-100/60 p-4 flex flex-col items-center justify-center min-h-[200px] overflow-hidden group">
                {currentImageUrl ? (
                  <div className="relative w-full h-48 max-w-sm rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-white">
                    <img
                      src={currentImageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-md hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {uploadingImage ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
                        ) : (
                          <Camera className="w-3.5 h-3.5 text-brand" />
                        )}
                        <span>Change Photo</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center mx-auto text-slate-400">
                      <Package className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">No Image Uploaded</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Add a product photo for the POS register and catalog
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="px-3.5 py-1.5 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand-hover transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Camera className="w-3.5 h-3.5" />
                      )}
                      <span>Upload Product Image</span>
                    </button>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleImageFileChange}
                />
              </div>

              {/* Pricing & Gross Margin Cards */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-brand" />
                  <span>Pricing & Profit Margins</span>
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                      Selling Price
                    </span>
                    <span className="text-lg font-black text-slate-900 font-mono">
                      ${selling.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                      Retail / POS unit
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                      Unit Cost
                    </span>
                    <span className="text-lg font-black text-slate-600 font-mono">
                      ${cost.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                      Wholesale cost
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                      Gross Margin
                    </span>
                    <span
                      className={`text-lg font-black font-mono ${
                        marginDollar >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {marginDollar >= 0 ? '+' : ''}${marginDollar.toFixed(2)}
                    </span>
                    <span
                      className={`text-[10px] font-bold block mt-0.5 ${
                        marginDollar >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {marginPercent.toFixed(1)}% margin
                    </span>
                  </div>
                </div>
              </div>

              {/* Inventory Stock & Reorder Points */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand" />
                  <span>Inventory Balance & Valuation</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Stock on Hand
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isOutOfStock
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isLowStock
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOutOfStock
                              ? 'bg-rose-500'
                              : isLowStock
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'Optimal'}
                      </span>
                    </div>
                    <span className="text-xl font-black text-slate-900 font-mono">
                      {Number.isInteger(stock) ? stock : stock.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                      Units available across outlets
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                      Inventory Asset Value
                    </span>
                    <span className="text-xl font-black text-slate-900 font-mono">
                      ${totalValuation.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                      Total stock cost valuation
                    </span>
                  </div>
                </div>

                {minBuffer > 0 && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between text-xs text-amber-800">
                    <span className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Reorder Threshold:</span>
                    </span>
                    <span className="font-mono font-black">{minBuffer} units buffer</span>
                  </div>
                )}
              </div>

              {/* Taxonomy, Barcode & Metadata */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand" />
                  <span>Catalog Taxonomy & Barcode</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">SKU Code</span>
                    <div className="flex items-center gap-1.5">
                      <code className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 font-mono font-bold text-slate-800 text-xs">
                        {product.sku || 'N/A'}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopySku}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                        title="Copy SKU"
                      >
                        {copiedSku ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Barcode (EAN / UPC)</span>
                    <span className="font-mono font-bold text-slate-800">
                      {product.barcode || 'None assigned'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Category</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 font-bold text-slate-800 text-[11px]">
                      {product.category_name || product.category || 'General'}
                    </span>
                  </div>

                  {product.brand_name && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Brand</span>
                      <span className="font-bold text-slate-800 text-[11px]">
                        {product.brand_name}
                      </span>
                    </div>
                  )}

                  {product.expiry_date && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Expiry Date</span>
                      </span>
                      <span className="font-mono font-bold text-slate-800 text-[11px]">
                        {String(product.expiry_date).split('T')[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    Description & Specifications
                  </h4>
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 leading-relaxed font-medium">
                    {product.description}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Footer Action Controls */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {onAdjustStock && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onAdjustStock(product);
                    }}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                    <span>Adjust Stock</span>
                  </button>
                )}

                {onViewMovements && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewMovements(product);
                    }}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <History className="w-3.5 h-3.5 text-blue-600" />
                    <span>History</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onDelete(product);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                    title="Delete Product SKU"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEdit(product);
                    }}
                    className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit SKU</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
