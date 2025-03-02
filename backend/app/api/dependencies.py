from app.core.whatsapp_parser import WhatsAppParser
from typing import List
from app.api.models import MessageBase

def create_parser_from_messages(messages: List[MessageBase]) -> WhatsAppParser:
    """Create a new WhatsApp parser instance from a list of messages (stateless approach)"""
    parser = WhatsAppParser()
    
    # Convert Pydantic models to WhatsApp parser Message objects
    parser_messages = []
    for msg in messages:
        parser_message = parser.create_message(
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
    parser.messages = parser_messages
    parser.participants = set(msg.sender for msg in parser_messages if not msg.is_system_message)
    parser._update_statistics()
    
    return parser 