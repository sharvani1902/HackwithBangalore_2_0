import { useState, useEffect } from "react";
import { getTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember } from "../services/api";
import { CheckCircleIcon, XIcon } from "./Icons";

export default function TeamManager({ onMemberAdded }) {
  const [members, setMembers] = useState([]);
  const [newName, setNewName] = useState("");
  const [skills, setSkills] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [adding, setAdding] = useState(false);

  const loadMembers = async () => {
    try {
      const data = await getTeamMembers();
      setMembers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    try {
      setError(null);
      setSuccess(null);
      setAdding(true);
      
      const payload = { name: newName.trim(), skills: skills.trim() || "Generalist" };
      
      if (editingId) {
        await updateTeamMember(editingId, payload);
        setSuccess("Resource Updated");
      } else {
        await addTeamMember(payload);
        setSuccess("Resource Provisioned");
      }
      
      setNewName("");
      setSkills("");
      setEditingId(null);
      await loadMembers();
      
      setTimeout(() => setSuccess(null), 3000);
      
      if (onMemberAdded) onMemberAdded();
    } catch (err) {
      setError(editingId ? "Failed to update resource." : "Failed to register resource.");
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = (m) => {
    setEditingId(m.id);
    setNewName(m.name);
    setSkills(m.skills);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this team member?")) return;
    try {
      await deleteTeamMember(id);
      await loadMembers();
      setSuccess("Resource Removed");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to remove resource.");
    }
  };

  return (
    <div className="glass-panel">
      <h2 className="section-title">Team Composition</h2>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <input 
            type="text" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            placeholder="Full Name"
            className="input-text"
            style={{ flex: 1 }}
          />
          <input 
            type="text" 
            value={skills} 
            onChange={(e) => setSkills(e.target.value)} 
            placeholder="Key Specialization / Role"
            className="input-text"
            style={{ flex: 1 }}
          />
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button type="submit" className="btn-primary" disabled={!newName.trim() || adding} style={{ background: "var(--primary-light)", flex: 1 }}>
            {adding ? (editingId ? "Updating..." : "Provisioning...") : (editingId ? "Update Resource" : "Add to Roster")}
          </button>
          {editingId && (
            <button 
              type="button" 
              onClick={() => { setEditingId(null); setNewName(""); setSkills(""); }}
              className="btn-primary" 
              style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--border-light)" }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      {error && <p style={{ color: "#e11d48", fontSize: "0.85rem", fontWeight: 600 }}>{error}</p>}
      {success && <p className="success-msg" style={{ color: "#059669" }}><CheckCircleIcon size={14} /> {success}</p>}
      
      <div style={{ maxHeight: "300px", overflowY: "auto", marginTop: "1.5rem" }}>
        {members.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Inventory currently empty.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {members.map((m) => (
              <li key={m.id} className="member-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid var(--border-light)" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "var(--primary)", fontWeight: "700" }}>{m.name}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: "800", textTransform: "uppercase" }}>{m.skills}</span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <button onClick={() => handleEdit(m)} style={{ background: "transparent", border: "none", color: "var(--primary-light)", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(m.id)} style={{ background: "transparent", border: "none", color: "#e11d48", cursor: "pointer" }}>
                    <XIcon size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
