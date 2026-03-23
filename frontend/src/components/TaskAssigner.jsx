import { useState, useEffect } from "react";
import { getSuggestion, createTask, getTeamMembers } from "../services/api";
import { SparklesIcon, CheckCircleIcon } from "./Icons";

export default function TaskAssigner({ onTaskAdded }) {
  const [members, setMembers] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [assignee, setAssignee] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [typedReason, setTypedReason] = useState("");

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (suggestion && suggestion.reason) {
      setTypedReason("");
      let i = 0;
      const interval = setInterval(() => {
        setTypedReason(prev => prev + suggestion.reason.charAt(i));
        i++;
        if (i >= suggestion.reason.length) clearInterval(interval);
      }, 10);
      return () => clearInterval(interval);
    }
  }, [suggestion]);

  const loadMembers = async () => {
    try {
      const data = await getTeamMembers();
      setMembers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuggest = async () => {
    if (!taskName.trim()) return;
    setError(null);
    setLoading(true);
    setSuggestion(null);
    try {
      const res = await getSuggestion(taskName);
      setTimeout(() => {
        setSuggestion(res);
        if (res.suggested_member) setAssignee(res.suggested_member);
        setLoading(false);
      }, 600);
    } catch (err) {
      setError("Suggestion engine unavailable.");
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!taskName.trim() || !assignee) return;
    
    setError(null);
    setIsAssigning(true);
    
    try {
      await createTask({ 
        task_name: taskName.trim(), 
        assigned_to: assignee,
        ai_rationale: suggestion?.reason || null,
        confidence_score: suggestion?.confidence || 0,
        priority: suggestion?.priority || "Medium",
        difficulty: suggestion?.difficulty || "Medium"
      });
      setTaskName("");
      setAssignee("");
      setSuggestion(null);
      setSuccess("Task Successfully Deployed");
      setTimeout(() => setSuccess(null), 3000);
      if (onTaskAdded) onTaskAdded();
    } catch (err) {
      setError("Deployment failed.");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="glass-panel">
      <h2 className="section-title"><SparklesIcon size={18} color="var(--accent)" /> AI ALLOCATION ENGINE</h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <input 
          type="text" 
          value={taskName} 
          onChange={(e) => setTaskName(e.target.value)} 
          placeholder="What needs to be accomplished?"
          className="input-text"
          style={{ fontSize: "1rem", padding: "1rem" }}
        />

        <div style={{ display: "flex", gap: "1rem" }}>
          <select 
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="input-text"
            style={{ flex: 1 }}
          >
            <option value="" disabled>Manual Selection</option>
            {members.map(m => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
          
          <button 
            type="button" 
            className="btn-primary" 
            onClick={handleSuggest}
            disabled={loading || !taskName.trim()}
            style={{ background: "#c8a96a", color: "#0a1f44", boxShadow: "0 4px 10px rgba(200,169,106,0.2)" }}
          >
            {loading ? "Analysing..." : "AI Suggest"}
          </button>
        </div>
        
        {loading && (
          <div className="glass-panel shimmer" style={{ padding: "var(--space-lg)", textAlign: "center", border: "1px dashed var(--accent)" }}>
             <div style={{ color: "var(--accent)", fontWeight: 900, fontSize: "0.7rem", letterSpacing: "0.2em" }}>SYNCHRONIZING_PREDICTIVE_MODELS</div>
             <div style={{ marginTop: "var(--space-sm)", background: "rgba(0,0,0,0.05)", height: "20px", width: "80%", margin: "0 auto", borderRadius: "4px" }}></div>
             <div style={{ marginTop: "var(--space-xs)", background: "rgba(0,0,0,0.05)", height: "12px", width: "60%", margin: "0 auto", borderRadius: "4px" }}></div>
          </div>
        )}

        {suggestion && (
          <div className="glass-panel" style={{ 
            padding: "var(--space-lg)", 
            background: "var(--suggestion-bg)", 
            border: "1px solid var(--suggestion-border)", 
            position: "relative",
            animation: "reveal 0.5s ease-out forwards"
          }}>
            <div style={{ position: "absolute", top: "var(--space-sm)", right: "var(--space-sm)", background: "var(--primary)", color: "#fff", padding: "0.25rem 0.75rem", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 900 }}>
              {Math.round(suggestion.confidence * 100)}% MATCH_ACCURACY
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--suggestion-text)", opacity: 0.7, fontWeight: 800, letterSpacing: "0.05em" }}>OPTIMIZED_ALLOCATION_STRATEGY</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.02em" }}>{suggestion.suggested_member}</div>
              
              <div style={{ height: "1px", background: "var(--suggestion-border)", margin: "var(--space-xs) 0" }}></div>
              
              <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--suggestion-text)", lineHeight: 1.6, fontWeight: 500 }}>
                 <span style={{ opacity: 0.5 }}>Rationale:</span> {typedReason}_
              </p>
            </div>
          </div>
        )}

        {success && <p className="success-msg" style={{ color: "#059669", fontWeight: 700 }}><CheckCircleIcon size={14} /> {success.toUpperCase()}</p>}

        <button 
          onClick={handleAssign}
          className="btn-primary" 
          disabled={!taskName.trim() || !assignee || isAssigning}
          style={{ padding: "1rem", fontSize: "0.9rem", marginTop: "0.5rem" }}
        >
          {isAssigning ? "Processing..." : "DEPLOY_TASK"}
        </button>
      </div>
    </div>
  );
}
