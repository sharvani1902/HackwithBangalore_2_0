import React from 'react';

export default function HistoryTimeline() {
  const activities = [
    { id: 1, type: 'DEPLOY', message: 'Task #102 assigned to Alex M.', time: '2m ago' },
    { id: 2, type: 'AI_SYNC', message: 'Predictive model recalculated for Q3', time: '15m ago' },
    { id: 3, type: 'AUTH', message: 'Master Admin access authorized', time: '1h ago' },
    { id: 4, type: 'DATA', message: 'Team telemetry batch processed', time: '3h ago' },
  ];

  return (
    <div className="glass-panel" style={{ padding: "var(--space-md)" }}>
      <h3 style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "0.05em", marginBottom: "var(--space-md)" }}>
        OPERATIONAL_LOGS
      </h3>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        {activities.map((act) => (
          <div key={act.id} style={{ display: "flex", gap: "var(--space-sm)", alignItems: "flex-start" }}>
            <div style={{ 
              width: "8px", 
              height: "8px", 
              borderRadius: "50%", 
              background: act.type === 'DEPLOY' ? 'var(--accent)' : 'var(--primary)',
              marginTop: "5px",
              boxShadow: `0 0 8px ${act.type === 'DEPLOY' ? 'rgba(200, 169, 106, 0.4)' : 'rgba(10, 31, 68, 0.2)'}`
            }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 600, lineHeight: 1.3 }}>{act.message}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, marginTop: "2px" }}>{act.time} · {act.type}</div>
            </div>
          </div>
        ))}
      </div>

      <button style={{ 
        width: "100%", 
        marginTop: "var(--space-lg)", 
        background: "transparent", 
        border: "1px solid var(--border-light)", 
        padding: "0.5rem", 
        fontSize: "0.7rem", 
        fontWeight: 800, 
        color: "var(--text-muted)",
        borderRadius: "6px",
        cursor: "pointer"
      }}>
        VIEW_ALL_TELEMETRY
      </button>
    </div>
  );
}
