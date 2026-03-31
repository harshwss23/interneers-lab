from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class ProductCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    description: Optional[str] = ""
    brand: str = Field(min_length=1)
    category_id: Optional[str] = None
    price: float = Field(ge=0)
    quantity: int = Field(ge=0)
    created_by: Optional[str] = None

class ProductUpdateRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = None
    brand: Optional[str] = Field(default=None, min_length=1)
    category_id: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    quantity: Optional[int] = Field(default=None, ge=0)

class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str
    brand: str
    category_id: Optional[str]
    category_name: Optional[str] = ""
    price: float
    quantity: int
    created_by: Optional[str] = ""
    created_at: str
    updated_at: str