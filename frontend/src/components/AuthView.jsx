import { useState } from "react";

import { SunIcon, MoonIcon } from "./Icons";

export default function AuthView({ onLogin, theme, toggleTheme }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const handleSubmit = async (e) => {
    // ... (rest of handlesubmit unchanged)
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLogin ? "/api/v1/auth/login" : "/api/v1/auth/register";
    
    try {
      let body;
      let headers = { "Content-Type": "application/json" };

      if (isLogin) {
        body = new URLSearchParams();
        body.append("username", username);
        body.append("password", password);
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      } else {
        body = JSON.stringify({ username, password });
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers,
        body
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentication failed");

      if (isLogin) {
        localStorage.setItem("token", data.access_token);
        onLogin(data.access_token);
      } else {
        setIsLogin(true);
        setError("Account created. Please log in.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh",
      background: "var(--bg-color)",
      transition: "background 0.3s ease",
      overflow: "hidden"
    }}>
      {/* Left Branding Section (Split Screen) */}
      <div style={{ 
        flex: "1.2", 
        background: theme === 'light'
          ? "linear-gradient(135deg, #0a1f44 0%, #1f2a44 100%)"
          : "linear-gradient(135deg, #020617 0%, #1e1b4b 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "var(--space-xl)",
        color: "#fff",
        position: "relative",
        transition: "background 0.3s ease"
      }}>
        {/* Abstract Branding Shape */}
        <div style={{ position: "absolute", top: "10%", left: "-5%", width: "400px", height: "400px", background: "rgba(200, 169, 106, 0.05)", borderRadius: "50%", filter: "blur(100px)" }}></div>
        
        <div style={{ position: "relative", zIndex: 1, maxWidth: "500px", margin: "0 auto" }}>
          <div style={{ width: "80px", height: "80px", background: "var(--accent)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", fontWeight: 900, color: "#0a1f44", marginBottom: "var(--space-lg)", boxShadow: "0 0 30px rgba(200, 169, 106, 0.3)" }}>A</div>
          <h1 style={{ fontSize: "4rem", fontWeight: 900, margin: 0, letterSpacing: "-0.04em", lineHeight: 1 }}>PROPILOT</h1>
          <p style={{ fontSize: "1.25rem", color: "rgba(255,255,255,0.6)", marginTop: "var(--space-md)", lineHeight: 1.6 }}>
            The executive standard for predictive resource orchestration and team synchronization.
          </p>
          
          <div style={{ marginTop: "var(--space-xl)", display: "flex", gap: "var(--space-md)", opacity: 0.4 }}>
             <div style={{ height: "1px", flex: 1, background: "white" }}></div>
             <span style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em" }}>EST_2026</span>
             <div style={{ height: "1px", flex: 1, background: "white" }}></div>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div style={{ flex: "1", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "var(--space-lg)" }}>
        
        <button
          onClick={toggleTheme}
          style={{
            position: "absolute",
            top: "var(--space-lg)",
            right: "var(--space-lg)",
            background: "transparent",
            border: "1px solid var(--border-light)",
            borderRadius: "50%",
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--primary)",
            transition: "all 0.2s ease"
          }}
          title={theme === 'light' ? "Switch to Dark" : "Switch to Light"}
        >
          {theme === 'light' ? <MoonIcon size={20} /> : <SunIcon size={20} />}
        </button>

        <div className="glass-panel" style={{ width: "100%", maxWidth: "440px", padding: "var(--space-xl)", border: "none", boxShadow: "var(--shadow-lg)" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--primary)", marginBottom: "var(--space-xs)", letterSpacing: "-0.02em" }}>
            {isLogin ? "Welcome Back" : "Create Master Account"}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "var(--space-lg)" }}>
            Enter your credentials to access the central node.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--primary)", letterSpacing: "0.05em" }}>IDENTITY_TOKEN</label>
              <input
                type="text"
                className="input-text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--primary)", letterSpacing: "0.05em" }}>ACCESS_KEY</label>
              <input
                type="password"
                className="input-text"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && <div style={{ padding: "var(--space-sm)", background: "rgba(225, 29, 72, 0.05)", color: "#e11d48", fontSize: "0.85rem", borderRadius: "8px", fontWeight: 600, border: "1px solid rgba(225, 29, 72, 0.1)" }}>{error}</div>}
            
            <button type="submit" className="btn-primary" style={{ padding: "1.1rem", marginTop: "var(--space-sm)", fontSize: "0.9rem", fontWeight: 900, letterSpacing: "0.05em" }} disabled={loading}>
              {loading ? "AUTHENTICATING..." : (isLogin ? "AUTHORIZE_ACCESS" : "PROVISION_ACCOUNT")}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "var(--space-lg)", fontSize: "0.9rem", color: "var(--text-muted)" }}>
            {isLogin ? "Need a key? " : "Authorized? "}
            <span 
              onClick={() => setIsLogin(!isLogin)} 
              style={{ color: "var(--primary)", cursor: "pointer", fontWeight: "800", textDecoration: "underline" }}
            >
              {isLogin ? "Request Access" : "Secure Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
