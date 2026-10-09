'use client';

import React from 'react';

interface ThermalReceiptPaperProps {
  sale: any;
  lines: any[];
  outlet: any;
  cashier?: any;
  register?: any;
  payments?: any[];
  is_reprint?: boolean;
  print_count?: number;
  print_badge?: string;
  formattedDate: string;
}

export function ThermalReceiptPaper({
  sale,
  lines,
  outlet,
  cashier,
  register,
  payments,
  is_reprint,
  print_count,
  print_badge,
  formattedDate,
}: ThermalReceiptPaperProps) {
  const primaryPayment = payments && payments.length > 0 ? payments[0] : null;

  return (
    <div
      id="printable-thermal-receipt"
      className="w-[300px] bg-white p-5 border border-slate-200 shadow-sm rounded-xl font-mono text-[11px] leading-tight text-slate-900 select-text"
    >
      {/* Original / Reprint Badge */}
      <div className="text-center mb-3">
        <span
          className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            is_reprint || (print_count && print_count > 1)
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          }`}
        >
          {print_badge || (is_reprint ? `*** REPRINT RECEIPT (#${print_count || 2}) ***` : '*** ORIGINAL RECEIPT ***')}
        </span>
      </div>

      {/* Store / Outlet Branding Header */}
      <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
        {(outlet?.logo_url || (typeof window !== 'undefined' && localStorage.getItem('cb_active_org_logo'))) && (
          <div className="flex justify-center mb-1">
            <img
              src={outlet?.logo_url || (typeof window !== 'undefined' ? localStorage.getItem('cb_active_org_logo') || '' : '')}
              alt="Logo"
              className="max-h-12 max-w-[150px] object-contain grayscale contrast-125"
            />
          </div>
        )}
        <h2 className="font-extrabold text-sm uppercase tracking-tight text-slate-900">
          {outlet?.name || 'Freshmart POS'}
        </h2>
        {outlet?.address && <p className="text-[10px] text-slate-600 leading-snug">{outlet.address}</p>}
        {outlet?.phone && <p className="text-[10px] text-slate-600">Tel: {outlet.phone}</p>}
        {outlet?.receipt_header && (
          <p className="text-[10px] italic text-slate-500 pt-1 border-t border-slate-100 mt-1">
            {outlet.receipt_header}
          </p>
        )}
      </div>

      {/* Metadata (Receipt No, Date, Order Mode & Table, Customer, Cashier, Register) */}
      <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[10px]">
        <div className="flex justify-between">
          <span className="text-slate-500">Receipt No:</span>
          <span className="font-extrabold text-slate-900">{sale?.receipt_number || 'REC-00000'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Date/Time:</span>
          <span>{formattedDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Dining Mode:</span>
          <span className="font-extrabold uppercase">
            {sale?.order_type === 'dine_in'
              ? `Dine-In (${sale?.table_name || 'Open Table'})`
              : sale?.order_type === 'takeaway'
              ? 'Takeaway'
              : sale?.order_type === 'delivery'
              ? 'Delivery'
              : 'Dine-In'}
          </span>
        </div>
        {sale?.customer_name && (
          <div className="flex justify-between">
            <span className="text-slate-500">Customer:</span>
            <span className="font-bold text-slate-900">{sale.customer_name}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500">Cashier:</span>
          <span className="font-bold">{cashier?.name || 'Admin Cashier'}</span>
        </div>
        {register?.name && (
          <div className="flex justify-between">
            <span className="text-slate-500">Register:</span>
            <span>{register.name}</span>
          </div>
        )}
      </div>

      {/* Line Items List */}
      <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
        <div className="flex justify-between font-bold text-[10px] text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
          <span>Item</span>
          <span>Total</span>
        </div>

        {lines && lines.length > 0 ? (
          lines.map((line: any, idx: number) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex justify-between font-semibold">
                <span className="truncate max-w-[180px]">{line.product_name}</span>
                <span>${Number(line.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>
                  {line.quantity} x ${Number(line.unit_price || 0).toFixed(2)}
                </span>
                {Number(line.discount_amount) > 0 && (
                  <span className="text-rose-600 font-bold">
                    -${Number(line.discount_amount).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-400 text-[10px]">No line items</p>
        )}
      </div>

      {/* Financial Totals */}
      <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal:</span>
          <span>${Number(sale?.subtotal || 0).toFixed(2)}</span>
        </div>

        {Number(sale?.discount_total) > 0 && (
          <div className="flex justify-between text-rose-600 font-semibold">
            <span>Discount:</span>
            <span>-${Number(sale.discount_total).toFixed(2)}</span>
          </div>
        )}

        {Number(sale?.tax_total) > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Tax (VAT):</span>
            <span>${Number(sale.tax_total).toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
          <span>GRAND TOTAL:</span>
          <span>${Number(sale?.grand_total || 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Tender & Payment Info */}
      <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[10px]">
        <div className="flex justify-between font-semibold">
          <span className="text-slate-500">Payment Method:</span>
          <span className="uppercase">{primaryPayment?.tender_type || 'CASH'}</span>
        </div>
        {primaryPayment?.tender_type === 'cash' && (
          <>
            <div className="flex justify-between">
              <span className="text-slate-500">Tendered:</span>
              <span>${Number(primaryPayment?.amount || sale?.grand_total || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900">
              <span className="text-slate-500">Change:</span>
              <span>
                $
                {Math.max(
                  0,
                  Number(primaryPayment?.amount || 0) - Number(sale?.grand_total || 0)
                ).toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Receipt Footer */}
      <div className="pt-3 text-center space-y-2">
        {outlet?.receipt_footer ? (
          <p className="text-[10px] text-slate-600 italic leading-snug">{outlet.receipt_footer}</p>
        ) : (
          <p className="text-[10px] text-slate-500 italic">Thank you for your visit! Please come again.</p>
        )}

        {/* Pseudo Barcode Representation */}
        <div className="pt-2 flex flex-col items-center justify-center gap-1">
          <div className="w-48 h-8 bg-slate-900 flex items-center justify-between px-2 text-white font-mono text-[9px] tracking-widest rounded-xs">
            <span>||||||||||||||||||||||||||||||||||||||||||||</span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono">{sale?.receipt_number}</span>
        </div>
      </div>
    </div>
  );
}
