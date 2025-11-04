from django.shortcuts import render
from authapp.models import MyUser
from rest_framework import status
from rest_framework.response import Response
from rest_framework import generics 
from .models import Conversation
from django.db.models import Q


# FOR CUSTOMER VIEW
# View to get the representative id
# if conversation_id present return it, else create new one
class GetConversationIdAPIView(generics.RetrieveAPIView):
    def get(self, request, customer_id):
        print(customer_id)

        # customer object
        customer = MyUser.objects.filter(id=customer_id).first()
        print(customer)

        if not customer:
            return Response({"error": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)

        # get the online reprsentative
        representative = MyUser.objects.filter(user_type='representative').first()
        print(representative)

        if not representative:
            return Response({"error": "No Representative available"}, status=status.HTTP_404_NOT_FOUND)

        # create conversation_id for them, if already present that is returned
        conversation = Conversation.objects.filter(
            Q(user1=customer, user2=representative) | 
            Q(user1=representative, user2=customer)).first()

        if not conversation:
            conversation = Conversation.objects.create(user1=customer, user2=representative)

        # create id 

        return Response({'conversation_id': str(conversation.id)}, status=status.HTTP_200_OK)



# FOR REPRESENTATIVE VIEW
# take representative ---> take all convid in which he is present ---> get all the connected users ----> return the customer name + conversation id which will then be rendered
# then based on which user clicke by representative --> chat occurs between them
class GetConnectedUsers(generics.RetrieveAPIView):
    def get(self, request, representative_id):
        # 1. Getting the representative obj
        representative = MyUser.objects.filter(id=representative_id, user_type='representative').first()
        if not representative:
            return Response({"error": "Representative not found"}, status=status.HTTP_404_NOT_FOUND)

        # 2. Get all conversations where this representative is either user1 or user2
        conversations = Conversation.objects.filter(
            Q(user1=representative) | Q(user2=representative)
        ).select_related('user1', 'user2')

        if not conversations.exists():
            return Response({"message" : "No conversations found"}, status=status.HTTP_200_OK)

        # 3. Data
        conversation_data = []
        for conv in conversations:
            other_user = conv.user2 if conv.user1.user_type == "representative" else conv.user1
            user_name = f"{other_user.first_name} {other_user.last_name}"

            conversation_data.append({
                "conversation_id": str(conv.id),
                "user_name": user_name
            })

        return Response(conversation_data, status=status.HTTP_200_OK)