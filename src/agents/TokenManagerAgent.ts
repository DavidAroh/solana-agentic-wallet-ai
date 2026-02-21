import { BaseAgent } from './BaseAgent';
import { ActionType } from '../types';
import { AGENT_CONFIG } from '../config';
import { PublicKey } from '@solana/web3.js';

export class TokenManagerAgent extends BaseAgent {
  private tokenMint: PublicKey | null = null;

  async performAction(): Promise<void> {
    const balance = await this.getBalance();

    if (balance < 0.1) {
      this.logger.info('Balance low, requesting airdrop for token operations', this.config.id);
      await this.requestAirdrop(AGENT_CONFIG.airdropAmount);
      return;
    }

    if (!this.tokenMint) {
      await this.createToken();
    } else {
      await this.manageTokens();
    }
  }

  private async createToken(): Promise<void> {
    if (!this.keypair) {
      throw new Error('Keypair not initialized');
    }

    try {
      this.logger.info('Creating new token mint', this.config.id);
      this.tokenMint = await this.walletEngine.createToken(this.keypair, 9);
      this.logAction(ActionType.INTERACT_PROGRAM, `Created token: ${this.tokenMint.toBase58()}`);
    } catch (error) {
      this.logger.error(
        `Failed to create token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.config.id
      );
    }
  }

  private async manageTokens(): Promise<void> {
    if (!this.keypair || !this.tokenMint) {
      return;
    }

    const shouldMint = Math.random() > 0.5;

    if (shouldMint) {
      try {
        const amount = Math.floor(Math.random() * 1000000) + 1000;
        this.logger.info(`Minting ${amount} tokens`, this.config.id);

        const result = await this.walletEngine.mintTokens(
          this.tokenMint,
          this.keypair.publicKey,
          this.keypair,
          amount
        );

        this.logAction(ActionType.TRANSFER_TOKEN, `Minted ${amount} tokens`, result);
      } catch (error) {
        this.logger.error(
          `Failed to mint tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
          this.config.id
        );
      }
    }
  }

  protected getActionInterval(): number {
    return AGENT_CONFIG.actionInterval * 2;
  }

  getTokenMint(): PublicKey | null {
    return this.tokenMint;
  }
}
