import uuid 
from django.db import models
from authapp.models import MyUser

# Create your models here.
class Conversation(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, null=False, editable=False)
    user1 = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='user1')
    user2 = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='user2')

    class Meta:
        unique_together = ('user1', 'user2')


    def __str__(self):
        return f"Conversation ID : {self.id} between {self.user1_id} and {self.user2_id}"
    

class Messages(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, null=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    sender = models.ForeignKey(MyUser, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at',]

    def __str__(self):
        return "Message ID : {self.id}"