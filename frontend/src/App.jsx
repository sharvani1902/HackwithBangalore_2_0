import { useState, useEffect } from "react";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import AuthView from "./components/AuthView";
import PremiumChat from "./components/PremiumChat";
import HowItWorks from "./components/HowItWorks";

import ActiveMeetingRoom from "./pages/ActiveMeetingRoom";
import MeetingDetailsPage from "./pages/MeetingDetailsPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import ReportingPage from "./pages/ReportingPage";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [view, setView] = useState("DASHBOARD"); 
  const [activeMeetingId, setActiveMeetingId] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken(null);
  };

  if (!token) {
    return <AuthView onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <>
      <Header 
        onLogout={handleLogout} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        view={view}
        setView={setView}
      />
      {view === "HOW_IT_WORKS" ? (
        <HowItWorks />
      ) : view === "CALENDAR" ? (
        <CalendarPage view={view} setView={setView} />
      ) : view === "ACTIVE_MEETING" ? (
        <ActiveMeetingRoom id={activeMeetingId} setView={setView} />
      ) : view === "MEETING_DETAILS" ? (
        <MeetingDetailsPage id={activeMeetingId} setView={setView} />
      ) : view === "INTEGRATIONS" ? (
        <IntegrationsPage setView={setView} />
      ) : view === "ANALYTICS" ? (
        <ReportingPage />
      ) : (
        <Dashboard view={view} setView={setView} setActiveMeetingId={setActiveMeetingId} />
      )}
      <PremiumChat />
    </>
  );
}

export default App;
