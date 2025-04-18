'use client';
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { sendPayment } from '../../utils/webln';

export default function QRCodeScanner() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preimage, setPreimage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "html5qr-code-full-region";

  const startScanner = () => {
    setScanning(true);
    setError(null);
    setScanResult(null);
    setSuccess(false);
    setPreimage(null);
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop()
        .catch(error => console.error('Error stopping scanner:', error));
    }
    setScanning(false);
  };

  useEffect(() => {
    // Initialize scanner when scanning starts
    if (scanning) {
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = html5QrCode;
      
      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          // Success callback - invoice detected
          setScanResult(decodedText);
          stopScanner();
          
          // Check if this looks like a Lightning invoice (starts with ln)
          if (decodedText.startsWith('ln')) {
            handlePayment(decodedText);
          }
        },
        () => {
          // Error callback - ignore the errors while scanning
          // No need to use the errorMessage parameter
        }
      ).catch(err => {
        setError(`Failed to start scanner: ${err}`);
        setScanning(false);
      });
    }
    
    // Clean up when component unmounts or scanning stops
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop()
          .catch(error => console.error('Error stopping scanner:', error));
      }
    };
  }, [scanning]);
  
  const handlePayment = async (invoice: string) => {
    setLoading(true);
    try {
      const response = await sendPayment(invoice);
      setSuccess(true);
      setPreimage(response.preimage);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleManualPayment = () => {
    if (!scanResult) return;
    handlePayment(scanResult);
  };

  return (
    <div className="card p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold mb-4">QR Code Scanner</h2>
      
      {!scanning && !scanResult && (
        <div className="flex flex-col gap-4">
          <p className="text-xs sm:text-sm dark:text-gray-300 mb-2">
            Use your device&apos;s camera to scan a Lightning invoice QR code for quick payments.
          </p>
          <button
            onClick={startScanner}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded text-sm sm:text-base"
          >
            Start Camera Scanner
          </button>
        </div>
      )}
      
      {scanning && (
        <div className="flex flex-col gap-4">
          <div id={scannerContainerId} className="w-full h-48 sm:h-64 relative"></div>
          <button
            onClick={stopScanner}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm sm:text-base"
          >
            Stop Scanner
          </button>
        </div>
      )}
      
      {scanResult && !success && !loading && (
        <div className="mt-4">
          <h3 className="font-medium mb-2 text-sm sm:text-base">Scanned Invoice:</h3>
          <div className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto max-h-24 sm:max-h-32 break-all">
            {scanResult}
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleManualPayment}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded text-sm sm:text-base"
            >
              Pay Invoice
            </button>
            <button
              onClick={() => {
                setScanResult(null);
                setError(null);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-sm sm:text-base"
            >
              Clear
            </button>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-yellow-800 dark:text-yellow-200 text-xs sm:text-sm">Processing payment...</p>
        </div>
      )}
      
      {success && preimage && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-green-800 dark:text-green-200 font-medium text-xs sm:text-sm">Payment Successful!</p>
          <p className="text-xs mt-1 break-all">
            <span className="font-medium">Preimage:</span> {preimage}
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setPreimage(null);
              setScanResult(null);
            }}
            className="mt-3 bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm py-1 px-3 rounded"
          >
            Scan Another
          </button>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200 text-xs sm:text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setScanResult(null);
            }}
            className="mt-3 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm py-1 px-3 rounded"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}