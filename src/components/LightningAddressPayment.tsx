'use client';
import { useState } from 'react';
import { payLightningAddress, fiatToSats } from '../../utils/webln';

export default function LightningAddressPayment() {
  const [lnAddress, setLnAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [amountType, setAmountType] = useState<'sats' | 'usd'>('sats');
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
      if (!lnAddress.trim() || !lnAddress.includes('@')) {
        throw new Error('Please enter a valid Lightning Address (user@domain.com)');
      }
      
      if (!amount || isNaN(parseFloat(amount))) {
        throw new Error('Please enter a valid amount');
      }
      
      let satAmount = parseInt(amount);
      
      // Convert USD to sats if needed
      if (amountType === 'usd') {
        satAmount = await fiatToSats(parseFloat(amount), 'USD');
      }
      
      const response = await payLightningAddress(lnAddress.trim(), satAmount);
      setSuccess(true);
      setPreimage(response.preimage);
      setLnAddress('');
      setAmount('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send payment to Lightning Address');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAmountTypeToggle = () => {
    setAmountType(prevType => prevType === 'sats' ? 'usd' : 'sats');
    setAmount(''); // Reset amount when changing types
  };

  return (
    <div className="card p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold mb-4">Pay to Lightning Address</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="lnAddress" className="block text-sm font-medium mb-1">
            Lightning Address
          </label>
          <input
            id="lnAddress"
            type="text"
            value={lnAddress}
            onChange={(e) => setLnAddress(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm sm:text-base"
            placeholder="user@domain.com"
          />
        </div>
        
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
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 text-sm sm:text-base"
        >
          {isLoading ? 'Processing...' : 'Pay to Lightning Address'}
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