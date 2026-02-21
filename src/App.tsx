import { useState, useEffect, useRef, useCallback } from "react";
import {
  INITIAL_AGENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_LOGS,
  simulateTick,
  generateNewAgent,
  Agent,
  Transaction,
  LogEntry,
} from "./simulation";
import {
  StatCard,
  AgentCard,
  TxRow,
  LogLine,
} from "./components/DashboardComponents";
import { AgentTopology } from "./components/Charts";

// ── NAV ITEMS ──────────────────────────────────────────────────────────
type View =
  | "dashboard"
  | "agents"
  | "transactions"
  | "tokens"
  | "logs"
  | "settings";

const NAV_ITEMS: { id: View; icon: string; label: string }[] = [
  { id: "dashboard", icon: "◈", label: "Dashboard" },
  { id: "agents", icon: "🤖", label: "Agents" },
  { id: "transactions", icon: "↕", label: "Transactions" },
  { id: "tokens", icon: "🪙", label: "SPL Tokens" },
  { id: "logs", icon: "📋", label: "System Logs" },
  { id: "settings", icon: "⚙", label: "Settings" },
];

// ── HELPERS ────────────────────────────────────────────────────────────
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour12: false });
}

// ── SIDEBAR ────────────────────────────────────────────────────────────
function Sidebar({
  view,
  setView,
}: {
  view: View;
  setView: (v: View) => void;
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>Navigation</h2>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-title">Main</div>
        {NAV_ITEMS.slice(0, 3).map((item) => (
          <button
            key={item.id}
            className={`nav-item ${view === item.id ? "active" : ""}`}
            onClick={() => setView(item.id)}
          >
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="nav-section-title" style={{ marginTop: 8 }}>
          Finance
        </div>
        {NAV_ITEMS.slice(3, 5).map((item) => (
          <button
            key={item.id}
            className={`nav-item ${view === item.id ? "active" : ""}`}
            onClick={() => setView(item.id)}
          >
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="nav-section-title" style={{ marginTop: 8 }}>
          System
        </div>
        <button
          className={`nav-item ${view === "settings" ? "active" : ""}`}
          onClick={() => setView("settings")}
        >
          <span style={{ fontSize: 15 }}>⚙</span>
          Settings
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-text">Solana Agentic Wallet</div>
        <div
          className="sidebar-footer-text"
          style={{ opacity: 0.5, marginTop: 2 }}
        >
          v1.0.0 · Devnet
        </div>
      </div>
    </aside>
  );
}

// ── NAVBAR ─────────────────────────────────────────────────────────────
function Navbar({
  agentCount,
  runningCount,
}: {
  agentCount: number;
  runningCount: number;
}) {
  const now = useNow();
  return (
    <header className="navbar">
      <div className="navbar-logo">
        <div className="navbar-logo-icon">◎</div>
        <span>
          Solana <span style={{ color: "var(--purple-400)" }}>Agentic</span>{" "}
          Wallet
        </span>
      </div>
      <div className="navbar-right">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="chip purple">🤖 {agentCount} Agents</span>
          <span className="chip green">▶ {runningCount} Active</span>
        </div>
        <div className="network-badge">
          <div className="network-dot" />
          Solana Devnet
        </div>
        <span className="time-display">{formatTime(now)}</span>
      </div>
    </header>
  );
}

// ── DASHBOARD VIEW ─────────────────────────────────────────────────────
function DashboardView({
  agents,
  transactions,
  logs,
  selectedAgentId,
  setSelectedAgentId,
  onToggle,
}: {
  agents: Agent[];
  transactions: Transaction[];
  logs: LogEntry[];
  selectedAgentId: string | null;
  setSelectedAgentId: (id: string | null) => void;
  onToggle: (id: string) => void;
}) {
  const totalBalance = agents.reduce((s, a) => s + a.balance, 0);
  const totalTx = agents.reduce((s, a) => s + a.txCount, 0);
  const running = agents.filter((a) => a.status === "running").length;
  const successRate = Math.round(
    (transactions.filter((t) => t.status === "success").length /
      Math.max(1, transactions.length)) *
      100,
  );

  return (
    <>
      {/* ── Stats Row ── */}
      <div className="stat-grid">
        <StatCard
          icon="🤖"
          label="Total Agents"
          value={agents.length}
          change={`${running} running`}
          changeDir="up"
          color="purple"
        />
        <StatCard
          icon="◎"
          label="Total SOL Balance"
          value={totalBalance.toFixed(3)}
          change="Devnet only"
          changeDir="up"
          color="green"
        />
        <StatCard
          icon="↕"
          label="Transactions"
          value={totalTx}
          change={`${successRate}% success`}
          changeDir="up"
          color="blue"
        />
        <StatCard
          icon="⚡"
          label="System Status"
          value="Live"
          change="All systems go"
          changeDir="up"
          color="amber"
        />
      </div>

      {/* ── Middle Row: Topology + Top Agents ── */}
      <div
        style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}
      >
        {/* Network Topology */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">◈ Network Map</span>
            <span className="chip blue">Devnet</span>
          </div>
          <div style={{ padding: "16px 24px 20px" }}>
            <AgentTopology
              agents={agents}
              onSelectAgent={(id) =>
                setSelectedAgentId(selectedAgentId === id ? null : id)
              }
              selectedAgentId={selectedAgentId}
            />
            <div
              style={{
                textAlign: "center",
                marginTop: 8,
                fontSize: 11,
                color: "var(--text-muted)",
              }}
            >
              Click agent nodes to inspect • ◎ = Solana Devnet
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">↕ Live Transactions</span>
            <span className="chip green">
              <span
                className="network-dot"
                style={{
                  width: 5,
                  height: 5,
                  display: "inline-block",
                  borderRadius: "50%",
                  background: "var(--green-400)",
                  animation: "pulse-dot 1.5s ease infinite",
                  marginRight: 4,
                }}
              />
              Live
            </span>
          </div>
          <div
            className="card-body"
            style={{ padding: "12px 16px", maxHeight: 280, overflowY: "auto" }}
          >
            <div className="tx-list">
              {transactions.slice(0, 8).map((tx) => (
                <TxRow key={tx.id} tx={tx} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Agents Grid ── */}
      <div>
        <div className="section-header">
          <div className="section-title">
            <span className="section-title-icon">🤖</span>
            Active Agents
          </div>
        </div>
        <div className="agents-grid">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={selectedAgentId === agent.id}
              onClick={() =>
                setSelectedAgentId(
                  selectedAgentId === agent.id ? null : agent.id,
                )
              }
              onToggle={() => onToggle(agent.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Log Console ── */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📋 System Console</span>
          <span
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {logs.length} entries
          </span>
        </div>
        <div style={{ padding: "8px 16px 16px" }}>
          <div className="log-console">
            {logs.slice(0, 20).map((entry) => (
              <LogLine key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── AGENTS VIEW ────────────────────────────────────────────────────────
function AgentsView({
  agents,
  onToggle,
  onAddAgent,
}: {
  agents: Agent[];
  onToggle: (id: string) => void;
  onAddAgent: () => void;
}) {
  return (
    <div>
      <div className="section-header">
        <div className="section-title">
          <span className="section-title-icon">🤖</span>
          Agent Management
        </div>
        <button className="btn btn-primary" onClick={onAddAgent}>
          + Spawn Agent
        </button>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {agents.map((agent) => (
          <div key={agent.id} className="card">
            <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
              {/* Left accent bar */}
              <div
                style={{
                  width: 4,
                  borderRadius: "12px 0 0 12px",
                  background:
                    agent.status === "running"
                      ? "linear-gradient(180deg, var(--green-400), var(--blue-400))"
                      : "linear-gradient(180deg, var(--text-muted), transparent)",
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1, padding: "20px 24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 14, alignItems: "center" }}
                  >
                    <div
                      className={`agent-avatar ${agent.colorClass}`}
                      style={{ width: 52, height: 52, fontSize: 24 }}
                    >
                      {agent.emoji}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                        }}
                      >
                        {agent.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginTop: 2,
                        }}
                      >
                        {agent.behavior}
                      </div>
                      <div
                        className="agent-address"
                        style={{ marginTop: 8, marginBottom: 0, maxWidth: 380 }}
                      >
                        {agent.address}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      className={`agent-status-badge status-${agent.status}`}
                    >
                      <span className={`status-dot ${agent.status}`} />
                      {agent.status}
                    </div>
                    <button
                      className={`btn ${agent.status === "running" ? "btn-danger" : "btn-primary"}`}
                      onClick={() => onToggle(agent.id)}
                    >
                      {agent.status === "running" ? "⏹ Stop" : "▶ Start"}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: 12,
                    marginTop: 20,
                  }}
                >
                  {[
                    {
                      label: "SOL Balance",
                      value: agent.balance.toFixed(4),
                      color: "var(--purple-400)",
                    },
                    {
                      label: "Transactions",
                      value: agent.txCount,
                      color: "var(--blue-400)",
                    },
                    {
                      label: "Success Rate",
                      value: `${agent.successRate}%`,
                      color:
                        agent.successRate >= 90
                          ? "var(--green-400)"
                          : "var(--amber-400)",
                    },
                    {
                      label: "Last Action",
                      value: agent.lastAction.slice(0, 18) + "...",
                      color: "var(--text-secondary)",
                    },
                    {
                      label: "Behavior",
                      value: agent.behavior,
                      color: "var(--text-secondary)",
                    },
                  ].map((s, i) => (
                    <div key={i} className="agent-stat">
                      <div
                        className="agent-stat-value"
                        style={{ color: s.color, fontSize: 13 }}
                      >
                        {s.value}
                      </div>
                      <div className="agent-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TRANSACTIONS VIEW ──────────────────────────────────────────────────
function TransactionsView({ transactions }: { transactions: Transaction[] }) {
  const [filter, setFilter] = useState<"all" | "success" | "error" | "pending">(
    "all",
  );
  const filtered =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.status === filter);

  const counts = {
    all: transactions.length,
    success: transactions.filter((t) => t.status === "success").length,
    error: transactions.filter((t) => t.status === "error").length,
    pending: transactions.filter((t) => t.status === "pending").length,
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">
          <span className="section-title-icon">↕</span>
          Transaction History
        </div>
        <div className="tab-bar">
          {(["all", "success", "error", "pending"] as const).map((f) => (
            <button
              key={f}
              className={`tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: "8px 16px" }}>
          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: "var(--text-muted)",
              }}
            >
              No transactions found
            </div>
          ) : (
            <div className="tx-list">
              {filtered.map((tx) => (
                <TxRow key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SPL TOKENS VIEW ────────────────────────────────────────────────────
function TokensView({ agents }: { agents: Agent[] }) {
  const mockTokens = [
    {
      symbol: "AGW",
      name: "AgentWallet Token",
      mint: "4Nd1mBQtrMJVYVfKf2ooxao5Yau8P33LEI5piHome3dt",
      supply: 1_000_000,
      decimals: 9,
    },
    {
      symbol: "USDC",
      name: "USD Coin (Mock)",
      mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      supply: 500_000,
      decimals: 6,
    },
    {
      symbol: "TEST",
      name: "Test Token",
      mint: "So11111111111111111111111111111111111111112",
      supply: 10_000,
      decimals: 9,
    },
  ];

  return (
    <div>
      <div className="section-header">
        <div className="section-title">
          <span className="section-title-icon">🪙</span>
          SPL Token Registry
        </div>
        <button className="btn btn-primary">+ Create Token</button>
      </div>

      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <table className="token-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Mint Address</th>
                <th>Supply</th>
                <th>Decimals</th>
                <th>Holders</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockTokens.map((token) => (
                <tr key={token.symbol}>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: "var(--bg-glass)",
                          border: "1px solid var(--border-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                        }}
                      >
                        🪙
                      </div>
                      <div>
                        <div
                          style={{
                            color: "var(--text-primary)",
                            fontWeight: 600,
                          }}
                        >
                          {token.symbol}
                        </div>
                        <div
                          style={{ fontSize: 11, color: "var(--text-muted)" }}
                        >
                          {token.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
                    >
                      {token.mint.slice(0, 16)}…{token.mint.slice(-8)}
                    </span>
                  </td>
                  <td style={{ color: "var(--green-400)", fontWeight: 600 }}>
                    {token.supply.toLocaleString()}
                  </td>
                  <td>{token.decimals}</td>
                  <td>
                    <span className="chip green">{agents.length}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary btn-sm">Mint</button>
                      <button className="btn btn-secondary btn-sm">
                        Transfer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balances per agent */}
      <div style={{ marginTop: 24 }}>
        <div className="section-header">
          <div className="section-title">
            <span className="section-title-icon">💼</span>
            Agent Token Holdings
          </div>
        </div>
        <div className="agents-grid">
          {agents.map((agent) => (
            <div key={agent.id} className="card">
              <div className="card-body">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <div className={`agent-avatar ${agent.colorClass}`}>
                    {agent.emoji}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {agent.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {agent.address.slice(0, 12)}…
                    </div>
                  </div>
                </div>
                {mockTokens.map((token) => (
                  <div
                    key={token.symbol}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span
                      style={{ fontSize: 13, color: "var(--text-secondary)" }}
                    >
                      {token.symbol}
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                      }}
                    >
                      {(Math.random() * 10000).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── LOGS VIEW ──────────────────────────────────────────────────────────
function LogsView({ logs }: { logs: LogEntry[] }) {
  const [levelFilter, setLevelFilter] = useState<
    "all" | "info" | "success" | "warn" | "error"
  >("all");
  const filtered =
    levelFilter === "all" ? logs : logs.filter((l) => l.level === levelFilter);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = 0;
    }
  }, [logs]);

  return (
    <div>
      <div className="section-header">
        <div className="section-title">
          <span className="section-title-icon">📋</span>
          System Logs
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="tab-bar">
            {(["all", "info", "success", "warn", "error"] as const).map((l) => (
              <button
                key={l}
                className={`tab ${levelFilter === l ? "active" : ""}`}
                onClick={() => setLevelFilter(l)}
              >
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: "12px 16px" }}>
          <div
            className="log-console"
            ref={consoleRef}
            style={{ maxHeight: 520 }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  color: "var(--text-muted)",
                  textAlign: "center",
                  padding: 24,
                }}
              >
                No logs
              </div>
            ) : (
              filtered.map((entry) => <LogLine key={entry.id} entry={entry} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS VIEW ──────────────────────────────────────────────────────
function SettingsView() {
  const settings = [
    {
      label: "Network",
      value: "Solana Devnet",
      type: "select",
      options: ["Devnet", "Testnet", "Localhost"],
    },
    {
      label: "RPC Endpoint",
      value: "https://api.devnet.solana.com",
      type: "text",
    },
    { label: "Action Interval", value: "10000ms", type: "text" },
    { label: "Min Transfer Amount", value: "0.001 SOL", type: "text" },
    { label: "Max Transfer Amount", value: "0.1 SOL", type: "text" },
    { label: "Airdrop Amount", value: "1 SOL", type: "text" },
    {
      label: "Persist Keys",
      value: "true",
      type: "select",
      options: ["true", "false"],
    },
    { label: "Max Retries", value: "3", type: "text" },
  ];

  return (
    <div>
      <div className="section-header">
        <div className="section-title">
          <span className="section-title-icon">⚙</span>
          System Settings
        </div>
        <button className="btn btn-primary">Save Configuration</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔌 Network Config</span>
          </div>
          <div className="card-body">
            {settings.slice(0, 3).map((s) => (
              <div key={s.label} style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginBottom: 6,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  {s.label}
                </label>
                <input
                  defaultValue={s.value}
                  readOnly
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">🤖 Agent Config</span>
          </div>
          <div className="card-body">
            {settings.slice(3, 6).map((s) => (
              <div key={s.label} style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginBottom: 6,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  {s.label}
                </label>
                <input
                  defaultValue={s.value}
                  readOnly
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="card-header">
            <span className="card-title">🔐 Security Config</span>
          </div>
          <div className="card-body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {settings.slice(6).map((s) => (
                <div key={s.label}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginBottom: 6,
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.label}
                  </label>
                  <input
                    defaultValue={s.value}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "rgba(0,0,0,0.2)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 8,
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 20,
                padding: "14px 16px",
                background: "rgba(251, 191, 36, 0.06)",
                border: "1px solid rgba(251, 191, 36, 0.2)",
                borderRadius: 10,
                fontSize: 13,
                color: "var(--amber-400)",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: 16 }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  Security Warning
                </div>
                This system is configured for <strong>Devnet only</strong>. No
                mainnet operations are permitted. All private keys are stored
                locally in encrypted form and never transmitted. Never use real
                SOL with this system.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── APP ROOT ───────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isSimRunning, setIsSimRunning] = useState(true);

  const runningCount = agents.filter((a) => a.status === "running").length;

  // Simulation tick
  useEffect(() => {
    if (!isSimRunning) return;
    const interval = setInterval(() => {
      setAgents((prev) => {
        const result = simulateTick(prev, transactions, logs);
        setTransactions(result.transactions);
        setLogs(result.logs);
        return result.agents;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [isSimRunning, transactions, logs]);

  const handleToggleAgent = useCallback((id: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "running" ? "stopped" : "running" }
          : a,
      ),
    );
  }, []);

  const handleAddAgent = useCallback(() => {
    const newAgent = generateNewAgent();
    setAgents((prev) => [...prev, newAgent]);
  }, []);

  return (
    <>
      {/* Background decorations */}
      <div className="bg-grid" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      <div className="app-shell">
        <Navbar agentCount={agents.length} runningCount={runningCount} />

        <div className="main-layout">
          <Sidebar view={view} setView={setView} />

          <main className="main-content">
            {/* Simulation toggle bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                background: isSimRunning
                  ? "rgba(52, 211, 153, 0.05)"
                  : "rgba(100, 116, 139, 0.05)",
                border: `1px solid ${isSimRunning ? "rgba(52, 211, 153, 0.15)" : "var(--border-subtle)"}`,
                borderRadius: 10,
                fontSize: 13,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {isSimRunning && (
                  <div style={{ display: "flex", gap: 4 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--green-400)",
                        boxShadow: "0 0 6px var(--green-400)",
                        animation: "pulse-dot 1.5s ease infinite",
                      }}
                    />
                  </div>
                )}
                <span
                  style={{
                    color: isSimRunning
                      ? "var(--green-400)"
                      : "var(--text-muted)",
                    fontWeight: 500,
                  }}
                >
                  {isSimRunning
                    ? "Simulation running — agents are executing autonomous transactions in real-time"
                    : "Simulation paused"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddAgent}
                >
                  + Spawn Agent
                </button>
                <button
                  className={`btn btn-sm ${isSimRunning ? "btn-danger" : "btn-primary"}`}
                  onClick={() => setIsSimRunning((p) => !p)}
                >
                  {isSimRunning ? "⏸ Pause Simulation" : "▶ Resume Simulation"}
                </button>
              </div>
            </div>

            {/* Page views */}
            {view === "dashboard" && (
              <DashboardView
                agents={agents}
                transactions={transactions}
                logs={logs}
                selectedAgentId={selectedAgentId}
                setSelectedAgentId={setSelectedAgentId}
                onToggle={handleToggleAgent}
              />
            )}
            {view === "agents" && (
              <AgentsView
                agents={agents}
                onToggle={handleToggleAgent}
                onAddAgent={handleAddAgent}
              />
            )}
            {view === "transactions" && (
              <TransactionsView transactions={transactions} />
            )}
            {view === "tokens" && <TokensView agents={agents} />}
            {view === "logs" && <LogsView logs={logs} />}
            {view === "settings" && <SettingsView />}
          </main>
        </div>
      </div>
    </>
  );
}
