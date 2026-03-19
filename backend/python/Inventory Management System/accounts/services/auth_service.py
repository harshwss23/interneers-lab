import os
import uuid
from datetime import datetime, timedelta
from django.contrib.auth.hashers import make_password, check_password

from accounts.repositories.user_repository import UserRepository
from accounts.repositories.token_repository import TokenRepository
from accounts.utils.otp_utils import generate_otp, hash_otp
from accounts.utils.email_utils import send_otp_email

class AuthError(Exception): pass

class AuthService:
    def __init__(self, user_repo: UserRepository, token_repo: TokenRepository):
        self.user_repo = user_repo
        self.token_repo = token_repo

    def register(self, name: str, email: str, password: str, role: str) -> dict:
        existing = self.user_repo.find_by_email(email)
        if existing:
            raise AuthError("Email already registered")

        otp = generate_otp()
        otp_ttl = int(os.getenv("OTP_TTL_MINUTES", "10"))

        user = self.user_repo.create({
            "name": name,
            "email": email,
            "password_hash": make_password(password),
            "role": role,
            "status": "ACTIVE",
            "is_verified": False,
            "otp_hash": hash_otp(otp),
            "otp_expires_at": datetime.utcnow() + timedelta(minutes=otp_ttl),
            "otp_attempts": 0,
        })

        # send email
        send_otp_email(email, otp)

        return {
            "message": "Registered successfully. OTP sent to email.",
            "user_id": str(user.id),
            "email": user.email,
            "status": user.status,
            "is_verified": user.is_verified,
        }

    def verify_otp(self, email: str, otp: str) -> dict:
        user = self.user_repo.find_by_email(email)
        if not user:
            raise AuthError("User not found")

        if user.is_verified:
            return {"message": "User already verified"}

        if not user.otp_hash or not user.otp_expires_at:
            raise AuthError("OTP not generated. Please register again.")

        if datetime.utcnow() > user.otp_expires_at:
            raise AuthError("OTP expired. Please register again.")

        user.otp_attempts = (user.otp_attempts or 0) + 1
        if user.otp_attempts > 5:
            self.user_repo.save(user)
            raise AuthError("Too many attempts. Please register again.")

        if hash_otp(otp) != user.otp_hash:
            self.user_repo.save(user)
            raise AuthError("Invalid OTP")

        user.is_verified = True
        user.otp_hash = None
        user.otp_expires_at = None
        user.otp_attempts = 0
        self.user_repo.save(user)

        return {"message": "OTP verified successfully"}

    def login(self, email: str, password: str) -> dict:
        user = self.user_repo.find_by_email(email)
        if not user:
            raise AuthError("Invalid credentials")

        if user.status != "ACTIVE":
            raise AuthError("User is inactive. Contact admin.")

        if not user.is_verified:
            raise AuthError("Please verify OTP before login")

        if not check_password(password, user.password_hash):
            raise AuthError("Invalid credentials")

        ttl_hours = int(os.getenv("LOGIN_TOKEN_TTL_HOURS", "24"))
        token = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(hours=ttl_hours)

        self.token_repo.create({
            "token": token,
            "user_id": str(user.id),
            "expires_at": expires_at,
        })

        return {
            "message": "Login successful",
            "token": token,
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "status": user.status,
            }
        }