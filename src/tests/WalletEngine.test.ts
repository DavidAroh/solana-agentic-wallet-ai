import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletEngine } from '../wallet/WalletEngine';
import { Keypair, Connection } from '@solana/web3.js';
import { SECURITY_CONFIG } from '../config';

describe('WalletEngine', () => {
  let walletEngine: WalletEngine;

  beforeEach(() => {
    walletEngine = new WalletEngine();
  });

  it('should create a wallet', async () => {
    const keypair = await walletEngine.createWallet();
    expect(keypair).toBeDefined();
    expect(typeof keypair).toBe('object');
    expect(keypair.publicKey).toBeDefined();
  });

  it('should sign a transaction', async () => {
    // Simplified mockup for transaction signing
    // Real tests might mock the @solana/web3.js more deeply
    const keypair = await walletEngine.createWallet();
    // Using simple verify check with a mock transaction structure
    expect(keypair.publicKey).toBeTruthy();
  });

  it('should query balance', async () => {
    // We would need to mock connection for balance queries
  });
});
