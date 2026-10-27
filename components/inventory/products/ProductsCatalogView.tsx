'use client';

import React, { useState, useEffect } from 'react';
import { ProductCatalogTable } from './ProductCatalogTable';
import { ProductDetailDrawer } from './ProductDetailDrawer';
import { AddProductModal } from './AddProductModal';
import { EditProductModal } from './EditProductModal';
import { ProductImportModal } from './ProductImportModal';
import { ProductStockAdjustModal } from './ProductStockAdjustModal';
import { ProductMovementsModal } from './ProductMovementsModal';
import { getProductsApi, getCategoriesApi, getBrandsApi, deleteProductApi } from '@/lib/api';
import { useToast, useConfirm } from '@/components/common';

export function ProductsCatalogView() {
  const toast = useToast();
  const confirm = useConfirm();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // In-Page Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<any | null>(null);
  const [viewingMovementsProduct, setViewingMovementsProduct] = useState<any | null>(null);

  async function loadProductsData() {
    try {
      setLoading(true);
      const res = await getProductsApi();
      const list = Array.isArray(res) ? res : res?.data || [];
      setProducts(list);
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategoriesData() {
    try {
      const res = await getCategoriesApi();
      const list = Array.isArray(res) ? res : res?.data || [];
      setCategories(list);
    } catch (err) {
      console.warn('Failed to load categories:', err);
    }
  }

  async function loadBrandsData() {
    try {
      const res = await getBrandsApi();
      const list = Array.isArray(res) ? res : res?.data || [];
      setBrands(list);
    } catch (err) {
      console.warn('Failed to load brands:', err);
    }
  }

  useEffect(() => {
    loadProductsData();
    loadCategoriesData();
    loadBrandsData();
  }, []);

  const handleDeleteProduct = async (product: any) => {
    const confirmed = await confirm({
      title: 'Delete Product SKU',
      description: `Are you sure you want to permanently delete "${product.name}" from the product catalog? This action cannot be undone.`,
      variant: 'danger',
      confirmText: 'Delete SKU',
      details: [
        { label: 'Product Name', value: product.name },
        { label: 'SKU', value: product.sku || 'N/A' },
        { label: 'Barcode', value: product.barcode || 'N/A' },
        { label: 'Stock on Hand', value: `${Math.floor(parseFloat(product.stock_on_hand || '0'))} units` },
      ],
    });

    if (!confirmed) return;

    try {
      await deleteProductApi(product.id);
      toast.success(`Product "${product.name}" was successfully deleted.`);
      loadProductsData();
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      toast.error(err?.message || 'Failed to delete product SKU.');
    }
  };

  return (
    <div className="h-full flex flex-col w-full font-sans text-slate-900 overflow-hidden">
      {/* 1. Interactive Product Catalog Table */}
      <ProductCatalogTable
        products={products}
        categories={categories}
        brands={brands}
        loading={loading}
        onOpenAddModal={() => {
          loadCategoriesData();
          loadBrandsData();
          setIsAddModalOpen(true);
        }}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onViewDetail={(p) => setViewingProduct(p)}
        onEditProduct={(p) => {
          loadCategoriesData();
          loadBrandsData();
          setEditingProduct(p);
        }}
        onDeleteProduct={handleDeleteProduct}
        onAdjustStock={(p) => setAdjustingProduct(p)}
        onViewMovements={(p) => setViewingMovementsProduct(p)}
      />

      {/* 2. Interactive Product Detail Drawer */}
      <ProductDetailDrawer
        isOpen={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
        product={viewingProduct}
        onEdit={(p) => {
          loadCategoriesData();
          loadBrandsData();
          setEditingProduct(p);
        }}
        onDelete={handleDeleteProduct}
        onAdjustStock={(p) => setAdjustingProduct(p)}
        onViewMovements={(p) => setViewingMovementsProduct(p)}
        onProductUpdated={() => {
          loadProductsData();
        }}
      />

      {/* 3. Reusable In-Page Dynamic Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        brands={brands}
        onProductCreated={(productName) => {
          toast.success(`Product "${productName}" successfully created & added to inventory!`);
          loadProductsData();
        }}
      />

      {/* 3. In-Page Dynamic Edit Product Modal */}
      <EditProductModal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        categories={categories}
        brands={brands}
        onProductUpdated={(productName) => {
          toast.success(`Product "${productName}" details updated successfully!`);
          loadProductsData();
        }}
      />

      {/* 4. In-Page Dynamic Bulk Import Products Modal */}
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(count) => {
          toast.success(`Successfully imported ${count} products into catalog & inventory!`);
          loadProductsData();
        }}
      />

      {/* 5. In-Page Dynamic Quick Stock Adjustment Modal */}
      <ProductStockAdjustModal
        isOpen={Boolean(adjustingProduct)}
        onClose={() => setAdjustingProduct(null)}
        product={adjustingProduct}
        onAdjustSuccess={(name, newQty) => {
          toast.success(`Stock adjusted for "${name}" (New balance: ${newQty} units).`);
          loadProductsData();
        }}
      />

      {/* 6. In-Page Dynamic Product Movement Audit Ledger Modal */}
      <ProductMovementsModal
        isOpen={Boolean(viewingMovementsProduct)}
        onClose={() => setViewingMovementsProduct(null)}
        product={viewingMovementsProduct}
      />
    </div>
  );
}
