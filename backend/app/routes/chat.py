from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.api.models import ChatMessage, ChatResponse
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["chat"])
chat_service = ChatService()

@router.post("/ask")
async def ask_question(
    question: str,
    messages: Optional[List[ChatMessage]] = None,
    chat_id: Optional[str] = None
) -> ChatResponse:
    """
    Process a question about the chat history and return an AI-generated response.
    """
    try:
        response = await chat_service.process_question(
            question=question,
            messages=messages,
            chat_id=chat_id
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 