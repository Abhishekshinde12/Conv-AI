from django.shortcuts import render
from authapp.models import MyUser
from rest_framework import status
from rest_framework.response import Response
from rest_framework import generics 
from .models import Conversation
from django.db.models import Q


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

        return Response({'representative_id': str(conversation.id)}, status=status.HTTP_200_OK)