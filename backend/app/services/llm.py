from groq import Groq
from ..config import GROQ_API_KEY, LLM_MODEL

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

def generate_response(system: str, messages: list[dict]) -> str:
    if not client:
        return "AI is not configured. Please set GROQ_API_KEY."
    r = client.chat.completions.create(
        model=LLM_MODEL,
        messages=[{"role": "system", "content": system}] + messages,
        temperature=0.3,
        max_tokens=512,
    )
    return r.choices[0].message.content
