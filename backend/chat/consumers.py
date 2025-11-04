import json
from channels.generic.websocket import AsyncWebsocketConsumer
from datetime import datetime

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get the room_name from the URL route.
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # --- IMPORTANT ---
        # First, check if the user is authenticated (from your middleware)
        if not self.scope["user"].is_authenticated:
            await self.close() # Reject unauthenticated connections
            return

        # If authenticated, proceed to join the channel layer group (the "room")
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # On disconnect, leave the room group
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

            
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        # Create the final message object on the backend
        final_message = {
            'type': 'chat.message', # Keep the type for the frontend to identify it
            'conversation_id': text_data_json.get('conversation_id'),
            'sender': text_data_json.get('sender'),
            'text': text_data_json.get('text'),
            'timestamp': datetime.utcnow().isoformat() + "Z", # Add a standardized timestamp
        }

        # Broadcast the new, complete message object
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message', # This is the event name for the handler
                'message_data': final_message # Send the enriched message
            }
        )

    async def chat_message(self, event):
        message_data = event['message_data']
        # Send the final message object to the client
        await self.send(text_data=json.dumps(message_data))