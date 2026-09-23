'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  openShiftApi,
  closeShiftApi,
  deleteHeldCartApi,
  getReceiptApi,
  syncOfflineSalesApi,
  getRoleDisplayName,
} from '@/lib/api';
import { getOfflineQueue, clearOfflineQueue } from '@/lib/offlineSync';
import { ThermalReceiptModal } from '@/components/receipt/ThermalReceiptModal';
import { SalesReturnModal } from '@/components/returns/SalesReturnModal';
import {
  PosKpiSummary,
  PosHourlySalesChart,
  PosTenderBreakdownCard,
  PosRegisterFleetCard,
  PosTopSellersCard,
  PosShiftStatusCard,
  PosQuickActionGrid,
  PosRecentSalesTable,
  PosHeldOrdersList,
  DashboardHeroBanner,
  DashboardOfflineBanner,
  OpenShiftModal,
  CloseShiftModal,
} from '@/components/pos/dashboard';
import { useOrganizationDashboardData } from '@/components/pos/dashboard/useOrganizationDashboardData';

export interface POSDashboardProps {
  user?: any;
  activeShift?: any;
  onRefreshShift?: () => void;
  onOpenShiftModal?: () => void;
  onCloseShiftModal?: () => void;
}
export type OrganizationDashboardProps = POSDashboardProps;
export type PosDashboardProps = POSDashboardProps;

export function POSDashboard({
  user: initialUser,
  activeShift: externalActiveShift,
  onRefreshShift,
  onOpenShiftModal: externalOpenShiftModal,
  onCloseShiftModal: externalCloseShiftModal,
}: POSDashboardProps) {
  const router = useRouter();

  const {
    user,
    orgName,
    loading,
    activeShift,
    setActiveShift,
    shiftSummary,
    kpis,
    recentSales,
    topSellers,
    registerFleet,
    hourlyData,
    heldCarts,
    offlineQueueCount,
    setOfflineQueueCount,
    loadDashboardData,
  } = useOrganizationDashboardData(initialUser, externalActiveShift);

  // Shift modals state
  const [showShiftOpenModal, setShowShiftOpenModal] = useState(false);
  const [showShiftCloseModal, setShowShiftCloseModal] = useState(false);
  const [openingFloat, setOpeningFloat] = useState('100.00');
  const [countedCash, setCountedCash] = useState('');
  const [closingNote, setClosingNote] = useState('');
  const [supervisorPinInput, setSupervisorPinInput] = useState('');
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Receipt & Return modals state
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncOffline = async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;
    try {
      setIsSyncing(true);
      await syncOfflineSalesApi(queue);
      clearOfflineQueue();
      setOfflineQueueCount(0);
      alert(`Successfully synced ${queue.length} offline transactions!`);
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Offline sync failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      await openShiftApi({ opening_float: parseFloat(openingFloat || '0') });
      setShowShiftOpenModal(false);
      loadDashboardData();
      if (onRefreshShift) onRefreshShift();
    } catch (err: any) {
      alert(err.message || 'Failed to open shift');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    try {
      setIsProcessing(true);
      await closeShiftApi(activeShift.id, {
        counted_cash: parseFloat(countedCash || '0'),
        closing_note: closingNote,
        supervisor_pin: supervisorPinInput,
      });
      setShowShiftCloseModal(false);
      setShowPinPrompt(false);
      setSupervisorPinInput('');
      setActiveShift(null);
      loadDashboardData();
      if (onRefreshShift) onRefreshShift();
    } catch (err: any) {
      if (err.message?.includes('Supervisor PIN')) setShowPinPrompt(true);
      alert(err.message || 'Failed to close shift');
    } finally {
      setIsProcessing(false);
    }
  };

  const roleName = getRoleDisplayName(user || 'admin', orgName);

  return (
    <div className="space-y-3 w-full font-sans pb-6">
      <DashboardOfflineBanner
        offlineQueueCount={offlineQueueCount}
        isSyncing={isSyncing}
        onSync={handleSyncOffline}
      />

      <DashboardHeroBanner
        user={user}
        orgName={orgName}
        roleName={roleName}
        activeShift={activeShift}
        loading={loading}
        onOpenShift={() => (externalOpenShiftModal ? externalOpenShiftModal() : setShowShiftOpenModal(true))}
        onCloseShift={() => (externalCloseShiftModal ? externalCloseShiftModal() : setShowShiftCloseModal(true))}
        onRefreshData={loadDashboardData}
      />

      <PosKpiSummary kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PosHourlySalesChart data={hourlyData} todayTotal={kpis.todaySales} />
        </div>
        <div>
          <PosTenderBreakdownCard kpis={kpis} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PosRegisterFleetCard registers={registerFleet} />
        <PosTopSellersCard items={topSellers} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PosShiftStatusCard
          activeShift={activeShift}
          shiftSummary={shiftSummary}
          onOpenShift={() => (externalOpenShiftModal ? externalOpenShiftModal() : setShowShiftOpenModal(true))}
          onCloseShift={() => (externalCloseShiftModal ? externalCloseShiftModal() : setShowShiftCloseModal(true))}
          onViewShiftHistory={() => router.push('/pos/shifts')}
        />

        <PosQuickActionGrid
          onOpenShift={() => (externalOpenShiftModal ? externalOpenShiftModal() : setShowShiftOpenModal(true))}
          onOpenReturn={() => setShowReturnModal(true)}
          activeShift={activeShift}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="held-orders-section">
        <div className="lg:col-span-2">
          <PosRecentSalesTable
            sales={recentSales}
            onViewReceipt={async (id) => {
              try {
                const res = await getReceiptApi(String(id), true);
                setCompletedSale(res.data || { id });
              } catch {
                setCompletedSale({ id, grand_total: 0 });
              }
            }}
            onReturnSale={() => setShowReturnModal(true)}
          />
        </div>

        <div>
          <PosHeldOrdersList
            heldCarts={heldCarts}
            onResumeCart={(id) => router.push(`/pos/pos-terminal?resumeCart=${id}`)}
            onDeleteCart={async (id) => {
              try {
                await deleteHeldCartApi(String(id));
                loadDashboardData();
              } catch (err: any) {
                alert(err.message || 'Failed to delete held cart');
              }
            }}
          />
        </div>
      </div>

      {completedSale && (
        <ThermalReceiptModal
          receiptData={{
            sale: completedSale.sale || completedSale,
            lines: completedSale.lines || [],
            outlet: completedSale.outlet || { name: orgName },
            cashier: completedSale.cashier || { name: user?.name || 'Cashier' },
            register: completedSale.register || { name: 'REG-01' },
            payments: completedSale.payments || [],
            is_reprint: true,
          }}
          onClose={() => setCompletedSale(null)}
        />
      )}

      <SalesReturnModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onSuccess={() => {
          setShowReturnModal(false);
          loadDashboardData();
        }}
      />

      <OpenShiftModal
        isOpen={showShiftOpenModal}
        openingFloat={openingFloat}
        isProcessing={isProcessing}
        onFloatChange={setOpeningFloat}
        onSubmit={handleOpenShift}
        onClose={() => setShowShiftOpenModal(false)}
      />

      <CloseShiftModal
        isOpen={showShiftCloseModal}
        countedCash={countedCash}
        closingNote={closingNote}
        showPinPrompt={showPinPrompt}
        supervisorPinInput={supervisorPinInput}
        isProcessing={isProcessing}
        onCountedCashChange={setCountedCash}
        onClosingNoteChange={setClosingNote}
        onPinChange={setSupervisorPinInput}
        onSubmit={handleCloseShift}
        onClose={() => setShowShiftCloseModal(false)}
      />
    </div>
  );
}

export const PosDashboard = POSDashboard;
export const OrganizationDashboard = POSDashboard;
export default POSDashboard;
