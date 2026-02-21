import { Agent, Transaction, LogEntry } from "../simulation";
import { Sparkline } from "./Charts";

// ────────────────────────────────────────────────────────────
// STAT CARD
// ────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  change?: string;
  changeDir?: "up" | "down";
  color: "purple" | "green" | "amber" | "blue";
}

export function StatCard({
  icon,
  label,
  value,
  change,
  changeDir,
  color,
}: StatCardProps) {
  return (
    <div className={`stat-card ${color}`}>
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className={`stat-value ${color}`}>{value}</div>
      <div className="stat-label">{label}</div>
      {change && (
        <div className={`stat-change ${changeDir}`}>
          {changeDir === "up" ? "↑" : "↓"} {change}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// AGENT CARD
// ────────────────────────────────────────────────────────────
interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onClick: () => void;
  onToggle: () => void;
}

export function AgentCard({
  agent,
  isSelected,
  onClick,
  onToggle,
}: AgentCardProps) {
  const sparkColor =
    agent.behavior === "Trader"
      ? "#8b5cf6"
      : agent.behavior === "Random Actor"
        ? "#fbbf24"
        : agent.behavior === "Token Manager"
          ? "#34d399"
          : "#60a5fa";

  return (
    <div
      className={`agent-card ${isSelected ? "active-card" : ""}`}
      onClick={onClick}
    >
      <div className="agent-card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className={`agent-avatar ${agent.colorClass}`}>
            {agent.emoji}
          </div>
          <div>
            <div className="agent-name">{agent.name}</div>
            <div className="agent-type">{agent.behavior}</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
          }}
        >
          <div className={`agent-status-badge status-${agent.status}`}>
            <span className={`status-dot ${agent.status}`} />
            {agent.status}
          </div>
          <button
            className={`btn btn-sm ${agent.status === "running" ? "btn-danger" : "btn-primary"}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            style={{ fontSize: 11, padding: "3px 8px" }}
          >
            {agent.status === "running" ? "⏹ Stop" : "▶ Start"}
          </button>
        </div>
      </div>

      <div className="agent-address tooltip-anchor">
        {agent.address.slice(0, 20)}...{agent.address.slice(-8)}
        <span className="tooltip">{agent.address}</span>
      </div>

      <div style={{ marginBottom: 14 }}>
        <Sparkline data={agent.balanceHistory} color={sparkColor} height={52} />
      </div>

      <div className="agent-stats">
        <div className="agent-stat">
          <div className="agent-stat-value" style={{ color: sparkColor }}>
            {agent.balance.toFixed(4)}
          </div>
          <div className="agent-stat-label">SOL</div>
        </div>
        <div className="agent-stat">
          <div className="agent-stat-value">{agent.txCount}</div>
          <div className="agent-stat-label">Txns</div>
        </div>
        <div className="agent-stat">
          <div
            className="agent-stat-value"
            style={{
              color:
                agent.successRate >= 90
                  ? "var(--green-400)"
                  : "var(--amber-400)",
            }}
          >
            {agent.successRate}%
          </div>
          <div className="agent-stat-label">Success</div>
        </div>
      </div>

      <div className="agent-actions-count">
        <span>🕐</span>
        <span
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {agent.lastAction}
        </span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// TRANSACTION ROW
// ────────────────────────────────────────────────────────────
interface TxRowProps {
  tx: Transaction;
}

const TX_ICONS: Record<string, string> = {
  send_sol: "↗",
  receive_sol: "↙",
  airdrop: "🪂",
  mint_token: "🪙",
  transfer_token: "🔄",
  balance_check: "📊",
};

function formatRelTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffS = Math.floor(diffMs / 1000);
  if (diffS < 60) return `${diffS}s ago`;
  const diffM = Math.floor(diffS / 60);
  if (diffM < 60) return `${diffM}m ago`;
  return `${Math.floor(diffM / 60)}h ago`;
}

export function TxRow({ tx }: TxRowProps) {
  return (
    <div className="tx-item">
      <div className={`tx-icon ${tx.status}`}>{TX_ICONS[tx.type] || "📝"}</div>
      <div className="tx-info">
        <div className="tx-description">{tx.description}</div>
        <div className="tx-meta">
          <span className="tx-agent">{tx.agentName}</span>
          <span style={{ color: "var(--text-muted)" }}>·</span>
          <span className="tx-time">{formatRelTime(tx.timestamp)}</span>
          <span style={{ color: "var(--text-muted)" }}>·</span>
          <span className="tx-sig">{tx.signature.slice(0, 12)}…</span>
        </div>
      </div>
      <div className={`tx-status ${tx.status}`}>
        {tx.status === "success" ? "✓" : tx.status === "error" ? "✗" : "…"}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// LOG LINE
// ────────────────────────────────────────────────────────────
interface LogLineProps {
  entry: LogEntry;
}

export function LogLine({ entry }: LogLineProps) {
  const fmt = (d: Date) => d.toISOString().split("T")[1].slice(0, 12);

  return (
    <div className="log-line">
      <span className="log-time">{fmt(entry.timestamp)}</span>
      <span className={`log-level ${entry.level}`}>
        {entry.level.toUpperCase().slice(0, 4)}
      </span>
      {entry.agentName && (
        <span className="log-agent">[{entry.agentName}]</span>
      )}
      <span className="log-msg">{entry.message}</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// MINI NETWORK BADGE
// ────────────────────────────────────────────────────────────
export function NetworkBadge() {
  return (
    <div className="network-badge">
      <div className="network-dot" />
      Devnet
    </div>
  );
}
