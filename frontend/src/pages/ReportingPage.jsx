import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getReports } from '../services/api';
import { TrendingUpIcon, AlertTriangleIcon, ActivityIcon, CheckCircleIcon } from '../components/Icons';

export default function ReportingPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getReports();
      if (res.success) {
        setReportData(res);
      } else {
        throw new Error("Failed to load report data");
      }
    } catch (err) {
      console.error("[ReportingPage] Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const velocityData = useMemo(() => {
    if (!reportData) return [];
    const velocityObj = reportData.data.find(d => d.type === 'velocity');
    return velocityObj ? velocityObj.points : [];
  }, [reportData]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="shimmer" style={{ height: '100px', marginBottom: '2rem' }}></div>
        <div className="grid-2">
           <div className="shimmer" style={{ height: '300px' }}></div>
           <div className="shimmer" style={{ height: '300px' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container text-center py-20">
        <div className="mb-4" style={{ color: '#ef4444' }}>
          <AlertTriangleIcon size={64} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Reporting Engine Offline</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button onClick={fetchReport} className="btn-primary">Retry Telemetry Sync</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container animate-in fade-in duration-500">
      <header style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <ActivityIcon color="var(--accent)" size={32} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.03em' }}>System Reports</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Real-time project velocity and team performance metrics.</p>
      </header>

      {/* Summary Stats */}
      <div className="grid-3" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="glass-panel" style={{ borderLeft: '4px solid #3b82f6', padding: 'var(--space-md)' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Completion Rate</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{reportData.summary.completion_rate}%</div>
          <p style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: 700, marginTop: '8px' }}>Overall project health</p>
        </div>
        <div className="glass-panel" style={{ borderLeft: '4px solid #8b5cf6', padding: 'var(--space-md)' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Total Tasks</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{reportData.summary.total_tasks}</div>
          <p style={{ color: '#8b5cf6', fontSize: '0.75rem', fontWeight: 700, marginTop: '8px' }}>Aggregated work items</p>
        </div>
        <div className="glass-panel" style={{ borderLeft: '4px solid #f59e0b', padding: 'var(--space-md)' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Active Members</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{reportData.summary.active_members}</div>
          <p style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, marginTop: '8px' }}>Synchronized contributors</p>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 'var(--space-lg)' }}>
        {/* Velocity Chart */}
        <div className="glass-panel" style={{ padding: 'var(--space-lg)' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <TrendingUpIcon size={18} /> Weekly Velocity
          </h3>
          <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '0 8px' }}>
            {velocityData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{ 
                    width: '100%', 
                    background: 'linear-gradient(to top, var(--primary), #3b82f6)', 
                    borderRadius: '8px 8px 0 0', 
                    transition: 'all 0.3s ease',
                    height: `${(d.value / (Math.max(...velocityData.map(v => v.value), 1))) * 100}%`, 
                    minHeight: '4px',
                    cursor: 'pointer'
                  }}
                  className="velocity-bar"
                >
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Intelligence Feed */}
        <div className="glass-panel" style={{ padding: 'var(--space-lg)', border: '1px solid rgba(200, 169, 106, 0.2)' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <LayersIcon size={18} /> Intelligence Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div className="insight-card" style={{ background: 'var(--suggestion-bg)', border: '1px solid var(--suggestion-border)' }}>
                <div style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center' }}>
                   <ActivityIcon size={24} />
                </div>
                <div>
                   <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Optimization Suggestion</p>
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', margin: 0 }}>Increasing backend resources by 20% on Mondays could reduce friction based on historical trends.</p>
                </div>
             </div>
             <div className="insight-card" style={{ background: 'var(--suggestion-bg)', border: '1px solid var(--suggestion-border)' }}>
                <div style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center' }}>
                   <TrendingUpIcon size={24} />
                </div>
                <div>
                   <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Efficiency Metric</p>
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', margin: 0 }}>Team velocity is currently 12% above quarterly baseline. Peak performance detected in UI/UX sprint.</p>
                </div>
             </div>
             <div className="insight-card" style={{ background: 'var(--suggestion-bg)', border: '1px solid var(--suggestion-border)' }}>
                <div style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center' }}>
                   <SparklesIcon size={24} />
                </div>
                <div>
                   <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Automation Impact</p>
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', margin: 0 }}>Workflow protocols have saved approximately 4.5 man-hours this week through auto-assignment.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
