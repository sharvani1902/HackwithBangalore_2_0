import { SunIcon, MoonIcon } from "./Icons";

export default function Header({ onLogout, theme, toggleTheme, view, setView }) {
  return (
    <nav style={{ 
      margin: "0", 
      padding: "1rem 3rem", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      background: theme === 'light' 
        ? "linear-gradient(135deg, #0a1f44 0%, #1f2a44 100%)" 
        : "linear-gradient(135deg, #020617 0%, #1e1b4b 100%)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      position: "sticky",
      top: "0",
      zIndex: 100,
      transition: "background 0.3s ease"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => setView("DASHBOARD")}>
        <div style={{ 
          width: "36px", 
          height: "36px", 
          background: "var(--accent)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0a1f44",
          fontWeight: "900",
          fontSize: "1.2rem",
          boxShadow: "0 0 15px rgba(200, 169, 106, 0.3)"
        }}>
          A
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1 style={{ fontSize: "1.1rem", color: "#ffffff", margin: 0, fontWeight: "800", letterSpacing: "0.02em" }}>
            PROPILOT
          </h1>
          <span style={{ fontSize: "0.6rem", color: "#c8a96a", fontWeight: "700", letterSpacing: "0.1em" }}>AI_PROJECT_MANAGER</span>
        </div>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
        <div style={{ display: "flex", gap: "2rem" }}>
          <span 
            onClick={() => setView("DASHBOARD")}
            style={{ 
              color: "#ffffff", 
              fontSize: "0.85rem", 
              fontWeight: "600", 
              cursor: "pointer",
              opacity: view === "DASHBOARD" ? 1 : 0.6,
              borderBottom: view === "DASHBOARD" ? "2px solid var(--accent)" : "none",
              paddingBottom: "4px",
              transition: "all 0.2s ease"
            }}
          >
            Dashboard
          </span>
          <span 
            onClick={() => setView("CALENDAR")}
            style={{ 
              color: "#ffffff", 
              fontSize: "0.85rem", 
              fontWeight: "600", 
              cursor: "pointer",
              opacity: view === "CALENDAR" ? 1 : 0.6,
              borderBottom: view === "CALENDAR" ? "2px solid var(--accent)" : "none",
              paddingBottom: "4px",
              transition: "all 0.2s ease"
            }}
          >
            Calendar
          </span>
          <span 
            onClick={() => setView("INTEGRATIONS")}
            style={{ 
              color: "#ffffff", 
              fontSize: "0.85rem", 
              fontWeight: "600", 
              cursor: "pointer",
              opacity: view === "INTEGRATIONS" ? 1 : 0.6,
              borderBottom: view === "INTEGRATIONS" ? "2px solid var(--accent)" : "none",
              paddingBottom: "4px",
              transition: "all 0.2s ease"
            }}
          >
            App Market
          </span>
          <span 
            onClick={() => setView("ANALYTICS")}
            style={{ 
              color: "#ffffff", 
              fontSize: "0.85rem", 
              fontWeight: "600", 
              cursor: "pointer",
              opacity: view === "ANALYTICS" ? 1 : 0.6,
              borderBottom: view === "ANALYTICS" ? "2px solid var(--accent)" : "none",
              paddingBottom: "4px",
              transition: "all 0.2s ease"
            }}
          >
            Reporting
          </span>
          <span 
            onClick={() => setView("HOW_IT_WORKS")}
            style={{ 
              color: "#ffffff", 
              fontSize: "0.85rem", 
              fontWeight: "600", 
              cursor: "pointer",
              opacity: view === "HOW_IT_WORKS" ? 1 : 0.6,
              borderBottom: view === "HOW_IT_WORKS" ? "2px solid var(--accent)" : "none",
              paddingBottom: "4px",
              transition: "all 0.2s ease"
            }}
          >
            How It Works
          </span>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={toggleTheme}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "white",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              e.currentTarget.style.transform = "rotate(15deg)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.transform = "rotate(0deg)";
            }}
            title={theme === 'light' ? "Switch to Dark" : "Switch to Light"}
          >
            {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
          </button>

          <button 
            onClick={onLogout}
            className="btn-primary"
            style={{ 
              background: "rgba(255,255,255,0.1)", 
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "0.6rem 1.25rem",
              fontSize: "0.8rem",
              boxShadow: "none"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
