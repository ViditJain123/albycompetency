export interface WebLNProvider {
  enable: () => Promise<void>;
  getInfo: () => Promise<WebLNGetInfoResponse>;
  sendPayment: (invoice: string) => Promise<WebLNSendPaymentResponse>;
  keysend: (keysendArgs: WebLNKeysendArgs) => Promise<WebLNSendPaymentResponse>;
  makeInvoice: (args: WebLNRequestInvoiceArgs) => Promise<WebLNRequestInvoiceResponse>;
  signMessage: (message: string) => Promise<WebLNSignMessageResponse>;
  verifyMessage: (signature: string, message: string) => Promise<WebLNVerifyMessageResponse>;
}

export interface WebLNGetInfoResponse {
  node: {
    alias: string;
    pubkey: string;
    color?: string;
  };
  methods: string[];
  supports: string[];
  version?: string;
  external?: boolean;
}

export interface WebLNSendPaymentResponse {
  preimage: string;
  paymentHash?: string;
}

export interface WebLNKeysendArgs {
  destination: string;
  amount: string | number;
  customRecords?: { [key: string]: string };
}

export interface WebLNRequestInvoiceArgs {
  amount?: string | number;
  defaultAmount?: string | number;
  minimumAmount?: string | number;
  maximumAmount?: string | number;
  defaultMemo?: string;
}

export interface WebLNRequestInvoiceResponse {
  paymentRequest: string;
}

export interface WebLNSignMessageResponse {
  message: string;
  signature: string;
}

export interface WebLNVerifyMessageResponse {
  valid: boolean;
  pubkey?: string;
}

export interface LightningWalletInfo {
  alias: string;
  pubkey: string;
  color?: string;
  methods?: string[];
  supports?: string[];
  version?: string;
  external?: boolean;
}