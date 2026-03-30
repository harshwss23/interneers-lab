from accounts.db.token_document import AuthTokenDocument

class TokenRepository:
    def create(self, data: dict) -> AuthTokenDocument:
        doc = AuthTokenDocument(**data)
        doc.save()
        return doc