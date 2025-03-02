from fastapi import APIRouter
from typing import List, Dict
from pydantic import BaseModel
from app.core.whatsapp_parser import WhatsAppParser
from app.api.dependencies import create_parser_from_messages
from app.services.sensitive_data_detector import SensitiveDataDetector
from app.api.models import (
    MessageBase, 
    SecurityFinding, 
    RiskLevels, 
    SecurityRecommendation, 
    SecurityAnalysis, 
    RedactedMessage,
    AnalyzeSecurityRequest,
    GetSensitiveDataRequest,
    GetRedactedMessagesRequest
)
from datetime import datetime

router = APIRouter()
detector = SensitiveDataDetector()

@router.post("/analyze", response_model=SecurityAnalysis)
async def analyze_security_stateless(request: AnalyzeSecurityRequest):
    """
    Analyze chat messages for security concerns and sensitive data.
    Returns a comprehensive security analysis with findings and recommendations.
    (Stateless approach)
    """
    if not request.messages:
        return SecurityAnalysis(
            security_score=100,
            total_findings=0,
            findings=[],
            risk_levels=RiskLevels(high=0, medium=0, low=0),
            recommendations=[]
        )
    
    # Create a parser from the provided messages
    parser = create_parser_from_messages(request.messages)
    
    # Analyze security
    analysis = detector.analyze_security(parser.messages)
    
    # Ensure the response matches the expected format
    for finding in analysis["findings"]:
        # Make sure all required fields are present
        if "description" not in finding:
            finding["description"] = f"Security issue of type: {finding['type']}"
        
        if "message_index" not in finding:
            finding["message_index"] = 0
            
        if "sender" not in finding:
            finding["sender"] = finding["message"].get("sender", "Unknown")
            
        if "timestamp" not in finding:
            finding["timestamp"] = finding["message"].get("timestamp", datetime.now().isoformat())
    
    # Ensure recommendations have the right format
    for rec in analysis["recommendations"]:
        if "steps" not in rec:
            rec["steps"] = None
        if "priority" not in rec:
            rec["priority"] = None
    
    return SecurityAnalysis(**analysis)

@router.post("/sensitive-data", response_model=Dict[str, List[str]])
async def get_sensitive_data_stateless(request: GetSensitiveDataRequest):
    """
    Get all detected sensitive data from the chat.
    Returns a dictionary mapping data types to lists of detected values.
    (Stateless approach)
    """
    all_sensitive_data = {}
    
    for msg in request.messages:
        if msg.message_type == "text":
            sensitive_data = detector.detect_sensitive_data(msg.content)
            for data_type, values in sensitive_data.items():
                if data_type not in all_sensitive_data:
                    all_sensitive_data[data_type] = []
                all_sensitive_data[data_type].extend(values)
    
    # Remove duplicates while preserving order
    for data_type in all_sensitive_data:
        all_sensitive_data[data_type] = list(dict.fromkeys(all_sensitive_data[data_type]))
    
    return all_sensitive_data

@router.post("/redacted", response_model=List[RedactedMessage])
async def get_redacted_messages_stateless(request: GetRedactedMessagesRequest):
    """
    Get messages with sensitive data redacted.
    Returns a list of messages with both original and redacted content.
    (Stateless approach)
    """
    redacted_messages = []
    
    for msg in request.messages:
        if msg.message_type == "text":
            redacted_content = detector.redact_sensitive_data(msg.content)
            if redacted_content != msg.content:
                redacted_messages.append(RedactedMessage(
                    original=msg.dict(),
                    redacted_content=redacted_content
                ))
    
    return redacted_messages 