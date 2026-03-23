// Configure base URL using Vite environment variables with a localhost fallback
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const getHeaders = () => {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

const checkAuth = (res) => {
    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.reload();
    }
    return res;
};

export const getTeamMembers = async () => {
    const res = await fetch(`${API_URL}/api/v1/teams/`, { headers: getHeaders() }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to fetch team members");
    return res.json();
};

export const addTeamMember = async (memberData) => {
    const res = await fetch(`${API_URL}/api/v1/teams/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(memberData)
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to add team member");
    return res.json();
};

export const updateTeamMember = async (memberId, memberData) => {
    const res = await fetch(`${API_URL}/api/v1/teams/${memberId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(memberData)
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to update team member");
    return res.json();
};

export const deleteTeamMember = async (memberId) => {
    const res = await fetch(`${API_URL}/api/v1/teams/${memberId}`, {
        method: "DELETE",
        headers: getHeaders()
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to delete team member");
    return res.json();
};

export const createTask = async (task) => {
    const res = await fetch(`${API_URL}/api/v1/tasks/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(task)
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to create task");
    return res.json();
};

export const getTasks = async () => {
    const res = await fetch(`${API_URL}/api/v1/tasks/`, { headers: getHeaders() }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
};

export const markTaskComplete = async (taskId) => {
    const res = await fetch(`${API_URL}/api/v1/tasks/${taskId}/complete`, {
        method: "PATCH",
        headers: getHeaders()
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to mark task complete");
    return res.json();
};

export const updateTask = async (taskId, taskData) => {
    const res = await fetch(`${API_URL}/api/v1/tasks/${taskId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(taskData)
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to update task");
    return res.json();
};

export const deleteTask = async (taskId) => {
    const res = await fetch(`${API_URL}/api/v1/tasks/${taskId}`, {
        method: "DELETE",
        headers: getHeaders()
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to delete task");
    return res.json();
};

export const getSuggestion = async (taskName) => {
    const res = await fetch(`${API_URL}/suggest-member?task_name=${encodeURIComponent(taskName)}`, {
        headers: getHeaders()
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to fetch suggestion");
    return res.json();
};

export const getInsights = async () => {
    const res = await fetch(`${API_URL}/insights`, { headers: getHeaders() }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to fetch insights");
    return res.json();
};

export const generateMeetingSummary = async (text) => {
    const res = await fetch(`${API_URL}/api/v1/ai/meeting-summary`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ text })
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to generate summary");
    return res.json();
};

export const getDeadlines = async () => {
    const res = await fetch(`${API_URL}/api/v1/ai/deadlines`, { headers: getHeaders() }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to fetch deadlines");
    return res.json();
};

export const seedDemoData = async () => {
    const res = await fetch(`${API_URL}/seed`, { 
        method: "POST",
        headers: getHeaders()
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to seed demo data");
    return res.json();
};

// --- Meeting API ---

export const getMeetings = async (startDate, endDate) => {
    let url = `${API_URL}/api/v1/meetings/`;
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: getHeaders() }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to fetch meetings");
    return res.json();
};

export const createMeeting = async (meetingData) => {
    const res = await fetch(`${API_URL}/api/v1/meetings/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(meetingData)
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to create meeting");
    return res.json();
};

export const updateMeeting = async (meetingId, meetingData) => {
    const res = await fetch(`${API_URL}/api/v1/meetings/${meetingId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(meetingData)
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to update meeting");
    return res.json();
};

export const deleteMeeting = async (meetingId) => {
    const res = await fetch(`${API_URL}/api/v1/meetings/${meetingId}`, {
        method: "DELETE",
        headers: getHeaders()
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to delete meeting");
    return res.json();
};

export const syncOutlook = async (accessToken) => {
    const res = await fetch(`${API_URL}/api/v1/meetings/sync/outlook/pull?access_token=${accessToken}`, {
        method: "POST",
        headers: getHeaders()
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to sync Outlook");
    return res.json();
};

// --- Meeting AI endpoints ---

export const getMeeting = async (meetingId) => {
    const res = await fetch(`${API_URL}/api/v1/meetings/${meetingId}`, { headers: getHeaders() }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to fetch meeting");
    return res.json();
};

export const addTranscriptLine = async (meetingId, payload) => {
    const res = await fetch(`${API_URL}/api/v1/meetings/${meetingId}/transcript`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to save transcript");
    return res.json();
};

export const getMeetingTranscript = async (meetingId) => {
    const res = await fetch(`${API_URL}/api/v1/meetings/${meetingId}/transcript`, { headers: getHeaders() }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to fetch transcript");
    return res.json();
};

export const addRecording = async (meetingId, payload) => {
    const res = await fetch(`${API_URL}/api/v1/meetings/${meetingId}/recording`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to save recording metadata");
    return res.json();
};

export const generateMeetingSummaryAI = async (meetingId) => {
    const res = await fetch(`${API_URL}/api/v1/meetings/${meetingId}/generate-summary`, {
        method: "POST",
        headers: getHeaders()
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to generate meeting summary");
    return res.json();
};

export const getMeetingSummaryAI = async (meetingId) => {
    const res = await fetch(`${API_URL}/api/v1/meetings/${meetingId}/summary`, { headers: getHeaders() }).then(checkAuth);
    if (!res.ok) return null; // Can be null if not generated yet
    return res.json();
};

export const searchMeetingIntelligence = async (query) => {
    const res = await fetch(`${API_URL}/api/v1/meetings/search/intelligence?query=${encodeURIComponent(query)}`, { headers: getHeaders() }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to search meetings");
    return res.json();
};

// --- Integration & Automation API ---

export const getIntegrations = async () => {
    const res = await fetch(`${API_URL}/api/v1/integrations/`, { headers: getHeaders() }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to fetch integrations");
    return res.json();
};

export const getUserIntegrations = async () => {
    const res = await fetch(`${API_URL}/api/v1/integrations/user`, { headers: getHeaders() }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to fetch user integrations");
    return res.json();
};

export const connectIntegration = async (integrationId) => {
    const res = await fetch(`${API_URL}/api/v1/integrations/${integrationId}/connect`, {
        method: "POST",
        headers: getHeaders()
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to connect integration");
    return res.json();
};

export const disconnectIntegration = async (integrationId) => {
    const res = await fetch(`${API_URL}/api/v1/integrations/${integrationId}/disconnect`, {
        method: "POST",
        headers: getHeaders()
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to disconnect integration");
    return res.json();
};

export const getAutomations = async () => {
    const res = await fetch(`${API_URL}/api/v1/integrations/automations`, { headers: getHeaders() }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to fetch automations");
    return res.json();
};

export const createAutomation = async (ruleData) => {
    const res = await fetch(`${API_URL}/api/v1/integrations/automations`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(ruleData)
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to create automation");
    return res.json();
};

export const toggleAutomation = async (ruleId, active) => {
    const res = await fetch(`${API_URL}/api/v1/integrations/automations/${ruleId}/toggle?active=${active}`, {
        method: "PATCH",
        headers: getHeaders()
    }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to toggle automation");
    return res.json();
};

export const getReports = async () => {
    const res = await fetch(`${API_URL}/api/v1/reports/`, { headers: getHeaders() }).then(checkAuth);
    if (!res.ok) throw new Error("Failed to fetch reports");
    return res.json();
};
