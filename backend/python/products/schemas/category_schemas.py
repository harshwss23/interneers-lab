from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class CategoryCreateRequest(BaseModel):
    title: str = Field(min_length=1)
    description: Optional[str] = ""

class CategoryUpdateRequest(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    created_at: str
    updated_at: str
