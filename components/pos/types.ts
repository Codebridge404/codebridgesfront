export interface Product {
  id: string | number;
  name: string;
  sku?: string;
  price: number;
  category?: string;
  stock_on_hand?: number;
  stock?: number;
  barcode?: string;
  image?: string;
  image_url?: string;
}

export interface CartItem {
  product_id?: string | number;
  name: string;
  price: number;
  qty: number;
  quantity?: number;
  product?: Product;
  subtotal?: number;
}

export interface ShiftInfo {
  id: number | string;
  outlet_id?: number | string;
  user_id?: number | string;
  user_name?: string;
  opening_float: number;
  opened_at: string;
  status: 'open' | 'closed';
  cash_sales_total?: number;
  khqr_sales_total?: number;
  card_sales_total?: number;
  expected_drawer_cash?: number;
  transactions_count?: number;
}

export interface PosKpis {
  todaySales: number;
  todaySalesChange?: string;
  todayTransactions: number;
  averageTicket: number;
  drawerFloat: number;
  cashSales: number;
  khqrSales: number;
  cardSales: number;
}

export interface RecentPosSale {
  id: string | number;
  receipt_number: string;
  customer_name?: string;
  created_at: string;
  grand_total: number;
  tender_type: string;
  status: string;
  items_count?: number;
}

export interface HeldCart {
  id: string | number;
  customer_name?: string;
  created_at: string;
  items: any[];
  total_amount?: number;
}
