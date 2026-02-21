import React from "react";
import { Agent } from "../simulation";

// ── SPARKLINE ────────────────────────────────────────────────────────
interface SparklineProps {
  data: number[];
  colorVar?: string; // CSS color string
  height?: number;
}

export function Sparkline({
  data,
  colorVar = "var(--chart-1)",
  height = 56,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const W = 260;
  const H = height;
  const pad = 4;
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 0.0001;

  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (W - pad * 2),
    y: H - pad - ((v - minVal) / range) * (H - pad * 2),
  }));

  const linePath =
    "M " + pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
  const areaPath =
    linePath +
    ` L ${pts[pts.length - 1].x.toFixed(1)},${H} L ${pts[0].x.toFixed(1)},${H} Z`;

  const gradId = `sg-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="sparkline-svg"
      style={{ height }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorVar} stopOpacity="0.30" />
          <stop offset="100%" stopColor={colorVar} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradId})`} />
      {/* Line */}
      <path
        d={linePath}
        stroke={colorVar}
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* End dot */}
      <circle
        cx={pts[pts.length - 1].x}
        cy={pts[pts.length - 1].y}
        r="3"
        fill={colorVar}
        stroke="var(--card)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// ── AGENT TOPOLOGY ───────────────────────────────────────────────────
const ORBIT_POSITIONS = [
  { angle: 270, r: 78 }, // top
  { angle: 0, r: 78 }, // right
  { angle: 90, r: 78 }, // bottom
  { angle: 180, r: 78 }, // left
];

interface AgentTopologyProps {
  agents: Agent[];
  onSelectAgent: (id: string) => void;
  selectedAgentId: string | null;
}

export function AgentTopology({
  agents,
  onSelectAgent,
  selectedAgentId,
}: AgentTopologyProps) {
  const cx = 140;
  const cy = 110;

  const nodePositions = agents.slice(0, 4).map((_, i) => {
    const pos = ORBIT_POSITIONS[i % ORBIT_POSITIONS.length];
    const rad = (pos.angle * Math.PI) / 180;
    return {
      x: cx + pos.r * Math.cos(rad),
      y: cy + pos.r * Math.sin(rad),
    };
  });

  return (
    <div className="relative w-full" style={{ height: 220 }}>
      <svg
        viewBox="0 0 280 220"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {/* Orbit ring */}
        <circle
          cx={cx}
          cy={cy}
          r={78}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.5"
        />
        {/* Connection lines */}
        {nodePositions.map((pos, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={pos.x}
            y2={pos.y}
            stroke="var(--primary)"
            strokeWidth="1"
            opacity="0.25"
          />
        ))}
      </svg>

      {/* Center node — Solana */}
      <div
        className="absolute flex items-center justify-center rounded-xl font-bold text-primary-foreground text-xl shadow-lg"
        style={{
          left: cx - 26,
          top: cy - 26,
          width: 52,
          height: 52,
          background: "linear-gradient(135deg, var(--chart-1), var(--chart-2))",
          boxShadow:
            "0 0 24px color-mix(in oklch, var(--primary) 50%, transparent)",
          zIndex: 2,
        }}
      >
        ◎
      </div>

      {/* Agent nodes */}
      {agents.slice(0, 4).map((agent, i) => {
        const pos = nodePositions[i];
        const isSelected = selectedAgentId === agent.id;
        return (
          <button
            key={agent.id}
            onClick={() => onSelectAgent(agent.id)}
            className="absolute flex items-center justify-center rounded-xl text-lg transition-all border cursor-pointer"
            style={{
              left: pos.x - 20,
              top: pos.y - 20,
              width: 40,
              height: 40,
              background: "var(--card)",
              borderColor: isSelected ? "var(--primary)" : "var(--border)",
              boxShadow: isSelected
                ? "0 0 16px color-mix(in oklch, var(--primary) 60%, transparent)"
                : "0 2px 8px color-mix(in oklch, var(--foreground) 8%, transparent)",
              zIndex: 2,
              transform: isSelected ? "scale(1.15)" : "scale(1)",
            }}
            title={`${agent.name}\n${agent.address}`}
          >
            {agent.emoji}
            {agent.status === "running" && (
              <span
                className="absolute -top-0.5 -right-0.5 rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background: "var(--chart-1)",
                  boxShadow: "0 0 6px var(--chart-1)",
                  animation: "pulse-dot 1.5s ease infinite",
                }}
              />
            )}
          </button>
        );
      })}

      {/* Labels */}
      {agents.slice(0, 4).map((agent, i) => {
        const pos = nodePositions[i];
        const labelOffset = {
          0: { x: 0, y: -18 },
          1: { x: 24, y: 0 },
          2: { x: 0, y: 18 },
          3: { x: -24, y: 0 },
        }[i] ?? { x: 0, y: -18 };

        return (
          <div
            key={`label-${agent.id}`}
            className="absolute text-center pointer-events-none"
            style={{
              left: pos.x + labelOffset.x - 28,
              top: pos.y + labelOffset.y + (i === 0 ? -32 : i === 2 ? 22 : 0),
              width: 56,
              fontSize: "0.6rem",
              fontWeight: 600,
              color: "var(--muted-foreground)",
              whiteSpace: "nowrap",
            }}
          >
            {agent.name.split(" ")[0]}
          </div>
        );
      })}
    </div>
  );
}
