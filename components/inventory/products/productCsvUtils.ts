/**
 * Product CSV Operations: Import, Export, and Sample Template
 */
import { exportProductsCsvApi } from '@/lib/api';

export function downloadSampleProductCsvTemplate() {
  const csvContent = `name,sku,barcode,selling_price,cost_price,initial_stock,min_reorder_point,category_name,description
Iced Americano,BEV-AME-01,885000000001,2.50,1.20,100,5,Beverages,Cold brew iced coffee
Iced Latte,BEV-LAT-01,885000000002,3.00,1.50,80,5,Beverages,Espresso with fresh milk
Butter Croissant,SNK-CRO-01,885000000003,2.00,0.80,50,5,Bakery,Freshly baked butter croissant`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'products_import_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseProductImportCsv(csvText: string) {
  const lines = csvText.split(/\r\n|\n/).filter((line) => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
    const cleanValues = values.map((v) => v.trim().replace(/^["']|["']$/g, ''));
    const rowData: any = {};
    headers.forEach((header, index) => {
      if (cleanValues[index] !== undefined) rowData[header] = cleanValues[index];
    });
    if (rowData.name) {
      rows.push({
        name: rowData.name,
        sku: rowData.sku || `SKU-${rowData.name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: rowData.barcode || undefined,
        selling_price: parseFloat(rowData.selling_price) || 0,
        cost_price: parseFloat(rowData.cost_price || '0'),
        category_name: rowData.category_name || rowData.category || 'General',
        min_reorder_point: parseInt(rowData.min_reorder_point || '5', 10),
        initial_stock: parseInt(rowData.initial_stock || '0', 10),
        description: rowData.description || undefined,
      });
    }
  }
  return rows;
}

export async function exportProductsToCsv(
  products: any[],
  filenamePrefix: string = 'catalog_export',
  filters?: {
    outletId?: string | number;
    categoryId?: string;
    brandId?: string;
    search?: string;
    stockStatus?: string;
  }
) {
  try {
    // 1. Primary: Use dedicated backend microservice export endpoint
    await exportProductsCsvApi(filters);
  } catch (err) {
    console.warn('Backend export endpoint unavailable, falling back to client CSV generator:', err);
    // 2. Fallback: Instant client-side CSV generator from loaded memory
    if (!products || products.length === 0) return;
    const headers = ['Name', 'SKU', 'Barcode', 'Category', 'Brand', 'Selling Price', 'Cost Price', 'Stock On Hand', 'Min Buffer', 'Expiry Date', 'Status'];
    const rows = [headers.join(',')];

    products.forEach((p: any) => {
      rows.push([
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${p.sku || ''}"`,
        `"${p.barcode || ''}"`,
        `"${(p.category_name || p.category?.name || p.category || 'General').replace(/"/g, '""')}"`,
        `"${(p.brand_name || p.brand?.name || '').replace(/"/g, '""')}"`,
        parseFloat(p.selling_price || p.price || '0').toFixed(2),
        parseFloat(p.cost_price || '0').toFixed(2),
        parseFloat(p.stock_on_hand || '0'),
        parseInt(p.min_reorder_point || '5', 10),
        p.expiry_date ? String(p.expiry_date).split('T')[0] : '',
        p.is_active !== false ? 'Active' : 'Inactive',
      ].join(','));
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
