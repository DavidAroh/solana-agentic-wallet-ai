import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
} from '@solana/spl-token';
import { SOLANA_CONFIG } from '../config';
import { WalletInfo, TransactionResult } from '../types';

export class WalletEngine {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(SOLANA_CONFIG.rpcEndpoint, SOLANA_CONFIG.commitment);
  }

  async createWallet(): Promise<Keypair> {
    return Keypair.generate();
  }

  async getBalance(publicKey: PublicKey): Promise<number> {
    const balance = await this.connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  async getWalletInfo(keypair: Keypair): Promise<WalletInfo> {
    const balance = await this.getBalance(keypair.publicKey);

    return {
      address: keypair.publicKey.toBase58(),
      publicKey: keypair.publicKey,
      balance,
      lastActivity: new Date(),
    };
  }

  async requestAirdrop(publicKey: PublicKey, amount: number = 1): Promise<TransactionResult> {
    try {
      const signature = await this.connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );

      await this.connection.confirmTransaction(signature);

      return {
        success: true,
        signature,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async sendSOL(
    from: Keypair,
    to: PublicKey,
    amount: number
  ): Promise<TransactionResult> {
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: from.publicKey,
          toPubkey: to,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [from]
      );

      return {
        success: true,
        signature,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async createToken(payer: Keypair, decimals: number = 9): Promise<PublicKey> {
    const mint = await createMint(
      this.connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      decimals
    );

    return mint;
  }

  async mintTokens(
    mint: PublicKey,
    destination: PublicKey,
    authority: Keypair,
    amount: number
  ): Promise<TransactionResult> {
    try {
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        authority,
        mint,
        destination
      );

      const signature = await mintTo(
        this.connection,
        authority,
        mint,
        tokenAccount.address,
        authority,
        amount
      );

      return {
        success: true,
        signature,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async transferTokens(
    mint: PublicKey,
    from: Keypair,
    to: PublicKey,
    amount: number
  ): Promise<TransactionResult> {
    try {
      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        from,
        mint,
        from.publicKey
      );

      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        from,
        mint,
        to
      );

      const signature = await transfer(
        this.connection,
        from,
        fromTokenAccount.address,
        toTokenAccount.address,
        from,
        amount
      );

      return {
        success: true,
        signature,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async signTransaction(transaction: Transaction, signer: Keypair): Promise<Transaction> {
    transaction.sign(signer);
    return transaction;
  }

  getConnection(): Connection {
    return this.connection;
  }
}
