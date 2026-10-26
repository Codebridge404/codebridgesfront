'use client';

/**
 * [BD-0053] Core IndexedDB Persistent Offline Store for POS Cashier Workstations.
 *
 * Provides resilient, asynchronous local storage exceeding localStorage limits (up to hundreds of MBs).
 * Stores:
 * 1. 'catalog': Cached product items (SKU, barcode, price, stock, category).
 * 2. 'categories': Cached category filters.
 * 3. 'active_cart': Persisted uncommitted cart state across page refreshes.
 * 4. 'offline_sales': Robust queue for offline sales transactions with sync status tracking.
 */

const DB_NAME = 'CodeBridge_POS_OfflineDB';
const DB_VERSION = 1;

export interface OfflineSaleItem {
  id: string | number;
  name: string;
  quantity: number;
  price: number;
  variant_id?: string | number | null;
}

export interface OfflineSaleTender {
  tender_type: string;
  amount: number;
}

export interface OfflineSaleRecord {
  offline_id: string;
  receipt_number: string;
  outlet_id?: number | null;
  register_id?: number | null;
  items: OfflineSaleItem[];
  tenders: OfflineSaleTender[];
  grand_total: number;
  created_at: string;
  sync_status: 'pending' | 'syncing' | 'synced' | 'failed';
  sync_attempts?: number;
  error_message?: string;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Product Catalog Store
      if (!db.objectStoreNames.contains('catalog')) {
        const catalogStore = db.createObjectStore('catalog', { keyPath: 'id' });
        catalogStore.createIndex('barcode', 'barcode', { unique: false });
        catalogStore.createIndex('category', 'category', { unique: false });
        catalogStore.createIndex('sku', 'sku', { unique: false });
      }

      // 2. Categories Store
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'name' });
      }

      // 3. Active Cart Store (Single key 'current_cart')
      if (!db.objectStoreNames.contains('active_cart')) {
        db.createObjectStore('active_cart', { keyPath: 'key' });
      }

      // 4. Offline Sales Queue Store
      if (!db.objectStoreNames.contains('offline_sales')) {
        const salesStore = db.createObjectStore('offline_sales', { keyPath: 'offline_id' });
        salesStore.createIndex('sync_status', 'sync_status', { unique: false });
        salesStore.createIndex('created_at', 'created_at', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ============================================================================
// Catalog Cache Operations
// ============================================================================

export async function cacheCatalog(products: any[]): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('catalog', 'readwrite');
      const store = tx.objectStore('catalog');
      store.clear(); // Replace with fresh snapshot
      for (const p of products) {
        store.put(p);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to cache catalog:', err);
  }
}

export async function getCachedCatalog(): Promise<any[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('catalog', 'readonly');
      const store = tx.objectStore('catalog');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to read cached catalog:', err);
    return [];
  }
}

export async function cacheCategories(categories: string[]): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('categories', 'readwrite');
      const store = tx.objectStore('categories');
      store.clear();
      for (const name of categories) {
        store.put({ name });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to cache categories:', err);
  }
}

export async function getCachedCategories(): Promise<string[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('categories', 'readonly');
      const store = tx.objectStore('categories');
      const request = store.getAll();
      request.onsuccess = () => {
        const rows = request.result || [];
        resolve(rows.map((r: any) => r.name));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to read cached categories:', err);
    return [];
  }
}

// ============================================================================
// Active Cart Persistence Operations
// ============================================================================

export async function savePersistentCart(cartItems: any[], context?: any): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('active_cart', 'readwrite');
      const store = tx.objectStore('active_cart');
      store.put({
        key: 'current_cart',
        items: cartItems,
        context: context || null,
        updated_at: new Date().toISOString(),
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to persist active cart:', err);
  }
}

export async function getPersistentCart(): Promise<{ items: any[]; context?: any } | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('active_cart', 'readonly');
      const store = tx.objectStore('active_cart');
      const request = store.get('current_cart');
      request.onsuccess = () => {
        if (request.result && Array.isArray(request.result.items)) {
          resolve({ items: request.result.items, context: request.result.context });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to retrieve persistent cart:', err);
    return null;
  }
}

export async function clearPersistentCart(): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('active_cart', 'readwrite');
      const store = tx.objectStore('active_cart');
      store.delete('current_cart');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to clear persistent cart:', err);
  }
}

// ============================================================================
// Offline Sales Queue Operations
// ============================================================================

export function generateOfflineReceiptNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randSeq = Math.floor(10000 + Math.random() * 90000);
  return `REC-OFFLINE-${dateStr}-${randSeq}`;
}

export async function enqueueOfflineSale(
  cartOrPayload: any,
  maybeTenders?: any[],
  meta?: { outlet_id?: number; register_id?: number }
): Promise<OfflineSaleRecord> {
  const offlineId = `OFFLINE-TX-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const receiptNo = generateOfflineReceiptNumber();

  let items: OfflineSaleItem[] = [];
  let tenders: OfflineSaleTender[] = [];
  let grandTotal = 0;

  if (Array.isArray(cartOrPayload)) {
    items = cartOrPayload.map((item) => {
      const price = Number(item.product?.price || 0);
      const qty = Number(item.quantity || 1);
      grandTotal += price * qty;
      return {
        id: item.product?.id,
        name: item.product?.name || 'Product',
        quantity: qty,
        price,
        variant_id: item.product?.variant_id || null,
      };
    });
    tenders = maybeTenders || [{ tender_type: 'cash', amount: grandTotal }];
  } else if (cartOrPayload && typeof cartOrPayload === 'object') {
    items = cartOrPayload.items || [];
    tenders = cartOrPayload.tenders || [
      {
        tender_type: cartOrPayload.tender_type || 'cash',
        amount: cartOrPayload.cash_tendered || cartOrPayload.grand_total || 0,
      },
    ];
    grandTotal = Number(cartOrPayload.grand_total || 0);
  }

  const record: OfflineSaleRecord = {
    offline_id: offlineId,
    receipt_number: receiptNo,
    outlet_id: meta?.outlet_id ?? null,
    register_id: meta?.register_id ?? 1,
    items,
    tenders,
    grand_total: grandTotal,
    created_at: new Date().toISOString(),
    sync_status: 'pending',
    sync_attempts: 0,
  };

  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('offline_sales', 'readwrite');
    const store = tx.objectStore('offline_sales');
    store.put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return record;
}

export async function getPendingOfflineSales(): Promise<OfflineSaleRecord[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_sales', 'readonly');
      const store = tx.objectStore('offline_sales');
      const request = store.getAll();
      request.onsuccess = () => {
        const records: OfflineSaleRecord[] = request.result || [];
        resolve(records.filter((r) => r.sync_status !== 'synced'));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to fetch pending sales:', err);
    return [];
  }
}

export async function getOfflineQueueCount(): Promise<number> {
  const pending = await getPendingOfflineSales();
  return pending.length;
}

export async function markOfflineSaleSynced(offlineId: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_sales', 'readwrite');
      const store = tx.objectStore('offline_sales');
      const getReq = store.get(offlineId);
      getReq.onsuccess = () => {
        if (getReq.result) {
          const updated = { ...getReq.result, sync_status: 'synced', error_message: undefined };
          store.put(updated);
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to mark synced:', err);
  }
}

export async function removeOfflineSale(offlineId: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_sales', 'readwrite');
      const store = tx.objectStore('offline_sales');
      store.delete(offlineId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to remove offline sale:', err);
  }
}

export async function clearSyncedOfflineSales(): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('offline_sales', 'readwrite');
    const store = tx.objectStore('offline_sales');
    const all = await new Promise<OfflineSaleRecord[]>((res, rej) => {
      const r = store.getAll();
      r.onsuccess = () => res(r.result || []);
      r.onerror = () => rej(r.error);
    });
    for (const item of all) {
      if (item.sync_status === 'synced') {
        store.delete(item.offline_id);
      }
    }
  } catch (err) {
    console.warn('[IndexedDB] Failed to clear synced sales:', err);
  }
}
