'use client';

import React from 'react';
import { Package, Plus, Loader2, RotateCcw, FileSpreadsheet, Download } from 'lucide-react';
import { ProductCatalogStats } from './ProductCatalogStats';
import { ProductCatalogToolbar } from './ProductCatalogToolbar';
import { ProductCatalogFilterChips } from './ProductCatalogFilterChips';
import { ProductCatalogTableHeader } from './ProductCatalogTableHeader';
import { ProductCatalogTableRow } from './ProductCatalogTableRow';
import { ProductCatalogPagination } from './ProductCatalogPagination';
import { useProductCatalog } from './useProductCatalog';
import { exportProductsToCsv } from './productCsvUtils';

interface ProductCatalogTableProps {
  products: any[];
  categories?: any[];
  brands?: any[];
  loading: boolean;
  onOpenAddModal: () => void;
  onOpenImportModal?: () => void;
  onViewDetail?: (product: any) => void;
  onEditProduct?: (product: any) => void;
  onDeleteProduct?: (product: any) => void;
  onAdjustStock?: (product: any) => void;
  onViewMovements?: (product: any) => void;
}

export function ProductCatalogTable({
  products,
  categories = [],
  brands = [],
  loading,
  onOpenAddModal,
  onOpenImportModal,
  onViewDetail,
  onEditProduct,
  onDeleteProduct,
  onAdjustStock,
  onViewMovements,
}: ProductCatalogTableProps) {
  const {
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    stockStatus,
    setStockStatus,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    categoryOptions,
    stats,
    handleSortPresetChange,
    handleResetFilters,
    hasActiveFilters,
    totalItems,
    totalPages,
    validCurrentPage,
    paginatedProducts,
    currentSortPreset,
    filteredProducts,
  } = useProductCatalog(products, categories);

  const [exporting, setExporting] = React.useState(false);

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const list = hasActiveFilters && filteredProducts?.length ? filteredProducts : products;
      await exportProductsToCsv(list, 'products_catalog', {
        search: search.trim() || undefined,
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
        stockStatus: stockStatus !== 'all' ? stockStatus : undefined,
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent p-2.5 sm:p-3 rounded-xl border border-slate-300/80 font-sans gap-2 overflow-hidden">
      {/* 1. Header & Title Bar */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-300/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-subtle flex items-center justify-center text-brand">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <span>Products &amp; SKUs Catalog</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-subtle text-brand border border-brand/20">
                {products.length} SKUs
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real-time stock valuation, unit costs, selling prices, and reorder buffer thresholds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={products.length === 0 || exporting}
            className="px-3.5 py-2 bg-transparent hover:bg-slate-200/50 text-slate-700 hover:text-slate-900 border border-slate-300/80 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs backdrop-blur-sm disabled:opacity-40"
            title="Export catalog to CSV via API"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
            ) : (
              <Download className="w-4 h-4 text-brand" />
            )}
            <span>{exporting ? 'Exporting...' : 'Export (CSV)'}</span>
          </button>

          {onOpenImportModal && (
            <button
              type="button"
              onClick={onOpenImportModal}
              className="px-3.5 py-2 bg-transparent hover:bg-slate-200/50 text-slate-700 hover:text-slate-900 border border-slate-300/80 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs backdrop-blur-sm"
              title="Bulk import products from CSV, Excel, or Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Import (CSV)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl font-black text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive KPI Filter Badges */}
      <div className="shrink-0">
        <ProductCatalogStats
          stats={stats}
          currentStatus={stockStatus}
          onSelectStatus={(status) => {
            setStockStatus(status);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* 3. Search, Filter & Sort Toolbar */}
      <div className="shrink-0">
        <ProductCatalogToolbar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          onClearSearch={() => {
            setSearch('');
            setCurrentPage(1);
          }}
          categories={categoryOptions}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setCurrentPage(1);
          }}
          totalProductsCount={products.length}
          stockStatus={stockStatus}
          onSelectStockStatus={(status) => {
            setStockStatus(status);
            setCurrentPage(1);
          }}
          stats={stats}
          currentSortPreset={currentSortPreset}
          onSortPresetChange={handleSortPresetChange}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
        />
      </div>

      {/* 4. Active Filter Chips */}
      {hasActiveFilters && (
        <div className="shrink-0">
          <ProductCatalogFilterChips
            search={search}
            onClearSearch={() => {
              setSearch('');
              setCurrentPage(1);
            }}
            selectedCategory={selectedCategory}
            onClearCategory={() => {
              setSelectedCategory('all');
              setCurrentPage(1);
            }}
            stockStatus={stockStatus}
            onClearStockStatus={() => {
              setStockStatus('all');
              setCurrentPage(1);
            }}
            totalFiltered={totalItems}
            totalProducts={products.length}
          />
        </div>
      )}

      {/* 5. Products Data Grid Table with Pinned Columns */}
      <div className="flex-1 min-h-0 flex flex-col gap-1 overflow-hidden">
        <div className="shrink-0 flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand/60 inline-block"></span>
            Pinned columns: <strong className="text-slate-600">Product &amp; SKU</strong> and <strong className="text-slate-600">Category</strong>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
            <span>↔ Scroll horizontally to view all product metrics</span>
          </span>
        </div>

        <div className="flex-1 min-h-0 relative overflow-auto border border-slate-300/80 rounded-xl">
          <table className="w-full min-w-[1550px] border-separate border-spacing-0 text-xs">
          <ProductCatalogTableHeader />

          <tbody className="divide-y divide-slate-200/80 bg-transparent">
            {loading ? (
              <tr>
                <td colSpan={12} className="py-14 text-center text-slate-400 font-medium">
                  <Loader2 className="w-7 h-7 animate-spin mx-auto text-brand mb-2.5" />
                  <span className="font-semibold text-slate-600">Loading live catalog products &amp; SKUs...</span>
                </td>
              </tr>
            ) : paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-14 text-center text-slate-400 font-medium space-y-2">
                  <Package className="w-9 h-9 mx-auto text-slate-300 mb-1" />
                  <p className="font-extrabold text-slate-700 text-sm">No Matching Products Found</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {hasActiveFilters
                      ? 'No products matched your search query or filter criteria. Try adjusting or clearing your filters.'
                      : 'No catalog products available yet. Click "Add Product" above to create your first item.'}
                  </p>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-subtle text-brand hover:bg-brand/20 font-bold text-xs transition-colors cursor-pointer border border-brand/20"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear All Filters</span>
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              paginatedProducts.map((p: any) => (
                <ProductCatalogTableRow
                  key={p.id}
                  product={p}
                  onViewDetail={onViewDetail}
                  onEdit={onEditProduct}
                  onDelete={onDeleteProduct}
                  onAdjustStock={onAdjustStock}
                  onViewMovements={onViewMovements}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* 6. Pagination & Row Limits */}
      <div className="shrink-0 pt-1.5 border-t border-slate-300/60 mt-auto">
        <ProductCatalogPagination
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          currentPage={validCurrentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}
