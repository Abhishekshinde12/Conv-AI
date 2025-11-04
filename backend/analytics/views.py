from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .services import structured_llm


class GetAnalytics(APIView):
    def post(self, request):
        messages = request.data.get("messages", [])

        if not messages:
            return Response({"error": "Messages are required"}, status=status.HTTP_400_BAD_REQUEST)

        prompt = f'''
            Based on following chat conversation between an bank customer and bank representative you need to provide me with these analytics. And only answer based on context if have no details simply return :- No details
            1. Provide summary of the conversation happened so far
            2. Sentiment of the user
            3. If there is some chats related to loan, tell what type of loan does the user is asking for
            4. Based on conversation tell the customer lead type
            5. Also give the rationale behind classifying the user with the particular lead type
            \n
            context: {messages}
        '''
        try:
            output = structured_llm.invoke(prompt)
            return Response(output.model_dump(), status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)