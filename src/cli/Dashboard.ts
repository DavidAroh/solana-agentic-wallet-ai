import { AgentManager } from '../agents/AgentManager';
import { Logger } from '../utils/Logger';

export class Dashboard {
  private agentManager: AgentManager;
  private logger: Logger;
  private refreshInterval: NodeJS.Timeout | null = null;

  constructor(agentManager: AgentManager, logger: Logger) {
    this.agentManager = agentManager;
    this.logger = logger;
  }

  async displayStatus(): Promise<void> {
    console.clear();
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('                    SOLANA AGENTIC WALLET SYSTEM - DEVNET                     ');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('');

    const statuses = await this.agentManager.getAllAgentStatuses();

    if (statuses.length === 0) {
      console.log('No agents currently running.');
      console.log('');
      return;
    }

    for (const status of statuses) {
      const { config, walletInfo, recentActions, totalActions } = status;
      const activeStatus = config.isActive ? '🟢 ACTIVE' : '🔴 STOPPED';

      console.log(`┌─────────────────────────────────────────────────────────────────────────────┐`);
      console.log(`│ Agent: ${config.name.padEnd(30)} ${activeStatus.padStart(38)} │`);
      console.log(`├─────────────────────────────────────────────────────────────────────────────┤`);
      console.log(`│ ID:       ${config.id.padEnd(66)} │`);
      console.log(`│ Type:     ${config.behavior.padEnd(66)} │`);
      console.log(`│ Wallet:   ${walletInfo.address.padEnd(66)} │`);
      console.log(`│ Balance:  ${walletInfo.balance.toFixed(4).padEnd(66)} SOL │`);
      console.log(`│ Actions:  ${totalActions.toString().padEnd(66)} │`);
      console.log(`└─────────────────────────────────────────────────────────────────────────────┘`);

      if (recentActions.length > 0) {
        console.log('  Recent Actions:');
        recentActions.forEach((action) => {
          const timestamp = action.timestamp.toLocaleTimeString();
          const status = action.result
            ? action.result.success
              ? '✓'
              : '✗'
            : '○';
          console.log(`    ${status} [${timestamp}] ${action.description}`);
        });
      }

      console.log('');
    }

    console.log('───────────────────────────────────────────────────────────────────────────────');
    console.log('Recent System Logs:');
    console.log('───────────────────────────────────────────────────────────────────────────────');

    const recentLogs = this.logger.getRecentLogs(10);
    recentLogs.forEach((log) => {
      const timestamp = log.timestamp.toLocaleTimeString();
      const levelIcon = this.getLevelIcon(log.level);
      const agentId = log.agentId ? `[${log.agentId}]` : '';
      console.log(`${levelIcon} ${timestamp} ${agentId} ${log.message}`);
    });

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('Press Ctrl+C to stop all agents and exit');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
  }

  private getLevelIcon(level: string): string {
    switch (level) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  }

  startAutoRefresh(intervalMs: number = 3000): void {
    if (this.refreshInterval) {
      return;
    }

    this.refreshInterval = setInterval(async () => {
      await this.displayStatus();
    }, intervalMs);
  }

  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  async displayAgentDetails(agentId: string): Promise<void> {
    const agent = this.agentManager.getAgent(agentId);
    if (!agent) {
      console.log(`Agent ${agentId} not found.`);
      return;
    }

    const status = await this.agentManager.getAgentStatus(agentId);
    if (!status) {
      return;
    }

    console.clear();
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log(`                    AGENT DETAILS: ${status.config.name}                    `);
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log(`ID:           ${status.config.id}`);
    console.log(`Name:         ${status.config.name}`);
    console.log(`Type:         ${status.config.behavior}`);
    console.log(`Status:       ${status.config.isActive ? 'Active' : 'Stopped'}`);
    console.log(`Wallet:       ${status.walletInfo.address}`);
    console.log(`Balance:      ${status.walletInfo.balance.toFixed(4)} SOL`);
    console.log(`Total Actions: ${status.totalActions}`);
    console.log('');
    console.log('Action History:');
    console.log('───────────────────────────────────────────────────────────────────────────────');

    const actionHistory = agent.getActionHistory();
    actionHistory.slice(-20).forEach((action) => {
      const timestamp = action.timestamp.toLocaleString();
      const status = action.result
        ? action.result.success
          ? '✓ SUCCESS'
          : '✗ FAILED'
        : '○ INFO';
      console.log(`[${timestamp}] ${status} - ${action.description}`);
      if (action.result && action.result.signature) {
        console.log(`  Signature: ${action.result.signature}`);
      }
      if (action.result && action.result.error) {
        console.log(`  Error: ${action.result.error}`);
      }
    });

    console.log('');
  }
}
