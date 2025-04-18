'use client';
import { useState } from 'react';
import { enableWebLN, getWalletInfo } from '../../utils/webln';
import { WebLNGetInfoResponse } from '../../types/types';

export default function WalletInfo() {
  const [walletInfo, setWalletInfo] = useState<WebLNGetInfoResponse | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      setError(null);
      await enableWebLN();
      const info = await getWalletInfo();
      setWalletInfo(info);
      setIsConnected(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect to wallet');
      setIsConnected(false);
    }
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[--primary] flex-shrink-0">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          <h2 className="text-lg font-semibold">Lightning Wallet</h2>
        </div>
        
        {isConnected && (
          <div className="flex items-center">
            <span className="inline-block h-2 w-2 bg-green-500 rounded-full mr-2"></span>
            <span className="text-xs text-green-500 font-medium">Connected</span>
          </div>
        )}
      </div>
      
      {!isConnected ? (
        <div className="flex flex-col items-center py-6 sm:py-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[--text-secondary] mb-4">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <p className="text-[--text-secondary] mb-4 text-center text-sm sm:text-base px-2">
            Connect your Lightning wallet to get started
          </p>
          <button 
            onClick={connectWallet}
            className="btn-primary flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {walletInfo && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[--text-secondary]">Alias</label>
                <div className="font-medium">{walletInfo.node.alias}</div>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[--text-secondary]">Pubkey</label>
                <div className="text-xs sm:text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden overflow-ellipsis font-mono break-all">
                  {walletInfo.node.pubkey}
                </div>
              </div>
              
              {walletInfo.methods && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[--text-secondary]">Supported Methods</label>
                  <div className="flex flex-wrap gap-2">
                    {walletInfo.methods.map((method, index) => (
                      <span 
                        key={index} 
                        className="text-xs bg-[--primary]/10 text-[--primary] rounded-full px-2 py-1"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400 text-xs sm:text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}