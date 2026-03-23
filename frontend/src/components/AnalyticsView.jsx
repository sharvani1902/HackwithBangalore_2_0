import React, { useState } from 'react';
import { TrendingUpIcon, AlertTriangleIcon } from './Icons';

export default function AnalyticsView({ data }) {
  const [filter, setFilter] = useState('ALL_TIME');

  if (!data) return <div className="shimmer" style={{ height: "400px" }}></div>;

  return (
    <div className="dashboard-container">
      {/* Analytics Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-md)" }}>
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "var(--primary)", margin: 0, letterSpacing: "-0.03em" }}>Resource Analytics</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Predictive telemetry and performance benchmarking.</p>
        </div>
        
        <div style={{ display: "flex", gap: "var(--space-xs)" }}>
          {['24H', '7D', '30D', 'ALL_TIME'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 700,
                border: filter === f ? "1px solid var(--accent)" : "1px solid var(--border-light)",
                background: filter === f ? "rgba(200, 169, 106, 0.05)" : "var(--white)",
                color: filter === f ? "var(--accent)" : "var(--text-muted)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid-2">
        <div className="glass-panel" style={{ height: "300px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--primary)", marginBottom: "var(--space-md)" }}>VELOCITY_LINE_CHART</h3>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "var(--space-xs)", padding: "0 var(--space-md)" }}>
            {[40, 70, 45, 90, 65, 80, 95].map((val, i) => (
              <div key={i} style={{ flex: 1, background: "var(--primary)", height: `${val}%`, borderRadius: "4px 4px 0 0", opacity: 0.1 + (i * 0.1) }}></div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ height: "300px", display: "flex", flexDirection: "column", border: "1px solid var(--accent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-md)" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--primary)" }}>HINDSIGHT_INTELLIGENCE</h3>
            <span style={{ fontSize: "0.6rem", fontWeight: 900, color: "var(--accent)", padding: "0.2rem 0.5rem", background: "rgba(200, 169, 106, 0.1)", borderRadius: "4px" }}>SYNCED_ACTIVE</span>
          </div>
          
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
             <div style={{ padding: "var(--space-sm)", background: "rgba(0,0,0,0.02)", borderRadius: "8px", borderLeft: "3px solid var(--accent)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--primary)" }}>PATTERN_RECOGNITION: TEAM_VELOCITY</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>Alex M. performs 20% faster on Backend tasks.</div>
             </div>
             <div style={{ padding: "var(--space-sm)", background: "rgba(0,0,0,0.02)", borderRadius: "8px", borderLeft: "3px solid var(--primary)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--primary)" }}>HISTORICAL_RISK_LOG</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>Friday deployments show 15% higher latency.</div>
             </div>
             <div style={{ padding: "var(--space-sm)", background: "rgba(0,0,0,0.02)", borderRadius: "8px", borderLeft: "3px solid var(--accent)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--primary)" }}>MEMORY_CACHE_STATE</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>2.4k text vectors stored in ProPilot memory.</div>
             </div>
          </div>
        </div>
      </div>

      {/* Detailed Telemetry Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--border-light)" }}>
              <th style={{ padding: "1.25rem", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)" }}>LOG_ID</th>
              <th style={{ padding: "1.25rem", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)" }}>MODULE</th>
              <th style={{ padding: "1.25rem", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)" }}>ACCURACY</th>
              <th style={{ padding: "1.25rem", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)" }}>STATE</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: "X-01", module: "Predictive Allocator", accuracy: "98.2%", state: "ACTIVE" },
              { id: "X-02", module: "Team Sync Engine", accuracy: "94.5%", state: "STABLE" },
              { id: "X-03", module: "Risk Monitor", accuracy: "99.0%", state: "MONITORING" },
            ].map((row) => (
              <tr key={row.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                <td style={{ padding: "1.25rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--primary)" }}>{row.id}</td>
                <td style={{ padding: "1.25rem", fontSize: "0.9rem", color: "var(--text-main)" }}>{row.module}</td>
                <td style={{ padding: "1.25rem", fontSize: "0.9rem", color: "var(--accent)", fontWeight: 800 }}>{row.accuracy}</td>
                <td style={{ padding: "1.25rem" }}>
                   <span style={{ fontSize: "0.65rem", fontWeight: 900, padding: "0.25rem 0.5rem", borderRadius: "4px", background: "rgba(5, 150, 105, 0.1)", color: "#059669" }}>{row.state}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
