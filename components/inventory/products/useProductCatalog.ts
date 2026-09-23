'use client';

import { useState, useMemo } from 'react';
import {
  SortKey,
  SortOrder,
  StockStatusFilter,
  CategoryOption,
  ProductStats,
} from './types';

export function useProductCatalog(products: any[], categories: any[] = []) {
  // Filter & Search States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockStatus, setStockStatus] = useState<StockStatusFilter>('all');

  // Sorting States
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Derive unique categories from both categories prop and products list
  const categoryOptions = useMemo<CategoryOption[]>(() => {
    const map = new Map<string, CategoryOption>();

    categories.forEach((cat: any) => {
      const name = cat.name || cat.title;
      if (name) {
        map.set(name.toLowerCase(), { id: String(cat.id || name), name, count: 0 });
      }
    });

    products.forEach((p: any) => {
      const catName = p.category_name || p.category?.name || p.category || 'Uncategorized';
      const key = catName.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { id: key, name: catName, count: 0 });
      }
      const item = map.get(key)!;
      item.count += 1;
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, products]);

  // Overall KPI counts
  const stats = useMemo<ProductStats>(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach((p: any) => {
      const stock = parseFloat(p.stock_on_hand || '0');
      const minBuffer = parseInt(p.min_reorder_point || '5', 10);
      if (stock <= 0) {
        outOfStock++;
      } else if (stock <= minBuffer) {
        lowStock++;
      } else {
        inStock++;
      }
    });

    return {
      total: products.length,
      inStock,
      lowStock,
      outOfStock,
    };
  }, [products]);

  // Handle column header sort toggle
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      const isNumDesc = key === 'stock' || key === 'cost_price' || key === 'selling_price' || key === 'margin' || key === 'stock_value';
      setSortOrder(isNumDesc ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = products.filter((p: any) => {
      if (q) {
        const name = (p.name || '').toLowerCase();
        const sku = (p.sku || '').toLowerCase();
        const barcode = (p.barcode || '').toLowerCase();
        const cat = (p.category_name || p.category?.name || p.category || '').toLowerCase();
        if (!name.includes(q) && !sku.includes(q) && !barcode.includes(q) && !cat.includes(q)) {
          return false;
        }
      }

      if (selectedCategory !== 'all') {
        const catName = (p.category_name || p.category?.name || p.category || 'Uncategorized').toLowerCase();
        if (catName !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      if (stockStatus !== 'all') {
        const stock = parseFloat(p.stock_on_hand || '0');
        const minBuffer = parseInt(p.min_reorder_point || '5', 10);
        if (stockStatus === 'out_of_stock' && stock > 0) return false;
        if (stockStatus === 'low_stock' && (stock <= 0 || stock > minBuffer)) return false;
        if (stockStatus === 'in_stock' && stock <= minBuffer) return false;
      }

      return true;
    });

    filtered.sort((a: any, b: any) => {
      let valA: any;
      let valB: any;

      switch (sortKey) {
        case 'name':
          valA = (a.name || '').toLowerCase();
          valB = (b.name || '').toLowerCase();
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);

        case 'sku':
          valA = (a.sku || '').toLowerCase();
          valB = (b.sku || '').toLowerCase();
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);

        case 'category':
          valA = (a.category_name || a.category?.name || a.category || '').toLowerCase();
          valB = (b.category_name || b.category?.name || b.category || '').toLowerCase();
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);

        case 'barcode':
          valA = (a.barcode || '').toLowerCase();
          valB = (b.barcode || '').toLowerCase();
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);

        case 'stock':
          valA = parseFloat(a.stock_on_hand || '0');
          valB = parseFloat(b.stock_on_hand || '0');
          return sortOrder === 'asc' ? valA - valB : valB - valA;

        case 'cost_price':
          valA = parseFloat(a.cost_price || '0');
          valB = parseFloat(b.cost_price || '0');
          return sortOrder === 'asc' ? valA - valB : valB - valA;

        case 'selling_price':
          valA = parseFloat(a.selling_price || a.price || '0');
          valB = parseFloat(b.selling_price || b.price || '0');
          return sortOrder === 'asc' ? valA - valB : valB - valA;

        case 'margin': {
          const sellA = parseFloat(a.selling_price || a.price || '0');
          const costA = parseFloat(a.cost_price || '0');
          const sellB = parseFloat(b.selling_price || b.price || '0');
          const costB = parseFloat(b.cost_price || '0');
          return sortOrder === 'asc' ? (sellA - costA) - (sellB - costB) : (sellB - costB) - (sellA - costA);
        }

        case 'stock_value': {
          const valA = parseFloat(a.stock_on_hand || '0') * parseFloat(a.cost_price || '0');
          const valB = parseFloat(b.stock_on_hand || '0') * parseFloat(b.cost_price || '0');
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        case 'min_buffer':
          valA = parseInt(a.min_reorder_point || '5', 10);
          valB = parseInt(b.min_reorder_point || '5', 10);
          return sortOrder === 'asc' ? valA - valB : valB - valA;

        case 'status': {
          valA = a.is_active === false ? 0 : 1;
          valB = b.is_active === false ? 0 : 1;
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        default:
          return 0;
      }
    });

    return filtered;
  }, [products, search, selectedCategory, stockStatus, sortKey, sortOrder]);

  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return filteredAndSortedProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedProducts, validCurrentPage, pageSize]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setStockStatus('all');
    setSortKey('name');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  const hasActiveFilters = search.trim() !== '' || selectedCategory !== 'all' || stockStatus !== 'all';

  const handleSortPresetChange = (preset: string) => {
    const lastUnderscore = preset.lastIndexOf('_');
    if (lastUnderscore !== -1) {
      const key = preset.substring(0, lastUnderscore) as SortKey;
      const order = preset.substring(lastUnderscore + 1) as SortOrder;
      setSortKey(key);
      setSortOrder(order);
      setCurrentPage(1);
    }
  };

  const currentSortPreset = `${sortKey}_${sortOrder}`;

  return {
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    stockStatus,
    setStockStatus,
    sortKey,
    sortOrder,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    categoryOptions,
    stats,
    handleSort,
    handleSortPresetChange,
    handleResetFilters,
    hasActiveFilters,
    totalItems,
    totalPages,
    validCurrentPage,
    paginatedProducts,
    currentSortPreset,
    filteredProducts: filteredAndSortedProducts,
  };
}
