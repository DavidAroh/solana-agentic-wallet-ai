import { Keypair, PublicKey } from '@solana/web3.js';
import { WalletEngine } from '../wallet/WalletEngine';
import { TransactionExecutor } from '../transactions/TransactionExecutor';
import { KeyManager } from '../security/KeyManager';
import { Logger } from '../utils/Logger';
import { AgentConfig, AgentAction, ActionType, TransactionResult } from '../types';

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected walletEngine: WalletEngine;
  protected transactionExecutor: TransactionExecutor;
  protected keyManager: KeyManager;
  protected logger: Logger;
  protected keypair: Keypair | null = null;
  protected isRunning: boolean = false;
  protected actionHistory: AgentAction[] = [];
  protected actionInterval: NodeJS.Timeout | null = null;

  constructor(
    config: AgentConfig,
    walletEngine: WalletEngine,
    transactionExecutor: TransactionExecutor,
    keyManager: KeyManager,
    logger: Logger
  ) {
    this.config = config;
    this.walletEngine = walletEngine;
    this.transactionExecutor = transactionExecutor;
    this.keyManager = keyManager;
    this.logger = logger;
  }

  async initialize(): Promise<void> {
    this.keypair = this.keyManager.loadKeypair(this.config.walletId);

    if (!this.keypair) {
      this.keypair = this.keyManager.generateKeypair();
      this.keyManager.saveKeypair(this.keypair, this.config.walletId);
      this.logAction(ActionType.CREATE_WALLET, 'Wallet created');
    }

    this.logger.info(
      `Agent initialized with wallet: ${this.keypair.publicKey.toBase58()}`,
      this.config.id
    );
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Agent is already running', this.config.id);
      return;
    }

    this.isRunning = true;
    this.config.isActive = true;
    this.logger.success(`Agent started`, this.config.id);

    await this.executeAgentLoop();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    this.config.isActive = false;

    if (this.actionInterval) {
      clearInterval(this.actionInterval);
      this.actionInterval = null;
    }

    this.logger.info('Agent stopped', this.config.id);
  }

  private async executeAgentLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.performAction();
        await this.sleep(this.getActionInterval());
      } catch (error) {
        this.logger.error(
          `Error in agent loop: ${error instanceof Error ? error.message : 'Unknown error'}`,
          this.config.id
        );
        await this.sleep(5000);
      }
    }
  }

  protected abstract performAction(): Promise<void>;

  protected abstract getActionInterval(): number;

  protected async requestAirdrop(amount: number): Promise<TransactionResult> {
    if (!this.keypair) {
      throw new Error('Keypair not initialized');
    }

    this.logger.info(`Requesting airdrop of ${amount} SOL`, this.config.id);
    const result = await this.transactionExecutor.requestAirdrop(this.keypair.publicKey, amount);

    this.logAction(ActionType.REQUEST_AIRDROP, `Airdrop ${amount} SOL`, result);
    return result;
  }

  protected async sendSOL(to: PublicKey, amount: number): Promise<TransactionResult> {
    if (!this.keypair) {
      throw new Error('Keypair not initialized');
    }

    this.logger.info(`Sending ${amount} SOL to ${to.toBase58()}`, this.config.id);
    const result = await this.transactionExecutor.sendSOL(this.keypair, to, amount);

    this.logAction(ActionType.SEND_SOL, `Sent ${amount} SOL`, result);
    return result;
  }

  protected async getBalance(): Promise<number> {
    if (!this.keypair) {
      throw new Error('Keypair not initialized');
    }

    return this.transactionExecutor.getBalance(this.keypair.publicKey);
  }

  protected logAction(type: ActionType, description: string, result?: TransactionResult): void {
    const action: AgentAction = {
      type,
      timestamp: new Date(),
      description,
      result,
    };

    this.actionHistory.push(action);

    if (result) {
      if (result.success) {
        this.logger.success(description, this.config.id);
      } else {
        this.logger.error(`${description} - ${result.error}`, this.config.id);
      }
    }
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getPublicKey(): PublicKey | null {
    return this.keypair ? this.keypair.publicKey : null;
  }

  getConfig(): AgentConfig {
    return this.config;
  }

  getActionHistory(): AgentAction[] {
    return this.actionHistory;
  }

  async getWalletInfo() {
    if (!this.keypair) {
      throw new Error('Keypair not initialized');
    }

    return this.walletEngine.getWalletInfo(this.keypair);
  }
}
