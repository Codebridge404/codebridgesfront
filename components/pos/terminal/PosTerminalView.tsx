'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { CheckCircle2, Loader2, AlertTriangle, Building2 } from 'lucide-react';
import { ThermalReceiptModal } from '@/components/receipt/ThermalReceiptModal';
import { SalesReturnModal } from '@/components/returns/SalesReturnModal';
import { BakongKhqrModal } from '@/components/payments/BakongKhqrModal';
import {
  PosSuiteHeader,
  CashierQuickSwitchModal,
  PosCategoryTabs,
  PosProductGrid,
  PosBarcodeScanner,
  PosCartPanel,
  PosCheckoutModal,
  PosHoldCartModal,
  PosOfflineBanner,
  PosShiftOpenModal,
  PosShiftCloseModal,
} from '@/components/pos';
import { usePosTerminalState } from './usePosTerminalState';
import { usePosCustomerAndTable } from './usePosCustomerAndTable';
import { PosOrderContextBar } from './PosOrderContextBar';
import { PosCustomerSelectorModal } from './PosCustomerSelectorModal';
import { PosTableSelectorModal } from './PosTableSelectorModal';
import { PosSupervisorPinModal } from './PosSupervisorPinModal';
import { PosCrossOutletStockModal } from './PosCrossOutletStockModal';
import {
  getPosBusinessType,
  POS_BUSINESS_PROFILES,
  PosBusinessTypeId,
} from '@/lib/posBusinessProfiles';

function PosTerminalContent() {
  const t = usePosTerminalState();
  const custTable = usePosCustomerAndTable();
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showStockLookupModal, setShowStockLookupModal] = useState(false);
  const [pendingSupervisorAction, setPendingSupervisorAction] = useState<{
    actionName: string;
    onExecute: () => void;
  } | null>(null);
  const [lowStockAlertMsg, setLowStockAlertMsg] = useState<string | null>(null);
  const [businessType, setBusinessType] = useState<PosBusinessTypeId>('retail_mart');

  useEffect(() => {
    setBusinessType(getPosBusinessType());
    const handleSettingsUpdated = (e: any) => {
      if (e?.detail?.businessType && e.detail.businessType in POS_BUSINESS_PROFILES) {
        setBusinessType(e.detail.businessType);
      }
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cb_pos_terminal_settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.businessType && parsed.businessType in POS_BUSINESS_PROFILES) {
            setBusinessType(parsed.businessType);
          }
        } catch {}
      }
    };
    window.addEventListener('cb_terminal_settings_updated', handleSettingsUpdated);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('cb_terminal_settings_updated', handleSettingsUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const currentProfile = POS_BUSINESS_PROFILES[businessType] || POS_BUSINESS_PROFILES.retail_mart;
  const tablesEnabled = currentProfile.presets.tablesEnabled;

  // Auto-switch to takeaway counter mode if business operating profile does not use dining tables
  useEffect(() => {
    if (!tablesEnabled && custTable.orderType === 'dine_in') {
      custTable.setOrderType('takeaway');
    }
  }, [tablesEnabled, custTable.orderType]);

  return (
    <div className="h-screen max-h-screen overflow-hidden font-sans flex flex-col select-none bg-slate-50 text-slate-900">
      {/* Header - Fixed & Pinned at top */}
      <div className="shrink-0 z-40">
        <PosSuiteHeader
          user={t.user}
          activeShift={t.activeShift}
          heldCartsCount={t.heldCarts.length}
          offlineQueueCount={t.offlineQueueCount}
          isOnline={t.isOnline}
          isSyncing={t.isSyncing}
          outletName={`${t.user?.outlet_name || 'Main Store'} • ${currentProfile.shortTitle}`}
          onOpenShiftModal={() => (t.activeShift ? t.setShowShiftCloseModal(true) : t.setShowShiftOpenModal(true))}
          onOpenHeldCartsModal={() => t.setShowHeldCartsModal(true)}
          onOpenReturnsModal={() => t.setShowReturnModal(true)}
          onSyncOffline={t.autoSyncOfflineQueue}
          onOpenQuickSwitchModal={() => t.setShowQuickSwitchModal(true)}
        />
      </div>

      {t.saleToast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-black shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{t.saleToast}</span>
        </div>
      )}

      {/* Main Terminal Layout */}
      <div className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left 8 Cols: Pinned Filters + Scrollable Product Grid */}
        <div className="lg:col-span-8 h-full flex flex-col min-h-0 overflow-hidden space-y-3">
          <div className="shrink-0">
            <PosOfflineBanner
              isOnline={t.isOnline}
              offlineQueueCount={t.offlineQueueCount}
              isSyncing={t.isSyncing}
              onSyncOffline={t.autoSyncOfflineQueue}
            />
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <div className="flex-1">
              <PosBarcodeScanner
                onScan={t.handleBarcodeScan}
                searchQuery={t.searchQuery}
                onSearchChange={t.setSearchQuery}
              />
            </div>
            {t.outletsCount > 1 && (
              <button
                type="button"
                onClick={() => setShowStockLookupModal(true)}
                className="px-3 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                title="Lookup inventory across chain branches"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden xl:inline">Branch Stock</span>
              </button>
            )}
          </div>

          <div className="shrink-0">
            <PosCategoryTabs
              categories={t.categories}
              selectedCategory={t.selectedCategory}
              onSelectCategory={t.setSelectedCategory}
            />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-2 custom-scrollbar">
            <PosProductGrid
              products={t.products}
              selectedCategory={t.selectedCategory}
              searchQuery={t.searchQuery}
              loading={t.loading}
              onAddToCart={t.handleAddToCart}
              onLowStockAlert={(msg) => {
                setLowStockAlertMsg(msg);
                setTimeout(() => setLowStockAlertMsg(null), 4000);
              }}
            />
          </div>
        </div>

        {/* Right 4 Cols: Order Context Bar + Pinned Cart Panel */}
        <div className="lg:col-span-4 h-full flex flex-col min-h-0 overflow-hidden space-y-2">
          <PosOrderContextBar
            customer={custTable.selectedCustomer}
            table={custTable.selectedTable}
            orderType={custTable.orderType}
            onOpenCustomerModal={() => setShowCustomerModal(true)}
            onOpenTableModal={() => setShowTableModal(true)}
            tablesEnabled={tablesEnabled}
          />

          <div className="flex-1 min-h-0">
            <PosCartPanel
              cart={t.cart}
              appliedCoupon={t.appliedCoupon}
              couponError={t.couponError}
              onUpdateQty={t.handleUpdateQty}
              onRemoveItem={t.handleRemoveCartItem}
              onClearCart={() => {
                setPendingSupervisorAction({
                  actionName: 'Void Entire Cart',
                  onExecute: () => {
                    t.handleClearCart();
                    custTable.resetCustomerAndTable();
                  },
                });
              }}
              onOpenHoldModal={() => t.setShowHeldCartsModal(true)}
              onApplyCoupon={t.handleApplyCoupon}
              onRemoveCoupon={() => t.setAppliedCoupon(null)}
              onOpenCheckout={t.handleOpenCheckout}
              isProcessing={t.isProcessing}
            />
          </div>
        </div>
      </div>

      {/* Customer and Dining Table Modals */}
      <PosCustomerSelectorModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        selectedCustomer={custTable.selectedCustomer}
        onSelectCustomer={custTable.setSelectedCustomer}
      />

      {tablesEnabled && (
        <PosTableSelectorModal
          isOpen={showTableModal}
          onClose={() => setShowTableModal(false)}
          orderType={custTable.orderType}
          onSelectOrderType={custTable.setOrderType}
          selectedTable={custTable.selectedTable}
          onSelectTable={custTable.setSelectedTable}
        />
      )}

      {/* Checkout and Shift Modals */}
      <PosCheckoutModal
        isOpen={t.showCheckoutModal}
        onClose={() => t.setShowCheckoutModal(false)}
        cart={t.cart}
        appliedCoupon={t.appliedCoupon}
        defaultTender={t.defaultTender}
        customer={custTable.selectedCustomer}
        onCompleteSale={async (tenderType, tenderedNum, printReceipt) => {
          await t.handleCompleteSale(tenderType, tenderedNum, printReceipt, {
            customer_id: custTable.selectedCustomer?.id,
            customer_name: custTable.selectedCustomer?.name,
            table_id: custTable.selectedTable?.id,
            table_name: custTable.selectedTable?.name,
            order_type: custTable.orderType,
          });
          custTable.resetCustomerAndTable();
        }}
        onTriggerKhqrModal={() => t.setShowBakongModal(true)}
      />

      <PosHoldCartModal
        isOpen={t.showHeldCartsModal}
        onClose={() => t.setShowHeldCartsModal(false)}
        cart={t.cart}
        heldCarts={t.heldCarts}
        onConfirmHold={t.handleHoldCart}
        onResumeCart={t.handleResumeCart}
        onDeleteHeldCart={t.handleDeleteHeldCart}
      />

      <PosShiftOpenModal
        isOpen={t.showShiftOpenModal}
        onClose={() => t.setShowShiftOpenModal(false)}
        onConfirmOpen={t.handleOpenShift}
      />

      <PosShiftCloseModal
        isOpen={t.showShiftCloseModal}
        onClose={() => t.setShowShiftCloseModal(false)}
        activeShift={t.activeShift}
        onConfirmClose={t.handleCloseShift}
      />

      {t.completedSale && (
        <ThermalReceiptModal
          isOpen={Boolean(t.completedSale)}
          onClose={() => t.setCompletedSale(null)}
          saleData={t.completedSale}
        />
      )}

      <SalesReturnModal
        isOpen={t.showReturnModal}
        onClose={() => t.setShowReturnModal(false)}
        onReturnProcessed={() => {
          t.setShowReturnModal(false);
          t.checkActiveShift();
        }}
      />

      {t.showBakongModal && (
        <BakongKhqrModal
          isOpen={t.showBakongModal}
          onClose={() => t.setShowBakongModal(false)}
          amount={t.cart.reduce((sum, item) => sum + item.price * item.qty, 0) * 1.1}
          salePayload={{
            outlet_id: t.activeOutletId || t.user?.outlet_id || '0d612401-62c2-4e9e-9857-69e40f24c86d',
            register_id: '9cd597e1-d134-4a91-b5e1-3dfd72c63554',
            idempotency_key: `khqr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            items: t.cart.map((i) => ({
              product_id: i.product_id || i.product?.id,
              name: i.name,
              quantity: i.qty,
              price: i.price,
            })),
            customer_id: custTable.selectedCustomer?.id || null,
            customer_name: custTable.selectedCustomer?.name || null,
            table_id: custTable.selectedTable?.id || null,
            table_name: custTable.selectedTable?.name || null,
            order_type: custTable.orderType,
          }}
          onSuccess={(sale) => {
            t.setCompletedSale(sale);
            t.handleClearCart();
            custTable.resetCustomerAndTable();
            t.setShowBakongModal(false);
          }}
        />
      )}

      <CashierQuickSwitchModal
        isOpen={t.showQuickSwitchModal}
        onClose={() => t.setShowQuickSwitchModal(false)}
        onSuccess={(switchedUser) => {
          t.setUser(switchedUser);
          t.setShowQuickSwitchModal(false);
        }}
      />

      {lowStockAlertMsg && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 rounded-2xl bg-amber-500 text-slate-950 text-xs font-black shadow-2xl flex items-center gap-2 border border-amber-300 animate-in fade-in slide-in-from-bottom-3">
          <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{lowStockAlertMsg}</span>
        </div>
      )}

      {pendingSupervisorAction && (
        <PosSupervisorPinModal
          actionName={pendingSupervisorAction.actionName}
          onSuccess={() => {
            pendingSupervisorAction.onExecute();
            setPendingSupervisorAction(null);
          }}
          onCancel={() => setPendingSupervisorAction(null)}
        />
      )}

      {showStockLookupModal && (
        <PosCrossOutletStockModal
          initialSearch={t.searchQuery}
          onClose={() => setShowStockLookupModal(false)}
        />
      )}
    </div>
  );
}

export function PosTerminalView() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-900 font-sans">
        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin text-brand" />
          <span>Initializing POS Terminal Interface...</span>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-900 font-sans">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin text-brand" />
            <span>Initializing POS Terminal Interface...</span>
          </div>
        </div>
      }
    >
      <PosTerminalContent />
    </Suspense>
  );
}

export const PosTerminal = PosTerminalView;
export default PosTerminalView;
