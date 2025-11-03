import json
from channels.generic.websocket import AsyncWebsocketConsumer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # The middleware has already populated self.scope['user']
        print("consumer")
        if self.scope["user"].is_authenticated:
            await self.accept()
            print(self.scope["user"])
        else:
            await self.close() # This is what causes the 403

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        print(message)

        self.send(text_data=json.dumps({"message": message}))