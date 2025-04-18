'use client';
import { useState } from 'react';
import { sendPayment } from '../../utils/webln';

export default function SendPayment() {
  const [invoice, setInvoice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preimage, setPreimage] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setPreimage(null);
    
    try {
      if (!invoice.trim()) {
        throw new Error('Please enter a valid Lightning invoice');
      }
      
      const response = await sendPayment(invoice.trim());
      setSuccess(true);
      setPreimage(response.preimage);
      setInvoice('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold mb-4">Send Payment</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="invoice" className="block text-sm font-medium mb-1">
            Lightning Invoice (BOLT11)
          </label>
          <textarea
            id="invoice"
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm sm:text-base"
            rows={3}
            placeholder="lnbc..."
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 text-sm sm:text-base"
        >
          {isLoading ? 'Processing...' : 'Pay Invoice'}
        </button>
      </form>
      
      {success && preimage && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-green-800 dark:text-green-200 font-medium text-sm sm:text-base">Payment Successful!</p>
          <p className="text-xs mt-1 break-all">
            <span className="font-medium">Preimage:</span> {preimage}
          </p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200 text-xs sm:text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}