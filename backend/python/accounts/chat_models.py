from mongoengine import Document, StringField, DateTimeField
import datetime

class ChatMessage(Document):
    sender_username = StringField(required=True)
    sender_role = StringField(required=True)
    receiver_username = StringField(required=False) # Empty if broadcast
    content = StringField(required=True)
    timestamp = DateTimeField(default=datetime.datetime.utcnow)
    
    meta = {
        'collection': 'chat_messages',
        'ordering': ['timestamp'],
        'db_alias': 'mongodb'
    }
