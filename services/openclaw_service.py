import logging
from services.memory import retrieve_memory

logger = logging.getLogger(__name__)

class OpenClaw:
    """
    OpenClaw Plugin: Interfaces with Hindsight Cloud to provide 
    contextual memory to the LLM.
    """
    
    @staticmethod
    async def query_memory(query: str) -> str:
        """
        Queries the project's persistent memory and returns a formatted string 
        of relevant historical context.
        """
        try:
            memories = await retrieve_memory(query)
            if not memories:
                return "No relevant past decisions or notes found for this query."
            
            context = "### RELEVANT PROJECT CONTEXT (from Hindsight):\n"
            for i, mem in enumerate(memories):
                # Handle both string and raw dict/object memories
                text = mem if isinstance(mem, str) else getattr(mem, 'text', str(mem))
                context += f"{i+1}. {text}\n"
            
            return context
        except Exception as e:
            logger.error(f"OpenClaw failed to retrieve memory: {e}")
            return "Error retrieving project memory context."

    @staticmethod
    async def get_project_summary() -> str:
        """
        Retrieves a high-level summary of the project state from memory.
        """
        return await OpenClaw.query_memory("project overview summary decisions")
