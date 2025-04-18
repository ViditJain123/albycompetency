'use client';

import { useState, useEffect } from 'react';
// Removing unused Image import
import WalletInfo from '../components/WalletInfo';
import SendPayment from '../components/SendPayment';
import KeysendPayment from '../components/KeysendPayment';
import CreateInvoice from '../components/CreateInvoice';
import LightningAddressPayment from '../components/LightningAddressPayment';
import AutoPayOnScroll from '../components/AutoPayOnScroll';
import QRCodeScanner from '../components/QRCodeScanner';
import { isWebLNAvailable } from '../../utils/webln';

export default function Home() {
  const [activeTab, setActiveTab] = useState('wallet');
  const [darkMode, setDarkMode] = useState(false);
  const [webLNAvailable, setWebLNAvailable] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if WebLN is available
  useEffect(() => {
    setWebLNAvailable(isWebLNAvailable());
    
    // Check system preference for dark mode
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Close mobile menu when tab changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Use Alby's default pubkey for demo purposes
  const demoDestinationPubkey = '030a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3';

  // Navigation items
  const navItems = [
    { id: 'wallet', label: 'Wallet Info' },
    { id: 'invoice', label: 'Create Invoice' },
    { id: 'pay', label: 'Pay Invoice' },
    { id: 'keysend', label: 'Keysend' },
    { id: 'lnaddress', label: 'Lightning Address' },
    { id: 'scan', label: 'Scan QR' },
    { id: 'auto', label: 'Auto-Pay' },
  ];

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-[--background]/90 border-b border-[--border]">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[--primary]">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-5 w-5 text-black"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">Lightning Web App</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:hidden"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile navigation menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 py-2 pb-4 border-t border-[--border] bg-white dark:bg-gray-900">
            <nav className="flex flex-col space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  className={`p-2 rounded-md text-left ${activeTab === item.id ? 'bg-[--primary]/10 text-[--primary]' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      <div className="container mx-auto px-4 py-6">
        {!webLNAvailable && (
          <div className="mb-8 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
            <div className="flex gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <h2 className="text-lg font-semibold mb-1">WebLN Not Available</h2>
                <p className="text-sm sm:text-base">You need a WebLN-compatible wallet like Alby to use this application. <a href="https://getalby.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Install Alby</a> to continue.</p>
              </div>
            </div>
          </div>
        )}

        {/* Desktop navigation */}
        <div className="mb-8 hidden md:block overflow-x-auto">
          <nav className="flex min-w-full border-b border-[--border]">
            {navItems.map(item => (
              <button 
                key={item.id}
                className={`tab ${activeTab === item.id ? 'tab-active' : 'tab-inactive'}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile active tab indicator */}
        <div className="md:hidden mb-6">
          <h2 className="text-lg font-semibold">
            {navItems.find(item => item.id === activeTab)?.label}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'wallet' && (
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[--primary]">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  <h2 className="text-xl font-semibold">About This App</h2>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p>
                    This Lightning Web Application demonstrates WebLN integration using React. It showcases the core functionalities of WebLN, allowing users to interact with their Lightning wallets directly from the browser.
                  </p>
                  <p>
                    To get started, connect your WebLN-compatible wallet (like Alby) using the &quot;Connect Wallet&quot; button on the sidebar. Then explore the different Lightning Network features using the tabs above.
                  </p>
                  <p>
                    You can send Lightning payments, create invoices, perform keysend payments, and even set up auto-payments when scrolling!
                  </p>
                  
                  <h3>Features</h3>
                  <ul>
                    <li><strong>Wallet Info</strong> - Connect and view your Lightning wallet information</li>
                    <li><strong>Create Invoice</strong> - Generate Lightning invoices with customizable amount and memo</li>
                    <li><strong>Pay Invoice</strong> - Send payments using BOLT11 invoices</li>
                    <li><strong>Keysend</strong> - Send direct payments to nodes without an invoice</li>
                    <li><strong>Lightning Address</strong> - Send payments to Lightning addresses like user@domain.com</li>
                    <li><strong>QR Scanner</strong> - Scan Lightning invoice QR codes and pay them instantly</li>
                    <li><strong>Auto-Pay on Scroll</strong> - Experimental feature that sends micropayments as you scroll</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'invoice' && <CreateInvoice />}
            {activeTab === 'pay' && <SendPayment />}
            {activeTab === 'keysend' && <KeysendPayment />}
            {activeTab === 'lnaddress' && <LightningAddressPayment />}
            {activeTab === 'scan' && <QRCodeScanner />}
            {activeTab === 'auto' && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Auto-Pay on Scroll</h2>
                <p className="mb-4 text-[--text-secondary]">
                  This feature demonstrates how WebLN can be used for micro-payments tied to user interactions. When enabled, it will send 1 sat each time you scroll on the page.
                </p>
                <p className="mb-4 text-[--text-secondary]">
                  You can enable/disable this feature using the toggle on the sidebar. Try scrolling up and down to trigger payments!
                </p>
                <div className="h-64 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="mb-4 font-medium">Scroll within this area to trigger payments (if enabled)</p>
                  {Array(20).fill(0).map((_, i) => (
                    <p key={i} className="mb-4 text-[--text-secondary]">
                      Scroll item {i+1} - Keep scrolling to send Lightning payments!
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 order-first lg:order-last">
            <WalletInfo />
            <AutoPayOnScroll 
              destinationPubkey={demoDestinationPubkey} 
              amountPerScroll={1}
              maxPayments={20}
            />
            
            {/* New footer card with helpful links */}
            <div className="card">
              <h3 className="text-sm uppercase text-[--text-secondary] tracking-wider mb-3">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="https://webln.dev/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[--text-primary] hover:text-[--primary] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    WebLN Documentation
                  </a>
                </li>
                <li>
                  <a 
                    href="https://getalby.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[--text-primary] hover:text-[--primary] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
                      <line x1="8" y1="16" x2="8.01" y2="16" />
                      <line x1="8" y1="20" x2="8.01" y2="20" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                      <line x1="12" y1="22" x2="12.01" y2="22" />
                      <line x1="16" y1="16" x2="16.01" y2="16" />
                      <line x1="16" y1="20" x2="16.01" y2="20" />
                    </svg>
                    Get Alby Wallet
                  </a>
                </li>
                <li>
                  <a 
                    href="https://github.com/getAlby/js-lightning-tools" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[--text-primary] hover:text-[--primary] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                    Alby JS Lightning Tools
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <footer className="mt-16 pt-6 border-t border-[--border] text-center text-sm text-[--text-secondary]">
          <p>Built with <span className="text-[--primary]">⚡</span> using Next.js, React, and WebLN</p>
        </footer>
      </div>
    </div>
  );
}
