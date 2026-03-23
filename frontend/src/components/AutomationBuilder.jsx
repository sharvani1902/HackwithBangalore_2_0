import React, { useState, useEffect } from 'react';
import { getAutomations, createAutomation, toggleAutomation } from '../services/api';

export default function AutomationBuilder() {
    const [rules, setRules] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newRule, setNewRule] = useState({ 
        trigger: 'TASK_COMPLETED', 
        action: 'CHAT_NOTIFY', 
        message: 'Automation Protocol: Task {{task_name}} was completed by {{assignee}}!' 
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const data = await getAutomations();
            setRules(data);
        } catch (err) { 
            console.error(err); 
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        try {
            console.log("[AutomationBuilder] Creating rule:", newRule);
            const config = { 
                message: newRule.action === 'CHAT_NOTIFY' ? newRule.message : undefined,
                task_name: newRule.action === 'CREATE_TASK' ? newRule.message : "Follow-up Task for {{task_name}}" 
            };

            await createAutomation({
                trigger_type: newRule.trigger,
                action_type: newRule.action,
                config: JSON.stringify(config),
                is_active: true
            });
            setShowAdd(false);
            fetchRules();
        } catch (err) { 
            console.error("[AutomationBuilder] Create Fail:", err);
            alert("Automation Protocol Deployment Failed: " + err.message); 
        }
    };

    const handleToggle = async (rule) => {
        try {
            await toggleAutomation(rule.id, !rule.is_active);
            fetchRules();
        } catch (err) { alert(err.message); }
    };

    if (loading) return <div className="text-white/50 p-4">Loading Automations...</div>;

    return (
        <div className="glass-panel" style={{ padding: 'var(--space-lg)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Workflow Automations</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>If-This-Then-That rules for your project</p>
                </div>
                <button 
                    onClick={() => setShowAdd(true)}
                    className="btn-primary"
                    style={{ padding: '0.6rem 1.2rem' }}
                >
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span> New Rule
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {rules.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-light)', borderRadius: '16px' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.3 }}>PROTOCOL_IDLE</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>No automation rules defined yet.</p>
                        <button onClick={() => setShowAdd(true)} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, marginTop: '8px' }}>Create your first rule</button>
                    </div>
                )}
                
                {rules.map(rule => {
                    let config = {};
                    try { config = JSON.parse(rule.config); } catch(e) {}
                    
                    return (
                        <div key={rule.id} className="task-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: 0, padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ 
                                    width: '40px', height: '40px', borderRadius: '10px', 
                                    background: rule.is_active ? 'rgba(59, 130, 246, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                                }}>
                                    {rule.trigger_type === 'TASK_COMPLETED' ? 'DONE' : 'CAL'}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{rule.trigger_type.replace('_',' ')}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 700 }}>THEN</span>
                                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{rule.action_type.replace('_',' ')}</span>
                                    </div>
                                    <p style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
                                        {rule.action_type === 'CHAT_NOTIFY' ? (config.message || 'Send notification') : (config.task_name || 'Execute workflow')}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                 <div style={{ textAlign: 'right' }} className="hidden-mobile">
                                    <p style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>Status</p>
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: rule.is_active ? '#10b981' : 'var(--text-muted)' }}>{rule.is_active ? 'RUNNING' : 'PAUSED'}</span>
                                 </div>
                                 <button 
                                    onClick={() => handleToggle(rule)}
                                    style={{ 
                                        width: '44px', height: '22px', borderRadius: '22px', 
                                        position: 'relative', border: 'none', cursor: 'pointer',
                                        background: rule.is_active ? '#10b981' : 'var(--border-light)',
                                        transition: 'all 0.3s'
                                    }}
                                 >
                                    <div style={{ 
                                        position: 'absolute', top: '2px', width: '18px', height: '18px', 
                                        background: '#fff', borderRadius: '50%', transition: 'all 0.3s',
                                        left: rule.is_active ? '24px' : '2px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                    }}></div>
                                 </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showAdd && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content" style={{ maxWidth: '500px', width: '100%', padding: 'var(--space-lg)' }}>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px 0' }}>Build Automation</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-lg)' }}>Define a new "If-This-Then-That" protocol.</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Trigger</label>
                                    <select 
                                        className="input-text"
                                        style={{ width: '100%', padding: '12px' }}
                                        value={newRule.trigger}
                                        onChange={e => setNewRule({...newRule, trigger: e.target.value})}
                                    >
                                        <option value="TASK_COMPLETED">Task is Completed</option>
                                        <option value="MEETING_SCHEDULED">Meeting is Scheduled</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Action</label>
                                    <select 
                                        className="input-text"
                                        style={{ width: '100%', padding: '12px' }}
                                        value={newRule.action}
                                        onChange={e => setNewRule({...newRule, action: e.target.value})}
                                    >
                                        <option value="CHAT_NOTIFY">Post to AI Insights</option>
                                        <option value="CREATE_TASK">Spawn Follow-up Task</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Configuration</label>
                                <p style={{ fontSize: '10px', color: 'var(--accent)', marginBottom: '8px', fontWeight: 700 }}>PRO TIP: Use `{{task_name}}` or `{{assignee}}` placeholders.</p>
                                <textarea 
                                    className="input-text"
                                    style={{ width: '100%', height: '100px', resize: 'none' }}
                                    value={newRule.message}
                                    onChange={e => setNewRule({...newRule, message: e.target.value})}
                                    placeholder={newRule.action === 'CHAT_NOTIFY' ? "Message to post..." : "Name of the new task..."}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: 'var(--space-lg)' }}>
                            <button onClick={() => setShowAdd(false)} className="btn-primary" style={{ flex: 1, background: 'none', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}>Abort</button>
                            <button onClick={handleAdd} className="btn-primary" style={{ flex: 1 }}>Deploy Protocol</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
