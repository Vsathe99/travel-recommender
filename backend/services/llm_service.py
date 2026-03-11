import os
import json
import httpx
from typing import Any, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

GROK_API_KEY = os.getenv("GROK_API_KEY", "")
GROK_BASE_URL = os.getenv("GROK_BASE_URL", "https://api.x.ai/v1")
GROK_MODEL = os.getenv("GROK_MODEL", "grok-3-mini")

HF_API_KEY = os.getenv("HF_API_KEY", "")
HF_MODEL = os.getenv("HF_MODEL", "mistralai/Mistral-7B-Instruct-v0.3")


async def call_grok(prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7) -> str:
    """Call xAI Grok API (primary LLM)."""
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": GROK_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 2048,
    }

    headers = {
        "Authorization": f"Bearer {GROK_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{GROK_BASE_URL}/chat/completions",
            json=payload,
            headers=headers,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()


async def call_huggingface(prompt: str) -> str:
    """Call HuggingFace Inference API (fallback LLM)."""
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    payload = {
        "inputs": prompt,
        "parameters": {"max_new_tokens": 1024, "temperature": 0.7, "return_full_text": False},
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"https://api-inference.huggingface.co/models/{HF_MODEL}",
            json=payload,
            headers=headers,
        )
        response.raise_for_status()
        data = response.json()
        if isinstance(data, list) and data:
            return data[0].get("generated_text", "").strip()
        return str(data)


async def generate_text(prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7) -> str:
    """Generate text using Grok (primary) with HuggingFace fallback."""
    if GROK_API_KEY:
        try:
            return await call_grok(prompt, system_prompt=system_prompt, temperature=temperature)
        except Exception as e:
            print(f"⚠️  Grok API failed: {e}. Falling back to HuggingFace.")

    if HF_API_KEY:
        try:
            full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
            return await call_huggingface(full_prompt)
        except Exception as e:
            print(f"⚠️  HuggingFace API failed: {e}")

    raise Exception("No LLM API key configured. Set GROK_API_KEY or HF_API_KEY in .env")


async def generate_json(prompt: str, system_prompt: Optional[str] = None) -> Any:
    """Generate structured JSON output from the LLM."""
    json_system = (
        (system_prompt or "")
        + "\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, no code blocks."
    )
    raw = await generate_text(prompt, system_prompt=json_system, temperature=0.3)
    # Strip any markdown code fences if the model adds them anyway
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip().rstrip("```").strip()
    return json.loads(raw)
