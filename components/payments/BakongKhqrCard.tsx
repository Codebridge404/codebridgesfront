'use client';

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface BakongKhqrCardProps {
  merchantName?: string;
  amount: number;
  currency?: string;
  khrEquivalent?: number;
  khqrString?: string;
}

export function BakongKhqrCard({
  merchantName,
  amount,
  currency = 'USD',
  khrEquivalent,
  khqrString,
}: BakongKhqrCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && khqrString) {
      QRCode.toCanvas(
        canvasRef.current,
        khqrString,
        {
          width: 200,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: { dark: '#000000', light: '#ffffff' },
        },
        (err) => err && console.error('[KHQR] Render error:', err)
      );
    }
  }, [khqrString]);

  return (
    <div className="relative mx-auto bg-white rounded-2xl border-2 border-[#E11933] shadow-md p-3 flex flex-col items-center w-full max-w-[264px]">
      <div className="w-full bg-[#E11933] text-white py-1.5 px-3 rounded-lg flex items-center justify-between shadow-2xs mb-2">
        <div className="flex items-center gap-1.5">
          <img src="/BakongKHQR/Bakong.png" alt="Bakong" className="w-4 h-4 rounded-xs object-contain" />
          <span className="text-xs font-black tracking-wider">KHQR</span>
        </div>
        <span className="text-[8px] font-extrabold opacity-90 tracking-wider uppercase">NBC Cambodia</span>
      </div>

      <div className="text-center w-full mb-1.5">
        <p className="text-xs font-black text-slate-800 truncate px-1">
          {merchantName || 'Bakong Merchant'}
        </p>
        <div className="flex items-baseline justify-center gap-1.5 mt-0.5">
          <span className="text-xl font-black text-[#E11933]">
            {currency === 'KHR' ? `៛${Math.round(amount).toLocaleString()}` : `$${amount.toFixed(2)}`}
          </span>
          {currency === 'USD' && (
            <span className="text-[10px] font-bold text-slate-500">
              (៛{(khrEquivalent || Math.round(amount * 4100)).toLocaleString()})
            </span>
          )}
        </div>
      </div>

      <div className="relative p-1.5 bg-white rounded-xl border border-slate-100 shadow-2xs flex items-center justify-center">
        <canvas ref={canvasRef} className="rounded-lg w-[200px] h-[200px]" />
      </div>

      <p className="text-[9px] font-semibold text-slate-400 mt-2">
        Scan via Bakong, ABA, Wing, ACLEDA, or any KHQR Bank App
      </p>
    </div>
  );
}

export default BakongKhqrCard;
