import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScannerModal({ isOpen, onClose, onScanSuccess, isClosed = false, storeStatusLabel = 'Toko Tutup' }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const scannerRef = useRef(null);
  const elementId = "qr-scanner-viewfinder";

  useEffect(() => {
    if (!isOpen) {
      setErrorMsg('');
      setIsInitializing(true);
      return;
    }

    let isMounted = true;
    let qrScannerInstance = null;

    const startCamera = async () => {
      try {
        setErrorMsg('');
        setIsInitializing(true);

        const container = document.getElementById(elementId);
        if (!container) {
          throw new Error("Scanner viewfinder container not found in DOM");
        }

        qrScannerInstance = new Html5Qrcode(elementId);
        scannerRef.current = qrScannerInstance;

        const qrConfig = {
          fps: 10,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          },
          aspectRatio: 1.777778 // 16:9 aspect-video
        };

        // Try environment (back camera) first, then fall back to default
        await qrScannerInstance.start(
          { facingMode: "environment" },
          qrConfig,
          (decodedText) => {
            if (isMounted) {
              onScanSuccess(decodedText);
            }
          },
          () => {
            // Quiet failure callbacks for normal frame processing
          }
        );

        if (isMounted) {
          setIsInitializing(false);
        }
      } catch (err) {
        console.error("Error starting camera scan:", err);
        if (isMounted) {
          setIsInitializing(false);
          const msg = err?.message || String(err);
          if (
            err.name === 'NotAllowedError' || 
            msg.includes("Permission denied") || 
            msg.includes("PermissionDismissedError")
          ) {
            setErrorMsg("Izin akses kamera ditolak. Harap izinkan kamera pada browser Anda untuk dapat memindai QR Code.");
          } else if (
            err.name === 'NotFoundError' || 
            msg.includes("Requested device not found")
          ) {
            setErrorMsg("Kamera tidak ditemukan atau tidak tersedia pada perangkat Anda.");
          } else {
            setErrorMsg("Gagal mengaktifkan kamera: " + msg);
          }
        }
      }
    };

    // Delay start scanner slightly to let modal scale animation complete
    const delayTimer = setTimeout(() => {
      startCamera();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(delayTimer);

      const cleanup = async () => {
        if (qrScannerInstance) {
          try {
            if (qrScannerInstance.isScanning) {
              await qrScannerInstance.stop();
            }
            qrScannerInstance.clear();
          } catch (stopErr) {
            console.warn("Error cleaning up scanner:", stopErr);
          }
        }
      };
      cleanup();
    };
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#FFF9EC] dark:bg-[#26170C] border border-[#26170c]/10 dark:border-white/5 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#26170c]/5 flex justify-between items-center bg-[#faf3e0] dark:bg-[#2d303a]/50">
          <h3 className="text-xl font-headline italic text-[#26170c] dark:text-[#faf3e0] flex items-center">
            <span className="material-symbols-outlined mr-2 text-[#944925]">qr_code_scanner</span>
            Scan QR Pelanggan
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 text-[#81756e] hover:text-[#26170c] dark:hover:text-[#faf3e0] rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Viewfinder Camera Feed */}
        <div className="p-6 flex flex-col items-center space-y-6">
          <div className="relative w-full aspect-video bg-neutral-900 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-[#944925]/40 overflow-hidden shadow-inner group">
            {/* Camera feed target div */}
            <div 
              id={elementId} 
              className="absolute inset-0 w-full h-full object-cover [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
            />

            {/* Corner brackets simulating scanner viewfinder */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#944925] z-10" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#944925] z-10" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#944925] z-10" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#944925] z-10" />
            
            {/* Scanning Laser Line Animation */}
            {!errorMsg && !isInitializing && (
              <div className="absolute inset-x-0 h-0.5 bg-[#944925] opacity-80 shadow-[0_0_8px_#944925] animate-scan z-10" />
            )}

            {/* Initializing Spinner */}
            {isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/90 z-20 text-center p-4">
                <span className="material-symbols-outlined text-4xl text-white/45 animate-pulse mb-2">videocam</span>
                <p className="text-white/60 font-semibold text-xs uppercase tracking-widest animate-pulse">Mengaktifkan Kamera...</p>
              </div>
            )}

            {/* Elegantly Handled Camera Error */}
            {errorMsg && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/95 z-20 text-center p-6">
                <span className="material-symbols-outlined text-4xl text-red-500 mb-2">no_photography</span>
                <p className="text-red-500 font-bold text-xs uppercase tracking-wider mb-2">Akses Kamera Gagal</p>
                <p className="text-[#efe8d5]/80 text-[11px] leading-relaxed max-w-[280px]">
                  {errorMsg}
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-[#26170C]/70 dark:text-[#faf3e0]/70 leading-relaxed px-4">
            Arahkan kamera ke QR Code check-in pada aplikasi mobile pelanggan untuk memproses antrean secara otomatis.
          </p>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-[#efe8d5] dark:bg-[#2d303a] hover:bg-[#e9e2d0] dark:hover:bg-[#3d2b1f] text-[#26170c] dark:text-[#faf3e0] py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors active:scale-95 transform"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
