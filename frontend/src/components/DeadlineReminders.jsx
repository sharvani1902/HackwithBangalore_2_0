import { useState, useEffect } from "react";
import { getDeadlines } from "../services/api";
import { AlertTriangleIcon } from "./Icons";

export default function DeadlineReminders({ refreshTrigger }) {
  const [deadlines, setDeadlines] = useState({ overdue: [], today: [], upcoming: [] });

  useEffect(() => {
    getDeadlines().then(setDeadlines).catch(console.error);
  }, [refreshTrigger]);

  const renderList = (title, items, color) => {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--primary)", fontSize: "0.85rem" }}>{title}</h4>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {items.map(t => (
            <li key={t.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", padding: "0.4rem 0", borderBottom: "1px solid var(--border-light)" }}>
              <span style={{ fontWeight: 600 }}>{t.task_name}</span>
              <span style={{ color: color, fontWeight: 700 }}>
                {new Date(t.deadline).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (deadlines.overdue.length === 0 && deadlines.today.length === 0 && deadlines.upcoming.length === 0) {
    return (
      <div className="glass-panel">
        <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertTriangleIcon size={18} /> Deadline Reminders
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No upcoming deadlines found.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ borderLeft: "4px solid #f59e0b" }}>
      <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#b45309" }}>
        <AlertTriangleIcon size={18} /> Deadline Reminders
      </h2>
      {renderList("Overdue", deadlines.overdue, "#e11d48")}
      {renderList("Due Today", deadlines.today, "#ea580c")}
      {renderList("Upcoming (7 Days)", deadlines.upcoming, "#059669")}
    </div>
  );
}
