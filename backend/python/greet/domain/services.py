def build_greeting(name: str | None, city: str | None, mood: str | None) -> str:
    safe_name = (name or "").strip() or "Guest"
    safe_city = (city or "").strip() or "somewhere"
    safe_mood = (mood or "").strip() or "good"
    return f"Hello {safe_name}! Hope you're feeling {safe_mood} in {safe_city}."
