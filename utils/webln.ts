import { WebLNKeysendArgs, WebLNProvider, WebLNRequestInvoiceArgs } from "../types/types";

// Extend Window interface
declare global {
  interface Window {
    webln?: WebLNProvider;
  }
}

/**
 * Enables WebLN in the browser
 * @returns WebLN provider if available
 */
export async function enableWebLN(): Promise<WebLNProvider> {
  if (typeof window !== 'undefined' && typeof window.webln !== 'undefined') {
    try {
      await window.webln.enable();
      return window.webln;
    } catch (error) {
      console.error('Error enabling WebLN:', error);
      throw new Error("Failed to enable WebLN. Please check your wallet connection.");
    }
  } else {
    throw new Error("WebLN is not available. Please install BlueWallet or another WebLN provider.");
  }
}

/**
 * Checks if WebLN is available in the browser
 * @returns boolean indicating if WebLN is available
 */
export function isWebLNAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.webln !== 'undefined';
}

/**
 * Gets information about the user's Lightning wallet
 * @returns Wallet information
 */
export async function getWalletInfo() {
  try {
    const webln = await enableWebLN();
    const info = await webln.getInfo();
    return info;
  } catch (error) {
    console.error('Error getting wallet info:', error);
    throw error;
  }
}

/**
 * Sends a Lightning payment using a BOLT11 invoice
 * @param invoice BOLT11 invoice to pay
 * @returns Payment response
 */
export async function sendPayment(invoice: string) {
  try {
    const webln = await enableWebLN();
    const response = await webln.sendPayment(invoice);
    return response;
  } catch (error) {
    console.error('Error sending payment:', error);
    throw error;
  }
}

/**
 * Sends a keysend payment to a Lightning node
 * @param destination Node pubkey
 * @param amount Amount in satoshis
 * @param customRecords Optional custom TLV records
 * @returns Payment response
 */
export async function sendKeysendPayment(
  destination: string,
  amount: number,
  customRecords?: { [key: string]: string }
) {
  try {
    const webln = await enableWebLN();
    const params: WebLNKeysendArgs = {
      destination,
      amount,
      ...(customRecords && { customRecords })
    };
    const response = await webln.keysend(params);
    return response;
  } catch (error) {
    console.error('Error sending keysend payment:', error);
    throw error;
  }
}

/**
 * Creates a Lightning invoice
 * @param args Invoice creation arguments
 * @returns Created invoice
 */
export async function createInvoice(args: WebLNRequestInvoiceArgs) {
  try {
    const webln = await enableWebLN();
    const response = await webln.makeInvoice(args);
    return response;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

/**
 * Pays a Lightning Address
 * @param lnAddress Lightning address (user@domain.com)
 * @param amount Amount in satoshis
 * @returns Payment response
 */
export async function payLightningAddress(lnAddress: string, amount: number) {
  try {
    const webln = await enableWebLN();
    
    // Use a generic LNURL resolver to convert Lightning Address to invoice
    const response = await fetch(`https://lightning.store/api/lnurl?lightning_address=${lnAddress}&amount=${amount * 1000}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to resolve Lightning Address');
    }
    
    const data = await response.json();
    
    // Pay the invoice using WebLN
    return await webln.sendPayment(data.payment_request);
  } catch (error) {
    console.error('Error paying Lightning address:', error);
    throw error;
  }
}

/**
 * Convert satoshis to fiat currency
 * @param sats Amount in satoshis
 * @param currency Fiat currency code (USD, EUR, etc.)
 * @returns Amount in fiat currency
 */
export async function satsToFiat(sats: number, currency: string = 'USD'): Promise<number> {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currency.toLowerCase()}`);
    const data = await response.json();
    const btcPrice = data.bitcoin[currency.toLowerCase()];
    
    // Convert sats to BTC and then to fiat
    return (sats / 100000000) * btcPrice;
  } catch (error) {
    console.error('Error converting sats to fiat:', error);
    throw error;
  }
}

/**
 * Convert fiat currency to satoshis
 * @param fiat Amount in fiat currency
 * @param currency Fiat currency code (USD, EUR, etc.)
 * @returns Amount in satoshis
 */
export async function fiatToSats(fiat: number, currency: string = 'USD'): Promise<number> {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currency.toLowerCase()}`);
    const data = await response.json();
    const btcPrice = data.bitcoin[currency.toLowerCase()];
    
    // Convert fiat to BTC and then to sats
    return Math.round((fiat / btcPrice) * 100000000);
  } catch (error) {
    console.error('Error converting fiat to sats:', error);
    throw error;
  }
}