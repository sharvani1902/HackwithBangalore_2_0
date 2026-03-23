import React, { useState, useEffect } from 'react';
import { getMeetings } from '../../services/api';

export default function UpcomingMeetings({ refreshTrigger, setView, setActiveMeetingId }) {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpcoming = async () => {
            try {
                setLoading(true);
                const data = await getMeetings();
                const now = new Date();
                
                // Filter upcoming
                const upcoming = data
                    .filter(m => new Date(m.start_time) > now)
                    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
                
                setMeetings(upcoming.slice(0, 5));
            } catch (err) {
                console.error("Failed to load upcoming meetings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUpcoming();
    }, [refreshTrigger]);

    // Reminder Logic
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            meetings.forEach(m => {
                const startTime = new Date(m.start_time);
                const diffMs = startTime - now;
                const diffMins = Math.floor(diffMs / 60000);
                
                if (m.reminder_time > 0 && diffMins === m.reminder_time) {
                    if (Notification.permission === "granted") {
                        new Notification(`Reminder: ${m.title}`, { body: `Starts in ${m.reminder_time} minutes.` });
                    } else {
                        // For demonstration without permissions
                        alert(`UPCOMING MEETING: ${m.title} starts in ${m.reminder_time} minutes!`);
                    }
                }
            });
        };

        // Request notification permission if available
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }

        const interval = setInterval(checkReminders, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [meetings]);

    if (loading) {
        return <div className="stat-box shimmer" style={{ height: "200px" }}></div>;
    }

    return (
        <div className="glass-panel" style={{ padding: "1.25rem" }}>
            <h2 className="section-title" style={{ fontSize: "1rem" }}>Upcoming Meetings</h2>
            {meetings.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>No upcoming scheduled meetings.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {meetings.map((m) => {
                        const mDate = new Date(m.start_time);
                        const isToday = mDate.toDateString() === new Date().toDateString();
                        const timeStr = mDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                            <div key={m.id} style={{ 
                                padding: "0.75rem", 
                                background: "var(--bg-color)", 
                                borderRadius: "8px",
                                borderLeft: "3px solid var(--accent)"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h4 style={{ margin: 0, fontSize: "0.9rem", color: "var(--primary)" }}>{m.title}</h4>
                                    <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)", background: "rgba(0,0,0,0.05)", padding: "2px 6px", borderRadius: "10px" }}>
                                        {isToday ? "Today" : mDate.toLocaleDateString([], { month: "short", day: "numeric" })}
                                    </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem" }}>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                        {timeStr}
                                    </div>
                                    <button 
                                        onClick={() => { setActiveMeetingId(m.id); setView("ACTIVE_MEETING"); }}
                                        style={{
                                            background: "rgba(200, 169, 106, 0.15)", border: "none", color: "var(--accent)",
                                            padding: "4px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "bold",
                                            cursor: "pointer", transition: "all 0.2s"
                                        }}
                                        onMouseOver={(e) => { e.target.style.background = "var(--accent)"; e.target.style.color = "#fff"; }}
                                        onMouseOut={(e) => { e.target.style.background = "rgba(200, 169, 106, 0.15)"; e.target.style.color = "var(--accent)"; }}
                                    >
                                        JOIN
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
