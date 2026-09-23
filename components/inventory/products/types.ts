export type SortKey =
  | 'name'
  | 'sku'
  | 'category'
  | 'barcode'
  | 'stock'
  | 'cost_price'
  | 'selling_price'
  | 'margin'
  | 'stock_value'
  | 'min_buffer'
  | 'status';

export type SortOrder = 'asc' | 'desc';

export type StockStatusFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

export interface CategoryOption {
  id: string;
  name: string;
  count: number;
}

export interface ProductStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}
