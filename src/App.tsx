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
  NetworkBadge,
  SectionHeader,
  Card,
  PrimaryBtn,
  StatusBadge,
} from "./components/DashboardComponents";
import { AgentTopology } from "./components/Charts";

// ── TYPES ──────────────────────────────────────────────────────────────
type View =
  | "dashboard"
  | "agents"
  | "transactions"
  | "tokens"
  | "logs"
  | "settings";

const NAV: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "agents", label: "Agents", icon: "🤖" },
  { id: "transactions", label: "Transactions", icon: "↕" },
  { id: "tokens", label: "SPL Tokens", icon: "🪙" },
  { id: "logs", label: "System Logs", icon: "📋" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

// ── CLOCK HOOK ─────────────────────────────────────────────────────────
function useClock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t.toLocaleTimeString("en-GB");
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
    <aside className="w-[240px] min-w-[240px] flex flex-col border-r border-border bg-sidebar sticky top-0 h-screen overflow-hidden">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold text-primary-foreground"
            style={{
              background:
                "linear-gradient(135deg, var(--chart-1), var(--chart-2))",
            }}
          >
            ◎
          </div>
          <div>
            <div className="text-sm font-extrabold text-sidebar-foreground leading-tight tracking-tight">
              Agentic Wallet
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              Solana Devnet
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        {[
          { section: "Main", items: NAV.slice(0, 3) },
          { section: "Finance", items: NAV.slice(3, 5) },
          { section: "System", items: NAV.slice(5) },
        ].map(({ section, items }) => (
          <div key={section} className="mb-1">
            <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-3 pt-3 pb-1.5">
              {section}
            </div>
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all border border-transparent cursor-pointer font-[inherit] text-left"
                style={{
                  color:
                    view === item.id
                      ? "var(--sidebar-primary)"
                      : "var(--muted-foreground)",
                  background:
                    view === item.id
                      ? "color-mix(in oklch, var(--sidebar-primary) 10%, transparent)"
                      : "transparent",
                  borderColor:
                    view === item.id
                      ? "color-mix(in oklch, var(--sidebar-primary) 25%, transparent)"
                      : "transparent",
                }}
              >
                <span className="text-base leading-none w-5 text-center flex-shrink-0">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <div className="text-[10px] font-mono text-muted-foreground">
          v1.0.0 · Solana Agentic Wallet
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
  const clock = useClock();
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="text-base font-extrabold tracking-tight text-foreground">
        Solana <span style={{ color: "var(--primary)" }}>Agentic</span> Wallet
      </div>
      <div className="flex items-center gap-3">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full border"
          style={{
            color: "var(--chart-2)",
            borderColor: "color-mix(in oklch, var(--chart-2) 30%, transparent)",
            background: "color-mix(in oklch, var(--chart-2) 8%, transparent)",
          }}
        >
          🤖 {agentCount} Agents
        </span>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full border"
          style={{
            color: "var(--chart-1)",
            borderColor: "color-mix(in oklch, var(--chart-1) 30%, transparent)",
            background: "color-mix(in oklch, var(--chart-1) 8%, transparent)",
          }}
        >
          ▶ {runningCount} Active
        </span>
        <NetworkBadge />
        <code className="text-xs text-muted-foreground font-mono tabular-nums">
          {clock}
        </code>
      </div>
    </header>
  );
}

// ── SIM BANNER ─────────────────────────────────────────────────────────
function SimBanner({
  running,
  onToggle,
  onSpawn,
}: {
  running: boolean;
  onToggle: () => void;
  onSpawn: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all"
      style={{
        borderColor: running
          ? "color-mix(in oklch, var(--chart-1) 25%, transparent)"
          : "var(--border)",
        background: running
          ? "color-mix(in oklch, var(--chart-1) 5%, var(--card))"
          : "var(--card)",
      }}
    >
      <div
        className="flex items-center gap-2.5 font-medium"
        style={{
          color: running ? "var(--chart-1)" : "var(--muted-foreground)",
        }}
      >
        {running && (
          <span
            className="rounded-full animate-pulse-dot"
            style={{
              width: 7,
              height: 7,
              display: "inline-block",
              background: "var(--chart-1)",
              flexShrink: 0,
            }}
          />
        )}
        {running
          ? "Simulation running — agents executing autonomous transactions in real-time"
          : "Simulation paused"}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onSpawn}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-muted/40 text-foreground hover:bg-muted/70 transition-all cursor-pointer font-[inherit]"
        >
          + Spawn Agent
        </button>
        <button
          onClick={onToggle}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer font-[inherit] border"
          style={
            running
              ? {
                  color: "var(--destructive)",
                  borderColor:
                    "color-mix(in oklch, var(--destructive) 30%, transparent)",
                  background:
                    "color-mix(in oklch, var(--destructive) 8%, transparent)",
                }
              : {
                  color: "var(--primary)",
                  borderColor:
                    "color-mix(in oklch, var(--primary) 30%, transparent)",
                  background:
                    "color-mix(in oklch, var(--primary) 8%, transparent)",
                }
          }
        >
          {running ? "⏸ Pause" : "▶ Resume"}
        </button>
      </div>
    </div>
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
  const totalBal = agents.reduce((s, a) => s + a.balance, 0);
  const totalTx = agents.reduce((s, a) => s + a.txCount, 0);
  const running = agents.filter((a) => a.status === "running").length;
  const successRate = Math.round(
    (transactions.filter((t) => t.status === "success").length /
      Math.max(1, transactions.length)) *
      100,
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon="🤖"
          label="Total Agents"
          value={agents.length}
          sub={`${running} running`}
          accentColor="var(--chart-2)"
        />
        <StatCard
          icon="◎"
          label="Total SOL"
          value={totalBal.toFixed(3)}
          sub="Devnet only"
          accentColor="var(--chart-1)"
        />
        <StatCard
          icon="↕"
          label="Transactions"
          value={totalTx}
          sub={`${successRate}% success`}
          accentColor="var(--secondary)"
        />
        <StatCard
          icon="⚡"
          label="System Status"
          value="Live"
          sub="All systems go"
          accentColor="var(--chart-3)"
        />
      </div>

      {/* Middle row */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "280px 1fr" }}>
        {/* Topology */}
        <Card title="Network Map" titleRight={<NetworkBadge />}>
          <div className="p-4">
            <AgentTopology
              agents={agents}
              onSelectAgent={(id) =>
                setSelectedAgentId(selectedAgentId === id ? null : id)
              }
              selectedAgentId={selectedAgentId}
            />
            <p className="text-center text-[10px] text-muted-foreground mt-1">
              Click agent nodes to inspect
            </p>
          </div>
        </Card>

        {/* Live transactions */}
        <Card
          title="Live Transactions"
          titleRight={
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold"
              style={{ color: "var(--chart-1)" }}
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
              Live
            </span>
          }
        >
          <div className="px-3 py-2 max-h-[252px] overflow-y-auto">
            {transactions.slice(0, 8).map((tx) => (
              <TxRow key={tx.id} tx={tx} />
            ))}
          </div>
        </Card>
      </div>

      {/* Agents grid */}
      <SectionHeader title="Active Agents" icon="🤖" />
      <div className="grid grid-cols-2 gap-4 -mt-4">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isSelected={selectedAgentId === agent.id}
            onClick={() =>
              setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id)
            }
            onToggle={() => onToggle(agent.id)}
          />
        ))}
      </div>

      {/* Console */}
      <Card
        title="System Console"
        titleRight={
          <span className="text-xs text-muted-foreground font-mono">
            {logs.length} entries
          </span>
        }
      >
        <div className="p-4 bg-muted/20 m-3 mt-0 rounded-lg border border-border/50 max-h-64 overflow-y-auto log-console">
          {logs.slice(0, 25).map((e) => (
            <LogLine key={e.id} entry={e} />
          ))}
        </div>
      </Card>
    </div>
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
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="Agent Management"
        icon="🤖"
        action={<PrimaryBtn onClick={onAddAgent}>+ Spawn Agent</PrimaryBtn>}
      />
      {agents.map((agent) => {
        const isRunning = agent.status === "running";
        const color =
          {
            Trader: "var(--chart-1)",
            "Random Actor": "var(--chart-3)",
            "Token Manager": "var(--chart-2)",
            Idle: "var(--chart-4)",
          }[agent.behavior] ?? "var(--primary)";
        return (
          <div
            key={agent.id}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="flex">
              {/* Accent bar */}
              <div
                className="w-1 flex-shrink-0"
                style={{ background: isRunning ? color : "var(--border)" }}
              />
              <div className="flex-1 p-5">
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{
                        background: `color-mix(in oklch, ${color} 12%, var(--muted))`,
                      }}
                    >
                      {agent.emoji}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-foreground">
                        {agent.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {agent.behavior}
                      </div>
                      <code
                        className="address-pill mt-1.5 block"
                        style={{ maxWidth: 380 }}
                      >
                        {agent.address}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={agent.status} />
                    <button
                      onClick={() => onToggle(agent.id)}
                      className="text-sm font-semibold px-3.5 py-2 rounded-lg border transition-all cursor-pointer font-[inherit]"
                      style={
                        isRunning
                          ? {
                              color: "var(--destructive)",
                              borderColor:
                                "color-mix(in oklch, var(--destructive) 30%, transparent)",
                              background:
                                "color-mix(in oklch, var(--destructive) 8%, transparent)",
                            }
                          : {
                              color: "var(--primary)",
                              borderColor:
                                "color-mix(in oklch, var(--primary) 30%, transparent)",
                              background:
                                "color-mix(in oklch, var(--primary) 8%, transparent)",
                            }
                      }
                    >
                      {isRunning ? "⏹ Stop" : "▶ Start"}
                    </button>
                  </div>
                </div>
                {/* Stats */}
                <div className="grid grid-cols-5 gap-3">
                  {[
                    {
                      label: "SOL Balance",
                      value: agent.balance.toFixed(4),
                      color,
                    },
                    {
                      label: "Transactions",
                      value: agent.txCount,
                      color: "var(--foreground)",
                    },
                    {
                      label: "Success Rate",
                      value: `${agent.successRate}%`,
                      color:
                        agent.successRate >= 90
                          ? "var(--chart-1)"
                          : "var(--chart-3)",
                    },
                    {
                      label: "Last Action",
                      value: agent.lastAction.slice(0, 16) + "…",
                      color: "var(--muted-foreground)",
                    },
                    {
                      label: "Behavior",
                      value: agent.behavior,
                      color: "var(--muted-foreground)",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-muted/30 border border-border/50 rounded-lg p-2.5"
                    >
                      <div
                        className="font-bold text-sm leading-tight mb-1"
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
              </div>
            </div>
          </div>
        );
      })}
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
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="Transaction History"
        icon="↕"
        action={
          <div className="tab-bar">
            {(["all", "success", "error", "pending"] as const).map((f) => (
              <button
                key={f}
                className={`tab-item ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
              </button>
            ))}
          </div>
        }
      />
      <Card>
        <div className="px-2 py-2">
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground text-sm">
              No transactions found
            </p>
          ) : (
            filtered.map((tx) => <TxRow key={tx.id} tx={tx} />)
          )}
        </div>
      </Card>
    </div>
  );
}

// ── SPL TOKEN TYPE ─────────────────────────────────────────────────────
export interface SplToken {
  id: string;
  symbol: string;
  name: string;
  mint: string;
  supply: number;
  decimals: number;
  color: string;
  description?: string;
  createdAt: Date;
  // per-agent holdings (agentId → amount)
  holdings: Record<string, number>;
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "oklch(0.70 0.18 300)",
];

function fakeMint(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from(
    { length: 44 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

const INITIAL_TOKENS: SplToken[] = [
  {
    id: "agw",
    symbol: "AGW",
    name: "AgentWallet Token",
    mint: "4Nd1mBQtrMJVYVfKf2ooxao5Yau8P33LEI5piHome3dt",
    supply: 1_000_000,
    decimals: 9,
    color: "var(--chart-1)",
    description: "Native governance token for the agentic wallet system.",
    createdAt: new Date(Date.now() - 86_400_000),
    holdings: {},
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin (Mock)",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    supply: 500_000,
    decimals: 6,
    color: "var(--chart-2)",
    createdAt: new Date(Date.now() - 172_800_000),
    holdings: {},
  },
  {
    id: "test",
    symbol: "TEST",
    name: "Test Token",
    mint: "So11111111111111111111111111111111111111112",
    supply: 10_000,
    decimals: 9,
    color: "var(--chart-3)",
    createdAt: new Date(Date.now() - 3_600_000),
    holdings: {},
  },
];

// ── MODAL BACKDROP ────────────────────────────────────────────────────
function ModalBackdrop({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  // close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl animate-slide-in"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
      >
        {children}
      </div>
    </div>
  );
}

// shared input style
const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-input bg-muted/30 text-foreground text-sm outline-none transition-colors focus:border-ring font-[inherit] placeholder:text-muted-foreground/50";
const labelCls =
  "block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5";

// ── CREATE TOKEN MODAL ────────────────────────────────────────────────
interface CreateTokenModalProps {
  onClose: () => void;
  onCreate: (token: SplToken) => void;
  tokenCount: number;
}

function CreateTokenModal({
  onClose,
  onCreate,
  tokenCount,
}: CreateTokenModalProps) {
  const [form, setForm] = useState({
    symbol: "",
    name: "",
    supply: "1000000",
    decimals: "9",
    description: "",
  });
  const [status, setStatus] = useState<"idle" | "minting" | "done">("idle");
  const [txSig, setTxSig] = useState("");
  const [err, setErr] = useState("");

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErr("");
  }

  async function handleCreate() {
    if (!form.symbol.trim()) {
      setErr("Token symbol is required.");
      return;
    }
    if (!form.name.trim()) {
      setErr("Token name is required.");
      return;
    }
    const supply = Number(form.supply);
    const decimals = Number(form.decimals);
    if (isNaN(supply) || supply <= 0) {
      setErr("Supply must be a positive number.");
      return;
    }
    if (isNaN(decimals) || decimals < 0 || decimals > 9) {
      setErr("Decimals must be 0–9.");
      return;
    }

    setStatus("minting");
    // Simulate devnet latency
    await new Promise((r) => setTimeout(r, 1600));

    const mint = fakeMint();
    const sig = fakeMint();
    setTxSig(sig);
    setStatus("done");

    onCreate({
      id: `tok-${Date.now()}`,
      symbol: form.symbol.toUpperCase().trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      mint,
      supply,
      decimals,
      color: CHART_COLORS[tokenCount % CHART_COLORS.length],
      createdAt: new Date(),
      holdings: {},
    });
  }

  return (
    <ModalBackdrop onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-base font-extrabold text-foreground">
            🪙 Create SPL Token
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mint a new token on Solana Devnet
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground text-xl leading-none cursor-pointer bg-transparent border-none font-[inherit]"
        >
          ✕
        </button>
      </div>

      {status === "done" ? (
        // ── Success state
        <div className="px-6 py-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            Token Created!
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            <strong style={{ color: "var(--chart-1)" }}>
              {form.symbol.toUpperCase()}
            </strong>{" "}
            has been minted on Solana Devnet.
          </p>
          <div className="bg-muted/40 border border-border rounded-lg p-3 mb-6 text-left">
            <div className={labelCls}>Transaction Signature</div>
            <code
              className="text-xs font-mono break-all"
              style={{ color: "var(--chart-1)" }}
            >
              {txSig}
            </code>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg text-sm font-bold text-primary-foreground cursor-pointer border-none font-[inherit]"
            style={{ background: "var(--primary)" }}
          >
            Done
          </button>
        </div>
      ) : (
        // ── Form
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Symbol *</label>
              <input
                className={inputCls}
                placeholder="e.g. SOL"
                maxLength={10}
                value={form.symbol}
                onChange={(e) => set("symbol", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Name *</label>
              <input
                className={inputCls}
                placeholder="e.g. My Token"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Initial Supply *</label>
              <input
                className={inputCls}
                type="number"
                min="1"
                placeholder="1000000"
                value={form.supply}
                onChange={(e) => set("supply", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Decimals (0–9)</label>
              <input
                className={inputCls}
                type="number"
                min="0"
                max="9"
                placeholder="9"
                value={form.decimals}
                onChange={(e) => set("decimals", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              className={inputCls}
              rows={2}
              placeholder="Optional description…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              style={{ resize: "vertical", minHeight: 60 }}
            />
          </div>

          {err && (
            <div
              className="text-xs font-semibold rounded-lg px-3 py-2 border"
              style={{
                color: "var(--destructive)",
                borderColor:
                  "color-mix(in oklch, var(--destructive) 30%, transparent)",
                background:
                  "color-mix(in oklch, var(--destructive) 8%, transparent)",
              }}
            >
              ⚠ {err}
            </div>
          )}

          {/* Devnet notice */}
          <div className="text-xs text-muted-foreground border border-border/50 rounded-lg px-3 py-2 bg-muted/20">
            ℹ️ This will simulate minting on <strong>Solana Devnet</strong>. No
            real funds are used.
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer font-[inherit] bg-transparent"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={status === "minting"}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-primary-foreground cursor-pointer border-none font-[inherit] transition-all disabled:opacity-60"
              style={{
                background: "var(--primary)",
                boxShadow:
                  "0 4px 14px color-mix(in oklch, var(--primary) 30%, transparent)",
              }}
            >
              {status === "minting" ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="inline-block w-3.5 h-3.5 rounded-full border-2 border-primary-foreground border-t-transparent"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                  Minting…
                </span>
              ) : (
                "✓ Create Token"
              )}
            </button>
          </div>
        </div>
      )}
    </ModalBackdrop>
  );
}

// ── MINT MODAL ────────────────────────────────────────────────────────
interface MintModalProps {
  token: SplToken;
  agents: Agent[];
  onClose: () => void;
  onMint: (tokenId: string, agentId: string, amount: number) => void;
}

function MintModal({ token, agents, onClose, onMint }: MintModalProps) {
  const [agentId, setAgentId] = useState(agents[0]?.id ?? "");
  const [amount, setAmount] = useState("10000");
  const [status, setStatus] = useState<"idle" | "minting" | "done">("idle");
  const [err, setErr] = useState("");

  async function handleMint() {
    const n = Number(amount);
    if (!n || n <= 0) {
      setErr("Enter a valid amount.");
      return;
    }
    if (!agentId) {
      setErr("Select a recipient agent.");
      return;
    }
    setStatus("minting");
    await new Promise((r) => setTimeout(r, 1200));
    onMint(token.id, agentId, n);
    setStatus("done");
  }

  const agent = agents.find((a) => a.id === agentId);

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-base font-extrabold">🪙 Mint {token.symbol}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{token.name}</p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground text-xl cursor-pointer bg-transparent border-none font-[inherit]"
        >
          ✕
        </button>
      </div>

      {status === "done" ? (
        <div className="px-6 py-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-lg font-bold mb-1">Mint Successful!</h3>
          <p className="text-sm text-muted-foreground">
            <strong style={{ color: "var(--chart-1)" }}>
              {Number(amount).toLocaleString()} {token.symbol}
            </strong>{" "}
            minted to <strong>{agent?.name}</strong>
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full py-2.5 rounded-lg text-sm font-bold text-primary-foreground border-none cursor-pointer font-[inherit]"
            style={{ background: "var(--primary)" }}
          >
            Done
          </button>
        </div>
      ) : (
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className={labelCls}>Recipient Agent</label>
            <select
              className={inputCls}
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              style={{ cursor: "pointer" }}
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.emoji} {a.name} ({a.address.slice(0, 10)}…)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Amount ({token.symbol})</label>
            <input
              className={inputCls}
              type="number"
              min="1"
              placeholder="10000"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setErr("");
              }}
            />
          </div>
          <div className="bg-muted/30 border border-border/50 rounded-lg px-3 py-2.5 text-xs text-muted-foreground flex justify-between">
            <span>Token supply</span>
            <span
              className="font-mono font-bold"
              style={{ color: token.color }}
            >
              {token.supply.toLocaleString()} {token.symbol}
            </span>
          </div>
          {err && (
            <div
              className="text-xs font-semibold px-3 py-2 rounded-lg border"
              style={{
                color: "var(--destructive)",
                borderColor:
                  "color-mix(in oklch, var(--destructive) 30%, transparent)",
                background:
                  "color-mix(in oklch, var(--destructive) 8%, transparent)",
              }}
            >
              ⚠ {err}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border text-muted-foreground hover:bg-muted/40 transition-all cursor-pointer bg-transparent font-[inherit]"
            >
              Cancel
            </button>
            <button
              onClick={handleMint}
              disabled={status === "minting"}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-primary-foreground border-none cursor-pointer font-[inherit] disabled:opacity-60"
              style={{
                background: "var(--primary)",
                boxShadow:
                  "0 4px 14px color-mix(in oklch, var(--primary) 30%, transparent)",
              }}
            >
              {status === "minting" ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="inline-block w-3.5 h-3.5 rounded-full border-2 border-primary-foreground border-t-transparent"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                  Minting…
                </span>
              ) : (
                "⚡ Mint Tokens"
              )}
            </button>
          </div>
        </div>
      )}
    </ModalBackdrop>
  );
}

// ── TRANSFER MODAL ────────────────────────────────────────────────────
interface TransferModalProps {
  token: SplToken;
  agents: Agent[];
  onClose: () => void;
  onTransfer: (
    tokenId: string,
    fromId: string,
    toId: string,
    amount: number,
  ) => void;
}

function TransferModal({
  token,
  agents,
  onClose,
  onTransfer,
}: TransferModalProps) {
  const [fromId, setFromId] = useState(agents[0]?.id ?? "");
  const [toId, setToId] = useState(agents[1]?.id ?? agents[0]?.id ?? "");
  const [amount, setAmount] = useState("1000");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");

  const fromHolding = token.holdings[fromId] ?? 0;

  async function handleTransfer() {
    const n = Number(amount);
    if (!n || n <= 0) {
      setErr("Enter a valid amount.");
      return;
    }
    if (fromId === toId) {
      setErr("From and To agent must be different.");
      return;
    }
    if (n > fromHolding) {
      setErr(
        `Insufficient balance. ${fromId === agents[0]?.id ? agents[0]?.name : "Agent"} holds ${fromHolding.toLocaleString()} ${token.symbol}.`,
      );
      return;
    }
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 1400));
    onTransfer(token.id, fromId, toId, n);
    setStatus("done");
  }

  const fromAgent = agents.find((a) => a.id === fromId);
  const toAgent = agents.find((a) => a.id === toId);

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-base font-extrabold">
            🔄 Transfer {token.symbol}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Agent-to-agent token transfer
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground text-xl cursor-pointer bg-transparent border-none font-[inherit]"
        >
          ✕
        </button>
      </div>

      {status === "done" ? (
        <div className="px-6 py-8 text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="text-lg font-bold mb-1">Transfer Complete!</h3>
          <p className="text-sm text-muted-foreground">
            <strong style={{ color: "var(--chart-1)" }}>
              {Number(amount).toLocaleString()} {token.symbol}
            </strong>{" "}
            sent from <strong>{fromAgent?.name}</strong> →{" "}
            <strong>{toAgent?.name}</strong>
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full py-2.5 rounded-lg text-sm font-bold text-primary-foreground border-none cursor-pointer font-[inherit]"
            style={{ background: "var(--primary)" }}
          >
            Done
          </button>
        </div>
      ) : (
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>From Agent</label>
              <select
                className={inputCls}
                value={fromId}
                onChange={(e) => {
                  setFromId(e.target.value);
                  setErr("");
                }}
                style={{ cursor: "pointer" }}
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.emoji} {a.name}
                  </option>
                ))}
              </select>
              {fromHolding > 0 && (
                <div className="mt-1 text-[10px] text-muted-foreground font-mono">
                  Balance: {fromHolding.toLocaleString()} {token.symbol}
                </div>
              )}
            </div>
            <div>
              <label className={labelCls}>To Agent</label>
              <select
                className={inputCls}
                value={toId}
                onChange={(e) => {
                  setToId(e.target.value);
                  setErr("");
                }}
                style={{ cursor: "pointer" }}
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.emoji} {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Amount ({token.symbol})</label>
            <input
              className={inputCls}
              type="number"
              min="1"
              placeholder="1000"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setErr("");
              }}
            />
          </div>
          {err && (
            <div
              className="text-xs font-semibold px-3 py-2 rounded-lg border"
              style={{
                color: "var(--destructive)",
                borderColor:
                  "color-mix(in oklch, var(--destructive) 30%, transparent)",
                background:
                  "color-mix(in oklch, var(--destructive) 8%, transparent)",
              }}
            >
              ⚠ {err}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border text-muted-foreground hover:bg-muted/40 transition-all cursor-pointer bg-transparent font-[inherit]"
            >
              Cancel
            </button>
            <button
              onClick={handleTransfer}
              disabled={status === "sending"}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-primary-foreground border-none cursor-pointer font-[inherit] disabled:opacity-60"
              style={{
                background: "var(--chart-2)",
                boxShadow:
                  "0 4px 14px color-mix(in oklch, var(--chart-2) 30%, transparent)",
              }}
            >
              {status === "sending" ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                  Sending…
                </span>
              ) : (
                "→ Send Transfer"
              )}
            </button>
          </div>
        </div>
      )}
    </ModalBackdrop>
  );
}

// ── SPL TOKENS VIEW ──────────────────────────────────────────────────
function TokensView({
  agents,
  tokens,
  onCreateToken,
  onMintToken,
  onTransferToken,
}: {
  agents: Agent[];
  tokens: SplToken[];
  onCreateToken: (t: SplToken) => void;
  onMintToken: (tokenId: string, agentId: string, amount: number) => void;
  onTransferToken: (
    tokenId: string,
    fromId: string,
    toId: string,
    amount: number,
  ) => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [mintTarget, setMintTarget] = useState<SplToken | null>(null);
  const [xferTarget, setXferTarget] = useState<SplToken | null>(null);

  return (
    <div className="flex flex-col gap-5">
      {showCreate && (
        <CreateTokenModal
          tokenCount={tokens.length}
          onClose={() => setShowCreate(false)}
          onCreate={(t) => {
            onCreateToken(t);
            setShowCreate(false);
          }}
        />
      )}
      {mintTarget && (
        <MintModal
          token={mintTarget}
          agents={agents}
          onClose={() => setMintTarget(null)}
          onMint={(tid, aid, amt) => {
            onMintToken(tid, aid, amt);
            setMintTarget(null);
          }}
        />
      )}
      {xferTarget && (
        <TransferModal
          token={xferTarget}
          agents={agents}
          onClose={() => setXferTarget(null)}
          onTransfer={(tid, fid, tid2, amt) => {
            onTransferToken(tid, fid, tid2, amt);
            setXferTarget(null);
          }}
        />
      )}

      <SectionHeader
        title="SPL Token Registry"
        icon="🪙"
        action={
          <PrimaryBtn onClick={() => setShowCreate(true)}>
            + Create Token
          </PrimaryBtn>
        }
      />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                {[
                  "Token",
                  "Mint Address",
                  "Supply",
                  "Decimals",
                  "Holders",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tokens.map((tk) => (
                <tr
                  key={tk.id}
                  className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{
                          background: `color-mix(in oklch, ${tk.color} 15%, var(--muted))`,
                          color: tk.color,
                        }}
                      >
                        🪙
                      </div>
                      <div>
                        <div className="font-bold text-sm">{tk.symbol}</div>
                        <div className="text-xs text-muted-foreground">
                          {tk.name}
                        </div>
                        {tk.description && (
                          <div className="text-[10px] text-muted-foreground/60 mt-0.5 max-w-[180px] truncate">
                            {tk.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="font-mono text-xs text-muted-foreground">
                      {tk.mint.slice(0, 12)}…{tk.mint.slice(-6)}
                    </code>
                  </td>
                  <td
                    className="px-4 py-3 font-bold text-sm"
                    style={{ color: tk.color }}
                  >
                    {tk.supply.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {tk.decimals}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-md"
                      style={{
                        color: "var(--chart-1)",
                        background:
                          "color-mix(in oklch, var(--chart-1) 10%, transparent)",
                      }}
                    >
                      {agents.length}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMintTarget(tk)}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer font-[inherit]"
                        style={{
                          color: "var(--chart-1)",
                          borderColor:
                            "color-mix(in oklch, var(--chart-1) 30%, transparent)",
                          background:
                            "color-mix(in oklch, var(--chart-1) 8%, transparent)",
                        }}
                      >
                        ⚡ Mint
                      </button>
                      <button
                        onClick={() => setXferTarget(tk)}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer font-[inherit]"
                        style={{
                          color: "var(--chart-2)",
                          borderColor:
                            "color-mix(in oklch, var(--chart-2) 30%, transparent)",
                          background:
                            "color-mix(in oklch, var(--chart-2) 8%, transparent)",
                        }}
                      >
                        → Transfer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SectionHeader title="Agent Token Holdings" icon="💼" />
      <div className="grid grid-cols-2 gap-4">
        {agents.map((agent) => {
          const color =
            {
              Trader: "var(--chart-1)",
              "Random Actor": "var(--chart-3)",
              "Token Manager": "var(--chart-2)",
              Idle: "var(--chart-4)",
            }[agent.behavior] ?? "var(--primary)";
          const totalTokens = tokens.reduce(
            (s, tk) => s + (tk.holdings[agent.id] ?? 0),
            0,
          );
          return (
            <Card key={agent.id}>
              <div className="p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                    style={{
                      background: `color-mix(in oklch, ${color} 12%, var(--muted))`,
                    }}
                  >
                    {agent.emoji}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{agent.name}</div>
                    <code className="text-[10px] text-muted-foreground font-mono">
                      {agent.address.slice(0, 12)}…
                    </code>
                  </div>
                </div>
                {tokens.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No tokens created yet
                  </p>
                )}
                {tokens.map((tk, i) => {
                  const holding = tk.holdings[agent.id] ?? 0;
                  return (
                    <div
                      key={tk.id}
                      className={`flex justify-between items-center py-2 ${i < tokens.length - 1 ? "border-b border-border/40" : ""}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[10px] w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            background: tk.color,
                            display: "inline-block",
                          }}
                        />
                        <span className="text-sm font-medium text-muted-foreground">
                          {tk.symbol}
                        </span>
                      </div>
                      <span
                        className="font-bold text-sm font-mono"
                        style={{
                          color:
                            holding > 0 ? tk.color : "var(--muted-foreground)",
                        }}
                      >
                        {holding > 0 ? holding.toLocaleString() : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── LOGS VIEW ──────────────────────────────────────────────────────────
function LogsView({ logs }: { logs: LogEntry[] }) {
  const [level, setLevel] = useState<
    "all" | "info" | "success" | "warn" | "error"
  >("all");
  const filtered =
    level === "all" ? logs : logs.filter((l) => l.level === level);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
  }, [logs.length]);

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="System Logs"
        icon="📋"
        action={
          <div className="tab-bar">
            {(["all", "info", "success", "warn", "error"] as const).map((l) => (
              <button
                key={l}
                className={`tab-item ${level === l ? "active" : ""}`}
                onClick={() => setLevel(l)}
              >
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        }
      />
      <Card>
        <div
          ref={ref}
          className="p-4 m-3 mt-0 rounded-lg border border-border/50 max-h-[520px] overflow-y-auto log-console"
          style={{
            background: "color-mix(in oklch, var(--muted) 30%, var(--card))",
          }}
        >
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No log entries
            </p>
          ) : (
            filtered.map((e) => <LogLine key={e.id} entry={e} />)
          )}
        </div>
      </Card>
    </div>
  );
}

// ── SETTINGS VIEW ──────────────────────────────────────────────────────
function SettingsView() {
  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-input bg-muted/30 text-foreground font-mono text-xs outline-none focus:border-ring transition-colors";
  const labelCls =
    "block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5";

  const groups = [
    {
      title: "🔌 Network",
      fields: [
        { label: "Network", value: "Solana Devnet" },
        { label: "RPC Endpoint", value: "https://api.devnet.solana.com" },
        { label: "Commitment", value: "confirmed" },
      ],
    },
    {
      title: "🤖 Agent Defaults",
      fields: [
        { label: "Action Interval", value: "10000 ms" },
        { label: "Min Transfer", value: "0.001 SOL" },
        { label: "Max Transfer", value: "0.1 SOL" },
      ],
    },
    {
      title: "🔐 Security",
      fields: [
        { label: "Key Storage", value: "./data/wallets" },
        { label: "Persist Keys", value: "true" },
        { label: "Encryption", value: "AES-256 (planned)" },
        { label: "Max Retries", value: "3" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="Configuration"
        icon="⚙"
        action={<PrimaryBtn>Save Config</PrimaryBtn>}
      />
      <div className="grid grid-cols-2 gap-4">
        {groups.slice(0, 2).map((g) => (
          <Card key={g.title} title={g.title}>
            <div className="p-4 flex flex-col gap-4">
              {g.fields.map((f) => (
                <div key={f.label}>
                  <label className={labelCls}>{f.label}</label>
                  <input className={inputCls} defaultValue={f.value} readOnly />
                </div>
              ))}
            </div>
          </Card>
        ))}
        <Card title={groups[2].title} className="col-span-2">
          <div className="p-4 grid grid-cols-2 gap-4">
            {groups[2].fields.map((f) => (
              <div key={f.label}>
                <label className={labelCls}>{f.label}</label>
                <input className={inputCls} defaultValue={f.value} readOnly />
              </div>
            ))}
          </div>
          <div
            className="mx-4 mb-4 p-4 rounded-lg border text-sm flex gap-3"
            style={{
              borderColor:
                "color-mix(in oklch, var(--chart-3) 30%, transparent)",
              background: "color-mix(in oklch, var(--chart-3) 6%, transparent)",
              color: "var(--chart-3)",
            }}
          >
            <span className="text-base flex-shrink-0">⚠️</span>
            <div>
              <strong>Security Notice:</strong> This system is configured for{" "}
              <strong>Devnet only</strong>. Private keys are stored locally and
              never transmitted. Do not use real SOL with this prototype.
            </div>
          </div>
        </Card>
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
  const [tokens, setTokens] = useState<SplToken[]>(INITIAL_TOKENS);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [simRunning, setSimRunning] = useState(true);

  // ── Token actions ─────────────────────────────────────────────────
  const handleCreateToken = useCallback((t: SplToken) => {
    setTokens((prev) => [...prev, t]);
    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        level: "success",
        agentName: "System",
        message: `Token ${t.symbol} created — mint ${t.mint.slice(0, 12)}… supply=${t.supply.toLocaleString()} decimals=${t.decimals}`,
      },
      ...prev,
    ]);
  }, []);

  const handleMintToken = useCallback(
    (tokenId: string, agentId: string, amount: number) => {
      setTokens((prev) =>
        prev.map((tk) => {
          if (tk.id !== tokenId) return tk;
          return {
            ...tk,
            supply: tk.supply + amount,
            holdings: {
              ...tk.holdings,
              [agentId]: (tk.holdings[agentId] ?? 0) + amount,
            },
          };
        }),
      );
      const agent = agents.find((a) => a.id === agentId);
      const token = tokens.find((t) => t.id === tokenId);
      setLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date(),
          level: "success",
          agentName: agent?.name ?? "Unknown",
          message: `Minted ${amount.toLocaleString()} ${token?.symbol} to wallet ${agent?.address.slice(0, 12)}…`,
        },
        ...prev,
      ]);
    },
    [agents, tokens],
  );

  const handleTransferToken = useCallback(
    (tokenId: string, fromId: string, toId: string, amount: number) => {
      setTokens((prev) =>
        prev.map((tk) => {
          if (tk.id !== tokenId) return tk;
          return {
            ...tk,
            holdings: {
              ...tk.holdings,
              [fromId]: Math.max(0, (tk.holdings[fromId] ?? 0) - amount),
              [toId]: (tk.holdings[toId] ?? 0) + amount,
            },
          };
        }),
      );
      const from = agents.find((a) => a.id === fromId);
      const to = agents.find((a) => a.id === toId);
      const token = tokens.find((t) => t.id === tokenId);
      setLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date(),
          level: "info",
          agentName: from?.name ?? "Unknown",
          message: `Transferred ${amount.toLocaleString()} ${token?.symbol} → ${to?.name} (${to?.address.slice(0, 12)}…)`,
        },
        ...prev,
      ]);
    },
    [agents, tokens],
  );

  const runningCount = agents.filter((a) => a.status === "running").length;

  // Live simulation tick
  useEffect(() => {
    if (!simRunning) return;
    const id = setInterval(() => {
      setAgents((prev) => {
        const r = simulateTick(prev, transactions, logs);
        setTransactions(r.transactions);
        setLogs(r.logs);
        return r.agents;
      });
    }, 2500);
    return () => clearInterval(id);
  }, [simRunning, transactions, logs]);

  const handleToggle = useCallback((id: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "running" ? "stopped" : "running" }
          : a,
      ),
    );
  }, []);
  const handleSpawn = useCallback(
    () => setAgents((prev) => [...prev, generateNewAgent()]),
    [],
  );

  return (
    /* Apply dark class at root so the design token system activates dark mode */
    <div className="dark min-h-screen flex flex-col bg-background text-foreground">
      <Navbar agentCount={agents.length} runningCount={runningCount} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar view={view} setView={setView} />
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <SimBanner
            running={simRunning}
            onToggle={() => setSimRunning((p) => !p)}
            onSpawn={handleSpawn}
          />

          {view === "dashboard" && (
            <DashboardView
              agents={agents}
              transactions={transactions}
              logs={logs}
              selectedAgentId={selectedAgent}
              setSelectedAgentId={setSelectedAgent}
              onToggle={handleToggle}
            />
          )}
          {view === "agents" && (
            <AgentsView
              agents={agents}
              onToggle={handleToggle}
              onAddAgent={handleSpawn}
            />
          )}
          {view === "transactions" && (
            <TransactionsView transactions={transactions} />
          )}
          {view === "tokens" && (
            <TokensView
              agents={agents}
              tokens={tokens}
              onCreateToken={handleCreateToken}
              onMintToken={handleMintToken}
              onTransferToken={handleTransferToken}
            />
          )}
          {view === "logs" && <LogsView logs={logs} />}
          {view === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
