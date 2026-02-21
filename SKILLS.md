# Agent Wallet Skills

This document provides a machine-readable specification of all capabilities available to agents in the Solana Agentic Wallet System.

## Core Wallet Skills

### Wallet Management
- `create_wallet` - Generate new Solana keypair and wallet address
- `load_wallet` - Load existing wallet from secure storage
- `save_wallet` - Persist wallet keypair to encrypted storage
- `delete_wallet` - Remove wallet from storage
- `export_keypair` - Export keypair in various formats
- `import_keypair` - Import keypair from external sources

### Balance Operations
- `query_balance` - Get SOL balance for a wallet
- `get_wallet_info` - Retrieve comprehensive wallet information
- `monitor_balance` - Continuous balance monitoring

### Transaction Operations
- `sign_transaction` - Cryptographically sign a transaction
- `send_sol` - Transfer SOL between wallets
- `receive_sol` - Receive SOL transfers (passive)
- `batch_transactions` - Execute multiple transactions in sequence

### Network Operations
- `request_airdrop` - Request devnet SOL airdrop
- `get_transaction_status` - Query transaction confirmation status
- `get_recent_blockhash` - Retrieve latest blockhash for transactions

## SPL Token Skills

### Token Creation
- `create_token_mint` - Create new SPL token mint
- `set_mint_authority` - Configure mint authority
- `set_freeze_authority` - Configure freeze authority

### Token Operations
- `mint_tokens` - Mint new tokens to an address
- `transfer_tokens` - Transfer SPL tokens between wallets
- `burn_tokens` - Burn/destroy tokens
- `get_token_balance` - Query token account balance
- `get_token_accounts` - List all token accounts for a wallet

### Token Account Management
- `create_token_account` - Create associated token account
- `close_token_account` - Close empty token account

## Program Interaction Skills

### General Program Operations
- `interact_with_program` - Call arbitrary Solana program
- `read_program_data` - Query program account data
- `create_program_derived_address` - Generate PDA

### Transaction Building
- `build_transaction` - Construct transaction with instructions
- `add_instruction` - Add instruction to transaction
- `set_fee_payer` - Set transaction fee payer

## Agent Behavior Skills

### Decision Making
- `evaluate_conditions` - Assess current state and conditions
- `select_action` - Choose next action based on behavior type
- `schedule_action` - Plan future actions
- `adjust_behavior` - Modify behavior parameters dynamically

### Monitoring
- `track_action_history` - Record all actions taken
- `analyze_performance` - Evaluate agent effectiveness
- `detect_anomalies` - Identify unusual patterns

### Communication
- `log_action` - Record action to log system
- `report_status` - Report current agent status
- `emit_event` - Broadcast events to other agents

## Security Skills

### Key Management
- `generate_keypair` - Create new cryptographic keypair
- `secure_store_key` - Store key with encryption
- `rotate_keys` - Replace keypair with new one
- `backup_keys` - Create secure backup

### Validation
- `verify_signature` - Verify transaction signature
- `validate_address` - Check if address is valid
- `check_ownership` - Verify wallet ownership

## Utility Skills

### Timing
- `sleep` - Wait for specified duration
- `schedule_periodic` - Execute action on interval
- `set_timeout` - Execute action after delay

### Data Management
- `serialize_data` - Convert data to storable format
- `deserialize_data` - Parse stored data
- `encrypt_data` - Encrypt sensitive data
- `decrypt_data` - Decrypt encrypted data

### Logging
- `log_info` - Log informational message
- `log_warning` - Log warning message
- `log_error` - Log error message
- `log_success` - Log success message

## Advanced Skills

### Retry Logic
- `execute_with_retry` - Execute operation with automatic retries
- `exponential_backoff` - Implement backoff strategy
- `circuit_breaker` - Prevent cascading failures

### Batch Operations
- `batch_transfers` - Execute multiple transfers efficiently
- `parallel_queries` - Query multiple accounts simultaneously
- `aggregate_results` - Combine multiple operation results

### Analytics
- `calculate_metrics` - Compute performance metrics
- `track_gas_usage` - Monitor transaction costs
- `analyze_timing` - Measure operation latency

## Agent-Specific Skills

### Trader Agent Skills
- `identify_trading_opportunity` - Find potential trades
- `execute_trade` - Perform trading transaction
- `manage_positions` - Track and manage holdings
- `maintain_liquidity` - Ensure sufficient balance

### Random Actor Skills
- `generate_random_action` - Select random valid action
- `random_target_selection` - Choose random recipient
- `variable_timing` - Randomize action intervals

### Token Manager Skills
- `manage_token_supply` - Control token minting/burning
- `distribute_tokens` - Allocate tokens to addresses
- `monitor_token_metrics` - Track token statistics

### Idle Agent Skills
- `passive_monitoring` - Observe without acting
- `minimal_maintenance` - Perform only essential operations
- `periodic_health_check` - Verify system health

## Skill Categories

### Autonomous Capabilities
Skills that operate without human intervention:
- All transaction signing
- Balance monitoring
- Automatic retries
- Error recovery
- Action scheduling

### Security Boundaries
Skills with security constraints:
- All key operations (encrypted storage only)
- Transaction signing (keypair required)
- Fund transfers (balance checks enforced)

### Network Dependencies
Skills requiring network connectivity:
- All Solana RPC operations
- Transaction submission
- Balance queries
- Airdrop requests

## Skill Composition

Agents can combine primitive skills into complex behaviors:

```
Complex Behavior: Automated Trading
  └─ query_balance
  └─ evaluate_conditions
  └─ identify_trading_opportunity
  └─ build_transaction
  └─ sign_transaction
  └─ execute_with_retry
  └─ log_action
```

## Extensibility

New skills can be added by:
1. Implementing the skill method in BaseAgent or specific agent
2. Adding skill identifier to this document
3. Updating agent behavior logic to use new skill
4. Testing in devnet environment

## Skill Invocation

All skills are invoked through the agent's internal methods:

```typescript
// Example skill invocation
await agent.sendSOL(targetAddress, amount);  // Uses: sign_transaction + send_sol
```

## Constraints and Limitations

### Rate Limits
- Airdrop requests: Limited by devnet faucet
- RPC calls: Subject to endpoint rate limits
- Transaction throughput: Limited by Solana TPS

### Security Constraints
- Private keys never leave secure storage
- All operations limited to devnet
- No mainnet operations permitted

### Resource Constraints
- Minimum balance required for operations
- Transaction fees deducted from balance
- Storage limited by local disk space

## Machine-Readable Format

```json
{
  "skills": {
    "wallet": [
      "create_wallet",
      "sign_transaction",
      "send_sol",
      "receive_sol",
      "query_balance"
    ],
    "tokens": [
      "transfer_spl_tokens",
      "create_token_mint",
      "mint_tokens"
    ],
    "network": [
      "request_airdrop",
      "interact_with_program"
    ],
    "security": [
      "generate_keypair",
      "secure_store_key",
      "verify_signature"
    ]
  },
  "behaviors": [
    "trader",
    "random_actor",
    "token_manager",
    "idle"
  ],
  "autonomy_level": "full",
  "network": "devnet",
  "security_model": "isolated_keypairs"
}
```

## Version

Skills Specification Version: 1.0.0
Last Updated: 2024
Compatible with: Solana Agentic Wallet Prototype v0.0.0
