import { useEffect, useState } from "react";
import { getInsights, seedDemoData } from "../services/api";
import TeamManager from "../components/TeamManager";
import TaskAssigner from "../components/TaskAssigner";
import TaskList from "../components/TaskList";
import Insights from "../components/Insights";
import HistoryTimeline from "../components/HistoryTimeline";
import AnalyticsView from "../components/AnalyticsView";
import MeetingSummaryTool from "../components/MeetingSummaryTool";
import DeadlineReminders from "../components/DeadlineReminders";
import UpcomingMeetings from "../components/calendar/UpcomingMeetings";
import MeetingIntelligenceSearch from "../components/MeetingIntelligenceSearch";
import AutomationBuilder from "../components/AutomationBuilder";
import DecisionsPanel from "../components/DecisionsPanel";
import { RocketIcon, SparklesIcon } from "../components/Icons";
import { io } from "socket.io-client";

export default function Dashboard({ view, setView, setActiveMeetingId }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Real-time Socket Nexus Integration
  useEffect(() => {
    const socket = io("http://127.0.0.1:4000");

    socket.on("connect", () => {
      console.log("[SocketNexus] Dashboard synchronized.");
    });

    socket.on("TASK_UPDATED", (data) => {
      console.log("[SocketNexus] Real-time task update received:", data.reason);
      notifyChange();
    });

    return () => socket.disconnect();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getInsights();
      setInsights(data);
    } catch (err) {
      console.error("[Dashboard] Fetch error:", err);
      // If unauthorized, we might want to redirect, but for now just clear insights
      setInsights(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const handleSeed = async () => {
    await seedDemoData();
    notifyChange();
  };

  const handleAnalyze = () => {
    setView("ANALYTICS");
  };

  const notifyChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading && !insights) {
    return (
      <main className="dashboard-container">
        <div className="stat-box shimmer" style={{ height: "120px" }}></div>
        <div className="grid-2">
          <div className="stat-box shimmer" style={{ height: "240px" }}></div>
          <div className="stat-box shimmer" style={{ height: "240px" }}></div>
        </div>
      </main>
    );
  }

  if (!insights) {
    return (
      <main className="dashboard-container">
        <div className="glass-panel" style={{ borderLeft: "5px solid #dc2626" }}>
          <h2 className="section-title">INTELLIGENCE_LAYER_OFFLINE</h2>
          <p style={{ color: "var(--text-muted)" }}>
            The AI engine at port 8000 is unreachable or your session has expired. 
            Please ensure the backend is active and you are authenticated.
          </p>
          <button onClick={() => {
            localStorage.removeItem("token");
            window.location.reload();
          }} className="btn-primary" style={{ marginTop: "1rem" }}>CLEAR_SESSION_&_RETRY</button>
        </div>
      </main>
    );
  }

  if (view === "ANALYTICS") {
    return (
      <>
        <AnalyticsView data={insights} />
        <div className="dashboard-container" style={{ paddingTop: 0 }}>
          <DecisionsPanel />
        </div>
      </>
    );
  }

  return (
    <main className="dashboard-container">
      {/* Elite Hero Banner */}
      <div className="glass-panel" style={{ 
        background: "linear-gradient(135deg, #0a1f44 0%, #1f2a44 100%)", 
        color: "#fff", 
        border: "none",
        padding: "var(--space-xl)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "-50px", right: "-54px", width: "240px", height: "240px", background: "rgba(200, 169, 106, 0.12)", filter: "blur(60px)", borderRadius: "50%" }}></div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", marginBottom: "var(--space-sm)" }}>
               <SparklesIcon color="var(--accent)" size={20} />
               <span style={{ color: "var(--accent)", fontWeight: "700", fontSize: "0.75rem", letterSpacing: "0.2em" }}>SYSTEM_INTELLIGENCE_ACTIVE</span>
            </div>
            <h2 style={{ margin: 0, color: "#fff", fontSize: "2.5rem", fontWeight: "900", letterSpacing: "-0.03em" }}>
              AI Learning Insights
            </h2>
            <p style={{ margin: "var(--space-sm) 0 0 0", color: "rgba(255,255,255,0.7)", fontSize: "1.1rem", lineHeight: 1.6, maxWidth: "600px" }}>
              Harness predictive modeling to synchronize team velocity and eliminate resource friction.
            </p>
          </div>
          
          <button className="btn-primary" onClick={insights?.stats?.total_completed === 0 ? handleSeed : handleAnalyze} style={{ background: "var(--accent)", color: "#0a1f44", border: "none", padding: "1.1rem 2.5rem", fontWeight: "900", fontSize: "0.85rem", letterSpacing: "0.05em" }}>
            {insights?.stats?.total_completed === 0 ? "INITIALIZE_PILOT" : "ANALYZE NOW"}
          </button>
        </div>
      </div>

      <MeetingIntelligenceSearch setView={setView} setActiveMeetingId={setActiveMeetingId} />

      <div style={{ marginBottom: "var(--space-md)" }}>
        <AutomationBuilder />
      </div>

      {/* Main Content Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)", alignItems: "start", marginBottom: "var(--space-md)" }}>
        
        {/* Left Column - AI Tools & Creation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <MeetingSummaryTool onTasksCreated={notifyChange} />
          <TaskAssigner onTaskAdded={notifyChange} />
        </div>

        {/* Right Column - Alerts & Activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <UpcomingMeetings refreshTrigger={refreshKey} setView={setView} setActiveMeetingId={setActiveMeetingId} />
          <DeadlineReminders refreshTrigger={refreshKey} />
          <TeamManager onMemberAdded={notifyChange} />
          <HistoryTimeline />
        </div>

      </div>

      <TaskList refreshTrigger={refreshKey} onTaskCompleted={notifyChange} />
    </main>
  );
}
