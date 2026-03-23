import os
import requests
from fastapi import HTTPException

# Microsoft Graph API Configuration
MS_CLIENT_ID = os.getenv("MS_CLIENT_ID", "")
MS_CLIENT_SECRET = os.getenv("MS_CLIENT_SECRET", "")
MS_TENANT_ID = os.getenv("MS_TENANT_ID", "common")

def get_ms_auth_url() -> str:
    """Generates the OAuth login URL for Microsoft Graph."""
    if not MS_CLIENT_ID:
        raise ValueError("Microsoft Client ID is not configured in .env")
        
    url = (
        f"https://login.microsoftonline.com/{MS_TENANT_ID}/oauth2/v2.0/authorize"
        f"?client_id={MS_CLIENT_ID}&response_type=code&scope=Calendars.ReadWrite offline_access"
    )
    return url

def fetch_outlook_events(access_token: str) -> list:
    """Fetches upcoming events from Outlook using Microsoft Graph API."""
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    url = "https://graph.microsoft.com/v1.0/me/events?$select=subject,body,start,end&$top=50"
    
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch Outlook events.")
        
    return response.json().get("value", [])

def push_meeting_to_outlook(access_token: str, meeting_data: dict) -> dict:
    """Pushes a local ProPilot meeting to the user's Outlook Calendar."""
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    url = "https://graph.microsoft.com/v1.0/me/events"
    
    outlook_event = {
        "subject": meeting_data.get("title"),
        "body": {
            "contentType": "HTML",
            "content": meeting_data.get("description", "")
        },
        "start": {
            "dateTime": meeting_data.get("start_time").isoformat(),
            "timeZone": "UTC"
        },
        "end": {
            "dateTime": meeting_data.get("end_time").isoformat(),
            "timeZone": "UTC"
        }
    }
    
    response = requests.post(url, headers=headers, json=outlook_event)
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail="Failed to sync meeting to Outlook.")
        
    return response.json()
