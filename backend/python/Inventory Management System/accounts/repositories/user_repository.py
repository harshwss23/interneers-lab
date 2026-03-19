from datetime import datetime
from typing import Optional
from accounts.db.user_document import UserDocument

class UserRepository:
    def find_by_email(self, email: str) -> Optional[UserDocument]:
        return UserDocument.objects(email=email).first()

    def create(self, data: dict) -> UserDocument:
        doc = UserDocument(**data)
        doc.updated_at = datetime.utcnow()
        doc.save()
        return doc

    def save(self, user: UserDocument) -> UserDocument:
        user.updated_at = datetime.utcnow()
        user.save()
        return user