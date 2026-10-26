'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Delete, Lock, AlertCircle } from 'lucide-react';
import { posAudio } from '@/hooks/usePosAudio';

interface PosSupervisorPinModalProps {
  actionName: string;
  onSuccess: () => void;
  onCancel: () => void;
  supervisorPin?: string;
}

export function PosSupervisorPinModal({
  actionName,
  onSuccess,
  onCancel,
  supervisorPin = '1234',
}: PosSupervisorPinModalProps) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      setErrorMsg(null);
      setPin((prev) => prev + digit);
    }
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg(null);
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleVerify = () => {
    // Check against supervisorPin or standard supervisor override pins (1234, 9999)
    const validPins = [supervisorPin, '1234', '9999'];
    if (validPins.includes(pin)) {
      posAudio.playSuccessBeep();
      onSuccess();
    } else {
      posAudio.playErrorBeep();
      setErrorMsg('Invalid supervisor PIN code');
      setPin('');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        handleVerify();
      } else if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none font-sans animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200/90 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Supervisor Override</h3>
              <p className="text-[11px] text-slate-500 font-medium">{actionName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PIN Display */}
        <div className="text-center space-y-2 py-2">
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  idx < pin.length
                    ? 'bg-slate-900 border-slate-900 scale-110'
                    : 'bg-slate-100 border-slate-300'
                }`}
              />
            ))}
          </div>
          {errorMsg && (
            <p className="text-xs font-bold text-rose-600 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          )}
          <p className="text-[10px] text-slate-400 font-medium">
            Enter 4-digit supervisor PIN on keypad or keyboard
          </p>
        </div>

        {/* 3x4 Touchscreen Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-13 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 text-slate-900 text-lg font-black transition-all cursor-pointer shadow-2xs"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-13 rounded-2xl bg-rose-50 hover:bg-rose-100 active:scale-95 border border-rose-200 text-rose-700 text-xs font-black transition-all cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-13 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 text-slate-900 text-lg font-black transition-all cursor-pointer shadow-2xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-13 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Confirm Button */}
        <button
          type="button"
          onClick={handleVerify}
          disabled={pin.length < 4}
          className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-brand text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
        >
          <Lock className="w-4 h-4" />
          <span>Authorize Override</span>
        </button>
      </div>
    </div>
  );
}
