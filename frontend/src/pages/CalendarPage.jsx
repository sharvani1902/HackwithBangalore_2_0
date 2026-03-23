import { useState, useEffect } from "react";
import { getMeetings } from "../services/api";
import CalendarGrid from "../components/calendar/CalendarGrid";
import MeetingEditor from "../components/calendar/MeetingEditor";
import { SparklesIcon } from "../components/Icons";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("MONTH"); // MONTH, WEEK
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [preselectedDate, setPreselectedDate] = useState(null);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      // Determine date range based on viewMode
      // For simplicity, we fetch all for now, but in production we'd scope this
      let start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      let end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const data = await getMeetings(start.toISOString(), end.toISOString());
      setMeetings(data);
    } catch (err) {
      console.error("[CalendarPage] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, viewMode]);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "MONTH") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "MONTH") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(newDate());
  };

  const openEditor = (meeting = null, date = null) => {
    setSelectedMeeting(meeting);
    setPreselectedDate(date);
    setEditorOpen(true);
  };

  const closeEditor = (refresh = false) => {
    setEditorOpen(false);
    setSelectedMeeting(null);
    setPreselectedDate(null);
    if (refresh) fetchCalendarData();
  };

  return (
    <main className="dashboard-container">
      <div className="glass-panel calendar-header" style={{ marginBottom: "var(--space-md)", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", marginBottom: "4px" }}>
              <SparklesIcon color="var(--accent)" size={16} />
              <span style={{ color: "var(--accent)", fontWeight: "700", fontSize: "0.7rem", letterSpacing: "0.15em" }}>ENTERPRISE SCHEDULING</span>
            </div>
            <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: "800", color: "var(--text)" }}>
              {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
            </h2>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div className="view-toggles" style={{ display: "flex", background: "rgba(0,0,0,0.1)", borderRadius: "8px", padding: "4px" }}>
            <button 
              onClick={() => setViewMode("MONTH")}
              style={{ background: viewMode === "MONTH" ? "var(--bg-card)" : "transparent", color: viewMode === "MONTH" ? "var(--text)" : "var(--text-muted)", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", transition: "all 0.2s" }}
            >
              Month
            </button>
            <button 
              onClick={() => setViewMode("WEEK")}
              style={{ background: viewMode === "WEEK" ? "var(--bg-card)" : "transparent", color: viewMode === "WEEK" ? "var(--text)" : "var(--text-muted)", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", transition: "all 0.2s" }}
            >
              Week
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={handlePrev} className="btn-secondary" style={{ padding: "0.5rem 1rem" }}>&larr;</button>
            <button onClick={() => setCurrentDate(new Date())} className="btn-secondary" style={{ padding: "0.5rem 1rem" }}>Today</button>
            <button onClick={handleNext} className="btn-secondary" style={{ padding: "0.5rem 1rem" }}>&rarr;</button>
          </div>

          <button onClick={() => openEditor()} className="btn-primary" style={{ padding: "0.75rem 1.5rem", fontWeight: "bold" }}>
            + New Meeting
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "0", overflow: "hidden" }}>
        <CalendarGrid 
          currentDate={currentDate} 
          viewMode={viewMode} 
          meetings={meetings} 
          onDateClick={(date) => openEditor(null, date)}
          onMeetingClick={(meeting) => openEditor(meeting)}
        />
      </div>

      {editorOpen && (
        <MeetingEditor 
          meeting={selectedMeeting} 
          preselectedDate={preselectedDate} 
          onClose={() => closeEditor()} 
          onSave={() => closeEditor(true)} 
        />
      )}
    </main>
  );
}
