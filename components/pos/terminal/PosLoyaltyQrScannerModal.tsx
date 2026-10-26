'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, QrCode, Search, AlertCircle, CheckCircle2, Loader2, Sparkles, User, RefreshCw } from 'lucide-react';
import { getCustomersApi } from '@/lib/api';
import { posAudio } from '@/hooks/usePosAudio';
import { PosCustomer } from './usePosCustomerAndTable';

interface PosLoyaltyQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: PosCustomer) => void;
}

export function PosLoyaltyQrScannerModal({
  isOpen,
  onClose,
  onSelectCustomer,
}: PosLoyaltyQrScannerModalProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [detectedCustomer, setDetectedCustomer] = useState<PosCustomer | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setDetectedCustomer(null);
      setManualCode('');
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);

      // Start BarcodeDetector loop if supported
      startScanningLoop();
    } catch (err: any) {
      console.warn('Unable to access webcam for loyalty scanner:', err);
      setCameraActive(false);
      setCameraError(err.message || 'WebCam access denied or camera unavailable. You can enter or search VIP code manually.');
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startScanningLoop = () => {
    // Check if BarcodeDetector API is natively supported in Chromium
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'code_128', 'ean_13', 'data_matrix'],
        });

        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              const rawValue = barcodes[0].rawValue;
              if (rawValue) {
                handleCodeDetected(rawValue);
              }
            }
          } catch (e) {
            // non-fatal detection frame error
          }
        }, 500);
      } catch (err) {
        console.warn('BarcodeDetector initialization warning:', err);
      }
    }
  };

  const handleCodeDetected = async (rawString: string) => {
    const cleaned = rawString.replace(/^CB-CUST-/, '').trim();
    if (!cleaned || searching) return;

    setSearching(true);
    try {
      const res = await getCustomersApi(cleaned);
      const list: PosCustomer[] = Array.isArray(res) ? res : res?.data || [];

      if (list.length > 0) {
        const matched = list[0];
        setDetectedCustomer(matched);
        posAudio.playSuccessBeep();

        // Auto-select after 600ms preview
        setTimeout(() => {
          onSelectCustomer(matched);
          onClose();
        }, 600);
      } else {
        setCameraError(`No VIP account found matching code "${rawString}".`);
      }
    } catch (err) {
      console.error('Customer lookup error:', err);
      setCameraError('Failed to lookup VIP member.');
    } finally {
      setSearching(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleCodeDetected(manualCode.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Scan Customer VIP QR Code</h3>
              <p className="text-[11px] text-slate-500 font-medium">Use device WebCam or barcode reader</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Section */}
        <div className="p-4 space-y-4">
          <div className="relative aspect-4/3 w-full rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Animated Scanning Frame & Reticle */}
                <div className="absolute inset-8 border-2 border-dashed border-amber-400/80 rounded-2xl pointer-events-none flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                  <div className="w-full h-0.5 bg-amber-400 animate-pulse" />
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-slate-400 space-y-2">
                <Camera className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs font-semibold text-slate-300">
                  {cameraError || 'Camera stream is inactive'}
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>
              </div>
            )}

            {/* Found Customer Overlay */}
            {detectedCustomer && (
              <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center animate-in zoom-in-95">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2" />
                <h4 className="font-black text-base">{detectedCustomer.name}</h4>
                <p className="text-xs text-emerald-200 font-medium">VIP Member Identified</p>
                <div className="mt-2 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                  {detectedCustomer.loyalty_points || 0} Points &bull; ${Number(detectedCustomer.store_credit || 0).toFixed(2)} Credit
                </div>
              </div>
            )}
          </div>

          {/* Manual Input or Emulation Trigger */}
          <form onSubmit={handleManualSearch} className="space-y-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Or Enter VIP / Loyalty Code
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. CB-CUST-001 or Phone number"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-brand"
                />
              </div>
              <button
                type="submit"
                disabled={searching || !manualCode.trim()}
                className="px-4 py-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Lookup</span>}
              </button>
            </div>
          </form>

          {/* Quick Demo Customer Badges */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Quick Test VIP Barcodes:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['Vibol Chea', 'Sokunthea Keo', 'Dara Roth'].map((demoName) => (
                <button
                  key={demoName}
                  type="button"
                  onClick={() => handleCodeDetected(demoName)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 text-[11px] font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  {demoName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
