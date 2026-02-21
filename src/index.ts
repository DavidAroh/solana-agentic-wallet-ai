import { WalletEngine } from './wallet/WalletEngine';
import { TransactionExecutor } from './transactions/TransactionExecutor';
import { KeyManager } from './security/KeyManager';
import { AgentManager } from './agents/AgentManager';
import { Dashboard } from './cli/Dashboard';
import { logger } from './utils/Logger';
import { AgentBehaviorType } from './types';

async function main() {
  logger.success('Initializing Solana Agentic Wallet System...');
  logger.info('Network: Solana Devnet');
  logger.info('');

  const walletEngine = new WalletEngine();
  const transactionExecutor = new TransactionExecutor(walletEngine);
  const keyManager = new KeyManager();
  const agentManager = new AgentManager(walletEngine, transactionExecutor, keyManager, logger);

  logger.info('Creating agents...');

  await agentManager.createAgent('agent-001', 'Trader Alice', AgentBehaviorType.TRADER);
  await agentManager.createAgent('agent-002', 'Random Bob', AgentBehaviorType.RANDOM_ACTOR);
  await agentManager.createAgent('agent-003', 'Token Charlie', AgentBehaviorType.TOKEN_MANAGER);
  await agentManager.createAgent('agent-004', 'Idle Diana', AgentBehaviorType.IDLE);

  logger.success('All agents created successfully!');
  logger.info('');

  logger.info('Requesting initial airdrops...');
  const agents = agentManager.getAllAgents();

  for (const agent of agents) {
    const publicKey = agent.getPublicKey();
    if (publicKey) {
      try {
        await transactionExecutor.requestAirdrop(publicKey, 1);
        logger.success(`Airdropped 1 SOL to ${agent.getConfig().name}`);
      } catch (error) {
        logger.error(
          `Failed to airdrop to ${agent.getConfig().name}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }
  }

  logger.info('');
  logger.success('Starting all agents...');
  await agentManager.startAllAgents();

  const dashboard = new Dashboard(agentManager, logger);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  dashboard.startAutoRefresh(3000);

  process.on('SIGINT', async () => {
    console.log('\n\nShutting down...');
    dashboard.stopAutoRefresh();
    await agentManager.stopAllAgents();
    logger.success('All agents stopped. Goodbye!');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\nShutting down...');
    dashboard.stopAutoRefresh();
    await agentManager.stopAllAgents();
    logger.success('All agents stopped. Goodbye!');
    process.exit(0);
  });
}

main().catch((error) => {
  logger.error('Fatal error:', undefined, error);
  process.exit(1);
});
