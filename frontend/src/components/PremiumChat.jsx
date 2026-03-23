import React, { useState, useEffect, useRef } from 'react';
import { MessageSquareIcon, XIcon, SparklesIcon, RobotIcon } from './Icons';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Quick action chips to surface all 6 required features
const QUICK_ACTIONS = [
  { label: "Project Status", query: "/project-status" },
  { label: "Bot Task", query: "/create-task Finish documentation" },
  { label: "Risk Report", query: "What are the biggest risks to our project velocity right now?" },
  { label: "Recall Memory", query: "What did we decide about the database architecture?" },
];

function ChatMessage({ m }) {
  // Enhanced markdown-like rendering for tables, bold, and bullets
  const renderContent = (text) => {
    // Handle very basic tables or bullet lists
    return text.split('\n').map((line, i) => {
      let content = line;
      // Bold
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullets
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return <li key={i} style={{ marginLeft: '1rem', marginBottom: '0.25rem' }} dangerouslySetInnerHTML={{ __html: content.substring(1).trim() }} />;
      }
      return (
        <p key={i} style={{ margin: '0 0 0.5rem 0' }} dangerouslySetInnerHTML={{ __html: content }} />
      );
    });
  };

  return (
    <div style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '90%' }}>
      <div style={{
        padding: '1rem 1.4rem',
        borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
        background: m.role === 'user' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : '#ffffff',
        color: m.role === 'user' ? '#f8fafc' : '#1e293b',
        fontSize: '0.92rem',
        lineHeight: 1.6,
        boxShadow: m.role === 'user' ? '0 10px 15px -3px rgba(15,23,42,0.2)' : '0 10px 15px -3px rgba(0,0,0,0.05)',
        border: m.role === 'ai' ? '1px solid #e2e8f0' : 'none',
        position: 'relative'
      }}>
        {renderContent(m.text)}
        {m.ref && (
          <div style={{ 
            marginTop: '0.8rem', 
            padding: '0.25rem 0.6rem', 
            background: m.role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)', 
            borderRadius: '4px', 
            fontSize: '0.65rem', 
            textTransform: 'uppercase',
            fontWeight: 800,
            letterSpacing: '0.05em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <SparklesIcon size={10} color={m.role === 'user' ? '#fff' : 'var(--accent)'} />
            {m.ref}
          </div>
        )}
      </div>
      <div style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600, padding: '0 8px' }}>
        {m.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}

export default function PremiumChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'ProPilot Assistant active.\n\nI can create tasks, log decisions, assign work, and provide progress updates. Use the quick actions below or type your query natively.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendQuery = async (query) => {
    if (!query.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text: query, timestamp: now }]);
    setInput('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      });

      if (!res.ok) throw new Error("Chat link failed");
      const data = await res.json();
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { role: 'ai', text: data.response, ref: data.context_ref, timestamp: aiTime }]);
    } catch (err) {
      const errTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { role: 'ai', text: "Connectivity friction detected. Please ensure the AI Brain is online at port 8000.", timestamp: errTime }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => sendQuery(input);

  return (
    <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 1000 }}>

      {/* Floating Toggle Button with pulse ring */}
      {!isOpen && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{
            position: 'absolute', inset: '-6px', borderRadius: '50%',
            background: 'var(--accent)', opacity: 0.25,
            animation: 'chatPulse 2s ease-in-out infinite'
          }} />
          <button
            onClick={() => setIsOpen(true)}
            style={{
              width: '64px', height: '64px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(200,169,106,0.4)',
              background: 'var(--accent)', color: '#0a1f44', border: 'none',
              cursor: 'pointer', transition: 'transform 0.2s',
              position: 'relative'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <MessageSquareIcon size={26} />
          </button>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div style={{
          width: '420px', height: '640px',
          display: 'flex', flexDirection: 'column',
          background: 'rgba(248, 249, 251, 0.98)',
          backdropFilter: 'blur(16px)',
          borderRadius: '20px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
          border: '1px solid rgba(200,169,106,0.25)',
          animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden'
        }}>

          {/* Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'linear-gradient(135deg, #0a1f44 0%, #1f2a44 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <RobotIcon color="#c8a96a" size={22} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.06em', color: '#fff' }}>PROPILOT_ASSISTANT</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>AI_PROJECT_MANAGER</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: '4px' }}>
              <XIcon size={18} />
            </button>
          </div>

          {/* Quick Actions */}
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', background: '#fff' }}>
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => sendQuery(action.query)}
                style={{
                  padding: '0.45rem 1rem', borderRadius: '20px',
                  border: '1px solid rgba(200,169,106,0.4)',
                  background: '#0a1f44',
                  color: '#ffffff', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.02em',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(10,31,68,0.15)'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#15336d'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = '#c8a96a'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#0a1f44'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(200,169,106,0.4)'; }}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {messages.map((m, i) => (
              <ChatMessage key={i} m={m} />
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '5px', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.9)', borderRadius: '18px 18px 18px 2px', border: '1px solid rgba(0,0,0,0.05)' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: '#0a1f44', opacity: 0.5,
                    animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: '1rem 1.25rem 1.25rem 1.25rem', background: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#f8f9fb', padding: '0.4rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                 onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200, 169, 106, 0.15)'; }}
                 onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && input.trim() && handleSend()}
                placeholder="Message ProPilot..."
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '12px',
                  border: 'none', background: 'transparent',
                  fontSize: '0.9rem', outline: 'none', color: '#0a1f44'
                }}
              />
              <button
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                style={{
                  padding: '0.7rem 1.2rem', borderRadius: '12px',
                  background: input.trim() ? '#0a1f44' : '#e2e8f0', 
                  color: input.trim() ? '#fff' : '#94a3b8', 
                  border: 'none', cursor: (isTyping || !input.trim()) ? 'default' : 'pointer',
                  fontSize: '0.85rem', fontWeight: 800,
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(24px) scale(0.96); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes chatPulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes fadeInBubble {
          from { transform: translateY(8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes dotBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
