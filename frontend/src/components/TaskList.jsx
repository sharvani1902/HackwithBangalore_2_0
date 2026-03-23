import { useState, useEffect, useCallback, useMemo } from "react";
import { getTasks, updateTask, deleteTask } from "../services/api";
import { CheckCircleIcon, XIcon, SparklesIcon, AlertCircleIcon, TrendingUpIcon } from "./Icons";

export default function TaskList({ refreshTrigger, onTaskCompleted }) {
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("To Do");
  const [editAssignee, setEditAssignee] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");
  const [editDifficulty, setEditDifficulty] = useState("Medium");
  const [expandedRationale, setExpandedRationale] = useState({});

  const loadTasks = useCallback(async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error("[TaskList] Load Error:", err);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [refreshTrigger, loadTasks]);

  const handleStatusChange = useCallback(async (task, newStatus) => {
    try {
      await updateTask(task.id, { status: newStatus });
      loadTasks();
      if (newStatus === "Completed" && onTaskCompleted) onTaskCompleted();
    } catch (err) {
      console.error("[TaskList] Status Update Error:", err);
    }
  }, [loadTasks, onTaskCompleted]);

  const handleEditClick = useCallback((task) => {
    setEditingId(task.id);
    setEditName(task.task_name);
    setEditStatus(task.status || "To Do");
    setEditAssignee(task.assigned_to || "");
    setEditPriority(task.priority || "Medium");
    setEditDifficulty(task.difficulty || "Medium");
  }, []);

  const handleSaveEdit = useCallback(async () => {
    try {
      await updateTask(editingId, { 
        task_name: editName, 
        status: editStatus, 
        assigned_to: editAssignee || null,
        priority: editPriority,
        difficulty: editDifficulty
      });
      setEditingId(null);
      loadTasks();
    } catch (err) {
      console.error("[TaskList] Save Error:", err);
    }
  }, [editingId, editName, editStatus, editAssignee, editPriority, editDifficulty, loadTasks]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      loadTasks();
    } catch (err) {
      console.error("[TaskList] Delete Error:", err);
    }
  }, [loadTasks]);

  const toggleRationale = useCallback((id) => {
    setExpandedRationale(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const getPriorityColor = useCallback((p) => {
    switch (p?.toLowerCase()) {
      case 'high': return '#e11d48';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return 'var(--text-muted)';
    }
  }, []);

  const tasksByStatus = useMemo(() => {
    return {
      todo: tasks.filter(t => {
        const s = (t.status || "To Do").toLowerCase();
        return s === "to do" || s === "todo" || s === "pending";
      }),
      inProgress: tasks.filter(t => (t.status || "").toLowerCase() === "in progress"),
      completed: tasks.filter(t => (t.status || "").toLowerCase() === "completed")
    };
  }, [tasks]);

  const renderColumn = (statusLabel, gradient, icon, columnTasks) => {
    return (
      <div style={{ flex: 1, minWidth: "320px", background: "rgba(255,255,255,0.01)", borderRadius: "16px", padding: "1.25rem", border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ 
          background: gradient, 
          padding: "1rem 1.25rem", 
          borderRadius: "12px", 
          color: "white", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 800, letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {icon} {statusLabel.toUpperCase()}
          </h3>
          <span style={{ background: "rgba(255,255,255,0.2)", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700 }}>
            {columnTasks.length}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", maxHeight: "70vh", paddingRight: "4px" }}>
          {columnTasks.map(t => (
            <div key={t.id} className="task-card" style={{ 
              margin: 0, 
              padding: "1.25rem", 
              background: "var(--white)", 
              borderRadius: "12px", 
              border: "1px solid var(--border-light)", 
              borderTop: `4px solid ${getPriorityColor(t.priority)}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "all 0.3s ease",
              position: "relative",
              opacity: (t.status || "").toLowerCase() === 'completed' ? 0.8 : 1
            }}>
              {editingId === t.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="input-text" style={{ padding: "0.5rem" }} />
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <select value={editPriority} onChange={e => setEditPriority(e.target.value)} className="input-text" style={{ padding: "0.4rem", fontSize: "0.8rem" }}>
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                    <select value={editDifficulty} onChange={e => setEditDifficulty(e.target.value)} className="input-text" style={{ padding: "0.4rem", fontSize: "0.8rem" }}>
                      <option value="Hard">Hard Level</option>
                      <option value="Medium">Medium Level</option>
                      <option value="Easy">Easy Level</option>
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <input type="text" value={editAssignee} onChange={e => setEditAssignee(e.target.value)} placeholder="Assignee" className="input-text" style={{ padding: "0.4rem", fontSize: "0.8rem" }} />
                    <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="input-text" style={{ padding: "0.4rem", fontSize: "0.8rem" }}>
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                    <button onClick={handleSaveEdit} className="btn-primary" style={{ flex: 1, padding: "0.5rem", fontSize: "0.8rem" }}>UPDATE</button>
                    <button onClick={() => setEditingId(null)} className="btn-primary" style={{ flex: 1, padding: "0.5rem", fontSize: "0.8rem", background: "transparent", color: "var(--text-main)", border: "1px solid var(--border-light)" }}>CANCEL</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                       <span style={{ fontSize: "0.6rem", background: `${getPriorityColor(t.priority)}20`, color: getPriorityColor(t.priority), padding: "0.15rem 0.5rem", borderRadius: "4px", fontWeight: 800 }}>{t.priority?.toUpperCase()}</span>
                       <span style={{ fontSize: "0.6rem", background: "var(--border-light)", color: "var(--text-muted)", padding: "0.15rem 0.5rem", borderRadius: "4px", fontWeight: 800 }}>{t.difficulty?.toUpperCase()}</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      <button onClick={() => handleEditClick(t)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.7rem", fontWeight: 600 }}>EDIT</button>
                      <button onClick={() => handleDelete(t.id)} style={{ background: "transparent", border: "none", color: "#e11d48", cursor: "pointer" }}><XIcon size={14} /></button>
                    </div>
                  </div>

                  <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem", color: "var(--primary)", fontWeight: 700, lineHeight: 1.4 }}>{t.task_name}</h4>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 900 }}>
                        {t.assigned_to?.charAt(0) || "?"}
                      </div>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)" }}>{t.assigned_to || "Unassigned"}</span>
                    </div>
                  </div>

                  {t.ai_rationale && (
                    <div style={{ marginBottom: "0.75rem" }}>
                       <button 
                        onClick={() => toggleRationale(t.id)} 
                        style={{ background: "transparent", border: "none", color: "var(--accent)", fontSize: "0.7rem", fontWeight: 800, padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                       >
                         <SparklesIcon size={12} /> {expandedRationale[t.id] ? "HIDE RATIONALE" : "VIEW AI RATIONALE"}
                       </button>
                       {expandedRationale[t.id] && (
                         <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.75rem", color: "var(--suggestion-text)", background: "var(--suggestion-bg)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--suggestion-border)", lineHeight: 1.5, animation: "reveal 0.3s ease-out" }}>
                           {t.ai_rationale}
                         </p>
                       )}
                    </div>
                  )}
                  
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                    {statusLabel !== "To Do" && (
                      <button onClick={() => handleStatusChange(t, statusLabel === "Completed" ? "In Progress" : "To Do")} style={{ flex: 1, padding: "0.5rem", fontSize: "0.7rem", borderRadius: "8px", border: "1px solid var(--border-light)", background: "#fff", cursor: "pointer", fontWeight: 700, color: "var(--text-muted)" }}>
                        &larr; BACK
                      </button>
                    )}
                    {statusLabel !== "Completed" && (
                      <button onClick={() => handleStatusChange(t, statusLabel === "To Do" ? "In Progress" : "Completed")} style={{ flex: 1, padding: "0.5rem", fontSize: "0.7rem", borderRadius: "8px", background: "var(--primary)", color: "white", cursor: "pointer", border: "none", fontWeight: 700 }}>
                        ADVANCE &rarr;
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
          {columnTasks.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)", fontSize: "0.85rem", border: "2px dashed var(--border-light)", borderRadius: "12px" }}>
              NO_TASKS_QUEUED
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ overflowX: "auto", background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
      <div style={{ display: "flex", gap: "1.5rem", minHeight: "500px", paddingBottom: "1rem" }}>
        {renderColumn("To Do", "linear-gradient(135deg, #64748b 0%, #475569 100%)", <AlertCircleIcon size={16} {...{}} />, tasksByStatus.todo)}
        {renderColumn("In Progress", "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", <SparklesIcon size={16} {...{}} />, tasksByStatus.inProgress)}
        {renderColumn("Completed", "linear-gradient(135deg, #10b981 0%, #047857 100%)", <CheckCircleIcon size={16} {...{}} />, tasksByStatus.completed)}
      </div>
    </div>
  );
}
