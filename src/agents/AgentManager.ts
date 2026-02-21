import { BaseAgent } from './BaseAgent';
import { TraderAgent } from './TraderAgent';
import { RandomActorAgent } from './RandomActorAgent';
import { TokenManagerAgent } from './TokenManagerAgent';
import { IdleAgent } from './IdleAgent';
import { WalletEngine } from '../wallet/WalletEngine';
import { TransactionExecutor } from '../transactions/TransactionExecutor';
import { KeyManager } from '../security/KeyManager';
import { Logger } from '../utils/Logger';
import { AgentConfig, AgentBehaviorType } from '../types';

export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();
  private walletEngine: WalletEngine;
  private transactionExecutor: TransactionExecutor;
  private keyManager: KeyManager;
  private logger: Logger;

  constructor(
    walletEngine: WalletEngine,
    transactionExecutor: TransactionExecutor,
    keyManager: KeyManager,
    logger: Logger
  ) {
    this.walletEngine = walletEngine;
    this.transactionExecutor = transactionExecutor;
    this.keyManager = keyManager;
    this.logger = logger;
  }

  async createAgent(
    id: string,
    name: string,
    behavior: AgentBehaviorType
  ): Promise<BaseAgent> {
    const config: AgentConfig = {
      id,
      name,
      behavior,
      walletId: `wallet-${id}`,
      isActive: false,
    };

    let agent: BaseAgent;

    switch (behavior) {
      case AgentBehaviorType.TRADER:
        agent = new TraderAgent(
          config,
          this.walletEngine,
          this.transactionExecutor,
          this.keyManager,
          this.logger
        );
        break;
      case AgentBehaviorType.RANDOM_ACTOR:
        agent = new RandomActorAgent(
          config,
          this.walletEngine,
          this.transactionExecutor,
          this.keyManager,
          this.logger
        );
        break;
      case AgentBehaviorType.TOKEN_MANAGER:
        agent = new TokenManagerAgent(
          config,
          this.walletEngine,
          this.transactionExecutor,
          this.keyManager,
          this.logger
        );
        break;
      case AgentBehaviorType.IDLE:
        agent = new IdleAgent(
          config,
          this.walletEngine,
          this.transactionExecutor,
          this.keyManager,
          this.logger
        );
        break;
      default:
        throw new Error(`Unknown agent behavior: ${behavior}`);
    }

    await agent.initialize();
    this.agents.set(id, agent);

    this.logger.success(`Agent ${name} (${behavior}) created with ID: ${id}`);
    return agent;
  }

  async startAgent(id: string): Promise<void> {
    const agent = this.agents.get(id);
    if (!agent) {
      throw new Error(`Agent ${id} not found`);
    }

    await agent.start();
  }

  async stopAgent(id: string): Promise<void> {
    const agent = this.agents.get(id);
    if (!agent) {
      throw new Error(`Agent ${id} not found`);
    }

    await agent.stop();
  }

  async startAllAgents(): Promise<void> {
    for (const agent of this.agents.values()) {
      await agent.start();
    }
  }

  async stopAllAgents(): Promise<void> {
    for (const agent of this.agents.values()) {
      await agent.stop();
    }
  }

  getAgent(id: string): BaseAgent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  getActiveAgents(): BaseAgent[] {
    return Array.from(this.agents.values()).filter((agent) => agent.getConfig().isActive);
  }

  async getAgentStatus(id: string) {
    const agent = this.agents.get(id);
    if (!agent) {
      return null;
    }

    const config = agent.getConfig();
    const walletInfo = await agent.getWalletInfo();
    const actionHistory = agent.getActionHistory();

    return {
      config,
      walletInfo,
      recentActions: actionHistory.slice(-5),
      totalActions: actionHistory.length,
    };
  }

  async getAllAgentStatuses() {
    const statuses = [];
    for (const [id] of this.agents) {
      const status = await this.getAgentStatus(id);
      if (status) {
        statuses.push(status);
      }
    }
    return statuses;
  }
}
