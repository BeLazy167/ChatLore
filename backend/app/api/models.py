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
    message: str
    min_similarity: float = Field(0.3, ge=0, le=1)
    limit: int = Field(10, ge=1, le=50)

class TopicClustersRequest(BaseModel):
    messages: List[MessageBase]

class ConversationInsightsRequest(BaseModel):
    messages: List[MessageBase]
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class AnswerQuestionRequest(BaseModel):
    messages: List[MessageBase]
    question: str

class AnswerQuestionResponse(BaseModel):
    answer: str
    status: str
    error_type: Optional[str] = None
    timestamp: datetime
    question: str
    message_count: int
# Response models
class ChatUploadResponse(BaseModel):
    message: str
    total_messages: int
    statistics: Dict
    messages: List[MessageBase]

class SecurityInsightItem(BaseModel):
    title: str
    description: str
    severity: str
    impact: str
    recommendations: List[str]
    examples: Optional[List[str]] = None

class SecurityMetrics(BaseModel):
    securityScore: float
    totalFindings: int
    criticalCount: int
    highCount: int
    sensitiveDataCount: int

class SensitiveDataItem(BaseModel):
    count: int
    examples: List[str]

class SecurityTrend(BaseModel):
    category: str
    count: int

class SecurityRecommendationDetail(BaseModel):
    title: str
    description: str
    impact: str
    priority: str
    steps: List[str]

class SecurityInsightsResponse(BaseModel):
    insights: List[SecurityInsightItem]
    metrics: SecurityMetrics
    sensitiveData: Dict[str, SensitiveDataItem]
    trends: List[SecurityTrend]
    recommendations: List[SecurityRecommendationDetail]

class SecurityInsightsRequest(BaseModel):
    messages: List[MessageBase]

# Security Insights V2 models
class SecurityInsight2(BaseModel):
    title: str
    description: str
    severity: str
    recommendations: List[str]

class SecurityMetrics2(BaseModel):
    overallScore: float
    totalRisks: int
    riskLevel: str
    highRiskCount: int
    mediumRiskCount: int
    lowRiskCount: int
    sensitiveDataByType: Dict[str, int]

class SecurityTrend2(BaseModel):
    type: str
    direction: str
    changePercentage: float
    period: str
    description: str

class SecurityInsightsResponse2(BaseModel):
    metrics: SecurityMetrics2
    insights: List[SecurityInsight2]
    trends: List[SecurityTrend2]
    recommendations: Optional[List[SecurityRecommendationDetail]] = None

class SecurityInsightsRequest2(BaseModel):
    messages: List[MessageBase]
    compare_with_previous: bool = False 