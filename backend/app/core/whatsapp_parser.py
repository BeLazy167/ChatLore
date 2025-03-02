import re
from datetime import datetime
from typing import List, Dict, Optional
from pydantic import BaseModel
import emoji
import pytz
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

class Message(BaseModel):
    """WhatsApp message model"""
    timestamp: datetime
    sender: str
    content: str
    message_type: str  # text, image, video, voice_call, etc.
    duration: Optional[str] = None  # For calls/voice messages
    url: Optional[str] = None  # For messages containing URLs
    language: str = "en"  # Default to English
    is_system_message: bool = False

class WhatsAppParser:
    def __init__(self):
        # Regular expressions for parsing
        self.timestamp_pattern = r"\[([\d/]+,\s*[\d:]+\s*[APM]+)\]"
        self.message_pattern = fr"{self.timestamp_pattern}\s*([^:]+):\s*(.*)"
        self.url_pattern = r"https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+"
        
        # Special message patterns
        self.media_patterns = {
            "image": r"‎image omitted",
            "video": r"‎video omitted",
            "sticker": r"‎sticker omitted",
            "voice_call": r"‎Voice call,\s*‎([^‎]+)",
            "video_call": r"‎Video call,\s*‎([^‎]+)",
            "document": r"‎document omitted",
            "gif": r"‎GIF omitted"
        }
        
        # Initialize message storage
        self.messages: List[Message] = []
        self.participants: set = set()
        self.statistics: Dict = {}

    def create_message(self, timestamp: datetime, sender: str, content: str, 
                      message_type: str, duration: Optional[str] = None, 
                      url: Optional[str] = None, language: str = "en", 
                      is_system_message: bool = False) -> Message:
        """Create a Message object directly"""
        message = Message(
            timestamp=timestamp,
            sender=sender,
            content=content,
            message_type=message_type,
            duration=duration,
            url=url,
            language=language,
            is_system_message=is_system_message
        )
        
        return message

    def parse_timestamp(self, timestamp_str: str) -> datetime:
        """Parse WhatsApp timestamp into datetime object"""
        try:
            # Remove brackets and convert to datetime
            timestamp_str = timestamp_str.strip("[]")
            # Handle the specific format from example: DD/MM/YYYY, H:MM:SS AM/PM
            return datetime.strptime(timestamp_str, "%d/%m/%Y, %I:%M:%S %p")
        except ValueError as e:
            raise ValueError(f"Invalid timestamp format: {timestamp_str}") from e

    def detect_message_type(self, content: str) -> tuple[str, Optional[str]]:
        """Detect message type and extract duration if applicable"""
        for msg_type, pattern in self.media_patterns.items():
            match = re.search(pattern, content)
            if match:
                duration = match.group(1) if msg_type in ["voice_call", "video_call"] else None
                return msg_type, duration
        return "text", None

    def detect_language(self, text: str) -> str:
        """Detect if text contains Hindi/mixed language"""
        # Simple heuristic: check for Devanagari characters
        if re.search(r'[\u0900-\u097F]', text):
            return "hi_en"  # Hindi-English mixed
        return "en"

    def extract_urls(self, content: str) -> Optional[str]:
        """Extract URLs from message content"""
        urls = re.findall(self.url_pattern, content)
        return urls[0] if urls else None

    def parse_line(self, line: str) -> Optional[Message]:
        """Parse a single line of WhatsApp chat"""
        if not line.strip():
            return None

        # Try to match the message pattern
        match = re.match(self.message_pattern, line)
        if not match:
            return None

        timestamp_str, sender, content = match.groups()
        
        # Parse timestamp
        try:
            timestamp = self.parse_timestamp(timestamp_str)
        except ValueError:
            return None

        # Clean sender name and content
        sender = sender.strip()
        content = content.strip()

        # Detect message type and duration
        message_type, duration = self.detect_message_type(content)
        
        # Extract URL if present
        url = self.extract_urls(content)
        
        # Detect language
        language = self.detect_language(content)
        
        # Check if it's a system message
        is_system_message = "Messages and calls are end-to-end encrypted" in content

        # Create message object
        message = Message(
            timestamp=timestamp,
            sender=sender,
            content=content,
            message_type=message_type,
            duration=duration,
            url=url,
            language=language,
            is_system_message=is_system_message
        )

        # Update participants set
        if not is_system_message:
            self.participants.add(sender)

        return message

    def parse_chat(self, chat_text: str) -> List[Message]:
        """Parse entire WhatsApp chat export"""
        self.messages = []
        self.participants = set()
        
        # Split into lines and parse each line
        lines = chat_text.split('\n')
        current_message = []
        
        for line in lines:
            # Check if line starts a new message
            if re.match(self.timestamp_pattern, line):
                # Process previous message if exists
                if current_message:
                    message = self.parse_line('\n'.join(current_message))
                    if message:
                        self.messages.append(message)
                current_message = [line]
            else:
                # Append to current message (handles multi-line messages)
                if current_message:
                    current_message.append(line)
        
        # Process last message
        if current_message:
            message = self.parse_line('\n'.join(current_message))
            if message:
                self.messages.append(message)
        
        # Update statistics
        self._update_statistics()
        
        return self.messages

    def _update_statistics(self):
        """Update chat statistics"""
        if not self.messages:
            return

        # Initialize statistics
        stats = {
            "participants": list(self.participants),
            "message_count": len(self.messages),
            "media_count": sum(1 for msg in self.messages if msg.message_type != "text"),
            "date_range": {
                "start": str(min(msg.timestamp for msg in self.messages)),
                "end": str(max(msg.timestamp for msg in self.messages))
            },
            "activity_by_hour": {},
            "activity_by_date": {},
            "participant_stats": {
                participant: {
                    "message_count": 0,
                    "media_count": 0,
                    "urls_shared": 0
                }
                for participant in self.participants
            }
        }

        # Calculate detailed statistics
        for msg in self.messages:
            # Activity by hour
            hour = msg.timestamp.strftime("%H")
            stats["activity_by_hour"][hour] = stats["activity_by_hour"].get(hour, 0) + 1

            # Activity by date
            date = msg.timestamp.strftime("%Y-%m-%d")
            stats["activity_by_date"][date] = stats["activity_by_date"].get(date, 0) + 1

            # Participant statistics
            if not msg.is_system_message:
                participant_stats = stats["participant_stats"][msg.sender]
                participant_stats["message_count"] += 1
                if msg.message_type != "text":
                    participant_stats["media_count"] += 1
                if msg.url:
                    participant_stats["urls_shared"] += 1

        self.statistics = stats

    def get_statistics(self) -> Dict:
        """Get chat statistics"""
        return self.statistics

    def get_messages_by_sender(self, sender: str) -> List[Message]:
        """Get all messages from a specific sender"""
        return [msg for msg in self.messages if msg.sender == sender]

    def get_messages_by_type(self, message_type: str) -> List[Message]:
        """Get all messages of a specific type"""
        return [msg for msg in self.messages if msg.message_type == message_type]

    def get_messages_in_timerange(self, start: datetime, end: datetime) -> List[Message]:
        """Get messages within a specific time range"""
        return [
            msg for msg in self.messages 
            if start <= msg.timestamp <= end
        ] 