import json
from channels.generic.websocket import AsyncWebsocketConsumer
from datetime import datetime, timezone
from channels.db import database_sync_to_async
from .models import Messages, Conversation
from authapp.models import MyUser

@database_sync_to_async
def save_message(conversation_id, sender_id, text):
    try:
        conversation = Conversation.objects.get(id=conversation_id)
        sender = MyUser.objects.get(id=sender_id)

        Messages.objects.create(
            conversation=conversation,
            sender=sender,
            text=text
        )

    except Conversation.DoesNotExist:
        print(f"Conversation with id {conversation_id} does not exist.")
    except MyUser.DoesNotExist:
        print(f"User with id {sender_id} does not exist.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")





class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get the room_name from the URL route using the room_name parameter from the websocket_routing
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        # then we create chat_room_name as the room_group_name
        self.room_group_name = f'chat_{self.room_name}'


        # First, check if the user is authenticated (from your middleware) in the scope object
        if not self.scope["user"].is_authenticated:
            await self.close() # Reject unauthenticated connections
            return

        # If authenticated, proceed to join the channel layer group (the "room")
        # add the current user channel_name to the room_group_name
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

        conversation_id = text_data_json.get('conversation_id')
        sender_id = text_data_json.get('sender')
        text = text_data_json.get('text')

        utc_time = datetime.now(timezone.utc)
        iso_format_time = utc_time.isoformat()


        await save_message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            text=text
        )


        # Create the final message object on the backend
        final_message = {
            'type': 'chat.message', # Keep the type for the frontend to identify it
            'conversation_id': conversation_id,
            'sender': sender_id,
            'text': text,
            'timestamp': iso_format_time
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