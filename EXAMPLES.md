# Examples and Use Cases

This document provides practical examples of how to use and extend the Solana Agentic Wallet System.

## Example 1: Creating a Custom Agent

Here's how to create a custom agent that monitors multiple wallets and rebalances funds:

```typescript
import { BaseAgent } from './agents/BaseAgent';
import { ActionType } from './types';
import { PublicKey } from '@solana/web3.js';

export class RebalancerAgent extends BaseAgent {
  private watchedWallets: PublicKey[] = [];
  private targetBalance: number = 1.0;
  private threshold: number = 0.5;

  async performAction(): Promise<void> {
    const myBalance = await this.getBalance();

    // Check if we need to request airdrop
    if (myBalance < this.threshold) {
      await this.requestAirdrop(1);
      return;
    }

    // Check watched wallets and rebalance if needed
    for (const wallet of this.watchedWallets) {
      const balance = await this.transactionExecutor.getBalance(wallet);

      if (balance < this.threshold && myBalance > this.targetBalance) {
        const transferAmount = this.targetBalance - balance;
        await this.sendSOL(wallet, transferAmount);
      }
    }
  }

  protected getActionInterval(): number {
    return 15000; // Check every 15 seconds
  }

  addWatchedWallet(wallet: PublicKey): void {
    this.watchedWallets.push(wallet);
  }
}
```

## Example 2: Multi-Agent Coordination

Demonstrate agents working together:

```typescript
async function createCoordinatedAgents() {
  const agentManager = new AgentManager(
    walletEngine,
    transactionExecutor,
    keyManager,
    logger
  );

  // Create a pool manager
  const poolManager = await agentManager.createAgent(
    'pool-001',
    'Pool Manager',
    AgentBehaviorType.TOKEN_MANAGER
  );

  // Create multiple traders that interact with the pool
  const trader1 = await agentManager.createAgent(
    'trader-001',
    'Trader 1',
    AgentBehaviorType.TRADER
  );

  const trader2 = await agentManager.createAgent(
    'trader-002',
    'Trader 2',
    AgentBehaviorType.TRADER
  );

  // Configure traders to send to pool
  if (trader1 instanceof TraderAgent && poolManager.getPublicKey()) {
    trader1.setTargetWallets([poolManager.getPublicKey()!.toBase58()]);
  }

  if (trader2 instanceof TraderAgent && poolManager.getPublicKey()) {
    trader2.setTargetWallets([poolManager.getPublicKey()!.toBase58()]);
  }

  // Start all agents
  await agentManager.startAllAgents();
}
```

## Example 3: Event-Driven Agent

Agent that responds to specific events:

```typescript
export class EventDrivenAgent extends BaseAgent {
  private lastKnownBalance: number = 0;
  private eventThreshold: number = 0.1;

  async performAction(): Promise<void> {
    const currentBalance = await this.getBalance();

    // Detect significant balance changes
    const balanceChange = Math.abs(currentBalance - this.lastKnownBalance);

    if (balanceChange > this.eventThreshold) {
      this.logger.info(
        `Significant balance change detected: ${balanceChange.toFixed(4)} SOL`,
        this.config.id
      );

      // React to the change
      if (currentBalance > this.lastKnownBalance) {
        // Received funds - distribute to other wallets
        await this.distributeExcessFunds(balanceChange * 0.5);
      } else {
        // Lost funds - request airdrop if needed
        if (currentBalance < 0.1) {
          await this.requestAirdrop(1);
        }
      }
    }

    this.lastKnownBalance = currentBalance;
  }

  private async distributeExcessFunds(amount: number): Promise<void> {
    // Implementation for distributing funds
    this.logAction(
      ActionType.SEND_SOL,
      `Distributed ${amount.toFixed(4)} SOL`
    );
  }

  protected getActionInterval(): number {
    return 5000; // Check frequently for events
  }
}
```

## Example 4: Scheduled Agent

Agent that performs actions on a schedule:

```typescript
export class ScheduledAgent extends BaseAgent {
  private schedule: Map<string, number> = new Map([
    ['airdrop', 0], // Run immediately
    ['balance_check', 10000], // After 10 seconds
    ['cleanup', 60000], // After 1 minute
  ]);

  private lastRun: Map<string, number> = new Map();

  async performAction(): Promise<void> {
    const now = Date.now();

    for (const [task, interval] of this.schedule) {
      const lastRunTime = this.lastRun.get(task) || 0;

      if (now - lastRunTime >= interval) {
        await this.executeScheduledTask(task);
        this.lastRun.set(task, now);
      }
    }
  }

  private async executeScheduledTask(task: string): Promise<void> {
    switch (task) {
      case 'airdrop':
        const balance = await this.getBalance();
        if (balance < 0.5) {
          await this.requestAirdrop(1);
        }
        break;

      case 'balance_check':
        const currentBalance = await this.getBalance();
        this.logAction(
          ActionType.QUERY_BALANCE,
          `Scheduled balance: ${currentBalance.toFixed(4)} SOL`
        );
        break;

      case 'cleanup':
        // Perform cleanup tasks
        this.logger.info('Running scheduled cleanup', this.config.id);
        break;
    }
  }

  protected getActionInterval(): number {
    return 1000; // Check schedule every second
  }
}
```

## Example 5: NFT Minter Agent

Agent that creates and manages NFTs:

```typescript
import { Metaplex } from '@metaplex-foundation/js';

export class NFTMinterAgent extends BaseAgent {
  private metaplex: Metaplex | null = null;
  private nftsMinted: number = 0;
  private maxNFTs: number = 10;

  async initialize(): Promise<void> {
    await super.initialize();

    if (this.keypair) {
      this.metaplex = new Metaplex(this.walletEngine.getConnection());
      // Configure metaplex with keypair
    }
  }

  async performAction(): Promise<void> {
    if (this.nftsMinted >= this.maxNFTs) {
      this.logger.info('Max NFTs reached, stopping', this.config.id);
      await this.stop();
      return;
    }

    const balance = await this.getBalance();
    if (balance < 0.1) {
      await this.requestAirdrop(1);
      return;
    }

    await this.mintNFT();
  }

  private async mintNFT(): Promise<void> {
    try {
      this.logger.info('Minting NFT...', this.config.id);

      // NFT minting logic here
      // const nft = await this.metaplex.nfts().create({...});

      this.nftsMinted++;
      this.logAction(
        ActionType.INTERACT_PROGRAM,
        `Minted NFT #${this.nftsMinted}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to mint NFT: ${error instanceof Error ? error.message : 'Unknown'}`,
        this.config.id
      );
    }
  }

  protected getActionInterval(): number {
    return 30000; // Mint every 30 seconds
  }
}
```

## Example 6: Portfolio Manager

Agent that manages a diverse portfolio:

```typescript
export class PortfolioAgent extends BaseAgent {
  private portfolio: Map<string, number> = new Map();
  private rebalanceThreshold: number = 0.2; // 20% deviation

  async performAction(): Promise<void> {
    await this.updatePortfolio();
    await this.checkRebalancing();
  }

  private async updatePortfolio(): Promise<void> {
    const balance = await this.getBalance();
    this.portfolio.set('SOL', balance);

    // Update token balances
    // const tokenAccounts = await this.getTokenAccounts();
    // for (const account of tokenAccounts) {
    //   this.portfolio.set(account.mint, account.balance);
    // }
  }

  private async checkRebalancing(): Promise<void> {
    const totalValue = this.calculateTotalValue();
    const targetAllocation = this.getTargetAllocation();

    for (const [asset, currentAmount] of this.portfolio) {
      const currentPercentage = currentAmount / totalValue;
      const targetPercentage = targetAllocation.get(asset) || 0;
      const deviation = Math.abs(currentPercentage - targetPercentage);

      if (deviation > this.rebalanceThreshold) {
        await this.rebalanceAsset(asset, targetPercentage);
      }
    }
  }

  private calculateTotalValue(): number {
    let total = 0;
    for (const amount of this.portfolio.values()) {
      total += amount;
    }
    return total;
  }

  private getTargetAllocation(): Map<string, number> {
    // 60% SOL, 40% tokens
    return new Map([['SOL', 0.6]]);
  }

  private async rebalanceAsset(
    asset: string,
    targetPercentage: number
  ): Promise<void> {
    this.logger.info(
      `Rebalancing ${asset} to ${(targetPercentage * 100).toFixed(1)}%`,
      this.config.id
    );
    // Rebalancing logic here
  }

  protected getActionInterval(): number {
    return 20000;
  }
}
```

## Example 7: Integration with External API

Agent that responds to external data:

```typescript
export class OracleAgent extends BaseAgent {
  private apiEndpoint: string = 'https://api.example.com/price';
  private lastPrice: number = 0;
  private priceThreshold: number = 0.05; // 5% change

  async performAction(): Promise<void> {
    const currentPrice = await this.fetchPrice();

    if (!currentPrice) {
      this.logger.warn('Failed to fetch price', this.config.id);
      return;
    }

    const priceChange = Math.abs(
      (currentPrice - this.lastPrice) / this.lastPrice
    );

    if (priceChange > this.priceThreshold) {
      await this.reactToPriceChange(currentPrice, this.lastPrice);
    }

    this.lastPrice = currentPrice;
  }

  private async fetchPrice(): Promise<number | null> {
    try {
      const response = await fetch(this.apiEndpoint);
      const data = await response.json();
      return data.price;
    } catch (error) {
      return null;
    }
  }

  private async reactToPriceChange(
    newPrice: number,
    oldPrice: number
  ): Promise<void> {
    const change = ((newPrice - oldPrice) / oldPrice) * 100;

    this.logger.info(
      `Price changed by ${change.toFixed(2)}% - taking action`,
      this.config.id
    );

    // Execute trading logic based on price change
    if (change > 0) {
      // Price increased - potentially sell
    } else {
      // Price decreased - potentially buy
    }
  }

  protected getActionInterval(): number {
    return 10000; // Check price every 10 seconds
  }
}
```

## Running Custom Agents

To use your custom agents:

```typescript
// In src/index.ts or a new file

import { MyCustomAgent } from './agents/MyCustomAgent';

// Add to AgentBehaviorType enum
export enum AgentBehaviorType {
  TRADER = 'trader',
  RANDOM_ACTOR = 'random_actor',
  TOKEN_MANAGER = 'token_manager',
  IDLE = 'idle',
  CUSTOM = 'custom',
}

// Register in AgentManager
case AgentBehaviorType.CUSTOM:
  agent = new MyCustomAgent(
    config,
    this.walletEngine,
    this.transactionExecutor,
    this.keyManager,
    this.logger
  );
  break;

// Create and start
await agentManager.createAgent('custom-001', 'My Custom Agent', AgentBehaviorType.CUSTOM);
await agentManager.startAgent('custom-001');
```

## Testing Agents

Create a test file to verify agent behavior:

```typescript
// tests/agent.test.ts

import { WalletEngine } from '../src/wallet/WalletEngine';
import { MyCustomAgent } from '../src/agents/MyCustomAgent';

async function testCustomAgent() {
  const walletEngine = new WalletEngine();
  const agent = new MyCustomAgent(/* ... */);

  await agent.initialize();

  // Test initialization
  const publicKey = agent.getPublicKey();
  console.assert(publicKey !== null, 'Agent should have a public key');

  // Test balance
  const balance = await agent.getBalance();
  console.assert(balance >= 0, 'Balance should be non-negative');

  // Test action execution
  await agent.performAction();

  console.log('All tests passed!');
}

testCustomAgent().catch(console.error);
```

## Best Practices

1. **Always handle errors gracefully**
   - Use try-catch blocks
   - Log errors for debugging
   - Implement retry logic for transient failures

2. **Rate limit your operations**
   - Don't spam the network
   - Use appropriate intervals
   - Respect devnet limitations

3. **Monitor resource usage**
   - Track balance before operations
   - Implement minimum balance checks
   - Request airdrops when needed

4. **Keep agents focused**
   - Single responsibility principle
   - Clear, specific behaviors
   - Avoid over-complication

5. **Log important actions**
   - Track all transactions
   - Record decision points
   - Enable debugging

## Next Steps

- Experiment with these examples
- Combine patterns to create complex behaviors
- Share your custom agents with the community
- Contribute improvements to the base system

Happy building!
