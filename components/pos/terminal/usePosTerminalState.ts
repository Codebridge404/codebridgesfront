'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getProductsApi,
  createSaleApi,
  getAuthUser,
  getActiveShiftApi,
  openShiftApi,
  closeShiftApi,
  holdCartApi,
  getHeldCartsApi,
  resumeHeldCartApi,
  deleteHeldCartApi,
  syncOfflineSalesApi,
  getOutletsApi,
} from '@/lib/api';
import {
  cacheCatalog,
  cacheCategories,
  getCachedCatalog,
  getCachedCategories,
  enqueueOfflineSale,
  getPendingOfflineSales,
  clearSyncedOfflineSales,
  removeOfflineSale,
  getOfflineQueueCount,
} from '@/lib/offlineStore';
import { posAudio } from '@/hooks/usePosAudio';
import { kickCashDrawer } from '@/lib/hardwareService';
import { Product } from '@/components/pos';
import { usePosCart } from './usePosCart';

export function usePosTerminalState() {
  const router = useRouter();
  const cartState = usePosCart();

  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing] = useState(false);

  // Modals
  const [showQuickSwitchModal, setShowQuickSwitchModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showBakongModal, setShowBakongModal] = useState(false);
  const [showHeldCartsModal, setShowHeldCartsModal] = useState(false);
  const [showShiftOpenModal, setShowShiftOpenModal] = useState(false);
  const [showShiftCloseModal, setShowShiftCloseModal] = useState(false);

  // States
  const [activeShift, setActiveShift] = useState<any>(null);
  const [heldCarts, setHeldCarts] = useState<any[]>([]);
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [defaultTender, setDefaultTender] = useState<'cash' | 'khqr' | 'card' | 'store_credit'>('cash');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [saleToast, setSaleToast] = useState<string | null>(null);
  const [activeOutletId, setActiveOutletId] = useState<string | null>(null);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const res = await getProductsApi();
      const rawProducts: any[] = Array.isArray(res) ? res : res.data || res.products || [];
      const formattedProducts: Product[] = rawProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku || `SKU-${p.id}`,
        price: Number(p.price || p.selling_price || 0),
        category: p.category_name || (typeof p.category === 'object' ? p.category?.name : p.category) || 'General',
        stock: p.stock_quantity ?? p.stock ?? 99,
        barcode: p.barcode || '',
      }));

      setProducts(formattedProducts);
      const cats = Array.from(new Set(formattedProducts.map((p) => p.category || 'General')));
      setCategories(cats);

      // Cache fresh catalog and categories into IndexedDB for offline resilience
      await cacheCatalog(formattedProducts);
      await cacheCategories(cats);
    } catch (err) {
      console.warn('Failed to load online catalog, attempting IndexedDB offline cache:', err);
      // Seamlessly fall back to local IndexedDB cached catalog
      const cachedProducts = await getCachedCatalog();
      if (cachedProducts && cachedProducts.length > 0) {
        setProducts(cachedProducts);
        const cachedCats = await getCachedCategories();
        setCategories(cachedCats.length > 0 ? cachedCats : ['General']);
        setSaleToast(`Loaded ${cachedProducts.length} items from offline storage`);
        setTimeout(() => setSaleToast(null), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkActiveShift = async () => {
    try {
      const res = await getActiveShiftApi();
      setActiveShift(res.data?.shift || null);
    } catch {
      setActiveShift(null);
    }
  };

  const fetchHeldCarts = async () => {
    try {
      const res = await getHeldCartsApi();
      setHeldCarts(res.data?.held_carts || res.held_carts || []);
    } catch {}
  };

  const autoSyncOfflineQueue = async () => {
    const pendingSales = await getPendingOfflineSales();
    if (pendingSales.length === 0) {
      setOfflineQueueCount(0);
      return;
    }
    try {
      setIsSyncing(true);
      const txPayload = pendingSales.map((s) => ({
        offline_id: s.offline_id,
        receipt_number: s.receipt_number,
        outlet_id: s.outlet_id,
        register_id: s.register_id,
        created_at: s.created_at,
        items: s.items.map((it) => ({
          id: it.id,
          name: it.name,
          quantity: it.quantity,
          price: it.price,
          variant_id: it.variant_id,
        })),
        tenders: s.tenders,
      }));

      const syncRes: any = await syncOfflineSalesApi(txPayload);
      if (syncRes && (syncRes.status === 'success' || syncRes.results)) {
        await clearSyncedOfflineSales();
        // Fallback cleanup of synced items
        for (const s of pendingSales) {
          await removeOfflineSale(s.offline_id);
        }
        setOfflineQueueCount(0);
        posAudio.playCheckoutChime();
        setSaleToast(`Synced ${pendingSales.length} offline transactions to cloud`);
        setTimeout(() => setSaleToast(null), 3500);
      }
    } catch (syncErr) {
      console.warn('Offline auto-sync deferred until stable connection:', syncErr);
    } finally {
      setIsSyncing(false);
      const remaining = await getOfflineQueueCount();
      setOfflineQueueCount(remaining);
    }
  };

  useEffect(() => {
    const currentUser = getAuthUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadCatalog();
    checkActiveShift();
    fetchHeldCarts();

    getOutletsApi()
      .then((res: any) => {
        const list = res.data || res;
        if (Array.isArray(list) && list[0]?.id) {
          setActiveOutletId(String(list[0].id));
        }
      })
      .catch(() => {});

    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      getOfflineQueueCount().then(setOfflineQueueCount).catch(() => {});

      const handleOnline = () => {
        setIsOnline(true);
        autoSyncOfflineQueue();
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const handleOpenCheckout = (tender: 'cash' | 'khqr' | 'card' | 'store_credit') => {
    if (cartState.cart.length === 0) return;
    setDefaultTender(tender);
    setShowCheckoutModal(true);
  };

  const handleCompleteSale = async (
    tenderType: 'cash' | 'khqr' | 'card' | 'store_credit',
    cashTendered: number,
    printReceipt: boolean = true,
    extra?: { customer_id?: any; customer_name?: string; table_id?: any; table_name?: string; order_type?: string }
  ) => {
    const subtotal = cartState.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discount = cartState.appliedCoupon
      ? cartState.appliedCoupon.type === 'percentage'
        ? (subtotal * cartState.appliedCoupon.value) / 100
        : cartState.appliedCoupon.value
      : 0;
    const tax = Math.max(0, subtotal - discount) * 0.1;
    const grandTotal = Math.max(0, subtotal - discount) + tax;

    const salePayload = {
      outlet_id: activeOutletId || user?.outlet_id || '0d612401-62c2-4e9e-9857-69e40f24c86d',
      register_id: '9cd597e1-d134-4a91-b5e1-3dfd72c63554',
      idempotency_key: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      items: cartState.cart.map((i) => ({ product_id: i.product_id || i.product?.id, name: i.name, quantity: i.qty, price: i.price })),
      tender_type: tenderType,
      subtotal,
      discount_total: discount, discount_amount: discount,
      tax_total: tax, tax_amount: tax,
      grand_total: grandTotal,
      cash_tendered: tenderType === 'cash' ? cashTendered : grandTotal,
      shift_id: activeShift?.id || null,
      customer_id: extra?.customer_id || null, customer_name: extra?.customer_name || null,
      table_id: extra?.table_id || null, table_name: extra?.table_name || null,
      order_type: extra?.order_type || 'dine_in',
    };

    if (!isOnline) {
      const offlineId = `off-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const receiptNum = `OFF-${Date.now()}`;
      await enqueueOfflineSale({
        offline_id: offlineId,
        receipt_number: receiptNum,
        outlet_id: salePayload.outlet_id,
        register_id: salePayload.register_id,
        items: cartState.cart.map((i) => ({
          id: i.product_id || i.product?.id || `item-${Date.now()}`,
          name: i.name,
          quantity: i.qty,
          price: i.price,
        })),
        tenders: [
          {
            tender_type: tenderType,
            amount: grandTotal,
          },
        ],
        created_at: new Date().toISOString(),
      });
      const remainingCount = await getOfflineQueueCount();
      setOfflineQueueCount(remainingCount);
      posAudio.playCheckoutChime();
      if (tenderType === 'cash') {
        kickCashDrawer().catch(() => {});
      }

      const offlineSale = {
        ...salePayload,
        receipt_number: receiptNum,
        created_at: new Date().toISOString(),
      };
      if (printReceipt) {
        setCompletedSale(offlineSale);
      } else {
        setSaleToast(`Sale recorded offline (${offlineSale.receipt_number})`);
        setTimeout(() => setSaleToast(null), 3500);
      }
      cartState.handleClearCart();
      return;
    }

    const res = await createSaleApi(salePayload);
    const saleResult = res.data?.sale || res.sale || salePayload;
    posAudio.playCheckoutChime();
    if (tenderType === 'cash') {
      kickCashDrawer().catch(() => {});
    }
    if (printReceipt) {
      setCompletedSale(saleResult);
    } else {
      setSaleToast(`Sale #${saleResult.receipt_number || 'OK'} completed (Receipt skipped)`);
      setTimeout(() => setSaleToast(null), 3500);
    }
    cartState.handleClearCart();
  };

  const handleHoldCart = async (customerName: string) => {
    await holdCartApi({ customer_name: customerName, cart_data: cartState.cart });
    fetchHeldCarts();
    cartState.handleClearCart();
  };

  const handleResumeCart = async (cartId: string) => {
    const res = await resumeHeldCartApi(cartId);
    const resumedItems = res.data?.cart_data || res.cart_data;
    if (resumedItems) {
      cartState.setCart(typeof resumedItems === 'string' ? JSON.parse(resumedItems) : resumedItems);
      fetchHeldCarts();
    }
  };

  const handleDeleteHeldCart = async (cartId: string) => {
    await deleteHeldCartApi(cartId);
    fetchHeldCarts();
  };

  const handleOpenShift = async (floatAmount: number, note: string) => {
    const res = await openShiftApi({ opening_float: floatAmount, note });
    if (res.data?.shift) setActiveShift(res.data.shift);
  };

  const handleCloseShift = async (countedCash: number, note: string, supervisorPin?: string) => {
    await closeShiftApi({ counted_cash: countedCash, note, supervisor_pin: supervisorPin });
    setActiveShift(null);
  };

  return {
    ...cartState,
    user,
    setUser,
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    loading,
    isProcessing,
    showQuickSwitchModal,
    setShowQuickSwitchModal,
    showCheckoutModal,
    setShowCheckoutModal,
    showReturnModal,
    setShowReturnModal,
    showBakongModal,
    setShowBakongModal,
    showHeldCartsModal,
    setShowHeldCartsModal,
    showShiftOpenModal,
    setShowShiftOpenModal,
    showShiftCloseModal,
    setShowShiftCloseModal,
    activeShift,
    heldCarts,
    completedSale,
    setCompletedSale,
    defaultTender,
    isOnline,
    offlineQueueCount,
    isSyncing,
    saleToast,
    activeOutletId,
    autoSyncOfflineQueue,
    handleOpenCheckout,
    handleCompleteSale,
    handleHoldCart,
    handleResumeCart,
    handleDeleteHeldCart,
    handleOpenShift,
    handleCloseShift,
    checkActiveShift,
  };
}
