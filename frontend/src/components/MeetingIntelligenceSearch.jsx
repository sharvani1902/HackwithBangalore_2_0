import React, { useState } from 'react';
import { searchMeetingIntelligence } from '../services/api';

export default function MeetingIntelligenceSearch({ setView, setActiveMeetingId }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState(null);
    const [searching, setSearching] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        
        try {
            setSearching(true);
            const data = await searchMeetingIntelligence(query);
            setResults(data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "var(--space-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)" }}>
                    Intelligent Meeting Search
                </h2>
            </div>
            
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem" }}>
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder='e.g. "deployment issues" or "budget"'
                    className="input-field"
                    style={{ flex: 1, padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border-light)", background: "var(--bg-color)", color: "var(--text-main)" }}
                />
                <button type="submit" disabled={searching} className="btn-primary" style={{ background: "var(--accent)" }}>
                    {searching ? "Searching..." : "Search"}
                </button>
            </form>

            {results && (
                <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    
                    {/* Summary Matches */}
                    {results.summary_matches?.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Decision & Summary Hits</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {results.summary_matches.map((s, i) => (
                                    <div key={i} style={{ padding: "0.75rem", background: "rgba(200, 169, 106, 0.05)", borderLeft: "3px solid var(--accent)", borderRadius: "6px" }}>
                                        <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>{s.overview}</p>
                                        <button 
                                            onClick={() => { setActiveMeetingId(s.meeting_id); setView("MEETING_DETAILS"); }}
                                            style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold", padding: 0 }}
                                        >
                                            View Meeting →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Transcript Matches */}
                    {results.transcript_matches?.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Transcript Quotes</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {results.transcript_matches.map((t, i) => (
                                    <div key={i} style={{ padding: "0.75rem", background: "var(--bg-color)", borderLeft: "3px solid var(--primary)", borderRadius: "6px" }}>
                                        <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", fontStyle: "italic" }}>"{t.text}"</p>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>— {t.speaker}</span>
                                            <button 
                                                onClick={() => { setActiveMeetingId(t.meeting_id); setView("MEETING_DETAILS"); }}
                                                style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold", padding: 0 }}
                                            >
                                                Jump to Context →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.summary_matches?.length === 0 && results.transcript_matches?.length === 0 && (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>
                            No intelligent matches discovered for your query.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
