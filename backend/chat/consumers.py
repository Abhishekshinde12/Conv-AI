import json
from authapp.models import MyUser
from datetime import datetime, timezone
from .models import Messages, Conversation
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

# saving the message to the DB
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


# Actually consumer used to communicate between users
class ChatConsumer(AsyncWebsocketConsumer):

    # function to connect
    async def connect(self):    
        # First, check if the user is authenticated (JWTMiddleware used here) in the scope object
        if not self.scope["user"].is_authenticated:
            await self.close() # Reject unauthenticated connections
            return

        # Get the room_name from the URL route using the room_name parameter from the websocket_routing
        # on which request made by user
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        # then we create the channel layer group name using room_name in socket url
        self.room_group_name = f'chat_{self.room_name}'

        # If authenticated, proceed to join to the channel layer using
        # the group name in the channels and the channel_name (unique name for each of the websocket object (or user))
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # accept the connection
        await self.accept()



    # function to disconnect
    async def disconnect(self, close_code):
        # On disconnect, leave the room group
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )



    # function to receive data from the socket
    # text_data = for text_data
    # another parameter exists, binary_data = for binary data
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        conversation_id = text_data_json.get('conversation_id')
        sender_id = text_data_json.get('sender')
        text = text_data_json.get('text')

        utc_time = datetime.now(timezone.utc)
        iso_format_time = utc_time.isoformat()

        # saving message to the DB
        await save_message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            text=text
        )


        # Create the final message object on the backend
        final_message = {
            # lot of data might we passing through websockets
            # data like notification, alert, typing, etc data can be present in the websocket connection
            # the purpose of this is what kind of message it just received so frontend knows how to handle it.
            # without type label - frontend would receive blob of data and have no idea what it is or what to do with it
            # format of the value for this key - can be anything, but a good pratice is to use namespace.action format
            # eg.'chat.message'	A standard message sent by a user in a chat.
            # 'user.typing.start'	A notification that a user has started typing.
            # 'user.typing.stop'	A notification that a user has stopped typing.
            'type': 'chat.message',

            # actual data to send 
            'conversation_id': conversation_id,
            'sender': sender_id,
            'text': text,
            'timestamp': iso_format_time
        }

        # Broadcast the new, complete message object
        # This is not socket send, it tells channel layer to take this dict and deliver it to every consumer currently subscribed to the group
        await self.channel_layer.group_send(
            # group name in channels
            self.room_group_name,
            # this is an event dictionary
            {
                # This is the event name for the handler
                # Looks for the chat_message handler on the consumer with this name
                # if type: chat.message would also converted to chat_message
                'type': 'chat_message', 
                'message_data': final_message # Send the enriched message
            }
        )
    
    # this method invoke on all consumer in group
    # both get event dict as an argument
    # each consumer takes the message from event dict and then sends the complete message to the websocket of user (browser)
    # for each connected user this function runs
    async def chat_message(self, event):
        message_data = event['message_data']
        # Send the final message object to the client
        await self.send(text_data=json.dumps(message_data))