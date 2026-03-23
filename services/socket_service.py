import httpx
import logging

logger = logging.getLogger(__name__)

# Socket Nexus is the Node.js auxiliary service on port 4000
SOCKET_NEXUS_URL = "http://127.0.0.1:4000/broadcast"

async def broadcast_event(event_name: str, data: dict):
    """
    Push a real-time event to the Node.js Socket Nexus.
    The Node service will then broadcast this to all connected frontend clients.
    """
    try:
        payload = {
            "event": event_name,
            "data": data
        }
        async with httpx.AsyncClient() as client:
            res = await client.post(SOCKET_NEXUS_URL, json=payload, timeout=2.0)
            if res.status_code == 200:
                logger.info(f"[SocketBridge] Broadcasted {event_name} successfully.")
            else:
                logger.warning(f"[SocketBridge] Failed to broadcast {event_name}: {res.text}")
    except Exception as e:
        logger.error(f"[SocketBridge] Connection error to Socket Nexus: {e}")
