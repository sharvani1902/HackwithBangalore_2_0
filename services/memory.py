import os
import logging
import asyncio
from dotenv import load_dotenv

# Conditional import safely
try:
    from hindsight_client import Hindsight
    HAS_HINDSIGHT = True
except ImportError:
    HAS_HINDSIGHT = False

load_dotenv()
logger = logging.getLogger(__name__)

HINDSIGHT_API_KEY = os.getenv("HINDSIGHT_API_KEY")
HINDSIGHT_BASE_URL = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.xyz")
HINDSIGHT_BANK_ID = os.getenv("HINDSIGHT_BANK_ID", "propilot_brain")

if HAS_HINDSIGHT and HINDSIGHT_API_KEY and "mock" not in HINDSIGHT_API_KEY.lower():
    try:
        hs = Hindsight(base_url=HINDSIGHT_BASE_URL, api_key=HINDSIGHT_API_KEY)
    except Exception as e:
        logger.error(f"Hindsight initialization failed: {e}")
        hs = None
else:
    hs = None


async def store_memory(data: dict):
    """
    Store memory structured as a text snippet for hindsight SDK.
    """
    if not data:
        return

    text = str(data)
    if hs:
        try:
            await hs.retain(bank_id=HINDSIGHT_BANK_ID, content=text)
            logger.info("Stored memory in Hindsight.")
        except Exception as e:
            logger.error(f"Failed to store memory: {e}")
    else:
        logger.info(f"[Mock Hindsight] Stored memory: {text}")


async def retrieve_memory(query: str):
    """
    Retrieve semantic memories from hindsight based on a query.
    """
    if hs:
        try:
            # Check if recall is a coroutine or a normal function
            res_or_coro = hs.recall(bank_id=HINDSIGHT_BANK_ID, query=query)
            if hasattr(res_or_coro, "__await__") or asyncio.iscoroutine(res_or_coro):
                response = await res_or_coro
            else:
                response = res_or_coro
            
            # Adapt RecallResponse to list of strings
            if hasattr(response, 'results'):
                return [r.text for r in response.results]
            return []
        except Exception as e:
            # Handle "This event loop is already running" by noting it but not crashing
            logger.error(f"Failed to retrieve memory: {e}")
            return []
    else:
        logger.info(f"[Mock Hindsight] Recalled memory for query '{query}'")
        return []
