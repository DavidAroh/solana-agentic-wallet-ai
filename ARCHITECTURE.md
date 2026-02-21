# System Architecture

## Overview

The Solana Agentic Wallet System is built on a layered architecture that separates concerns and enables autonomous agent operation.

## Architectural Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Interface Layer                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   CLI Dashboard                          │  │
│  │  - Real-time status display                              │  │
│  │  - Agent monitoring                                      │  │
│  │  - Log visualization                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Observes
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      Agent Logic Layer                          │
│                                                                 │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐            │
│  │   Trader   │  │Random Actor  │  │   Token     │            │
│  │   Agent    │  │    Agent     │  │  Manager    │ ...        │
│  └────────────┘  └──────────────┘  └─────────────┘            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Agent Manager                               │  │
│  │  - Agent lifecycle management                            │  │
│  │  - Coordination and orchestration                        │  │
│  │  - Status aggregation                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Base Agent                                  │  │
│  │  - Common functionality                                  │  │
│  │  - Action history                                        │  │
│  │  - State management                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Uses
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Execution Layer                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Transaction Executor                             │  │
│  │  - Retry logic                                           │  │
│  │  - Error handling                                        │  │
│  │  - Batch operations                                      │  │
│  │  - Confirmation management                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Executes
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      Core Services Layer                        │
│                                                                 │
│  ┌─────────────────────┐        ┌──────────────────────────┐   │
│  │  Wallet Engine      │        │   Key Manager            │   │
│  │  - Create wallets   │        │   - Generate keypairs    │   │
│  │  - Sign txns        │        │   - Secure storage       │   │
│  │  - Send/receive SOL │        │   - Import/export        │   │
│  │  - Token operations │        │   - Encryption           │   │
│  │  - Program calls    │        │   - Wallet isolation     │   │
│  └─────────────────────┘        └──────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Logger                                      │  │
│  │  - Structured logging                                    │  │
│  │  - File persistence                                      │  │
│  │  - Console output                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Connects to
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   Solana Network Layer                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Solana Devnet (via RPC)                         │  │
│  │  - Transaction submission                                │  │
│  │  - Balance queries                                       │  │
│  │  - Program interaction                                   │  │
│  │  - Airdrop requests                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Wallet Engine

**Responsibility**: Low-level Solana operations

**Key Methods**:
- `createWallet()` - Generate new keypair
- `sendSOL()` - Transfer SOL between wallets
- `requestAirdrop()` - Request devnet funds
- `createToken()` - Create SPL token mint
- `transferTokens()` - Transfer SPL tokens

**Dependencies**:
- @solana/web3.js
- @solana/spl-token
- Solana RPC endpoint

### 2. Key Manager

**Responsibility**: Secure keypair management

**Key Methods**:
- `generateKeypair()` - Create new keypair
- `saveKeypair()` - Persist to disk
- `loadKeypair()` - Load from disk
- `deleteKeypair()` - Remove keypair

**Storage**:
- File-based (data/wallets/)
- Base58 encoding
- Per-agent isolation

### 3. Transaction Executor

**Responsibility**: Reliable transaction execution

**Features**:
- Automatic retry with exponential backoff
- Configurable timeouts
- Error handling and recovery
- Transaction confirmation
- Batch operations

**Configuration**:
```typescript
{
  maxRetries: 3,
  retryDelay: 1000,
  confirmationTimeout: 30000
}
```

### 4. Base Agent

**Responsibility**: Common agent functionality

**Features**:
- Lifecycle management (start/stop)
- Action execution loop
- Balance monitoring
- Transaction signing
- Action history tracking

**Abstract Methods**:
- `performAction()` - Agent-specific behavior
- `getActionInterval()` - Timing configuration

### 5. Agent Manager

**Responsibility**: Multi-agent coordination

**Features**:
- Agent creation and registration
- Lifecycle management
- Status aggregation
- Concurrent operation
- Agent discovery

### 6. Dashboard

**Responsibility**: Real-time observation

**Features**:
- Live status updates
- Agent monitoring
- Transaction history
- System logs
- Auto-refresh

## Data Flow

### Transaction Flow

```
┌──────────┐
│  Agent   │ Decides to send SOL
└────┬─────┘
     │
     ▼
┌──────────────────┐
│ Base Agent       │ Calls sendSOL()
└────┬─────────────┘
     │
     ▼
┌──────────────────────┐
│ Transaction Executor │ Wraps with retry logic
└────┬─────────────────┘
     │
     ▼
┌──────────────┐
│ Wallet Engine│ Creates and signs transaction
└────┬─────────┘
     │
     ▼
┌─────────────────┐
│ Solana Network  │ Submits transaction
└────┬────────────┘
     │
     ▼
┌──────────────────────┐
│ Transaction Executor │ Confirms transaction
└────┬─────────────────┘
     │
     ▼
┌──────────┐
│  Agent   │ Logs result
└──────────┘
```

### Agent Lifecycle

```
┌─────────┐
│ Created │
└────┬────┘
     │
     ▼
┌─────────────┐
│ Initialized │ Keypair loaded/created
└────┬────────┘
     │
     ▼
┌─────────┐
│ Started │ ───┐
└────┬────┘    │
     │         │
     ▼         │
┌──────────┐   │
│ Running  │◄──┘ Continuous action loop
└────┬─────┘
     │
     ▼
┌──────────┐
│ Stopped  │
└──────────┘
```

## Security Architecture

### Key Isolation

Each agent maintains completely isolated keys:

```
data/wallets/
├── wallet-agent-001.json  (Trader Alice)
├── wallet-agent-002.json  (Random Bob)
├── wallet-agent-003.json  (Token Charlie)
└── wallet-agent-004.json  (Idle Diana)
```

### Transaction Signing

All transactions are signed automatically within the agent's context:

```
Agent → Base Agent → Wallet Engine → Keypair → Signature
```

No external signing approval required (autonomous operation).

### Network Safety

- Hardcoded to devnet only
- No mainnet endpoint configuration
- Rate limiting on operations
- Balance checks before transactions

## Extensibility Points

### 1. Custom Agent Behaviors

Extend `BaseAgent` and implement:
- `performAction()` - Your logic
- `getActionInterval()` - Your timing

### 2. Custom Transaction Types

Add methods to `WalletEngine`:
- Program-specific interactions
- Custom instruction building
- Advanced transaction construction

### 3. Custom Storage

Replace `KeyManager` implementation:
- Database storage
- Cloud key management
- Hardware wallet integration

### 4. Custom UI

Replace `Dashboard`:
- Web interface
- Mobile app
- API server
- Metrics dashboard

## Configuration System

Centralized configuration in `src/config/`:

```typescript
SOLANA_CONFIG      // Network settings
TRANSACTION_CONFIG // Retry/timeout settings
SECURITY_CONFIG    // Key storage settings
AGENT_CONFIG       // Behavior settings
LOGGING_CONFIG     // Log settings
```

## Logging System

Structured logging with multiple levels:

```
Logger
├── File Output (data/logs/)
├── Console Output (CLI)
└── In-Memory Buffer (Dashboard)
```

Log Levels:
- `info` - General information
- `success` - Successful operations
- `warn` - Warning conditions
- `error` - Error conditions

## Performance Considerations

### Concurrency

- Agents run in parallel
- Independent event loops
- No blocking operations
- Async/await throughout

### Resource Usage

- Minimal memory footprint
- Efficient RPC calls
- File-based persistence
- No database required

### Scalability

- Supports multiple agents (tested up to 10+)
- Linear resource scaling
- Configurable intervals
- Rate limit aware

## Error Handling Strategy

### Transaction Errors

1. Automatic retry with backoff
2. Log error details
3. Continue operation
4. Alert via logs

### Network Errors

1. Detect connection issues
2. Retry failed operations
3. Graceful degradation
4. Continue with other agents

### Agent Errors

1. Catch at agent level
2. Log error context
3. Continue agent loop
4. Don't crash other agents

## Testing Strategy

### Unit Testing

- Individual components
- Mock dependencies
- Isolated behaviors

### Integration Testing

- End-to-end flows
- Real devnet connection
- Multi-agent scenarios

### Manual Testing

- CLI observation
- Log inspection
- Explorer verification

## Future Enhancements

Potential improvements:

1. **Web Dashboard** - Browser-based UI
2. **API Server** - REST/GraphQL API
3. **Database Integration** - PostgreSQL storage
4. **Advanced Strategies** - ML-based decisions
5. **Multi-Network** - Testnet/mainnet support
6. **Performance Metrics** - Analytics dashboard
7. **Alert System** - Notifications
8. **Agent Marketplace** - Share behaviors

## Design Principles

1. **Separation of Concerns** - Clear layer boundaries
2. **Single Responsibility** - Focused components
3. **Dependency Injection** - Testable architecture
4. **Fail-Safe Operations** - Graceful error handling
5. **Observable System** - Comprehensive logging
6. **Extensible Design** - Easy to customize
7. **Security First** - Safe by default

## Technology Stack

- **Language**: TypeScript
- **Runtime**: Node.js 18+
- **Blockchain**: Solana (devnet)
- **Libraries**:
  - @solana/web3.js - Solana interaction
  - @solana/spl-token - Token operations
  - bs58 - Key encoding
- **Tools**:
  - tsx - TypeScript execution
  - vite - Build tool
  - eslint - Linting

## Deployment

Currently supports:
- Local development
- Single machine deployment

Future support planned for:
- Docker containers
- Cloud deployment
- Kubernetes orchestration
- Distributed agents

---

This architecture enables autonomous agents to safely interact with Solana devnet while maintaining security, reliability, and observability.
