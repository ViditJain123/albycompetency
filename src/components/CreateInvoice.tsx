'use client';
import { useState } from 'react';
import { createInvoice, fiatToSats } from '../../utils/webln';
import { QRCodeSVG } from 'qrcode.react';

export default function CreateInvoice() {
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [amountType, setAmountType] = useState<'sats' | 'usd'>('sats');
  const [isLoading, setIsLoading] = useState(false);
  const [invoice, setInvoice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setInvoice(null);
    setCopied(false);
    
    try {
      if (!amount || isNaN(parseFloat(amount))) {
        throw new Error('Please enter a valid amount');
      }
      
      let satAmount = parseInt(amount);
      
      // Convert USD to sats if needed
      if (amountType === 'usd') {
        satAmount = await fiatToSats(parseFloat(amount), 'USD');
      }
      
      const response = await createInvoice({
        amount: satAmount,
        defaultMemo: memo || 'Lightning Web App Invoice',
      });
      
      setInvoice(response.paymentRequest);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAmountTypeToggle = () => {
    setAmountType(prevType => prevType === 'sats' ? 'usd' : 'sats');
    setAmount(''); // Reset amount when changing types
  };
  
  const copyToClipboard = () => {
    if (invoice) {
      navigator.clipboard.writeText(invoice);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold mb-4">Create Invoice</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
            <label htmlFor="amount" className="block text-sm font-medium">
              Amount
            </label>
            <button
              type="button"
              onClick={handleAmountTypeToggle}
              className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-center sm:text-left w-full sm:w-auto"
            >
              {amountType === 'sats' ? 'Switch to USD' : 'Switch to Sats'}
            </button>
          </div>
          <div className="relative">
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm sm:text-base"
              placeholder={amountType === 'sats' ? '1000' : '0.50'}
              min="0"
              step={amountType === 'sats' ? '1' : '0.01'}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sm sm:text-base">
              {amountType === 'sats' ? 'sats' : 'USD'}
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="memo" className="block text-sm font-medium mb-1">
            Memo (Optional)
          </label>
          <input
            id="memo"
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm sm:text-base"
            placeholder="What's this invoice for?"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 text-sm sm:text-base"
        >
          {isLoading ? 'Generating...' : 'Create Invoice'}
        </button>
      </form>
      
      {invoice && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md">
          <div className="flex justify-center mb-3">
            <QRCodeSVG 
              value={invoice} 
              size={150} 
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-[150px] md:h-[150px]"
            />
          </div>
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">Invoice</label>
            <div className="relative">
              <textarea
                value={invoice}
                readOnly
                className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md text-xs h-20"
              />
              <button
                onClick={copyToClipboard}
                className="absolute right-2 bottom-2 bg-gray-300 dark:bg-gray-600 text-xs px-2 py-1 rounded"
                type="button"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
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