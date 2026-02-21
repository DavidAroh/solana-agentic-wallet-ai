import { Keypair, PublicKey } from '@solana/web3.js';
import { WalletEngine } from '../wallet/WalletEngine';
import { TransactionResult, TransactionConfig } from '../types';
import { TRANSACTION_CONFIG } from '../config';

export class TransactionExecutor {
  private walletEngine: WalletEngine;
  private config: TransactionConfig;

  constructor(walletEngine: WalletEngine, config: TransactionConfig = TRANSACTION_CONFIG) {
    this.walletEngine = walletEngine;
    this.config = config;
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(
          `${operationName} attempt ${attempt}/${this.config.maxRetries} failed:`,
          lastError.message
        );

        if (attempt < this.config.maxRetries) {
          await this.sleep(this.config.retryDelay * attempt);
        }
      }
    }

    throw lastError || new Error(`${operationName} failed after ${this.config.maxRetries} attempts`);
  }

  async requestAirdrop(publicKey: PublicKey, amount: number): Promise<TransactionResult> {
    return this.executeWithRetry(
      () => this.walletEngine.requestAirdrop(publicKey, amount),
      'Airdrop'
    );
  }

  async sendSOL(from: Keypair, to: PublicKey, amount: number): Promise<TransactionResult> {
    return this.executeWithRetry(
      () => this.walletEngine.sendSOL(from, to, amount),
      'Send SOL'
    );
  }

  async transferTokens(
    mint: PublicKey,
    from: Keypair,
    to: PublicKey,
    amount: number
  ): Promise<TransactionResult> {
    return this.executeWithRetry(
      () => this.walletEngine.transferTokens(mint, from, to, amount),
      'Transfer Tokens'
    );
  }

  async getBalance(publicKey: PublicKey): Promise<number> {
    return this.executeWithRetry(
      () => this.walletEngine.getBalance(publicKey),
      'Get Balance'
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async executeTransaction(
    operation: () => Promise<TransactionResult>,
    operationName: string
  ): Promise<TransactionResult> {
    try {
      return await this.executeWithRetry(operation, operationName);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async batchTransactions(
    operations: Array<() => Promise<TransactionResult>>
  ): Promise<TransactionResult[]> {
    const results: TransactionResult[] = [];

    for (const operation of operations) {
      const result = await this.executeTransaction(operation, 'Batch Transaction');
      results.push(result);

      if (!result.success) {
        console.warn('Batch transaction failed, continuing with next operation');
      }
    }

    return results;
  }
}
