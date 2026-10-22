'use client';

import React, { useState } from 'react';
import {
  openShiftApi,
  closeShiftApi,
  syncOfflineSalesApi,
  getRoleDisplayName,
} from '@/lib/api';
import { getOfflineQueue, clearOfflineQueue } from '@/lib/offlineSync';
import {
  PosKpiSummary,
  PosHourlySalesChart,
  PosTenderBreakdownCard,
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
  const {
    user,
    orgName,
    loading,
    activeShift,
    setActiveShift,
    kpis,
    hourlyData,
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
    <div className="space-y-4 w-full font-sans pb-6">
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
