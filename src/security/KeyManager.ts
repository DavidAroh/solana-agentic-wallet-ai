import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import bs58 from 'bs58';
import { WalletCredentials, SecurityConfig } from '../types';
import { SECURITY_CONFIG } from '../config';

export class KeyManager {
  private config: SecurityConfig;
  private keystoreDir: string;

  constructor(config: SecurityConfig = SECURITY_CONFIG) {
    this.config = config;
    this.keystoreDir = SECURITY_CONFIG.keystoreDir;
    this.ensureKeystoreDir();
  }

  private ensureKeystoreDir(): void {
    if (this.config.persistKeys && !fs.existsSync(this.keystoreDir)) {
      fs.mkdirSync(this.keystoreDir, { recursive: true });
    }
  }

  generateKeypair(): Keypair {
    return Keypair.generate();
  }

  saveKeypair(keypair: Keypair, walletId: string): void {
    if (!this.config.persistKeys) {
      console.warn('Key persistence is disabled. Keypair will not be saved.');
      return;
    }

    const credentials: WalletCredentials = {
      publicKey: keypair.publicKey.toBase58(),
      secretKey: keypair.secretKey,
    };

    const filePath = path.join(this.keystoreDir, `${walletId}.json`);

    const data = {
      publicKey: credentials.publicKey,
      secretKey: bs58.encode(credentials.secretKey),
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  loadKeypair(walletId: string): Keypair | null {
    const filePath = path.join(this.keystoreDir, `${walletId}.json`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);

      const secretKey = bs58.decode(data.secretKey);
      return Keypair.fromSecretKey(secretKey);
    } catch (error) {
      console.error(`Failed to load keypair for wallet ${walletId}:`, error);
      return null;
    }
  }

  deleteKeypair(walletId: string): boolean {
    const filePath = path.join(this.keystoreDir, `${walletId}.json`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }

    return false;
  }

  listWallets(): string[] {
    if (!fs.existsSync(this.keystoreDir)) {
      return [];
    }

    const files = fs.readdirSync(this.keystoreDir);
    return files
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace('.json', ''));
  }

  exportKeypairToArray(keypair: Keypair): number[] {
    return Array.from(keypair.secretKey);
  }

  importKeypairFromArray(secretKeyArray: number[]): Keypair {
    return Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
  }

  getKeypairFromSecretKey(secretKey: string): Keypair {
    const decoded = bs58.decode(secretKey);
    return Keypair.fromSecretKey(decoded);
  }
}
