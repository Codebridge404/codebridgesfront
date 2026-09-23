'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuthUser,
  getActiveShiftApi,
  openShiftApi,
  closeShiftApi,
  recordCashMovementApi,
  getShiftReportApi,
} from '@/lib/api';
import {
  PosShiftActiveCard,
  PosShiftHistoryTable,
  PosCashMovementModal,
  PosShiftOpenModal,
  PosShiftCloseModal,
  DualCurrencyDenominationModal,
  PosThermalReportModal,
  PosSafeDropModal,
} from './index';

export function PosShiftsManagementView() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [shiftHistory, setShiftHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showCashMovementModal, setShowCashMovementModal] = useState(false);
  const [cashMovementType, setCashMovementType] = useState<'in' | 'out'>('in');
  const [showDenomModal, setShowDenomModal] = useState(false);
  const [showThermalReportModal, setShowThermalReportModal] = useState(false);
  const [thermalReportType, setThermalReportType] = useState<'X-REPORT' | 'Z-REPORT'>('X-REPORT');
  const [selectedThermalShift, setSelectedThermalShift] = useState<any>(null);
  const [showSafeDropModal, setShowSafeDropModal] = useState(false);

  useEffect(() => {
    const currentUser = getAuthUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadShiftsData();
  }, [router]);

  const loadShiftsData = async () => {
    try {
      setLoading(true);
      const res = await getActiveShiftApi();
      if (res?.data?.shift) {
        setActiveShift(res.data.shift);
      } else {
        setActiveShift(null);
      }

      const reportRes = await getShiftReportApi('history');
      const historyList = reportRes?.data?.shifts || reportRes?.shifts || [];
      setShiftHistory(historyList);
    } catch (err) {
      console.error('Failed to load shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenShift = async (floatAmount: number, note: string) => {
    const res = await openShiftApi({ opening_float: floatAmount, note });
    const newShift = res?.data?.shift || res?.data;
    if (newShift) {
      setActiveShift(newShift);
      await loadShiftsData();
    }
  };

  const handleCloseShift = async (countedCash: number, note: string, supervisorPin?: string) => {
    if (!activeShift?.id) return;
    const closingShift = { ...activeShift, counted_cash: countedCash, status: 'closed' };
    await closeShiftApi(activeShift.id, {
      counted_cash: countedCash,
      closing_note: note,
      supervisor_pin: supervisorPin,
    });
    setActiveShift(null);
    await loadShiftsData();

    setSelectedThermalShift(closingShift);
    setThermalReportType('Z-REPORT');
    setShowThermalReportModal(true);
  };

  const handleRecordCashMovement = async (type: 'in' | 'out', amount: number, reason: string) => {
    if (!activeShift?.id) return;
    await recordCashMovementApi(activeShift.id, { type, amount, reason });
    await loadShiftsData();
  };

  const handleSafeDrop = async (data: { amount: number; envelopeSerial: string; supervisorPin: string; note: string }) => {
    if (!activeShift?.id) return;
    await recordCashMovementApi(activeShift.id, {
      type: 'out',
      amount: data.amount,
      reason: `Safe Drop [${data.envelopeSerial}]: ${data.note}`,
    });
    await loadShiftsData();
  };

  const currentExpectedCash = activeShift
    ? Number(activeShift.opening_float || 0) +
      Number(activeShift.cash_sales || 0) +
      Number(activeShift.cash_in || 0) -
      Number(activeShift.cash_out || 0) -
      Number(activeShift.safe_drops || 0)
    : 0;

  return (
    <div className="space-y-3 w-full font-sans pb-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Shifts &amp; Till Float
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Cash drawer opening float, paid-in/out movements, mid-shift safe drops, and Z-report end-of-day reconciliation
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeShift ? (
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● Shift Active (#{String(activeShift.id).slice(0, 6)})
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
              No Active Shift
            </span>
          )}
        </div>
      </div>

      {/* Active Shift Status Overview */}
      <PosShiftActiveCard
        activeShift={activeShift}
        onOpenShift={() => setShowOpenModal(true)}
        onCloseShift={() => setShowCloseModal(true)}
        onOpenCashMovement={(type) => {
          setCashMovementType(type);
          setShowCashMovementModal(true);
        }}
        onPrintXReport={() => {
          setSelectedThermalShift(activeShift);
          setThermalReportType('X-REPORT');
          setShowThermalReportModal(true);
        }}
        onSafeDrop={() => setShowSafeDropModal(true)}
        onDenominations={() => setShowDenomModal(true)}
      />

      {/* Historical Shifts Auditing Table */}
      <PosShiftHistoryTable
        shiftHistory={shiftHistory}
        loading={loading}
        onViewSummary={(shift: any) => {
          setSelectedThermalShift(shift);
          setThermalReportType(shift.status === 'closed' ? 'Z-REPORT' : 'X-REPORT');
          setShowThermalReportModal(true);
        }}
      />

      {/* Modal: Open Shift */}
      <PosShiftOpenModal
        isOpen={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        onConfirmOpen={handleOpenShift}
      />

      {/* Modal: Close Shift */}
      {activeShift && (
        <PosShiftCloseModal
          isOpen={showCloseModal}
          onClose={() => setShowCloseModal(false)}
          activeShift={activeShift}
          onConfirmClose={handleCloseShift}
        />
      )}

      {/* Modal: Cash Movement (In/Out) */}
      <PosCashMovementModal
        isOpen={showCashMovementModal}
        onClose={() => setShowCashMovementModal(false)}
        defaultType={cashMovementType}
        onRecordMovement={handleRecordCashMovement}
      />

      {/* Modal: Physical Dual-Currency Denomination Counter */}
      <DualCurrencyDenominationModal
        isOpen={showDenomModal}
        onClose={() => setShowDenomModal(false)}
        onApply={() => {
          if (activeShift) {
            setShowCloseModal(true);
          }
        }}
      />

      {/* Modal: Printable Thermal X-Report / Z-Report */}
      <PosThermalReportModal
        isOpen={showThermalReportModal}
        onClose={() => setShowThermalReportModal(false)}
        reportType={thermalReportType}
        shift={selectedThermalShift || activeShift || shiftHistory[0] || {}}
        user={user}
      />

      {/* Modal: Safe Cash Drop */}
      <PosSafeDropModal
        isOpen={showSafeDropModal}
        onClose={() => setShowSafeDropModal(false)}
        onConfirm={handleSafeDrop}
        currentCashInDrawer={currentExpectedCash}
      />
    </div>
  );
}
