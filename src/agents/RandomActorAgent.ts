import { BaseAgent } from './BaseAgent';
import { ActionType } from '../types';
import { AGENT_CONFIG } from '../config';
import { Keypair } from '@solana/web3.js';

export class RandomActorAgent extends BaseAgent {
  private actions: ActionType[] = [
    ActionType.REQUEST_AIRDROP,
    ActionType.QUERY_BALANCE,
    ActionType.SEND_SOL,
  ];

  async performAction(): Promise<void> {
    const randomAction = this.actions[Math.floor(Math.random() * this.actions.length)];

    switch (randomAction) {
      case ActionType.REQUEST_AIRDROP:
        await this.performAirdrop();
        break;
      case ActionType.QUERY_BALANCE:
        await this.performBalanceCheck();
        break;
      case ActionType.SEND_SOL:
        await this.performRandomTransfer();
        break;
      default:
        this.logger.info('Idle action', this.config.id);
    }
  }

  private async performAirdrop(): Promise<void> {
    const shouldAirdrop = Math.random() > 0.7;
    if (shouldAirdrop) {
      await this.requestAirdrop(AGENT_CONFIG.airdropAmount);
    }
  }

  private async performBalanceCheck(): Promise<void> {
    const balance = await this.getBalance();
    this.logAction(ActionType.QUERY_BALANCE, `Balance: ${balance.toFixed(4)} SOL`);
  }

  private async performRandomTransfer(): Promise<void> {
    const balance = await this.getBalance();

    if (balance < AGENT_CONFIG.minTransferAmount * 2) {
      this.logger.info('Insufficient balance for transfer', this.config.id);
      return;
    }

    const randomWallet = Keypair.generate().publicKey;
    const amount = Math.min(
      Math.random() * AGENT_CONFIG.maxTransferAmount,
      balance * 0.1
    );

    await this.sendSOL(randomWallet, amount);
  }

  protected getActionInterval(): number {
    return AGENT_CONFIG.actionInterval + Math.random() * 5000;
  }
}
