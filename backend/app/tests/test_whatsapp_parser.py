import pytest
from app.core.whatsapp_parser import WhatsAppParser

SAMPLE_CHAT = """[10/09/2023, 1:04:31 PM] Meet Bhanushali: ‎Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
[10/09/2023, 1:04:31 PM] Meet Bhanushali: 6 for?
[10/09/2023, 2:12:54 PM] Dhruv: Hello"""

def test_whatsapp_parser():
    parser = WhatsAppParser()
    messages = parser.parse_chat(SAMPLE_CHAT)
    
    assert len(messages) == 3
    
    # Test first message
    assert messages[0].sender == "Meet Bhanushali"
    assert "end-to-end encrypted" in messages[0].content
    assert messages[0].message_type == "text"
    
    # Test second message
    assert messages[1].sender == "Meet Bhanushali"
    assert messages[1].content == "6 for?"
    
    # Test third message
    assert messages[2].sender == "Dhruv"
    
    # Test statistics
    stats = parser.get_statistics()
    assert stats["total_messages"] == 3
    assert "Meet Bhanushali" in stats["participants"]
    assert "Dhruv" in stats["participants"] 