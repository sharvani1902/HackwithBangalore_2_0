import { AlertTriangleIcon, TrendingUpIcon } from "./Icons";

export default function Insights({ data }) {
  if (!data) return null;

  const { stats, best_performing_member, most_delayed_member, risk_insights } = data;

  const onTimePercent = stats.total_completed > 0 
    ? (stats.total_on_time / stats.total_completed) * 100 
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {/* Metrics Row */}
      <div className="grid-4">
        <div className="stat-box">
          <h3>Total Executed</h3>
          <p className="value">{stats.total_completed}</p>
          <div style={{ marginTop: "var(--space-xs)", color: "var(--accent)", fontSize: "0.7rem", fontWeight: 700 }}>
             <TrendingUpIcon size={12} /> +12% VS BASELINE
          </div>
        </div>
        <div className="stat-box highlight">
          <h3>Efficiency</h3>
          <p className="value">{onTimePercent.toFixed(0)}%</p>
          <div className="mini-bar-container" style={{ height: "4px", background: "rgba(0,0,0,0.05)", marginTop: "var(--space-xs)" }}>
            <div className="mini-bar-fill" style={{ width: `${onTimePercent}%`, background: "var(--accent)", height: "100%" }}></div>
          </div>
        </div>
        <div className="stat-box">
          <h3>Risk Level</h3>
          <p className="value" style={{ color: stats.total_delayed > 0 ? "#e11d48" : "var(--primary)" }}>
            {stats.total_delayed > 0 ? "ELEVATED" : "OPTIMAL"}
          </p>
          <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>{stats.total_delayed} ACTIVE_CONFLICTS</span>
        </div>
        <div className="stat-box highlight">
          <h3>Predictions</h3>
          <p className="value">A+</p>
          <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>MODEL_STABILITY: HIGH</span>
        </div>
      </div>

      <div className="grid-2">
        {/* Performance Benchmarks */}
        <div className="glass-panel">
          <h2 className="section-title">Resource Analytics</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1.5rem" }}>
            <div style={{ padding: "1.5rem", borderRadius: "10px", background: "var(--bg-color)", border: "1px solid var(--border-light)" }}>
               <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>PEAK_PERFORMER</div>
               <div style={{ color: "var(--primary)", fontSize: "1.5rem", fontWeight: "800" }}>{best_performing_member || "..."}</div>
            </div>
            <div style={{ padding: "1.5rem", borderRadius: "10px", background: "white", border: "1px solid var(--border-light)" }}>
               <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>HIGH_LATENCY_RESOURCE</div>
               <div style={{ color: "var(--primary)", fontSize: "1.5rem", fontWeight: "800" }}>{most_delayed_member || "NONE"}</div>
            </div>
          </div>
        </div>

        {/* AI Risks Portfolio */}
        <div className="insight-card-luxury">
          <h2 className="section-title" style={{ color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
             Risk Monitoring
          </h2>
          <div style={{ marginTop: "1.5rem" }}>
            {risk_insights.length === 0 ? (
              <p style={{ opacity: 0.5, fontSize: "0.9rem" }}>Scanning environment for resource conflicts... No risks detected.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {risk_insights.map((insight, idx) => (
                  <div key={idx} className="insight-card" style={{ background: "rgba(0,0,0,0.2)", border: "none", borderLeft: "4px solid var(--accent)", color: "#fff" }}>
                    <div className="status-indicator" style={{ background: "var(--accent)", color: "#fff", padding: "4px" }}>
                      <AlertTriangleIcon size={12} color="#fff" />
                    </div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "600", lineHeight: 1.4 }}>{insight}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "0.75rem", opacity: 0.6 }}>
            AUTOMATED_SCAN_INTERVAL: 60S
          </div>
        </div>
      </div>
    </div>
  );
}
