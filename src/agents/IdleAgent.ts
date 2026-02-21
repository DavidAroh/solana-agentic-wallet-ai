import { BaseAgent } from './BaseAgent';
import { ActionType } from '../types';
import { AGENT_CONFIG } from '../config';

export class IdleAgent extends BaseAgent {
  private checkCount: number = 0;

  async performAction(): Promise<void> {
    this.checkCount++;

    if (this.checkCount % 5 === 0) {
      const balance = await this.getBalance();
      this.logAction(
        ActionType.QUERY_BALANCE,
        `Periodic balance check: ${balance.toFixed(4)} SOL`
      );

      if (balance < 0.01) {
        this.logger.info('Balance critically low, requesting airdrop', this.config.id);
        await this.requestAirdrop(AGENT_CONFIG.airdropAmount);
      }
    } else {
      this.logger.info('Idle - monitoring wallet', this.config.id);
    }
  }

  protected getActionInterval(): number {
    return AGENT_CONFIG.actionInterval * 3;
  }
}
