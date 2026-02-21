import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AgentManager } from '../agents/AgentManager';
import { WalletEngine } from '../wallet/WalletEngine';
import { TransactionExecutor } from '../transactions/TransactionExecutor';
import { KeyManager } from '../security/KeyManager';
import { Logger } from '../utils/Logger';
import { AgentBehaviorType } from '../types';

describe('AgentManager execution loop', () => {
  let agentManager: AgentManager;
  let walletEngine: WalletEngine;
  let transactionExecutor: TransactionExecutor;
  let keyManager: KeyManager;
  let logger: Logger;

  beforeEach(() => {
    walletEngine = new WalletEngine();
    transactionExecutor = new TransactionExecutor(walletEngine);
    keyManager = new KeyManager({ persistKeys: false, keystoreDir: './test-keystore', encryptionKey: 'test-key' });
    logger = new Logger();

    agentManager = new AgentManager(walletEngine, transactionExecutor, keyManager, logger);
  });

  afterEach(() => {
    // Restore any mocks
    vi.restoreAllMocks();
  });

  it('should create an agent', async () => {
    const agent = await agentManager.createAgent('test-agent-idle', 'Idle Agent', AgentBehaviorType.IDLE);
    expect(agent).toBeDefined();
    expect(agentManager.getAgent('test-agent-idle')).toBe(agent);
  });

  it('should start and stop all agents', async () => {
    const agent1 = await agentManager.createAgent('agent-1', 'Random', AgentBehaviorType.RANDOM_ACTOR);
    const agent2 = await agentManager.createAgent('agent-2', 'Trader', AgentBehaviorType.TRADER);

    // Mock start and stop methods for agents
    const start1 = vi.spyOn(agent1, 'start').mockResolvedValue(undefined);
    const stop1 = vi.spyOn(agent1, 'stop').mockResolvedValue(undefined);
    
    const start2 = vi.spyOn(agent2, 'start').mockResolvedValue(undefined);
    const stop2 = vi.spyOn(agent2, 'stop').mockResolvedValue(undefined);

    await agentManager.startAllAgents();
    
    expect(start1).toHaveBeenCalledTimes(1);
    expect(start2).toHaveBeenCalledTimes(1);

    await agentManager.stopAllAgents();

    expect(stop1).toHaveBeenCalledTimes(1);
    expect(stop2).toHaveBeenCalledTimes(1);
  });
});
