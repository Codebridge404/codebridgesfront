'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle2, Sparkles } from 'lucide-react';
import { getProductsApi, createOnlineOrderApi } from '@/lib/api';
import { BakongKhqrModal } from '@/components/payments/BakongKhqrModal';
import { ShopProduct, ShopProductGrid } from './ShopProductGrid';
import { CartItem, ShopCartDrawer } from './ShopCartDrawer';
import { calculateCartTax } from '@/lib/posTaxUtils';

export const ShopStorefrontView: React.FC = () => {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart & Fulfillment State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Payment & Order Confirmation State
  const [showKhqrModal, setShowKhqrModal] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await getProductsApi();
      const items = (res.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: Number(p.price || 0),
        category: p.category?.name || 'General',
      }));
      setProducts(items);

      const cats = Array.from(new Set(items.map((i: any) => i.category))) as string[];
      setCategories(['All', ...cats]);
    } catch (err) {
      console.error('Failed to load shop catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: ShopProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = deliveryType === 'delivery' ? 1.5 : 0.0;
  const taxCalc = calculateCartTax(subtotal, 0);
  const taxAmount = taxCalc.taxAmount;
  const grandTotal = roundTwo(taxCalc.grandTotal + deliveryFee);

  function roundTwo(val: number) {
    return Math.round(val * 100) / 100;
  }

  const handleStartKhqrCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter your Name and Phone Number to proceed.');
      return;
    }
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      alert('Please provide your Delivery Address.');
      return;
    }
    setShowKhqrModal(true);
  };

  const handlePaymentApproved = async () => {
    setShowKhqrModal(false);
    try {
      setIsSubmitting(true);
      const payload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? deliveryAddress : undefined,
        payment_method: 'khqr',
        items: cart.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
        })),
      };

      const res = await createOnlineOrderApi(payload);
      setPlacedOrder(res.data);
      setCart([]);
      setShowCartDrawer(false);
    } catch (err: any) {
      alert(err.message || 'Order submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top E-Commerce Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center font-black text-white text-lg shadow-lg shadow-brand/20">
            CB
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Freshmart Online Storefront <Sparkles className="w-4 h-4 text-brand" />
            </h1>
            <p className="text-[11px] text-slate-400">Order Online • Express Delivery or Store Pickup</p>
          </div>
        </div>

        {/* Cart Drawer Trigger */}
        <button
          onClick={() => setShowCartDrawer(true)}
          className="relative px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Cart</span>
          {cartTotalItems > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-brand font-extrabold text-[10px] flex items-center justify-center">
              {cartTotalItems}
            </span>
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Order Success Banner */}
        {placedOrder && (
          <div className="p-6 bg-emerald-950/60 border border-emerald-500/30 rounded-3xl space-y-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h2 className="text-lg font-black text-white">
                  Order Confirmed! #{placedOrder.order_number}
                </h2>
                <p className="text-xs text-emerald-200">
                  Thank you! Your online order has been placed and is currently being prepared by our store staff.
                </p>
              </div>
            </div>
            <button
              onClick={() => setPlacedOrder(null)}
              className="text-xs font-bold text-emerald-400 hover:underline"
            >
              Dismiss Banner
            </button>
          </div>
        )}

        <ShopProductGrid
          products={products}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={loading}
          onAddToCart={handleAddToCart}
        />
      </main>

      <ShopCartDrawer
        isOpen={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        deliveryType={deliveryType}
        setDeliveryType={setDeliveryType}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        deliveryAddress={deliveryAddress}
        setDeliveryAddress={setDeliveryAddress}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        taxAmount={taxAmount}
        taxLabel={taxCalc.taxLabel}
        isTaxEnabled={taxCalc.isTaxEnabled}
        grandTotal={grandTotal}
        isSubmitting={isSubmitting}
        onSubmitCheckout={handleStartKhqrCheckout}
      />

      <BakongKhqrModal
        isOpen={showKhqrModal}
        amount={grandTotal}
        currency="USD"
        onClose={() => setShowKhqrModal(false)}
        onPaymentApproved={handlePaymentApproved}
      />
    </div>
  );
};
