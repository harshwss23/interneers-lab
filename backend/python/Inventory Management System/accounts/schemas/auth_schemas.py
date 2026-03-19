from pydantic import BaseModel, Field, EmailStr

class RegisterRequest(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=6)
    role: str = Field(pattern="^(ADMIN|MANAGER)$")

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)