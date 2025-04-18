'use client';
import { useEffect, useState, useCallback } from 'react';
import { createInvoice, sendPayment } from '../../utils/webln';

interface AutoPayOnScrollProps {
  destinationPubkey: string; // The pubkey to send payments to (preserved for interface compatibility)
  amountPerScroll: number; // Amount in sats to pay per scroll event
  maxPayments?: number; // Maximum number of payments to send (optional)
}

export default function AutoPayOnScroll({
  amountPerScroll = 1,
  maxPayments = 10
}: AutoPayOnScrollProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [paymentCount, setPaymentCount] = useState(0);
  const [lastPayment, setLastPayment] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cooldown period to prevent too many payments
  const COOLDOWN_MS = 5000; // 5 seconds

  const toggleAutoPayment = () => {
    setIsEnabled(prev => !prev);
  };

  const makePayment = useCallback(async () => {
    if (!isEnabled || isLoading) return;
    if (maxPayments && paymentCount >= maxPayments) return;
    
    // Check if we're within cooldown period
    if (lastPayment && Date.now() - lastPayment.getTime() < COOLDOWN_MS) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate an invoice and pay it right away to simulate a keysend payment
      // (Using createInvoice + sendPayment is more reliable than keysend for this demo)
      const invoiceResponse = await createInvoice({
        amount: amountPerScroll,
        defaultMemo: `Auto-payment on scroll #${paymentCount + 1}`
      });
      
      await sendPayment(invoiceResponse.paymentRequest);
      
      setPaymentCount(prev => prev + 1);
      setLastPayment(new Date());
    } catch (err: unknown) {
      console.error('Auto-payment error:', err);
      setError(err instanceof Error ? err.message : 'Auto-payment failed');
      setIsEnabled(false); // Disable on error
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled, isLoading, maxPayments, paymentCount, lastPayment, amountPerScroll]);

  useEffect(() => {
    if (!isEnabled) return;
    
    const handleScroll = () => {
      makePayment();
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isEnabled, makePayment]);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[--primary] flex-shrink-0">
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
          <path d="M12 7v5l3 3" />
        </svg>
        <h2 className="text-base sm:text-lg font-semibold">Auto-Pay on Scroll</h2>
      </div>
      
      <div className="space-y-4">
        <div className="text-xs sm:text-sm text-[--text-secondary]">
          When enabled, this feature will send {amountPerScroll} sat(s) each time you scroll the page.
          {maxPayments && <span className="block mt-1">Limited to {maxPayments} payments total.</span>}
        </div>
        
        <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <span className="text-sm font-medium">Enable auto-payments</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={isEnabled} 
              onChange={toggleAutoPayment} 
              className="sr-only peer"
            />
            <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[--primary] rounded-full peer dark:peer-focus:ring-[--primary]/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[--primary]"></div>
          </label>
        </div>
        
        {paymentCount > 0 && (
          <div className="flex items-center justify-between p-2 sm:p-3 border border-[--border] rounded-lg">
            <span className="text-xs sm:text-sm">Payments sent</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{paymentCount}</span>
              {maxPayments && <span className="text-[--text-secondary]">/ {maxPayments}</span>}
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-xs sm:text-sm">{error}</p>
          </div>
        )}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-[--primary]">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xs sm:text-sm">Processing payment...</span>
          </div>
        )}
      </div>
    </div>
  );
}