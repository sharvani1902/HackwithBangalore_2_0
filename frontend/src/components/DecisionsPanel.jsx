import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './Icons';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const CATEGORY_COLORS = {
  Architecture: '#4F86C6',
  Process: '#059669',
  Hiring: '#b45309',
  General: '#6b7280',
};

export default function DecisionsPanel() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', decided_by: '', category: 'General' });
  const [saving, setSaving] = useState(false);

  const fetchDecisions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/v1/decisions/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setDecisions(await res.json());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDecisions(); }, []);

  const handleLog = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content || !form.decided_by) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/v1/decisions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ title: '', content: '', decided_by: '', category: 'General' });
        setShowForm(false);
        fetchDecisions();
      }
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/api/v1/decisions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setDecisions(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 className="section-title">
          <SparklesIcon size={16} color="var(--accent)" /> DECISION_MEMORY_LOG
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.78rem' }}
        >
          {showForm ? 'Cancel' : '+ LOG DECISION'}
        </button>
      </div>

      {/* Log Form */}
      {showForm && (
        <form onSubmit={handleLog} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', padding: '1.25rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px dashed var(--accent)' }}>
          <input className="input-text" placeholder="Decision title..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          <textarea className="input-text" placeholder="Full decision description..." rows={3} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} required style={{ resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input className="input-text" placeholder="Decided by (name)..." value={form.decided_by} onChange={e => setForm(p => ({ ...p, decided_by: e.target.value }))} required style={{ flex: 1 }} />
            <select className="input-text" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ flex: 1 }}>
              {['General', 'Architecture', 'Process', 'Hiring'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={saving} style={{ alignSelf: 'flex-end', padding: '0.6rem 1.5rem' }}>
            {saving ? 'Saving...' : 'LOG_DECISION'}
          </button>
        </form>
      )}

      {/* Decision Cards */}
      {loading ? (
        <div className="shimmer" style={{ height: '120px', borderRadius: '12px' }} />
      ) : decisions.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
          No decisions logged yet. Team knowledge will appear here.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {decisions.map((d) => (
            <div key={d.id} style={{ padding: '1rem 1.25rem', borderRadius: '10px', background: '#fff', border: '1px solid var(--border-light)', borderLeft: `4px solid ${CATEGORY_COLORS[d.category] || '#6b7280'}`, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>{d.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem', lineHeight: 1.5 }}>{d.content}</div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <span style={{ background: 'rgba(0,0,0,0.04)', padding: '2px 8px', borderRadius: '20px', marginRight: '0.5rem' }}>{d.category}</span>
                    {d.decided_by} · {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(d.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1rem', opacity: 0.4, padding: '0 4px' }}
                  title="Remove decision"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
