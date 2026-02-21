# Quick Start Guide

## Prerequisites

Ensure you have Node.js 18+ installed:

```bash
node --version
```

## Installation

1. Clone the repository and navigate to the project directory

2. Install dependencies:

```bash
npm install
```

## Running the Agentic Wallet System

### Start the Agent System

```bash
npm run start:agents
```

This command will:
- Initialize the Solana connection to devnet
- Create 4 autonomous agents with different behaviors
- Request initial airdrops from the devnet faucet
- Start all agents running independently
- Display a live CLI dashboard showing agent activity

### What You'll See

The dashboard displays:

```
═══════════════════════════════════════════════════════════════════════════════
                    SOLANA AGENTIC WALLET SYSTEM - DEVNET
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│ Agent: Trader Alice                                           🟢 ACTIVE      │
├─────────────────────────────────────────────────────────────────────────────┤
│ ID:       agent-001                                                          │
│ Type:     trader                                                             │
│ Wallet:   ABC123...XYZ789                                                    │
│ Balance:  0.9850 SOL                                                         │
│ Actions:  15                                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
  Recent Actions:
    ✓ [14:32:15] Sent 0.05 SOL
    ✓ [14:32:05] Airdrop 1 SOL
    ✓ [14:31:55] Balance check
```

### Stop the System

Press `Ctrl+C` to gracefully stop all agents and exit.

## Agent Behaviors

### Trader Alice (Trader Agent)
- Monitors balance and requests airdrops when low
- Periodically transfers SOL to target wallets
- Interval: 10 seconds

### Random Bob (Random Actor Agent)
- Randomly performs various actions
- Unpredictable transaction patterns
- Interval: 10-15 seconds (randomized)

### Token Charlie (Token Manager Agent)
- Creates and manages SPL tokens
- Mints tokens to own wallet
- Interval: 20 seconds

### Idle Diana (Idle Agent)
- Passively monitors wallet
- Minimal activity
- Interval: 30 seconds

## Viewing Agent Details

The dashboard auto-refreshes every 3 seconds showing:
- Real-time agent status
- Current balances
- Recent actions (with success/failure indicators)
- System logs

## Troubleshooting

### Airdrop Rate Limits

If you see airdrop failures:
- Devnet has rate limits (typically 1 SOL per request, 2 requests per hour per IP)
- Wait a few minutes before retrying
- Agents will automatically retry failed operations

### RPC Connection Issues

If connection errors occur:
- Check your internet connection
- Devnet can be slow during high usage
- The system will automatically retry failed operations

### No Activity Visible

If agents seem inactive:
- Check that airdrops succeeded (initial funding is required)
- Look at system logs for error messages
- Verify devnet is operational: https://status.solana.com/

## Exploring the Code

### Key Files to Understand

1. **src/index.ts** - Main entry point, agent initialization
2. **src/agents/BaseAgent.ts** - Base class for all agents
3. **src/wallet/WalletEngine.ts** - Core Solana operations
4. **src/cli/Dashboard.ts** - CLI interface

### Adding Your Own Agent

See README.md for detailed instructions on creating custom agent behaviors.

## Next Steps

1. Review the agent action history in the dashboard
2. Check the logs in `data/logs/` for detailed activity
3. Examine stored wallets in `data/wallets/` (base58 encoded)
4. View transactions on Solana Explorer (signatures shown in logs)
5. Modify agent behaviors in `src/agents/`
6. Create your own custom agent (see README.md)

## Devnet Explorer

To view transactions on-chain:

```
https://explorer.solana.com/address/[WALLET_ADDRESS]?cluster=devnet
```

Replace `[WALLET_ADDRESS]` with any agent's wallet address from the dashboard.

## Safety Reminder

This system runs on Solana **devnet only**:
- Devnet tokens have no real value
- Safe for testing and experimentation
- Never use these patterns with real funds on mainnet

## Getting Help

- See README.md for comprehensive documentation
- Check SKILLS.md for complete capability reference
- Review logs in `data/logs/` for debugging

Enjoy exploring autonomous agents on Solana!
