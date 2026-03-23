import React, { useState, useEffect, useCallback } from 'react';
import { getIntegrations, getUserIntegrations, connectIntegration, disconnectIntegration } from '../services/api';
import { SparklesIcon, XIcon, MicrosoftIcon, GithubIcon, TrelloIcon, ZoomIcon } from '../components/Icons';

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState([]);
    const [userIntegrations, setUserIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [all, user] = await Promise.all([getIntegrations(), getUserIntegrations()]);
            setIntegrations(all);
            setUserIntegrations(user);
        } catch (err) {
            console.error("[Integrations] Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const isConnected = (id) => {
        const ui = userIntegrations.find(ui => ui.integration_id === id);
        return ui && ui.is_connected;
    };

    const handleToggle = async (integration) => {
        try {
            console.log(`[Integrations] Toggling ${integration.name}...`);
            if (isConnected(integration.id)) {
                await disconnectIntegration(integration.id);
            } else {
                await connectIntegration(integration.id);
            }
            fetchData();
        } catch (err) {
            alert("Action failed: " + err.message);
        }
    };

    if (loading) return (
        <div className="dashboard-container">
            <div className="glass-panel shimmer" style={{ height: '300px' }}></div>
        </div>
    );

    return (
        <div className="dashboard-container" style={{ animation: 'reveal 0.5s ease-out' }}>
            <header style={{ marginBottom: 'var(--space-xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>CENTRAL_HUB</span>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>App Marketplace</h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px' }}>
                    Connect ProPilot with your enterprise stack to unify mission intelligence and workflow automation.
                </p>
            </header>

            <div className="grid-3" style={{ gap: 'var(--space-md)' }}>
                {integrations.map(app => (
                    <div key={app.id} className="glass-panel" style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        textAlign: 'center', 
                        padding: 'var(--space-lg)',
                        position: 'relative',
                        transition: 'transform 0.3s ease'
                    }}>
                        <div style={{ 
                            width: '80px', height: '80px', 
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)', 
                            borderRadius: '24px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            marginBottom: 'var(--space-md)', 
                            border: '1px solid var(--border-light)',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ color: 'var(--text-main)' }}>
                                {app.slug === 'ms365' && <MicrosoftIcon size={40} color="#00a4ef" />}
                                {app.slug === 'github' && <GithubIcon size={40} color="var(--text-main)" />}
                                {app.slug === 'trello' && <TrelloIcon size={40} color="#0079bf" />}
                                {app.slug === 'zoom' && <ZoomIcon size={40} color="#2d8cf0" />}
                            </div>
                        </div>
                        
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0' }}>{app.name}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 'var(--space-lg)', flexGrow: 1 }}>{app.description}</p>
                        
                        <div style={{ width: '100%', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ 
                                    width: '8px', height: '8px', borderRadius: '50%', 
                                    background: isConnected(app.id) ? '#10b981' : 'var(--border-light)',
                                    boxShadow: isConnected(app.id) ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
                                }}></div>
                                <span style={{ fontSize: '10px', fontWeight: 800, color: isConnected(app.id) ? '#10b981' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                                    {isConnected(app.id) ? 'Active' : 'Offline'}
                                </span>
                            </div>
                            <button 
                                onClick={() => handleToggle(app)}
                                className={isConnected(app.id) ? "" : "btn-primary"}
                                style={isConnected(app.id) ? {
                                    background: 'rgba(239, 68, 68, 0.05)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                } : { padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
                            >
                                {isConnected(app.id) ? 'Disconnect' : 'Connect Now'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-panel" style={{ 
                marginTop: 'var(--space-xl)', 
                padding: 'var(--space-xl)', 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '24px'
            }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 4px 0' }}>Request Custom Integration</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Missing a critical tool? Our engineers can build custom connectors for your enterprise stack.</p>
                </div>
                <button className="btn-primary" style={{ background: 'var(--accent)', color: 'white', whiteSpace: 'nowrap' }}>
                    <SparklesIcon size={16} /> Submit Protocol
                </button>
            </div>
        </div>
    );
}
