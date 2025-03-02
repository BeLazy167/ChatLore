from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict
from app.core.whatsapp_parser import WhatsAppParser
from app.services.sensitive_data_detector import SensitiveDataDetector
from app.api.models import MessageBase, ChatUploadResponse
from pydantic import BaseModel
import nltk

# Download required NLTK data
try:
    nltk.data.find('punkt')
    nltk.data.find('stopwords')
    nltk.data.find('wordnet')
    nltk.data.find('averaged_perceptron_tagger')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')
    nltk.download('averaged_perceptron_tagger')

router = APIRouter()
detector = SensitiveDataDetector()

class ChatStats(BaseModel):
    total_messages: int
    participants: List[str]
    media_count: int
    date_range: Dict[str, str]
    activity_by_hour: Dict[str, int]
    activity_by_date: Dict[str, int]
    participant_stats: Dict[str, Dict[str, int]]

class UploadResponse(BaseModel):
    message: str
    total_messages: int
    statistics: Dict

@router.post("/process", response_model=ChatUploadResponse)
async def process_chat_text(chat_text: str = Body(..., embed=True)):
    """
    Process a WhatsApp chat text directly.
    Returns basic statistics about the chat and the parsed messages.
    This endpoint is designed for stateless operation.
    """
    try:
        # Parse messages
        local_parser = WhatsAppParser()
        messages = local_parser.parse_chat(chat_text)
        
        # Get chat statistics
        stats = local_parser.get_statistics()
        
        # Convert messages to the format expected by the frontend
        message_list = [
            {
                "timestamp": msg.timestamp,
                "sender": msg.sender,
                "content": msg.content,
                "message_type": msg.message_type,
                "duration": msg.duration,
                "url": msg.url,
                "language": msg.language,
                "is_system_message": msg.is_system_message
            }
            for msg in messages
        ]
        
        return ChatUploadResponse(
            message="Chat processed successfully",
            total_messages=len(messages),
            statistics=stats,
            messages=message_list
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/messages", response_model=List[Dict])
async def get_messages_stateless(
    messages: List[MessageBase],
    skip: int = 0,
    limit: int = 100
):
    """Get parsed messages with pagination (stateless approach)"""
    result_messages = messages[skip:skip + limit]
    return [msg.dict() for msg in result_messages]

@router.post("/stats")
async def get_stats_stateless(messages: List[MessageBase]):
    """Get chat statistics (stateless approach)"""
    # Create a temporary parser and populate it with the provided messages
    local_parser = WhatsAppParser()
    
    # Convert Pydantic models to WhatsApp parser Message objects
    parser_messages = []
    for msg in messages:
        parser_message = local_parser.create_message(
            timestamp=msg.timestamp,
            sender=msg.sender,
            content=msg.content,
            message_type=msg.message_type,
            duration=msg.duration,
            url=msg.url,
            language=msg.language,
            is_system_message=msg.is_system_message
        )
        parser_messages.append(parser_message)
    
    # Set the messages and update statistics
    local_parser.messages = parser_messages
    local_parser.participants = set(msg.sender for msg in parser_messages if not msg.is_system_message)
    local_parser._update_statistics()
    
    return local_parser.get_statistics() 