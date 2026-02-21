import { PublicKey } from '@solana/web3.js';

export interface WalletInfo {
  address: string;
  publicKey: PublicKey;
  balance: number;
  lastActivity?: Date;
}

export interface TransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
  timestamp: Date;
}

export interface AgentConfig {
  id: string;
  name: string;
  behavior: AgentBehaviorType;
  walletId: string;
  isActive: boolean;
}

export enum AgentBehaviorType {
  TRADER = 'trader',
  RANDOM_ACTOR = 'random_actor',
  TOKEN_MANAGER = 'token_manager',
  IDLE = 'idle',
}

export interface AgentAction {
  type: ActionType;
  timestamp: Date;
  description: string;
  result?: TransactionResult;
}

export enum ActionType {
  CREATE_WALLET = 'create_wallet',
  REQUEST_AIRDROP = 'request_airdrop',
  SEND_SOL = 'send_sol',
  RECEIVE_SOL = 'receive_sol',
  TRANSFER_TOKEN = 'transfer_token',
  QUERY_BALANCE = 'query_balance',
  SIGN_TRANSACTION = 'sign_transaction',
  INTERACT_PROGRAM = 'interact_program',
}

export interface WalletCredentials {
  publicKey: string;
  secretKey: Uint8Array;
}

export interface SecurityConfig {
  encryptionEnabled?: boolean;
  persistKeys: boolean;
  keystorePassword?: string;
  keystoreDir: string;
  encryptionKey?: string;
}

export interface TransactionConfig {
  maxRetries: number;
  retryDelay: number;
  confirmationTimeout: number;
}

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  agentId?: string;
  message: string;
  data?: unknown;
}
