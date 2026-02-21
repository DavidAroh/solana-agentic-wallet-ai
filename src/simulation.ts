// Frontend-only simulation store — no Node.js dependencies
// Simulates the agent system state for the dashboard UI

export type AgentStatus = 'running' | 'idle' | 'stopped';
export type AgentBehavior = 'Trader' | 'Random Actor' | 'Token Manager' | 'Idle';
export type TxStatus = 'success' | 'error' | 'pending';
export type LogLevel = 'info' | 'success' | 'warn' | 'error';

export interface Agent {
  id: string;
  name: string;
  behavior: AgentBehavior;
  emoji: string;
  status: AgentStatus;
  address: string;
  balance: number;
  balanceHistory: number[];
  txCount: number;
  successRate: number;
  lastAction: string;
  lastActionTime: Date;
  colorClass: string;
}

export interface Transaction {
  id: string;
  agentId: string;
  agentName: string;
  type: string;
  description: string;
  status: TxStatus;
  amount?: number;
  signature: string;
  timestamp: Date;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  agentId?: string;
  agentName?: string;
  message: string;
}

// ── HELPERS ─────────────────────────────────────────────

function randomAddress(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let addr = '';
  for (let i = 0; i < 44; i++) addr += chars[Math.floor(Math.random() * chars.length)];
  return addr;
}

function randomSig(): string {
  const chars = '0123456789abcdef';
  let sig = '';
  for (let i = 0; i < 64; i++) sig += chars[Math.floor(Math.random() * chars.length)];
  return sig;
}

function genBalanceHistory(): number[] {
  const history: number[] = [];
  let bal = 0.5 + Math.random() * 1.5;
  for (let i = 0; i < 20; i++) {
    bal += (Math.random() - 0.45) * 0.2;
    bal = Math.max(0.01, bal);
    history.push(parseFloat(bal.toFixed(4)));
  }
  return history;
}

// ── SEED DATA ─────────────────────────────────────────────

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-001',
    name: 'Trader Alpha',
    behavior: 'Trader',
    emoji: '🤖',
    status: 'running',
    address: randomAddress(),
    balance: 2.4819,
    balanceHistory: genBalanceHistory(),
    txCount: 142,
    successRate: 94,
    lastAction: 'Sent 0.05 SOL to agent-002',
    lastActionTime: new Date(Date.now() - 12000),
    colorClass: 'trader-bg',
  },
  {
    id: 'agent-002',
    name: 'Random Rex',
    behavior: 'Random Actor',
    emoji: '🎲',
    status: 'running',
    address: randomAddress(),
    balance: 1.1034,
    balanceHistory: genBalanceHistory(),
    txCount: 87,
    successRate: 78,
    lastAction: 'Random transfer 0.02 SOL',
    lastActionTime: new Date(Date.now() - 5000),
    colorClass: 'random-bg',
  },
  {
    id: 'agent-003',
    name: 'Token Queen',
    behavior: 'Token Manager',
    emoji: '💎',
    status: 'running',
    address: randomAddress(),
    balance: 0.8821,
    balanceHistory: genBalanceHistory(),
    txCount: 63,
    successRate: 98,
    lastAction: 'Minted 1000 AGW tokens',
    lastActionTime: new Date(Date.now() - 28000),
    colorClass: 'token-bg',
  },
  {
    id: 'agent-004',
    name: 'Idle Watcher',
    behavior: 'Idle',
    emoji: '👁️',
    status: 'idle',
    address: randomAddress(),
    balance: 3.0,
    balanceHistory: genBalanceHistory(),
    txCount: 7,
    successRate: 100,
    lastAction: 'Balance check',
    lastActionTime: new Date(Date.now() - 60000),
    colorClass: 'idle-bg',
  },
];

const TX_TYPES = [
  { type: 'send_sol', icon: '↗', desc: (a: Agent) => `Sent ${(Math.random() * 0.09 + 0.01).toFixed(3)} SOL` },
  { type: 'receive_sol', icon: '↙', desc: (a: Agent) => `Received ${(Math.random() * 0.05 + 0.01).toFixed(3)} SOL` },
  { type: 'airdrop', icon: '🪂', desc: (a: Agent) => `Airdrop 1 SOL requested` },
  { type: 'mint_token', icon: '🪙', desc: (a: Agent) => `Minted ${Math.floor(Math.random() * 900 + 100)} AGW tokens` },
  { type: 'transfer_token', icon: '🔄', desc: (a: Agent) => `Transferred ${Math.floor(Math.random() * 500 + 50)} AGW` },
  { type: 'balance_check', icon: '📊', desc: (a: Agent) => `Balance query` },
];

function seedTransactions(): Transaction[] {
  const txs: Transaction[] = [];
  const agents = INITIAL_AGENTS;
  for (let i = 0; i < 20; i++) {
    const agent = agents[Math.floor(Math.random() * agents.length)];
    const template = TX_TYPES[Math.floor(Math.random() * TX_TYPES.length)];
    const status: TxStatus = Math.random() > 0.12 ? 'success' : Math.random() > 0.5 ? 'error' : 'pending';
    txs.push({
      id: `tx-${i}`,
      agentId: agent.id,
      agentName: agent.name,
      type: template.type,
      description: template.desc(agent),
      status,
      signature: randomSig(),
      timestamp: new Date(Date.now() - i * 7500 - Math.random() * 5000),
    });
  }
  return txs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export const INITIAL_TRANSACTIONS: Transaction[] = seedTransactions();

const LOG_MESSAGES = [
  (a: Agent) => [`Agent started`, 'info'],
  (a: Agent) => [`Requesting airdrop of 1 SOL`, 'info'],
  (a: Agent) => [`Airdrop confirmed successfully`, 'success'],
  (a: Agent) => [`Sending 0.05 SOL to devnet wallet`, 'info'],
  (a: Agent) => [`Transaction confirmed: ${randomSig().slice(0, 16)}...`, 'success'],
  (a: Agent) => [`Balance too low, pausing...`, 'warn'],
  (a: Agent) => [`Retrying failed transaction (1/3)`, 'warn'],
  (a: Agent) => [`RPC rate limit hit, backing off`, 'warn'],
  (a: Agent) => [`Minted 500 AGW tokens successfully`, 'success'],
  (a: Agent) => [`Transaction failed: insufficient funds`, 'error'],
];

export function seedLogs(): LogEntry[] {
  const logs: LogEntry[] = [];
  const agents = INITIAL_AGENTS;
  for (let i = 0; i < 30; i++) {
    const agent = agents[Math.floor(Math.random() * agents.length)];
    const [msg, level] = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)](agent) as [string, LogLevel];
    logs.push({
      id: `log-${i}`,
      timestamp: new Date(Date.now() - i * 4500 - Math.random() * 3000),
      level,
      agentId: agent.id,
      agentName: agent.name,
      message: msg,
    });
  }
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export const INITIAL_LOGS: LogEntry[] = seedLogs();

// ── SIMULATION TICK ─────────────────────────────────────────────

let _agentIdCounter = 5;

export function generateNewAgent(): Agent {
  const configs: { name: string; behavior: AgentBehavior; emoji: string; colorClass: string }[] = [
    { name: 'Phantom Trader', behavior: 'Trader', emoji: '👻', colorClass: 'trader-bg' },
    { name: 'Chaos Bot', behavior: 'Random Actor', emoji: '⚡', colorClass: 'random-bg' },
    { name: 'Mint Master', behavior: 'Token Manager', emoji: '🏦', colorClass: 'token-bg' },
    { name: 'Sentinel', behavior: 'Idle', emoji: '🛡️', colorClass: 'idle-bg' },
  ];
  const c = configs[Math.floor(Math.random() * configs.length)];
  return {
    id: `agent-${String(_agentIdCounter++).padStart(3, '0')}`,
    name: c.name,
    behavior: c.behavior,
    emoji: c.emoji,
    status: 'idle',
    address: randomAddress(),
    balance: parseFloat((Math.random() * 2 + 0.5).toFixed(4)),
    balanceHistory: genBalanceHistory(),
    txCount: 0,
    successRate: 100,
    lastAction: 'Initialized',
    lastActionTime: new Date(),
    colorClass: c.colorClass,
  };
}

export function simulateTick(agents: Agent[], transactions: Transaction[], logs: LogEntry[]) {
  const newAgents = agents.map(a => {
    if (a.status !== 'running') return a;

    const balDelta = (Math.random() - 0.48) * 0.08;
    const newBal = Math.max(0.001, parseFloat((a.balance + balDelta).toFixed(4)));
    const newHistory = [...a.balanceHistory.slice(-19), newBal];

    const template = TX_TYPES[Math.floor(Math.random() * TX_TYPES.length)];
    return {
      ...a,
      balance: newBal,
      balanceHistory: newHistory,
      txCount: a.txCount + (Math.random() > 0.5 ? 1 : 0),
      lastAction: template.desc(a),
      lastActionTime: new Date(),
    };
  });

  // Generate new transaction for a random running agent
  const running = newAgents.filter(a => a.status === 'running');
  let newTx: Transaction | null = null;
  let newLog: LogEntry | null = null;

  if (running.length > 0 && Math.random() > 0.3) {
    const agent = running[Math.floor(Math.random() * running.length)];
    const template = TX_TYPES[Math.floor(Math.random() * TX_TYPES.length)];
    const status: TxStatus = Math.random() > 0.13 ? 'success' : Math.random() > 0.5 ? 'error' : 'pending';
    newTx = {
      id: `tx-${Date.now()}`,
      agentId: agent.id,
      agentName: agent.name,
      type: template.type,
      description: template.desc(agent),
      status,
      signature: randomSig(),
      timestamp: new Date(),
    };

    const [msg, level] = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)](agent) as [string, LogLevel];
    newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      level,
      agentId: agent.id,
      agentName: agent.name,
      message: msg,
    };
  }

  const newTransactions = newTx
    ? [newTx, ...transactions].slice(0, 50)
    : transactions;

  const newLogs = newLog
    ? [newLog, ...logs].slice(0, 100)
    : logs;

  return { agents: newAgents, transactions: newTransactions, logs: newLogs };
}
