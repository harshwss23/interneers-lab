import uuid
from typing import Dict, Any

# product_id -> product dict
PRODUCTS: Dict[str, Dict[str, Any]] = {}

def new_id() -> str:
    return str(uuid.uuid4())