import React, { useState, useEffect } from 'react';
import { createMeeting, updateMeeting, deleteMeeting } from '../../services/api';

export default function MeetingEditor({ meeting, preselectedDate, onClose, onSave }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [participants, setParticipants] = useState("");
    const [reminderTime, setReminderTime] = useState(10);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (meeting) {
            setTitle(meeting.title || "");
            setDescription(meeting.description || "");
            const sDate = new Date(meeting.start_time);
            const eDate = new Date(meeting.end_time);
            
            setDate(sDate.toISOString().split('T')[0]);
            setStartTime(sDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
            setEndTime(eDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
            
            setParticipants(meeting.participants ? meeting.participants.join(", ") : "");
            setReminderTime(meeting.reminder_time || 10);
        } else if (preselectedDate) {
            const tzoffset = (preselectedDate).getTimezoneOffset() * 60000;
            const localISOTime = (new Date(preselectedDate - tzoffset)).toISOString().slice(0, 10);
            setDate(localISOTime);
        } else {
            const today = new Date();
            const tzoffset = today.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(today - tzoffset)).toISOString().slice(0, 10);
            setDate(localISOTime);
        }
    }, [meeting, preselectedDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const startDateTime = new Date(`${date}T${startTime}`);
            const endDateTime = new Date(`${date}T${endTime}`);
            
            const participantList = participants.split(',').map(p => p.trim()).filter(p => p);

            const payload = {
                title,
                description,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                reminder_time: parseInt(reminderTime),
                participants: participantList
            };

            if (meeting) {
                await updateMeeting(meeting.id, payload);
            } else {
                await createMeeting(payload);
            }
            onSave();
        } catch (err) {
            console.error("Failed to save meeting:", err);
            alert("Failed to save meeting. Check console.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!meeting) return;
        if (confirm("Are you sure you want to delete this meeting?")) {
            setSaving(true);
            try {
                await deleteMeeting(meeting.id);
                onSave();
            } catch (err) {
                console.error("Failed to delete", err);
                alert("Failed to delete.");
            } finally {
                setSaving(false);
            }
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ width: '500px', maxWidth: '90vw' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--accent)' }}>
                    {meeting ? "Edit Meeting" : "New Meeting"}
                </h3>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                        <label>Title</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            required 
                            className="input-field"
                            placeholder="e.g. Weekly Standup"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Date</label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={e => setDate(e.target.value)} 
                            required 
                            className="input-field"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Start Time</label>
                            <input 
                                type="time" 
                                value={startTime} 
                                onChange={e => setStartTime(e.target.value)} 
                                required 
                                className="input-field"
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>End Time</label>
                            <input 
                                type="time" 
                                value={endTime} 
                                onChange={e => setEndTime(e.target.value)} 
                                required 
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Participants <span style={{fontSize: '0.8em', color: 'var(--text-muted)'}}>(comma separated)</span></label>
                        <input 
                            type="text" 
                            value={participants} 
                            onChange={e => setParticipants(e.target.value)} 
                            className="input-field"
                            placeholder="alice, bob, charlie"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            className="input-field"
                            rows="3"
                            placeholder="Agenda..."
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        {meeting ? (
                            <button type="button" onClick={handleDelete} className="btn-secondary" style={{ color: '#ff4b4b', borderColor: '#ff4b4b' }}>
                                Delete
                            </button>
                        ) : <div />}
                        
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                            <button type="submit" disabled={saving} className="btn-primary">
                                {saving ? "Saving..." : "Save Meeting"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
