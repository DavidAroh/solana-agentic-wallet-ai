# Solana Agentic Wallet Prototype

A comprehensive demonstration of autonomous AI agents controlling their own Solana wallets on devnet. Each agent operates independently, making decisions, signing transactions, and managing funds without human intervention.

## What Are Agentic Wallets?

Agentic wallets are autonomous wallet systems controlled by AI agents rather than humans. Each agent:

- **Owns** its own wallet with a unique keypair
- **Makes decisions** based on programmed behaviors
- **Signs transactions** automatically without manual approval
- **Manages funds** independently (SOL and SPL tokens)
- **Interacts** with Solana programs autonomously

This system demonstrates how AI agents can participate in blockchain ecosystems as independent economic actors.

## System Architecture

The system is built with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Observation Layer (CLI)                  │
│                     Dashboard & Logging                     │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Agent Logic Layer                      │
│         Trader │ RandomActor │ TokenManager │ Idle          │
│                  (Decision Making & Behaviors)              │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Execution Layer                          │
│        Transaction Pipeline with Retry Logic                │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Wallet Engine                           │
│         Low-level Solana Operations & Security              │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. Wallet Engine (`src/wallet/`)
Low-level Solana operations including:
- Wallet creation and management
- Transaction signing
- SOL transfers
- SPL token operations
- Balance queries
- Program interactions

#### 2. Security Layer (`src/security/`)
Secure key management with:
- Keypair generation
- Encrypted local storage
- Import/export functionality
- Wallet isolation per agent

#### 3. Transaction System (`src/transactions/`)
Robust transaction pipeline featuring:
- Automatic retry logic
- Configurable timeouts
- Error handling
- Batch operations
- Transaction confirmation

#### 4. Agent Framework (`src/agents/`)
Autonomous agent system with:
- Base agent class for common functionality
- Pluggable behavior system
- Action history tracking
- State management
- Multi-agent coordination

#### 5. CLI Dashboard (`src/cli/`)
Real-time observation interface showing:
- Agent status and activity
- Wallet balances
- Recent transactions
- System logs
- Performance metrics

## Agent Behaviors

### Trader Agent
Simulates a trading bot that:
- Monitors balance and requests airdrops when low
- Periodically transfers SOL to target wallets
- Maintains minimum balance threshold
- Logs all trading activity

### Random Actor Agent
Demonstrates unpredictable behavior:
- Randomly selects actions (airdrop, transfer, query)
- Executes transactions to random addresses
- Variable timing between actions
- Useful for stress testing

### Token Manager Agent
Handles SPL token operations:
- Creates new token mints
- Mints tokens to own wallet
- Manages token supply
- Demonstrates program interaction

### Idle Agent
Minimal activity agent that:
- Monitors wallet periodically
- Maintains minimum balance
- Serves as a passive holder
- Logs balance checks

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Solana CLI (optional, for advanced operations)

### Installation

```bash
npm install
```

### Running the System

```bash
npm run start:agents
```

This will:
1. Initialize all agent systems
2. Create 4 agents with different behaviors
3. Request initial airdrops from devnet
4. Start all agents autonomously
5. Display live CLI dashboard

### Stopping the System

Press `Ctrl+C` to gracefully stop all agents.

## Configuration

### Network Configuration (`src/config/index.ts`)

```typescript
export const SOLANA_CONFIG = {
  network: 'devnet',
  rpcEndpoint: clusterApiUrl('devnet'),
  commitment: 'confirmed',
};
```

### Agent Behavior Configuration

```typescript
export const AGENT_CONFIG = {
  actionInterval: 10000,        // Time between actions (ms)
  minTransferAmount: 0.001,     // Minimum SOL transfer
  maxTransferAmount: 0.1,       // Maximum SOL transfer
  airdropAmount: 1,             // SOL per airdrop request
};
```

### Transaction Configuration

```typescript
export const TRANSACTION_CONFIG = {
  maxRetries: 3,                // Retry attempts
  retryDelay: 1000,            // Delay between retries (ms)
  confirmationTimeout: 30000,   // Max wait for confirmation (ms)
};
```

## Project Structure

```
src/
├── agents/              # Agent implementations
│   ├── BaseAgent.ts     # Abstract base class
│   ├── TraderAgent.ts   # Trading behavior
│   ├── RandomActorAgent.ts
│   ├── TokenManagerAgent.ts
│   ├── IdleAgent.ts
│   └── AgentManager.ts  # Agent coordination
├── wallet/              # Wallet operations
│   └── WalletEngine.ts  # Core Solana interactions
├── security/            # Key management
│   └── KeyManager.ts    # Keypair storage/retrieval
├── transactions/        # Transaction handling
│   └── TransactionExecutor.ts
├── cli/                 # User interface
│   └── Dashboard.ts     # Status display
├── config/              # Configuration
│   └── index.ts
├── types/               # TypeScript types
│   └── index.ts
├── utils/               # Utilities
│   └── Logger.ts        # Logging system
└── index.ts             # Main entry point

data/
├── wallets/             # Stored keypairs (gitignored)
└── logs/                # Transaction logs (gitignored)
```

## Security Considerations

### Devnet Safety Model

This prototype is designed ONLY for Solana devnet:

- **No Real Value**: Devnet tokens have no monetary value
- **Isolated Environment**: Separate from mainnet
- **Testing Purpose**: Safe for experimentation
- **Rate Limits**: Devnet has airdrop limits

### Key Management

- Keys are stored locally in `data/wallets/`
- Each agent has an isolated keypair
- Keys are base58 encoded for storage
- **WARNING**: Never use these patterns with real funds

### Production Considerations

Before using in production:

1. Implement hardware wallet integration
2. Use secure key management service (HSM, KMS)
3. Add multi-signature requirements
4. Implement spending limits
5. Add human approval workflows
6. Use secure enclave for key storage
7. Implement comprehensive audit logging
8. Add rate limiting and circuit breakers

## Extending the System

### Creating Custom Agents

```typescript
import { BaseAgent } from './agents/BaseAgent';

export class CustomAgent extends BaseAgent {
  async performAction(): Promise<void> {
    // Your custom logic here
    const balance = await this.getBalance();

    if (balance < 0.1) {
      await this.requestAirdrop(1);
    } else {
      // Custom behavior
    }
  }

  protected getActionInterval(): number {
    return 15000; // 15 seconds
  }
}
```

### Adding New Behaviors

1. Extend `BaseAgent` class
2. Implement `performAction()` method
3. Define action interval
4. Register in `AgentManager`
5. Update `AgentBehaviorType` enum

### Integrating Custom Programs

```typescript
// In your custom agent
import { Transaction, SystemProgram } from '@solana/web3.js';

async customProgramInteraction() {
  const transaction = new Transaction().add(
    // Your program instruction
  );

  const signature = await this.walletEngine
    .getConnection()
    .sendTransaction(transaction, [this.keypair]);

  this.logAction(ActionType.INTERACT_PROGRAM, 'Custom action');
}
```

## Development

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
```

## Troubleshooting

### Airdrop Failures

Devnet airdrops are rate-limited. If you see failures:
- Wait a few minutes between airdrop requests
- Use testnet faucet websites as backup
- Reduce number of simultaneous agents

### Connection Errors

If you experience RPC connection issues:
- Check your internet connection
- Try alternative RPC endpoints
- Increase `confirmationTimeout` in config

### Balance Not Updating

- Devnet can be slow during high usage
- Transactions may take 30-60 seconds
- Check Solana Explorer for transaction status

## Resources

- [Solana Documentation](https://docs.solana.com/)
- [Solana Web3.js Guide](https://solana-labs.github.io/solana-web3.js/)
- [SPL Token Program](https://spl.solana.com/token)
- [Solana Devnet Explorer](https://explorer.solana.com/?cluster=devnet)

## License

MIT License - see LICENSE file for details

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## Disclaimer

This is a prototype for educational and demonstration purposes only. Do not use with real funds or on mainnet without implementing proper security measures. The authors are not responsible for any loss of funds or security breaches resulting from use of this code.
