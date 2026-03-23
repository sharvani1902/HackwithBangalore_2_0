import React, { useState, useEffect } from 'react';
import { 
    getMeeting, 
    getMeetingTranscript, 
    getMeetingSummaryAI, 
    generateMeetingSummaryAI 
} from '../services/api';

export default function MeetingDetailsPage({ id, setView }) {
    const [meeting, setMeeting] = useState(null);
    const [transcript, setTranscript] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [mData, tData, sData] = await Promise.all([
                getMeeting(id),
                getMeetingTranscript(id).catch(() => []),
                getMeetingSummaryAI(id).catch(() => null)
            ]);
            setMeeting(mData);
            setTranscript(tData);
            setSummary(sData);
        } catch (error) {
            console.error("Failed to load meeting details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSummary = async () => {
        if (transcript.length === 0) {
            alert("No transcript available to summarize.");
            return;
        }

        try {
            setGenerating(true);
            const sData = await generateMeetingSummaryAI(id);
            setSummary(sData);
        } catch (error) {
            console.error("Summary generation failed:", error);
            alert("Failed to generate AI Summary. Please ensure the backend Llama3 model is running.");
        } finally {
            setGenerating(false);
        }
    };

    if (loading || !meeting) {
        return <div className="dashboard-container"><div className="shimmer glass-panel" style={{height: "60vh"}}></div></div>;
    }

    return (
        <div className="dashboard-container">
            <button onClick={() => setView('DASHBOARD')} className="btn-secondary" style={{ marginBottom: "1rem", alignSelf: "flex-start" }}>
                ← Back to Dashboard
            </button>

            <div className="glass-panel" style={{ padding: "0" }}>
                <div style={{ padding: "2rem", borderBottom: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <h1 style={{ margin: "0 0 0.5rem 0", color: "var(--primary)", fontSize: "2rem" }}>
                                {meeting.title}
                            </h1>
                            <p style={{ margin: 0, color: "var(--text-muted)" }}>
                                {new Date(meeting.start_time).toLocaleString()} • {meeting.participants?.join(", ")}
                            </p>
                        </div>
                        {meeting.outlook_event_id && (
                            <span className="meeting-badge" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                                Synced with Outlook
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {/* Left Column: AI Summary */}
                    <div style={{ flex: "1 1 60%", padding: "2rem", borderRight: "1px solid var(--border-light)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)" }}>
                                Meeting Intelligence
                            </h2>
                            {!summary && (
                                <button 
                                    onClick={handleGenerateSummary} 
                                    disabled={generating}
                                    className="btn-primary" 
                                    style={{ background: "var(--accent)", color: "var(--white)" }}
                                >
                                    {generating ? "Brainstorming..." : "Generate AI Summary"}
                                </button>
                            )}
                        </div>

                        {!summary ? (
                            <div style={{ padding: "3rem", textAlign: "center", background: "var(--bg-color)", borderRadius: "12px", border: "1px dashed var(--border-light)" }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.2 }}>MIND_SCAN</div>
                                <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--text-main)" }}>No AI Summary Yet</h3>
                                <p style={{ margin: 0, color: "var(--text-muted)" }}>
                                    Click “Generate AI Summary” to process the raw transcript and extract action items natively via ProPilot OpenClaw.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                <div className="stat-box highlight">
                                    <h3 style={{ color: "var(--accent)" }}>Executive Overview</h3>
                                    <p style={{ margin: 0, lineHeight: 1.6 }}>{summary.overview}</p>
                                </div>

                                <div className="grid-2">
                                    <div className="stat-box">
                                        <h3>Key Points</h3>
                                        <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.6 }}>
                                            {summary.key_points.map((pt, i) => <li key={i}>{pt}</li>)}
                                        </ul>
                                    </div>
                                    <div className="stat-box">
                                        <h3>Next Steps</h3>
                                        <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.6 }}>
                                            {summary.next_steps.map((st, i) => <li key={i}>{st}</li>)}
                                        </ul>
                                    </div>
                                </div>

                                {summary.action_items && summary.action_items.length > 0 && (
                                    <div className="stat-box" style={{ borderTopColor: "#ff4b4b" }}>
                                        <h3 style={{ color: "#ff4b4b" }}>Allocated Action Items</h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
                                            {summary.action_items.map((item, i) => (
                                                <div key={i} style={{ padding: "0.75rem", background: "var(--bg-color)", borderRadius: "8px", display: "flex", justifyContent: "space-between", borderLeft: "3px solid #ff4b4b" }}>
                                                    <span>{typeof item === 'object' ? item.task : item}</span>
                                                    {typeof item === 'object' && item.assignee && (
                                                        <span style={{ fontSize: "0.8rem", background: "rgba(0,0,0,0.05)", padding: "2px 8px", borderRadius: "12px", fontWeight: "bold" }}>
                                                            {item.assignee}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Original Transcript */}
                    <div style={{ flex: "1 1 35%", padding: "2rem", background: "var(--bg-color)" }}>
                        <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "1.1rem", color: "var(--secondary)" }}>
                            Raw Transcript ({transcript.length} lines)
                        </h2>
                        
                        <div style={{ 
                            height: "600px", overflowY: "auto", paddingRight: "1rem",
                            display: "flex", flexDirection: "column", gap: "1rem"
                        }}>
                            {transcript.length === 0 ? (
                                <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No dialogue was recorded for this meeting.</p>
                            ) : (
                                transcript.map((line, i) => {
                                    const tDate = new Date(line.timestamp);
                                    const timeStr = tDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                    return (
                                        <div key={i} style={{ background: "var(--white)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-light)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.8rem" }}>
                                                <strong style={{ color: "var(--primary)" }}>{line.speaker}</strong>
                                                <span style={{ color: "var(--text-muted)" }}>{timeStr}</span>
                                            </div>
                                            <div style={{ color: "var(--text-main)", lineHeight: 1.5 }}>
                                                {line.text}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
