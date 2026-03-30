from datetime import datetime
from mongoengine import (
    Document, StringField, BooleanField, DateTimeField, IntField
)

class UserDocument(Document):
    meta = {
        "collection": "users",
        "indexes": [{"fields": ["email"], "unique": True}],
    }

    name = StringField(required=True)
    email = StringField(required=True)
    password_hash = StringField(required=True)

    role = StringField(required=True, choices=["ADMIN", "MANAGER"])
    status = StringField(default="ACTIVE", choices=["ACTIVE", "INACTIVE"])

    is_verified = BooleanField(default=False)

    # OTP fields
    otp_hash = StringField(null=True)
    otp_expires_at = DateTimeField(null=True)
    otp_attempts = IntField(default=0)

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)