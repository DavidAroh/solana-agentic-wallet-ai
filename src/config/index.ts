import { clusterApiUrl } from '@solana/web3.js';

export const SOLANA_CONFIG = {
  network: 'devnet' as const,
  rpcEndpoint: clusterApiUrl('devnet'),
  commitment: 'confirmed' as const,
};

export const TRANSACTION_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  confirmationTimeout: 30000,
};

export const SECURITY_CONFIG = {
  encryptionEnabled: false,
  persistKeys: true,
  keystoreDir: './data/wallets',
};

export const AGENT_CONFIG = {
  actionInterval: 10000,
  minTransferAmount: 0.001,
  maxTransferAmount: 0.1,
  airdropAmount: 1,
};

export const LOGGING_CONFIG = {
  logDir: './data/logs',
  enableFileLogging: true,
  enableConsoleLogging: true,
};
