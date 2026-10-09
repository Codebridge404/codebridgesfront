import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { PosShiftsManagementView } from '@/components/pos';

export const metadata: Metadata = {
  title: 'Shift & Cash Drawer | Cashier POS',
  description: 'Manage active shift, cash movements, safe drops, and reports',
};

export default function CashierShiftsPage() {
  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden bg-slate-50">
      {/* Top Cashier Return Bar */}
      <div className="shrink-0 h-14 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between z-10">
        <Link
          href="/cashier/pos-terminal"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Register Terminal</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Clock className="w-4 h-4 text-brand" />
          <span>Cashier Till &amp; Shift Management</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 max-w-7xl w-full mx-auto custom-scrollbar">
        <PosShiftsManagementView />
      </div>
    </div>
  );
}
