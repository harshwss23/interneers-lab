import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from accounts.models import User
from rest_framework.authtoken.models import Token
from urllib.parse import parse_qs

from .chat_models import ChatMessage

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_params = parse_qs(self.scope['query_string'].decode('utf8'))
        token = query_params.get('token', [None])[0]
        
        if not token:
            await self.close()
            return
            
        self.user = await self.get_user_by_token(token)
        if not self.user or self.user.role not in ['ADMIN', 'WAREHOUSE_MANAGER']:
            await self.close()
            return

        self.room_name = f"user_{self.user.id}"
        self.broadcast_group = "broadcast_managers"
        self.admin_group = "admin_group"

        # Join individual room
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        
        # Managers join broadcast group
        if self.user.role == 'WAREHOUSE_MANAGER':
            await self.channel_layer.group_add(self.broadcast_group, self.channel_name)
            
        # Admins join admin group
        if self.user.role == 'ADMIN':
            await self.channel_layer.group_add(self.admin_group, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_name'):
            await self.channel_layer.group_discard(self.room_name, self.channel_name)
            if self.user.role == 'WAREHOUSE_MANAGER':
                await self.channel_layer.group_discard(self.broadcast_group, self.channel_name)
            if self.user.role == 'ADMIN':
                await self.channel_layer.group_discard(self.admin_group, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        receiver_id = text_data_json.get('receiver_id', None) # If None, it's a broadcast
        
        if self.user.role == 'ADMIN':
            if receiver_id:
                # 1-to-1 message to a manager
                receiver_user = await self.get_user_by_id(receiver_id)
                if receiver_user:
                    await self.save_message(self.user.username, self.user.role, receiver_user.username, message)
                    msg_data = {
                        'type': 'chat_message',
                        'message': message,
                        'sender': self.user.username,
                        'sender_role': self.user.role,
                        'receiver': receiver_user.username
                    }
                    await self.channel_layer.group_send(f"user_{receiver_id}", msg_data)
                    await self.channel_layer.group_send(self.room_name, msg_data)
            else:
                # Broadcast
                await self.save_message(self.user.username, self.user.role, None, message)
                msg_data = {
                    'type': 'chat_message',
                    'message': message,
                    'sender': self.user.username,
                    'sender_role': self.user.role,
                    'receiver': 'all'
                }
                await self.channel_layer.group_send(self.broadcast_group, msg_data)
                await self.channel_layer.group_send(self.room_name, msg_data)
                
        elif self.user.role == 'WAREHOUSE_MANAGER':
            # Managers always send to admins
            await self.save_message(self.user.username, self.user.role, "admin", message)
            msg_data = {
                'type': 'chat_message',
                'message': message,
                'sender': self.user.username,
                'sender_role': self.user.role,
                'receiver': 'admin'
            }
            await self.channel_layer.group_send(self.admin_group, msg_data)
            await self.channel_layer.group_send(self.room_name, msg_data)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'sender_role': event['sender_role'],
            'receiver': event['receiver'],
            'timestamp': event.get('timestamp')
        }))

    @sync_to_async
    def get_user_by_token(self, token_key):
        try:
            token = Token.objects.get(key=token_key)
            return token.user
        except Token.DoesNotExist:
            return None
            
    @sync_to_async
    def get_user_by_id(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @sync_to_async
    def save_message(self, sender_username, sender_role, receiver_username, content):
        msg = ChatMessage(
            sender_username=sender_username,
            sender_role=sender_role,
            receiver_username=receiver_username if receiver_username else "",
            content=content
        )
        msg.save()
        return msg
