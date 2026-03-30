import hashlib
import random

def generate_otp() -> str:
    return f"{random.randint(0, 999999):06d}"

def hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode("utf-8")).hexdigest()