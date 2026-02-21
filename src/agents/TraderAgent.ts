import { BaseAgent } from './BaseAgent';
import { AGENT_CONFIG } from '../config';

export class TraderAgent extends BaseAgent {
  private targetWallets: string[] = [];
  private minBalance: number = 0.1;

  async performAction(): Promise<void> {
    const balance = await this.getBalance();

    if (balance < this.minBalance) {
      this.logger.info('Balance low, requesting airdrop', this.config.id);
      await this.requestAirdrop(AGENT_CONFIG.airdropAmount);
      return;
    }

    if (this.targetWallets.length === 0) {
      this.logger.info('No target wallets configured, waiting...', this.config.id);
      return;
    }

    const amount =
      Math.random() * (AGENT_CONFIG.maxTransferAmount - AGENT_CONFIG.minTransferAmount) +
      AGENT_CONFIG.minTransferAmount;

    const targetPublicKey = await this.getRandomDevnetWallet();

    if (!targetPublicKey) {
      this.logger.warn('Could not determine target wallet', this.config.id);
      return;
    }

    await this.sendSOL(targetPublicKey, amount);
  }

  protected getActionInterval(): number {
    return AGENT_CONFIG.actionInterval;
  }

  setTargetWallets(wallets: string[]): void {
    this.targetWallets = wallets;
  }

  private async getRandomDevnetWallet() {
    return this.keypair?.publicKey || null;
  }
}
