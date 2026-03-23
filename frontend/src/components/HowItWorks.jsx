import React from 'react';
import { 
  RocketIcon, 
  SparklesIcon, 
  RobotIcon, 
  MessageSquareIcon, 
  TrendingUpIcon, 
  CheckCircleIcon 
} from './Icons';

export default function HowItWorks() {
  const features = [
    {
      icon: <RocketIcon size={24} color="var(--accent)" />,
      title: "Strategic Coordination",
      desc: "Synchronize your global workforce with elite role-based management and skill-mapped task distribution."
    },
    {
      icon: <TrendingUpIcon size={24} color="var(--accent)" />,
      title: "Predictive Analytics",
      desc: "Harness real-time velocity modeling to identify systemic bottlenecks and optimize project trajectory."
    },
    {
      icon: <CheckCircleIcon size={24} color="var(--accent)" />,
      title: "Active Compliance",
      desc: "Maintain absolute oversight with automated deadline categorization and real-time status synchronization."
    },
    {
      icon: <SparklesIcon size={24} color="var(--accent)" />,
      title: "Neural Intelligence",
      desc: "Leverage advanced LLM processing for automated meeting distillation and semantic project memory recall."
    }
  ];

  return (
    <main className="dashboard-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-xl) var(--space-md)' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 'var(--space-xs)', 
          background: 'rgba(200, 169, 106, 0.1)', 
          padding: '0.5rem 1rem', 
          borderRadius: '20px',
          marginBottom: 'var(--space-md)'
        }}>
          <SparklesIcon size={14} color="var(--accent)" />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2em', color: 'var(--accent)' }}>SYSTEM_PROTOCOL_v1.0</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 var(--space-xs) 0', color: 'var(--primary)' }}>
          Operational Intelligence
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
          ProPilot is an executive-grade AI orchestration layer designed for high-velocity teams who demand precision and real-time project synchronization.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid-2" style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        {features.map((f, i) => (
          <div key={i} className="glass-panel" style={{ padding: 'var(--space-lg)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ marginBottom: 'var(--space-md)' }}>{f.icon}</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 'var(--space-xs)', letterSpacing: '-0.01em' }}>
              {f.title.toUpperCase()}
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      {/* AI Terminal Section */}
      <div className="glass-panel" style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        border: 'none',
        padding: 'var(--space-xl)',
        color: '#fff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(200, 169, 106, 0.2)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <RobotIcon size={24} color="var(--accent)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--accent)' }}>ProPilot_Assistant</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>NEURAL_ORCHESTRATION_ACTIVE</p>
          </div>
        </div>

        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', marginBottom: 'var(--space-lg)', lineHeight: 1.6 }}>
          Interact with the underlying project structure using raw natural language queries. The AI layer actively updates the state of your workspace.
        </p>

        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          borderRadius: '12px', 
          padding: 'var(--space-lg)', 
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: 'var(--space-md)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 'var(--space-xs)' }}>
            // COMMON_AI_COMMANDS
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', lineHeight: 2, color: 'var(--accent)' }}>
            <li style={{ display: 'flex', gap: '1rem' }}><span style={{ color: 'rgba(255,255,255,0.4)' }}>&gt;</span> "Initialize task: Audit backend security for Q3"</li>
            <li style={{ display: 'flex', gap: '1rem' }}><span style={{ color: 'rgba(255,255,255,0.4)' }}>&gt;</span> "Assign critical security task to Senior Analyst Alice"</li>
            <li style={{ display: 'flex', gap: '1rem' }}><span style={{ color: 'rgba(255,255,255,0.4)' }}>&gt;</span> "Recall memory: Strategic decisions regarding SQL migration"</li>
            <li style={{ display: 'flex', gap: '1rem' }}><span style={{ color: 'rgba(255,255,255,0.4)' }}>&gt;</span> "Summarize technical meeting and extract TODOs"</li>
            <li style={{ display: 'flex', gap: '1rem' }}><span style={{ color: 'rgba(255,255,255,0.4)' }}>&gt;</span> "Analyze current velocity and identify project risks"</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
