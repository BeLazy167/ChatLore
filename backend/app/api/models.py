from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

# Message models
class MessageBase(BaseModel):
    timestamp: datetime
    sender: str
    content: str
    message_type: str
    duration: Optional[str] = None
    url: Optional[str] = None
    language: str = "en"
    is_system_message: bool = False

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: str

    class Config:
        from_attributes = True

# Chat models
class ChatBase(BaseModel):
    name: str

class ChatCreate(ChatBase):
    messages: List[MessageBase]

class Chat(ChatBase):
    id: str
    upload_date: datetime
    message_count: int

    class Config:
        from_attributes = True

# Security models
class SecurityFinding(BaseModel):
    type: str
    risk_level: str
    message: Dict
    description: Optional[str] = None
    message_index: Optional[int] = None
    sender: Optional[str] = None
    timestamp: Optional[str] = None

class RiskLevels(BaseModel):
    high: int
    medium: int
    low: int

class SecurityRecommendation(BaseModel):
    title: str
    description: str
    steps: Optional[List[str]] = None
    priority: Optional[str] = None

class SecurityAnalysis(BaseModel):
    security_score: float
    total_findings: int
    findings: List[SecurityFinding]
    risk_levels: RiskLevels
    recommendations: List[SecurityRecommendation]

class RedactedMessage(BaseModel):
    original: Dict
    redacted_content: str

# Search models
class MessageContext(BaseModel):
    before: List[str]
    after: List[str]

class SearchResult(BaseModel):
    message: Dict
    similarity: float
    context: MessageContext
    explanation: Optional[str] = None

class TimeContext(BaseModel):
    same_sender_messages: List[Dict]
    time_window_messages: List[Dict]

class ContextResponse(BaseModel):
    message: Dict
    context: MessageContext
    time_context: TimeContext

class TopicCluster(BaseModel):
    topic_id: str
    messages: List[Dict]
    summary: str

class ConversationInsights(BaseModel):
    insights: str
    timestamp: str

# Request models for stateless API
class AnalyzeSecurityRequest(BaseModel):
    messages: List[MessageBase]

class GetSensitiveDataRequest(BaseModel):
    messages: List[MessageBase]

class GetRedactedMessagesRequest(BaseModel):
    messages: List[MessageBase]

class SemanticSearchRequest(BaseModel):
    messages: List[MessageBase]
    query: str
    min_similarity: float = Field(0.3, ge=0, le=1)
    limit: int = Field(10, ge=1, le=50)
    with_explanation: bool = False

class SimilarMessagesRequest(BaseModel):
    messages: List[MessageBase]
    message_id: int
    min_similarity: float = Field(0.3, ge=0, le=1)
    limit: int = Field(10, ge=1, le=50)

class TopicClustersRequest(BaseModel):
    messages: List[MessageBase]

class ConversationInsightsRequest(BaseModel):
    messages: List[MessageBase]
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

# Response models
class ChatUploadResponse(BaseModel):
    message: str
    total_messages: int
    statistics: Dict
    messages: List[MessageBase] 