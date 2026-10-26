'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Printer, X, CheckCircle2, Mail } from 'lucide-react';
import { ThermalReceiptPaper } from './ThermalReceiptPaper';
import { PosDigitalReceiptModal } from '@/components/pos/terminal/PosDigitalReceiptModal';

interface ThermalReceiptModalProps {
  receiptData?: {
    sale: any;
    lines: any[];
    outlet: any;
    cashier?: any;
    register?: any;
    payments?: any[];
    is_reprint?: boolean;
    print_count?: number;
    print_badge?: string;
  };
  saleData?: any;
  isOpen?: boolean;
  onClose: () => void;
}

export function ThermalReceiptModal({
  receiptData,
  saleData,
  isOpen = true,
  onClose,
}: ThermalReceiptModalProps) {
  if (!isOpen) return null;

  const data = receiptData || {
    sale: saleData?.sale || saleData,
    lines: saleData?.lines || saleData?.items || [],
    outlet: saleData?.outlet || {
      name: 'CodeBridges Store',
      address: 'Main Commercial Ave, Phnom Penh',
      phone: '+855 23 888 999',
    },
    cashier: saleData?.cashier || { name: 'Cashier Staff' },
    register: saleData?.register || { name: 'Terminal #01' },
    payments: saleData?.payments || [
      {
        tender_type: saleData?.tender_type || saleData?.payment_method || 'cash',
        amount: saleData?.grand_total || saleData?.total_amount || saleData?.total || 0,
      },
    ],
    is_reprint: saleData?.is_reprint || false,
    print_count: saleData?.print_count || 1,
    print_badge: saleData?.print_badge,
  };

  const { sale, lines, outlet, cashier, register, payments, is_reprint, print_count, print_badge } = data;
  const [showDigitalModal, setShowDigitalModal] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formattedDate = sale?.created_at
    ? new Date(sale.created_at).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      {/* Printable CSS Rules for Thermal 80mm Roll */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-thermal-receipt,
          #printable-thermal-receipt * {
            visibility: visible !important;
          }
          #printable-thermal-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            margin: 0 !important;
            padding: 10px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 flex flex-col max-h-[90vh]"
      >
        {/* Modal Top Bar (Screen Only) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-brand" />
            <h3 className="font-bold text-xs">Customer Sales Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Action Header (Screen Only) */}
        <div className="p-4 bg-brand-subtle border-b border-brand/20 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-brand shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">Transaction Finalized</p>
              <p className="text-[11px] text-brand/80">Receipt ready for 80mm thermal printing</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowDigitalModal(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>E-Receipt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              Don't Print
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
          </div>
        </div>

        {/* --- THERMAL RECEIPT CONTENT AREA (80mm) --- */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 flex justify-center custom-scrollbar">
          <ThermalReceiptPaper
            sale={sale}
            lines={lines}
            outlet={outlet}
            cashier={cashier}
            register={register}
            payments={payments}
            is_reprint={is_reprint}
            print_count={print_count}
            print_badge={print_badge}
            formattedDate={formattedDate}
          />
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2.5 no-print shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-400" />
            <span>Skip</span>
          </button>
          <button
            type="button"
            onClick={() => setShowDigitalModal(true)}
            className="flex-1 py-3 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-indigo-200 cursor-pointer"
          >
            <Mail className="w-4 h-4 text-indigo-600" />
            <span>Email/SMS E-Receipt</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1.5 py-3 px-3 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print 80mm Slip</span>
          </button>
        </div>
      </motion.div>

      {/* Embedded Digital E-Receipt Dispatcher */}
      <PosDigitalReceiptModal
        isOpen={showDigitalModal}
        onClose={() => setShowDigitalModal(false)}
        sale={sale}
        outlet={outlet}
        onPrintThermal={handlePrint}
      />
    </div>
  );
}

export default ThermalReceiptModal;
