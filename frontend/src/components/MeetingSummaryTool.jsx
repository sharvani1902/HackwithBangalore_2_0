import { useState } from "react";
import { generateMeetingSummary, createTask } from "../services/api";
import { SparklesIcon, CheckCircleIcon } from "./Icons";

export default function MeetingSummaryTool({ onTasksCreated }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleProcess = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await generateMeetingSummary(text);
      setResult(data);
    } catch (err) {
      setError("Failed to process meeting summary.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTasks = async () => {
    if (!result || !result.action_items) return;
    setLoading(true);
    try {
      for (const item of result.action_items) {
        await createTask({
          task_name: item.task,
          assigned_to: item.assignee,
          status: "To Do"
        });
      }
      setResult(null);
      setText("");
      if (onTasksCreated) onTasksCreated();
    } catch (err) {
      setError("Failed to create tasks.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel">
      <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <SparklesIcon size={20} color="var(--primary-light)" />
        AI Meeting Assistant
      </h2>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
        Paste your meeting transcript or raw notes below. The AI will extract action items and draft tasks for your team.
      </p>
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. Discussed the new dashboard. Action: Alice needs to design the mockup. TODO: Bob to setup the database schema."
        className="input-text"
        style={{ width: "100%", height: "120px", resize: "vertical", marginBottom: "1rem", fontFamily: "inherit" }}
      />
      
      <button 
        onClick={handleProcess} 
        disabled={loading || !text.trim()} 
        className="btn-primary" 
        style={{ width: "100%", justifyContent: "center", marginBottom: "1rem" }}
      >
        {loading && !result ? "Analyzing Notes..." : "Generate Action Items"}
      </button>

      {error && <p style={{ color: "#e11d48", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>}

      {result && (
        <div style={{ background: "#f8f9fb", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-light)" }}>
          <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--primary)" }}>Summary</h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text)", marginBottom: "1rem" }}>{result.summary}</p>
          
          <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--primary)" }}>Drafted Tasks ({result.action_items.length})</h4>
          {result.action_items.length > 0 ? (
            <ul style={{ paddingLeft: "1.5rem", fontSize: "0.85rem", color: "var(--text)", marginBottom: "1rem" }}>
              {result.action_items.map((item, idx) => (
                <li key={idx} style={{ marginBottom: "0.25rem" }}>
                  <strong>{item.task}</strong> {item.assignee && <span style={{ color: "var(--primary-light)" }}>(Assigned to: {item.assignee})</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>No tasks extracted.</p>
          )}

          {result.action_items.length > 0 && (
            <button 
              onClick={handleCreateTasks} 
              disabled={loading} 
              className="btn-primary" 
              style={{ background: "#10b981", color: "white", width: "100%", justifyContent: "center" }}
            >
              {loading ? "Creating Tasks..." : <><CheckCircleIcon size={16} /> Create Tasks on Board</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
