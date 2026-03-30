from datetime import datetime
from mongoengine import Document, StringField, DateTimeField

class AuthTokenDocument(Document):
    meta = {"collection": "auth_tokens", "indexes": ["token", "user_id"]}

    token = StringField(required=True, unique=True)
    user_id = StringField(required=True)
    expires_at = DateTimeField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)