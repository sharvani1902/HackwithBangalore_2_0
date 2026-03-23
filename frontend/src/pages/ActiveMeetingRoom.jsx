import React, { useState, useEffect, useRef } from 'react';
import { 
    getMeeting, 
    addTranscriptLine, 
    addRecording 
} from '../services/api';
import { MicIcon, VideoIcon, MonitorIcon } from '../components/Icons';

export default function ActiveMeetingRoom({ id, setView }) {
    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Web Speech API state
    const [isListening, setIsListening] = useState(false);
    const [captions, setCaptions] = useState([]);
    const [currentCaption, setCurrentCaption] = useState("");
    const recognitionRef = useRef(null);
    
    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const captionsEndRef = useRef(null);

    useEffect(() => {
        loadMeeting();
    }, [id]);

    useEffect(() => {
        // Auto-scroll captions
        if (captionsEndRef.current) {
            captionsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [captions, currentCaption]);

    useEffect(() => {
        let timer;
        if (isRecording) {
            timer = setInterval(() => setRecordingTime(t => t + 1), 1000);
        } else {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [isRecording]);

    const loadMeeting = async () => {
        try {
            setLoading(true);
            const m = await getMeeting(id);
            setMeeting(m);
        } catch (error) {
            console.error("Failed to load meeting:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSpeechRecognition = () => {
        if (isListening) {
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support the Web Speech API for live captions.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        
        recognition.onresult = async (event) => {
            let interimTranscript = "";
            let finalTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            setCurrentCaption(interimTranscript);

            if (finalTranscript) {
                // Determine user (simulated as current user)
                const username = localStorage.getItem("username") || "Me";
                
                const newLine = {
                    speaker: username,
                    text: finalTranscript.trim(),
                    timestamp: new Date().toISOString()
                };

                setCaptions(prev => [...prev, newLine]);
                setCurrentCaption("");
                
                // Fire and forget to Backend
                try {
                    await addTranscriptLine(id, {
                        meeting_id: parseInt(id),
                        speaker: newLine.speaker,
                        text: newLine.text
                    });
                } catch (e) {
                    console.error("Failed to sync transcript block", e);
                }
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            // Auto restart if still supposed to be listening
            if (isListening) {
                recognition.start();
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const toggleRecording = async () => {
        if (!isRecording) {
            setIsRecording(true);
        } else {
            setIsRecording(false);
            // Simulate storing the recording link
            try {
                await addRecording(id, {
                    meeting_id: parseInt(id),
                    recording_url: `https://nexus-cloud.propilot.internal/recordings/mtg_${id}_${Date.now()}.mp4`,
                    duration: recordingTime
                });
            } catch (e) {
                console.error("Failed to save recording metadata", e);
            }
        }
    };

    const endMeeting = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        setView("MEETING_DETAILS");
    };

    if (loading || !meeting) {
        return <div className="dashboard-container"><div className="shimmer glass-panel" style={{height: "60vh"}}></div></div>;
    }

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div style={{ padding: "var(--space-md)", height: "calc(100vh - 80px)", display: "flex", flexDirection: "column", background: "#000", color: "#fff" }}>
            
            {/* Top Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                    <h2 style={{ margin: 0, color: "#fff" }}>{meeting.title}</h2>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {meeting.participants?.length > 0 ? meeting.participants.join(", ") : "Just you"}
                    </span>
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    {isRecording && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#ff4b4b", fontWeight: "bold" }}>
                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff4b4b", animation: "pulse 1.5s infinite" }} />
                            {formatTime(recordingTime)}
                        </div>
                    )}
                    
                    <button 
                        onClick={toggleRecording} 
                        style={{
                            background: isRecording ? "rgba(255, 75, 75, 0.2)" : "rgba(255, 255, 255, 0.1)",
                            color: isRecording ? "#ff4b4b" : "#fff",
                            border: `1px solid ${isRecording ? '#ff4b4b' : 'rgba(255,255,255,0.2)'}`,
                            padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s"
                        }}
                    >
                        {isRecording ? "Stop Recording" : "Record"}
                    </button>
                    
                    <button onClick={endMeeting} className="btn-primary" style={{ background: "#ff4b4b" }}>
                        End Meeting
                    </button>
                </div>
            </div>

            {/* Video / Content Area (Simulated) */}
            <div style={{ 
                flex: 1, 
                background: "#1a1a1a", 
                borderRadius: "12px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden"
            }}>
                <div style={{ 
                    width: "120px", height: "120px", borderRadius: "50%", 
                    background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "2rem", fontWeight: "bold", border: isListening ? "4px solid var(--accent)" : "4px solid transparent",
                    boxShadow: isListening ? "0 0 20px var(--accent)" : "none", transition: "all 0.3s"
                }}>
                    {(localStorage.getItem("username") || "Me").charAt(0).toUpperCase()}
                </div>
                {isListening && <span style={{ marginTop: "1rem", color: "var(--accent)" }}>Microphone Active...</span>}
            </div>

            {/* Bottom Controls & Captions */}
            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                
                {/* Live Captions Display */}
                <div style={{ 
                    height: "120px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", overflowY: "auto", padding: "1rem",
                    display: "flex", flexDirection: "column", gap: "0.5rem", border: "1px solid rgba(255,255,255,0.1)"
                }}>
                    {captions.length === 0 && !currentCaption && (
                        <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: "1rem", fontStyle: "italic" }}>
                            Live captions will appear here when you speak...
                        </div>
                    )}
                    
                    {captions.map((c, i) => (
                        <div key={i} style={{ display: "flex", gap: "0.5rem", fontSize: "0.95rem" }}>
                            <span style={{ fontWeight: "bold", color: "var(--accent)" }}>{c.speaker}:</span>
                            <span style={{ color: "#fff" }}>{c.text}</span>
                        </div>
                    ))}
                    
                    {currentCaption && (
                        <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.95rem", opacity: 0.7 }}>
                            <span style={{ fontWeight: "bold", color: "var(--accent)" }}>{localStorage.getItem("username") || "Me"}:</span>
                            <span style={{ color: "#fff" }}>{currentCaption}</span>
                        </div>
                    )}
                    
                    <div ref={captionsEndRef} />
                </div>

                {/* Toolbar */}
                <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                    <button 
                        onClick={toggleSpeechRecognition}
                        style={{
                            width: "50px", height: "50px", borderRadius: "50%", border: "none", cursor: "pointer",
                            background: isListening ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)",
                            color: isListening ? "var(--accent)" : "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
                            transition: "all 0.2s"
                        }}
                        title={isListening ? "Mute Microphone" : "Unmute Microphone"}
                    >
                        <MicIcon size={20} color={isListening ? "var(--accent)" : "#fff"} />
                    </button>
                    <button 
                        style={{
                            width: "50px", height: "50px", borderRadius: "50%", border: "none", cursor: "pointer",
                            background: "rgba(255,255,255,0.05)", color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
                        }}
                    >
                        <VideoIcon size={20} color="#fff" />
                    </button>
                    <button 
                        style={{
                            width: "50px", height: "50px", borderRadius: "50%", border: "none", cursor: "pointer",
                            background: "rgba(255,255,255,0.05)", color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
                        }}
                        title="Share Screen"
                    >
                        <MonitorIcon size={20} color="#fff" />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 75, 75, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(255, 75, 75, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 75, 75, 0); }
                }
            `}</style>
        </div>
    );
}
