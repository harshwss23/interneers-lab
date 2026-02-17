from typing import Dict, Any
from greet.domain.services import build_greeting

class GreetUseCase:
    def greet(self, name: str | None, city: str | None, mood: str | None) -> Dict[str, Any]:
        message = build_greeting(name=name, city=city, mood=mood)

        return {
            "message": message,
            "meta": {
                "received": {
                    "name": name,
                    "city": city,
                    "mood": mood,
                }
            }
        }
