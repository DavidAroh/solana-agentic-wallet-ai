import React from "react";
import { Agent } from "../simulation";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({
  data,
  color = "#8b5cf6",
  height = 60,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const width = 200;
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;
  const padding = 4;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y =
      height - ((val - minVal) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  });

  const pathD = "M " + points.join(" L ");
  const areaD = `${pathD} L ${padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2)},${height} L ${padding},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: height }}
      className="chart-svg"
    >
      <defs>
        <linearGradient
          id={`grad-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <path d={areaD} fill={`url(#grad-${color.replace("#", "")})`} />
      <path
        d={pathD}
        stroke={color}
        strokeWidth="2"
        fill="none"
        filter="url(#glow)"
      />
      <circle
        cx={points[points.length - 1].split(",")[0]}
        cy={points[points.length - 1].split(",")[1]}
        r="3"
        fill={color}
        filter="url(#glow)"
      />
    </svg>
  );
}

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
  const positions = [
    { top: "50%", left: "50%", transform: "translate(-50%,-50%)" }, // center (network)
    { top: "15%", left: "50%", transform: "translate(-50%,0)" },
    { top: "50%", left: "82%", transform: "translate(-50%,-50%)" },
    { top: "80%", left: "68%", transform: "translate(-50%,0)" },
    { top: "80%", left: "32%", transform: "translate(-50%,0)" },
    { top: "50%", left: "18%", transform: "translate(-50%,-50%)" },
  ];

  return (
    <div className="topology-container">
      {/* Center node — Solana Network */}
      <div
        className="topology-node topology-center"
        style={positions[0]}
        title="Solana Devnet"
      >
        ◎
      </div>

      {agents.slice(0, 4).map((agent, i) => (
        <React.Fragment key={agent.id}>
          {/* Connection line */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
            viewBox="0 0 300 220"
            preserveAspectRatio="none"
          />

          {/* Agent node */}
          <div
            className={`topology-node ${agent.colorClass} ${selectedAgentId === agent.id ? "glow-purple" : ""}`}
            style={{
              ...(positions[i + 1] as React.CSSProperties),
              border:
                selectedAgentId === agent.id
                  ? "2px solid #8b5cf6"
                  : "1px solid rgba(255,255,255,0.08)",
            }}
            onClick={() => onSelectAgent(agent.id)}
            title={`${agent.name} — ${agent.address.slice(0, 8)}...`}
          >
            {agent.emoji}
            {agent.status === "running" && (
              <div
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#34d399",
                  boxShadow: "0 0 6px #34d399",
                  animation: "pulse-dot 1.5s ease infinite",
                }}
              />
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

interface StatMiniProps {
  label: string;
  value: string | number;
  color?: string;
}

export function StatMini({
  label,
  value,
  color = "var(--text-primary)",
}: StatMiniProps) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: -0.5 }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}
