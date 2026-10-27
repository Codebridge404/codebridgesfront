'use client';

import { useState, useEffect, useRef } from 'react';
import { Product, CartItem } from '@/components/pos';
import { getBarcodeProductApi, validateCouponApi } from '@/lib/api';
import { savePersistentCart, getPersistentCart, clearPersistentCart, getCachedCatalog } from '@/lib/offlineStore';
import { posAudio } from '@/hooks/usePosAudio';

export function usePosCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const isHydratedRef = useRef(false);

  // Restore cart from IndexedDB on initial mount
  useEffect(() => {
    let isMounted = true;
    getPersistentCart().then((saved) => {
      if (isMounted && saved && Array.isArray(saved.items) && saved.items.length > 0) {
        setCart(saved.items);
      }
      isHydratedRef.current = true;
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist cart to IndexedDB and broadcast to Customer-Facing Display (CFD) on every modification
  useEffect(() => {
    if (!isHydratedRef.current) return;
    savePersistentCart(cart);
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('cb_pos_cart_channel');
        channel.postMessage({ type: 'CART_UPDATED', cart, appliedCoupon });
        channel.close();
      } catch {}
    }
  }, [cart, appliedCoupon]);

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => (i.product_id || i.product?.id) === product.id);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].qty += 1;
        return next;
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          product,
        },
      ];
    });
  };

  const handleUpdateQty = (index: number, delta: number) => {
    setCart((prev) => {
      const next = [...prev];
      const newQty = next[index].qty + delta;
      if (newQty <= 0) return next.filter((_, i) => i !== index);
      next[index].qty = newQty;
      return next;
    });
  };

  const handleRemoveCartItem = (index: number) => setCart((prev) => prev.filter((_, i) => i !== index));

  const handleClearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponError('');
    clearPersistentCart();
  };

  const handleBarcodeScan = async (barcode: string) => {
    if (!barcode || !barcode.trim()) return;
    const cleanBarcode = barcode.trim();

    try {
      // 1. First attempt rapid local lookup in cached IndexedDB catalog
      const cached = await getCachedCatalog();
      const localMatch = cached.find(
        (p: any) => p.barcode === cleanBarcode || p.sku === cleanBarcode
      );

      if (localMatch) {
        posAudio.playSuccessBeep();
        handleAddToCart({
          id: localMatch.id,
          name: localMatch.name,
          sku: localMatch.sku || `SKU-${localMatch.id}`,
          price: Number(localMatch.price || localMatch.selling_price || 0),
          category: localMatch.category || 'General',
          stock: localMatch.stock || 99,
          barcode: localMatch.barcode,
          image_url: localMatch.image_url || localMatch.image,
          image: localMatch.image_url || localMatch.image,
        });
        return;
      }

      // 2. Fallback to API if not found in local cache
      const res = await getBarcodeProductApi(cleanBarcode);
      const product = res.data?.product || res.data || res.product;
      if (product) {
        posAudio.playSuccessBeep();
        handleAddToCart({
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: Number(product.price || product.selling_price || 0),
          category: product.category,
          barcode: product.barcode,
          image_url: product.image_url || product.image,
          image: product.image_url || product.image,
        });
      } else {
        posAudio.playErrorBeep();
      }
    } catch {
      posAudio.playErrorBeep();
    }
  };

  const handleApplyCoupon = async (code: string) => {
    try {
      setCouponError('');
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const res = await validateCouponApi(code, subtotal);
      if (res.data?.coupon || res.coupon) {
        setAppliedCoupon(res.data?.coupon || res.coupon);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid or expired coupon code.');
    }
  };

  return {
    cart,
    setCart,
    appliedCoupon,
    setAppliedCoupon,
    couponError,
    handleAddToCart,
    handleUpdateQty,
    handleRemoveCartItem,
    handleClearCart,
    handleBarcodeScan,
    handleApplyCoupon,
  };
}
