'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Package, Plus, AlertTriangle } from 'lucide-react';
import { Product } from '../types';

interface PosProductGridProps {
  products: Product[];
  selectedCategory: string;
  searchQuery: string;
  loading: boolean;
  onAddToCart: (product: Product) => void;
  onLowStockAlert?: (msg: string) => void;
}

function PosProductCard({
  product,
  idx,
  cardVariants,
  onAddToCart,
  onLowStockAlert,
}: {
  product: Product;
  idx: number;
  cardVariants: Variants;
  onAddToCart: (product: Product) => void;
  onLowStockAlert?: (msg: string) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = product.image_url || product.image;
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <motion.div
      key={product.id}
      custom={idx}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={!isOutOfStock ? { y: -3, scale: 1.02 } : undefined}
      whileTap={!isOutOfStock ? { scale: 0.97 } : undefined}
      onClick={() => {
        if (isOutOfStock) return;
        if (product.stock !== undefined && product.stock <= 2 && product.stock > 0) {
          onLowStockAlert?.(
            `Low Stock Warning: Only ${product.stock} units remaining in inventory for "${product.name}"`
          );
        }
        onAddToCart(product);
      }}
      className={`p-3.5 rounded-2xl bg-white border transition-all flex flex-col justify-between cursor-pointer select-none relative group ${
        isOutOfStock
          ? 'opacity-60 border-slate-200 bg-slate-50 cursor-not-allowed'
          : 'border-slate-200/90 shadow-xs hover:shadow-md hover:border-brand/40'
      }`}
    >
      {/* Top Category Tag & Stock */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[80px]">
          {product.category || 'General'}
        </span>
        {product.stock !== undefined && (
          <span
            className={`text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
              isOutOfStock
                ? 'bg-rose-100 text-rose-700'
                : product.stock <= 2
                ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse font-black'
                : product.stock <= 5
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : product.stock <= 2 ? (
              <>
                <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                <span>Only {product.stock} left!</span>
              </>
            ) : (
              `${product.stock} left`
            )}
          </span>
        )}
      </div>

      {/* Product Image / Icon Visual */}
      <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center relative my-1 group-hover:border-brand/30 transition-all">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Product Name & SKU */}
      <div className="space-y-0.5 my-1">
        <h4 className="font-extrabold text-xs text-slate-900 line-clamp-2 leading-tight">
          {product.name}
        </h4>
        {product.sku && (
          <p className="text-[10px] text-slate-400 font-mono">{product.sku}</p>
        )}
      </div>

      {/* Bottom Price & Add Action */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
        <span className="text-sm font-black text-slate-900 tracking-tight">
          ${Number(product.price).toFixed(2)}
        </span>
        <div className="w-6 h-6 rounded-lg bg-brand-subtle group-hover:bg-brand text-brand group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
          <Plus className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
}

export function PosProductGrid({
  products,
  selectedCategory,
  searchQuery,
  loading,
  onAddToCart,
  onLowStockAlert,
}: PosProductGridProps) {
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.includes(searchQuery);

    return matchesCategory && matchesSearch;
  });

  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: Math.min(i * 0.02, 0.2), duration: 0.25, ease: 'easeOut' },
    }),
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 animate-pulse h-56 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="h-2.5 bg-slate-100 rounded w-16" />
              <div className="h-3 bg-slate-100 rounded w-12" />
            </div>
            <div className="w-full h-24 rounded-xl bg-slate-100" />
            <div className="space-y-2 my-2">
              <div className="h-3 bg-slate-100 rounded-md w-3/4" />
              <div className="h-2 bg-slate-100 rounded-md w-1/2" />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <div className="h-4 bg-slate-100 rounded w-14" />
              <div className="w-6 h-6 bg-slate-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center justify-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-brand-subtle text-brand flex items-center justify-center border border-brand/20">
          <Package className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-800">No products found</p>
          <p className="text-xs text-slate-400">
            {searchQuery
              ? `No items match "${searchQuery}" in ${selectedCategory}`
              : `No items available in category "${selectedCategory}"`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
      {filteredProducts.map((product, idx) => (
        <PosProductCard
          key={product.id}
          product={product}
          idx={idx}
          cardVariants={cardVariants}
          onAddToCart={onAddToCart}
          onLowStockAlert={onLowStockAlert}
        />
      ))}
    </div>
  );
}
