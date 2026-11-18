/**
 * Author: Antigravity Team
 * Date: 2026-11-17
 * Task: BD-0160 - POS Terminal & Current Order Dynamic Organization Receipt Template Integration
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { calculateCartTax } from '@/lib/posTaxUtils';
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
  getOutletTerminalSettingsApi,
  getPosBffBootstrapApi,
  getPosBffCatalogApi,
  posBffCheckoutApi,
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
  const [activeOutlet, setActiveOutlet] = useState<any>(null);
  const [receiptSettings, setReceiptSettings] = useState<any>(null);
  const [outletsCount, setOutletsCount] = useState<number>(1);

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
        stock: Number(p.stock_on_hand ?? p.stock_available ?? p.stock_quantity ?? p.stock ?? 0),
        stock_on_hand: Number(p.stock_on_hand ?? 0),
        stock_available: Number(p.stock_available ?? 0),
        barcode: p.barcode || '',
        image_url: p.image_url || p.image || undefined,
        image: p.image_url || p.image || undefined,
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
        const sanitizedCats: string[] = (cachedCats || [])
          .map((c: any) => (typeof c === 'string' ? c : c?.name || 'General'))
          .filter(Boolean);
        setCategories(sanitizedCats.length > 0 ? Array.from(new Set(sanitizedCats)) : ['General']);
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

  const syncAuthoritativeOutletSettings = async (
    targetOutletId: string,
    fallbackOutlet?: any,
    fallbackTpl?: any
  ) => {
    try {
      const termRes = await getOutletTerminalSettingsApi(targetOutletId);
      if (termRes?.status === 'success' && termRes.data) {
        const d = termRes.data;
        const ts = d.terminal_settings || {};
        const merged = {
          storeName:
            ts.outletName ||
            fallbackOutlet?.name ||
            fallbackTpl?.store_name ||
            'Main Store',
          storeAddress:
            ts.outletAddress ||
            fallbackOutlet?.address ||
            fallbackTpl?.store_address ||
            '',
          storePhone:
            ts.outletPhone ||
            fallbackOutlet?.phone ||
            fallbackTpl?.store_phone ||
            '',
          receiptHeader:
            ts.receiptHeader !== undefined && ts.receiptHeader !== null
              ? ts.receiptHeader
              : d.receipt_header ?? fallbackTpl?.receipt_header ?? '',
          receiptFooter:
            ts.receiptFooter !== undefined && ts.receiptFooter !== null
              ? ts.receiptFooter
              : d.receipt_footer ?? fallbackTpl?.receipt_footer ?? 'Thank you for shopping with us! Please come again.',
          receiptLogoUrl:
            ts.receiptLogoUrl !== undefined && ts.receiptLogoUrl !== null
              ? ts.receiptLogoUrl
              : d.receipt_logo_url ?? fallbackTpl?.receipt_logo_url ?? '',
          paperWidth: (ts.paperWidth || fallbackTpl?.paper_width || '80mm') as '80mm' | '58mm',
          autoPrintReceipt:
            ts.autoPrintReceipt !== undefined
              ? Boolean(ts.autoPrintReceipt)
              : Boolean(fallbackTpl?.auto_print_receipt ?? true),
          vatTin: ts.vatTin || ts.vat_tin || fallbackTpl?.vat_tin || '',
          taxLabel: ts.taxLabel || ts.tax_label || fallbackTpl?.tax_label || 'VAT',
          receiptStartNumber: Number(ts.receiptStartNumber ?? fallbackTpl?.receipt_start_number ?? 0) || 0,
          receiptDigits: Number(ts.receiptDigits ?? fallbackTpl?.receipt_digits ?? 5) || 5,
        };

        setReceiptSettings(merged);

        if (typeof window !== 'undefined') {
          localStorage.setItem('cb_pos_receipt_header', merged.receiptHeader || '');
          localStorage.setItem('cb_pos_receipt_footer', merged.receiptFooter || '');
          if (merged.receiptLogoUrl) {
            localStorage.setItem('cb_active_org_logo', merged.receiptLogoUrl);
          } else {
            localStorage.removeItem('cb_active_org_logo');
          }
          try {
            const prevTerm = JSON.parse(localStorage.getItem('cb_pos_terminal_settings') || '{}');
            localStorage.setItem(
              'cb_pos_terminal_settings',
              JSON.stringify({
                ...prevTerm,
                ...ts,
                outletId: String(targetOutletId),
                outletName: merged.storeName,
                outletAddress: merged.storeAddress,
                outletPhone: merged.storePhone,
                receiptHeader: merged.receiptHeader,
                receiptFooter: merged.receiptFooter,
                receiptLogoUrl: merged.receiptLogoUrl,
                paperWidth: merged.paperWidth,
                autoPrintReceipt: merged.autoPrintReceipt,
                vatTin: merged.vatTin,
                vat_tin: merged.vatTin,
                taxLabel: merged.taxLabel,
                tax_label: merged.taxLabel,
                receiptStartNumber: merged.receiptStartNumber,
                receiptDigits: merged.receiptDigits,
                kdsEnabled:
                  d.is_kds_enabled !== undefined ? Boolean(d.is_kds_enabled) : prevTerm.kdsEnabled,
                cfdEnabled:
                  d.is_cfd_enabled !== undefined ? Boolean(d.is_cfd_enabled) : prevTerm.cfdEnabled,
                businessType: d.business_type || ts.businessType || prevTerm.businessType,
              })
            );
          } catch {}
          window.dispatchEvent(new CustomEvent('cb_terminal_settings_updated', { detail: ts }));
        }
      }
    } catch (err) {
      console.warn('Could not sync authoritative outlet terminal settings:', err);
    }
  };

  const bootstrapTerminal = async () => {
    try {
      setLoading(true);
      // Attempt ultra-fast single-roundtrip BFF bootstrap
      const bffRes = await getPosBffBootstrapApi();
      if (bffRes && bffRes.status === 'success' && bffRes.data) {
        const bff = bffRes.data;
        if (bff.user) setUser(bff.user);
        if (bff.active_shift) setActiveShift(bff.active_shift);
        const resolvedOutlet = bff.active_outlet || bff.outlet || null;
        if (resolvedOutlet?.id) {
          setActiveOutletId(String(resolvedOutlet.id));
          setActiveOutlet(resolvedOutlet);
        }

        if (bff.receipt_template) {
          const tpl = bff.receipt_template;
          const mappedSettings = {
            storeName: tpl.store_name,
            storeAddress: tpl.store_address,
            storePhone: tpl.store_phone,
            receiptHeader: tpl.receipt_header,
            receiptFooter: tpl.receipt_footer,
            receiptLogoUrl: tpl.receipt_logo_url,
            paperWidth: tpl.paper_width,
            autoPrintReceipt: tpl.auto_print_receipt,
            vatTin: tpl.vat_tin,
            taxLabel: tpl.tax_label,
            receiptStartNumber: tpl.receipt_start_number ?? 0,
            receiptDigits: tpl.receipt_digits ?? 5,
          };
          setReceiptSettings(mappedSettings);

          if (typeof window !== 'undefined') {
            localStorage.setItem('cb_pos_receipt_header', tpl.receipt_header || '');
            localStorage.setItem('cb_pos_receipt_footer', tpl.receipt_footer || '');
            if (tpl.receipt_logo_url) {
              localStorage.setItem('cb_active_org_logo', tpl.receipt_logo_url);
            } else {
              localStorage.removeItem('cb_active_org_logo');
            }
            if (tpl.store_name) {
              localStorage.setItem('active_org', tpl.store_name);
            }
            try {
              const prevTerm = JSON.parse(localStorage.getItem('cb_pos_terminal_settings') || '{}');
              localStorage.setItem(
                'cb_pos_terminal_settings',
                JSON.stringify({
                  ...prevTerm,
                  outletId: resolvedOutlet?.id ? String(resolvedOutlet.id) : prevTerm.outletId,
                  outletName: tpl.store_name,
                  outletAddress: tpl.store_address,
                  outletPhone: tpl.store_phone,
                  receiptHeader: tpl.receipt_header,
                  receiptFooter: tpl.receipt_footer,
                  receiptLogoUrl: tpl.receipt_logo_url,
                  paperWidth: tpl.paper_width,
                  autoPrintReceipt: tpl.auto_print_receipt ?? prevTerm.autoPrintReceipt ?? true,
                  vat_tin: tpl.vat_tin,
                  vatTin: tpl.vat_tin,
                  tax_label: tpl.tax_label,
                  taxLabel: tpl.tax_label,
                  receiptStartNumber: tpl.receipt_start_number ?? prevTerm.receiptStartNumber ?? 0,
                  receiptDigits: tpl.receipt_digits ?? prevTerm.receiptDigits ?? 5,
                })
              );
            } catch {}
            window.dispatchEvent(new CustomEvent('cb_terminal_settings_updated'));
          }
        }

        const fallbackOutletId =
          resolvedOutlet?.id ||
          (bff.user as any)?.outlet_id ||
          bff.outlets?.[0]?.id ||
          getAuthUser()?.outlet_id ||
          null;
        if (fallbackOutletId) {
          setActiveOutletId(String(fallbackOutletId));
          await syncAuthoritativeOutletSettings(
            String(fallbackOutletId),
            resolvedOutlet || bff.outlets?.[0],
            bff.receipt_template
          );
        }

        if (Array.isArray(bff.outlets)) {
          setOutletsCount(bff.outlets.length);
          if (typeof window !== 'undefined') {
            localStorage.setItem('cb_outlets_count', String(bff.outlets.length));
          }
        }

        // Accelerated catalog retrieval with outlet stock balances and delta cache
        try {
          const catalogRes = await getPosBffCatalogApi({
            outlet_id: resolvedOutlet?.id ? Number(resolvedOutlet.id) : undefined,
            per_page: 200,
          });
          const rawProducts = catalogRes?.data?.products || [];
          if (Array.isArray(rawProducts) && rawProducts.length > 0) {
            const formattedProducts: Product[] = rawProducts.map((p: any) => ({
              id: p.id,
              name: p.name,
              sku: p.sku || `SKU-${p.id}`,
              price: Number(p.price || p.selling_price || 0),
              category:
                p.category_name ||
                (typeof p.category === 'object' ? p.category?.name : p.category) ||
                'General',
              stock: Number(p.stock_on_hand ?? p.stock_available ?? p.stock_quantity ?? p.stock ?? 0),
              stock_on_hand: Number(p.stock_on_hand ?? 0),
              stock_available: Number(p.stock_available ?? 0),
              barcode: p.barcode || '',
              image_url: p.image_url || p.image || undefined,
              image: p.image_url || p.image || undefined,
            }));
            setProducts(formattedProducts);
            const rawCats = catalogRes?.data?.categories;
            const cats: string[] = Array.isArray(rawCats) && rawCats.length > 0
              ? Array.from(
                  new Set(
                    rawCats
                      .map((c: any) => (typeof c === 'string' ? c : c?.name || 'General'))
                      .filter(Boolean)
                  )
                )
              : Array.from(new Set(formattedProducts.map((p) => p.category || 'General')));
            setCategories(cats);
            await cacheCatalog(formattedProducts);
            await cacheCategories(cats);
          } else {
            await loadCatalog();
          }
        } catch {
          await loadCatalog();
        }

        if (bff.held_carts_count > 0) {
          fetchHeldCarts();
        }
        return;
      }
    } catch (err) {
      console.warn('POS BFF unavailable, falling back to legacy multi-endpoint sequence:', err);
    } finally {
      setLoading(false);
    }

    // Graceful fallback for offline or legacy instances
    loadCatalog();
    checkActiveShift();
    fetchHeldCarts();

    getOutletsApi()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        if (Array.isArray(list)) {
          const count = list.length;
          setOutletsCount(count);
          if (typeof window !== 'undefined') {
            localStorage.setItem('cb_outlets_count', String(count));
          }
          if (list[0]?.id) {
            setActiveOutletId(String(list[0].id));
            setActiveOutlet(list[0]);
            syncAuthoritativeOutletSettings(String(list[0].id), list[0]);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    const currentUser = getAuthUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    bootstrapTerminal();

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
    const { taxAmount: tax, grandTotal } = calculateCartTax(subtotal, discount);

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
      generate_khqr: tenderType === 'khqr',
      khqr_currency: 'USD' as const,
      payments: [
        {
          method: tenderType,
          amount: tenderType === 'cash' ? cashTendered : grandTotal,
          currency: 'USD' as const,
        },
      ],
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
      // Optimistically deduct sold quantities even while offline
      const soldCartOffline = cartState.cart;
      setProducts((prev) =>
        prev.map((p) => {
          const soldItem = soldCartOffline.find(
            (i) => (i.product_id || i.product?.id) === p.id
          );
          if (!soldItem) return p;
          const newStock = Math.max(0, (p.stock ?? 0) - soldItem.qty);
          return { ...p, stock: newStock, stock_on_hand: newStock, stock_available: newStock };
        })
      );
      cartState.handleClearCart();
      return;
    }

    let res: any;
    try {
      res = await posBffCheckoutApi(salePayload as any);
    } catch (bffErr: any) {
      // Fallback to standard sales checkout if BFF endpoint is unavailable
      if (bffErr?.status === 404) {
        res = await createSaleApi(salePayload);
      } else {
        throw bffErr;
      }
    }
    const saleResult = res.data?.sale || res.sale || salePayload;
    const saleOutlet = res.data?.outlet || res.outlet || activeOutlet;
    const enrichedSaleResult = {
      ...saleResult,
      outlet: saleOutlet || saleResult.outlet,
    };
    posAudio.playCheckoutChime();
    if (tenderType === 'cash') {
      kickCashDrawer().catch(() => {});
    }
    if (printReceipt) {
      setCompletedSale(enrichedSaleResult);
    } else {
      setSaleToast(`Sale #${saleResult.receipt_number || 'OK'} completed (Receipt skipped)`);
      setTimeout(() => setSaleToast(null), 3500);
    }
    // Optimistically deduct sold quantities from the product grid so stock is live
    const soldCart = cartState.cart;
    setProducts((prev) =>
      prev.map((p) => {
        const soldItem = soldCart.find(
          (i) => (i.product_id || i.product?.id) === p.id
        );
        if (!soldItem) return p;
        const newStock = Math.max(0, (p.stock ?? 0) - soldItem.qty);
        return { ...p, stock: newStock, stock_on_hand: newStock, stock_available: newStock };
      })
    );
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
    activeOutlet,
    receiptSettings,
    outletsCount,
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
