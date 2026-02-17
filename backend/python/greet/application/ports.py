from typing import Protocol, Dict, Any

class GreetUseCasePort(Protocol):
    def greet(self, name: str | None, city: str | None, mood: str | None) -> Dict[str, Any]:
        ...
