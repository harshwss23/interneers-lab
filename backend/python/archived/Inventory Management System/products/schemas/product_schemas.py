from typing import Optional
from pydantic import BaseModel, Field

class ProductCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    description: Optional[str] = ""
    brand: str = Field(min_length=1)
    price: float = Field(ge=0)
    quantity: int = Field(ge=0)
    category_id: Optional[str] = None