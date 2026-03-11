import os
import json
import redis.asyncio as redis
from typing import Any, Optional
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
DEFAULT_TTL = int(os.getenv("CACHE_TTL", 3600))  # 1 hour default

_redis_client: Optional[redis.Redis] = None


async def get_redis() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis.from_url(REDIS_URL, decode_responses=True)
            await _redis_client.ping()
        except Exception:
            _redis_client = None
    return _redis_client


async def get_cached(key: str) -> Optional[Any]:
    try:
        client = await get_redis()
        if client is None:
            return None
        value = await client.get(key)
        if value:
            return json.loads(value)
    except Exception:
        pass
    return None


async def set_cached(key: str, value: Any, ttl: int = DEFAULT_TTL) -> None:
    try:
        client = await get_redis()
        if client is None:
            return
        await client.setex(key, ttl, json.dumps(value))
    except Exception:
        pass


async def delete_cached(key: str) -> None:
    try:
        client = await get_redis()
        if client is None:
            return
        await client.delete(key)
    except Exception:
        pass
