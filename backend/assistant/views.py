from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Thread, Message
from .serializers import ThreadSerializer, MessageSerializer
from .services.rag import RAGService
from ai_engine.services import LLMService

class ThreadViewSet(viewsets.ModelViewSet):
    """API for managing AI chat threads."""
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Thread.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def chat(self, request, pk=None):
        """Send a message to the thread, perform RAG, and get an AI response."""
        thread = self.get_object()
        user_text = request.data.get('content')
        if not user_text:
            return Response({'error': 'Message content required'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Save user message
        Message.objects.create(thread=thread, role='user', content=user_text)

        # 2. Retrieve RAG Context
        context = RAGService.retrieve_context(user_text)

        # 3. Construct LLM prompt
        system_prompt = (
            "You are ORBIS, an expert AI tutor for Official Statistics in India. "
            "Use the provided context to answer the user's question accurately. "
            "If the answer is not in the context, say so.\n\n"
            f"{context}"
        )

        messages = [{"role": "system", "content": system_prompt}]
        
        # Add recent conversation history (last 5 messages)
        recent_messages = thread.messages.order_by('-timestamp')[:5]
        for m in reversed(recent_messages):
            messages.append({"role": m.role, "content": m.content})

        # 4. Generate AI response
        try:
            # We use chat() for standard text completion rather than generate_json()
            output = LLMService.chat(messages=messages, max_tokens=512)
            ai_text = output['choices'][0]['message']['content'].strip()
        except Exception as e:
            print(f"LLM Chat Error: {e}")
            ai_text = "I'm currently unable to generate a response. Please check my AI engine configuration."

        # 5. Save AI message
        ai_msg = Message.objects.create(thread=thread, role='assistant', content=ai_text)
        
        return Response(MessageSerializer(ai_msg).data, status=status.HTTP_201_CREATED)
