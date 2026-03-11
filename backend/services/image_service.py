import os
import httpx
from typing import List, Optional
from utils.cache import get_cached, set_cached
from dotenv import load_dotenv

load_dotenv()

UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY", "")
UNSPLASH_BASE = "https://api.unsplash.com"


async def get_destination_images(query: str, count: int = 12) -> List[str]:
    """Fetch high-quality travel images from Unsplash for a destination."""
    cache_key = f"images:{query.lower()}:{count}"
    cached = await get_cached(cache_key)
    if cached:
        return cached

    if not UNSPLASH_ACCESS_KEY:
        return _placeholder_images(query, count)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{UNSPLASH_BASE}/search/photos",
                params={
                    "query": f"{query} travel",
                    "per_page": count,
                    "orientation": "landscape",
                    "order_by": "relevant",
                },
                headers={"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"},
            )
            response.raise_for_status()
            data = response.json()
    except Exception as e:
        print(f"⚠️  Unsplash API error for {query}: {e}")
        return _placeholder_images(query, count)

    urls = [
        photo["urls"]["regular"]
        for photo in data.get("results", [])
        if photo.get("urls", {}).get("regular")
    ]
    await set_cached(cache_key, urls, 86400)
    return urls


def _placeholder_images(query: str, count: int) -> List[str]:
    """Return Unsplash source URLs as fallback (no API key needed for these)."""
    keywords = query.replace(" ", ",")
    return [
        f"https://source.unsplash.com/800x600/?{keywords},travel&sig={i}"
        for i in range(count)
    ]
