import { Agent, Transaction, LogEntry } from "../simulation";
import { Sparkline } from "./Charts";

// ── AGENT COLOR MAP ───────────────────────────────────────────────────
const AGENT_COLORS: Record<string, string> = {
  Trader: "var(--chart-1)",
  "Random Actor": "var(--chart-3)",
  "Token Manager": "var(--chart-2)",
  Idle: "var(--chart-4)",
};

const AGENT_BG: Record<string, string> = {
  Trader: "color-mix(in oklch, var(--chart-1) 15%, transparent)",
  "Random Actor": "color-mix(in oklch, var(--chart-3) 15%, transparent)",
  "Token Manager": "color-mix(in oklch, var(--chart-2) 15%, transparent)",
  Idle: "color-mix(in oklch, var(--chart-4) 15%, transparent)",
};

// ── STAT CARD ─────────────────────────────────────────────────────────
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  subUp?: boolean;
  accentColor?: string;
}

export function StatCard({
  icon,
  label,
  value,
  sub,
  subUp,
  accentColor = "var(--primary)",
}: StatCardProps) {
  return (
    <div className="relative bg-card border border-border rounded-xl p-5 overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md group">
      {/* Top accent line */}
      <div
        className="absolute top-0 inset-x-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
        }}
      />
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-3"
        style={{
          background: `color-mix(in oklch, ${accentColor} 12%, transparent)`,
        }}
      >
        {icon}
      </div>
      {/* Value */}
      <div
        className="text-2xl font-extrabold tracking-tight leading-none mb-1"
        style={{ color: accentColor }}
      >
        {value}
      </div>
      {/* Label */}
      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </div>
      {/* Sub */}
      {sub && (
        <div
          className="mt-2 text-xs font-semibold flex items-center gap-1"
          style={{
            color: subUp === false ? "var(--destructive)" : "var(--chart-1)",
          }}
        >
          {subUp !== false ? "↑" : "↓"} {sub}
        </div>
      )}
    </div>
  );
}

// ── AGENT CARD ────────────────────────────────────────────────────────
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
  const color = AGENT_COLORS[agent.behavior] ?? "var(--primary)";
  const isRunning = agent.status === "running";

  return (
    <div
      onClick={onClick}
      className="bg-card border rounded-xl p-5 transition-all cursor-pointer hover:shadow-md group relative overflow-hidden"
      style={{
        borderColor: isSelected ? color : "var(--border)",
        boxShadow: isSelected
          ? `0 0 0 1px ${color}, 0 4px 20px color-mix(in oklch, ${color} 20%, transparent)`
          : undefined,
      }}
    >
      {/* Active indicator strip */}
      {isRunning && (
        <div
          className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r"
          style={{ background: color }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: AGENT_BG[agent.behavior] }}
          >
            {agent.emoji}
          </div>
          <div>
            <div className="font-bold text-foreground leading-tight">
              {agent.name}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {agent.behavior}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={agent.status} />
          <button
            className="text-xs font-semibold px-2.5 py-1 rounded-md transition-all border"
            style={
              isRunning
                ? {
                    color: "var(--destructive)",
                    borderColor: "var(--destructive)",
                    background:
                      "color-mix(in oklch, var(--destructive) 8%, transparent)",
                  }
                : {
                    color: "var(--primary)",
                    borderColor: "var(--primary)",
                    background:
                      "color-mix(in oklch, var(--primary) 8%, transparent)",
                  }
            }
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isRunning ? "⏹ Stop" : "▶ Start"}
          </button>
        </div>
      </div>

      {/* Address */}
      <div className="address-pill mb-3 text-xs">
        {agent.address.slice(0, 18)}…{agent.address.slice(-8)}
      </div>

      {/* Sparkline */}
      <div className="mb-3 -mx-1">
        <Sparkline data={agent.balanceHistory} colorVar={color} height={52} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "SOL", value: agent.balance.toFixed(3), color },
          { label: "TXNs", value: agent.txCount, color: "var(--foreground)" },
          {
            label: "Rate",
            value: `${agent.successRate}%`,
            color:
              agent.successRate >= 90 ? "var(--chart-1)" : "var(--chart-3)",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-muted/30 border border-border/50 rounded-lg p-2 text-center"
          >
            <div
              className="font-bold text-sm leading-none mb-1"
              style={{ color: s.color }}
            >
              {s.value}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Last action */}
      <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex-shrink-0">🕐</span>
        <span className="truncate">{agent.lastAction}</span>
      </div>
    </div>
  );
}

// ── STATUS BADGE ──────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const cfg = {
    running: {
      color: "var(--chart-1)",
      bg: "color-mix(in oklch, var(--chart-1) 12%, transparent)",
      border: "color-mix(in oklch, var(--chart-1) 30%, transparent)",
    },
    idle: {
      color: "var(--chart-2)",
      bg: "color-mix(in oklch, var(--chart-2) 12%, transparent)",
      border: "color-mix(in oklch, var(--chart-2) 30%, transparent)",
    },
    stopped: {
      color: "var(--muted-foreground)",
      bg: "color-mix(in oklch, var(--muted-foreground) 10%, transparent)",
      border: "var(--border)",
    },
  }[status] ?? {
    color: "var(--muted-foreground)",
    bg: "transparent",
    border: "var(--border)",
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      <span
        className="rounded-full status-dot"
        style={{
          background: cfg.color,
          animation:
            status === "running" ? "pulse-dot 1.5s ease infinite" : undefined,
        }}
      />
      {status}
    </span>
  );
}

// ── TX ROW ────────────────────────────────────────────────────────────
const TX_ICONS: Record<string, string> = {
  send_sol: "↗",
  receive_sol: "↙",
  airdrop: "🪂",
  mint_token: "🪙",
  transfer_token: "🔄",
  balance_check: "📊",
};

const TX_STATUS_CFG = {
  success: {
    color: "var(--chart-1)",
    bg: "color-mix(in oklch, var(--chart-1) 10%, transparent)",
    label: "✓ Confirmed",
  },
  error: {
    color: "var(--destructive)",
    bg: "color-mix(in oklch, var(--destructive) 10%, transparent)",
    label: "✗ Failed",
  },
  pending: {
    color: "var(--chart-3)",
    bg: "color-mix(in oklch, var(--chart-3) 10%, transparent)",
    label: "⋯ Pending",
  },
};

function relTime(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`;
}

export function TxRow({ tx }: { tx: Transaction }) {
  const statusCfg = TX_STATUS_CFG[tx.status] ?? TX_STATUS_CFG.pending;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:bg-muted/30 hover:border-border/40 transition-all animate-fade-in-up">
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 font-semibold"
        style={{ background: statusCfg.bg, color: statusCfg.color }}
      >
        {TX_ICONS[tx.type] ?? "📝"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">
          {tx.description}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="text-xs font-semibold"
            style={{ color: AGENT_COLORS[tx.agentName] ?? "var(--chart-2)" }}
          >
            {tx.agentName}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground font-mono">
            {relTime(tx.timestamp)}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground font-mono">
            {tx.signature.slice(0, 10)}…
          </span>
        </div>
      </div>

      {/* Status */}
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-md flex-shrink-0"
        style={{ color: statusCfg.color, background: statusCfg.bg }}
      >
        {statusCfg.label}
      </span>
    </div>
  );
}

// ── LOG LINE ──────────────────────────────────────────────────────────
export function LogLine({ entry }: { entry: LogEntry }) {
  const fmt = (d: Date) => d.toISOString().split("T")[1].slice(0, 12);
  const cls = `log-${entry.level}`;
  return (
    <div className="log-line">
      <span className="log-time">{fmt(entry.timestamp)}</span>
      <span className={`log-level ${cls}`}>
        {entry.level.slice(0, 4).toUpperCase()}
      </span>
      {entry.agentName && (
        <span className="log-agent">[{entry.agentName}]</span>
      )}
      <span className="log-msg">{entry.message}</span>
    </div>
  );
}

// ── NETWORK BADGE ─────────────────────────────────────────────────────
export function NetworkBadge() {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border"
      style={{
        color: "var(--chart-1)",
        borderColor: "color-mix(in oklch, var(--chart-1) 30%, transparent)",
        background: "color-mix(in oklch, var(--chart-1) 8%, transparent)",
      }}
    >
      <span
        className="rounded-full animate-pulse-dot"
        style={{
          width: 6,
          height: 6,
          display: "inline-block",
          background: "var(--chart-1)",
        }}
      />
      Devnet
    </div>
  );
}

// ── SECTION HEADER ────────────────────────────────────────────────────
export function SectionHeader({
  title,
  icon,
  action,
}: {
  title: string;
  icon?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      {action}
    </div>
  );
}

// ── CARD WRAPPER ──────────────────────────────────────────────────────
export function Card({
  children,
  className = "",
  title,
  titleRight,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleRight?: React.ReactNode;
}) {
  return (
    <div
      className={`bg-card border border-border rounded-xl overflow-hidden ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {title}
          </span>
          {titleRight}
        </div>
      )}
      {children}
    </div>
  );
}

// ── PRIMARY BUTTON ────────────────────────────────────────────────────
export function PrimaryBtn({
  children,
  onClick,
  small,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-semibold rounded-lg transition-all hover:-translate-y-px active:translate-y-0 border-none cursor-pointer font-[inherit]
        ${small ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2"}`}
      style={{
        background: "var(--primary)",
        color: "var(--primary-foreground)",
        boxShadow:
          "0 4px 14px color-mix(in oklch, var(--primary) 35%, transparent)",
      }}
    >
      {children}
    </button>
  );
}
