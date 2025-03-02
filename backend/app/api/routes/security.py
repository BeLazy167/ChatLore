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
    GetRedactedMessagesRequest,
    SecurityInsightsRequest,
    SecurityInsightsResponse,
    SecurityInsightItem,
    SecurityMetrics,
    SensitiveDataItem,
    SecurityTrend,
    SecurityRecommendationDetail
)
from datetime import datetime
import random

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

@router.post("/insights", response_model=SecurityInsightsResponse)
async def get_security_insights(request: SecurityInsightsRequest):
    """
    Generate comprehensive security insights from chat messages.
    Returns detailed security findings, metrics, sensitive data analysis, trends, and recommendations.
    """
    if not request.messages:
        # Return empty response if no messages provided
        return SecurityInsightsResponse(
            insights=[],
            metrics=SecurityMetrics(
                securityScore=100,
                totalFindings=0,
                criticalCount=0,
                highCount=0,
                sensitiveDataCount=0
            ),
            sensitiveData={},
            trends=[],
            recommendations=[]
        )
    
    # Create a parser from the provided messages
    parser = create_parser_from_messages(request.messages)
    
    # Get basic security analysis
    basic_analysis = detector.analyze_security(parser.messages)
    
    # Get all sensitive data
    all_sensitive_data = {}
    sensitive_data_count = 0
    
    for msg in request.messages:
        if msg.message_type == "text":
            sensitive_data = detector.detect_sensitive_data(msg.content)
            for data_type, values in sensitive_data.items():
                if data_type not in all_sensitive_data:
                    all_sensitive_data[data_type] = []
                all_sensitive_data[data_type].extend(values)
                sensitive_data_count += len(values)
    
    # Remove duplicates while preserving order
    for data_type in all_sensitive_data:
        all_sensitive_data[data_type] = list(dict.fromkeys(all_sensitive_data[data_type]))
    
    # Generate insights based on findings
    insights = []
    
    # Email insight
    if "email" in all_sensitive_data and len(all_sensitive_data["email"]) > 0:
        insights.append(SecurityInsightItem(
            title="Email Address Exposure",
            description="Email addresses were found in the conversation",
            severity="high",
            impact="Email addresses can be used for phishing attacks, spam, or identity theft",
            recommendations=[
                "Remove email addresses when sharing conversations",
                "Use secure channels for sharing email addresses",
                "Consider using masked or temporary email addresses"
            ],
            examples=all_sensitive_data["email"][:3]  # Show up to 3 examples
        ))
    
    # Phone number insight
    if "phone" in all_sensitive_data and len(all_sensitive_data["phone"]) > 0:
        insights.append(SecurityInsightItem(
            title="Phone Number Exposure",
            description="Phone numbers were found in the conversation",
            severity="high",
            impact="Phone numbers can be used for unwanted calls, SMS phishing, or identity verification attacks",
            recommendations=[
                "Remove phone numbers when sharing conversations",
                "Use messaging apps that don't require phone number sharing",
                "Consider using temporary phone numbers for sensitive communications"
            ],
            examples=all_sensitive_data["phone"][:3]  # Show up to 3 examples
        ))
    
    # Credit card insight
    if "credit_card" in all_sensitive_data and len(all_sensitive_data["credit_card"]) > 0:
        insights.append(SecurityInsightItem(
            title="Credit Card Information Exposure",
            description="Credit card numbers were found in the conversation",
            severity="critical",
            impact="Credit card information can be used for financial fraud and unauthorized transactions",
            recommendations=[
                "Immediately remove all credit card numbers from the conversation",
                "Never share credit card details through chat",
                "Use secure payment methods instead of sharing card details"
            ],
            examples=all_sensitive_data["credit_card"][:2]  # Show up to 2 examples
        ))
    
    # Location insight
    if ("location" in all_sensitive_data or "address" in all_sensitive_data) and \
       (len(all_sensitive_data.get("location", [])) > 0 or len(all_sensitive_data.get("address", [])) > 0):
        location_examples = all_sensitive_data.get("location", [])[:2] + all_sensitive_data.get("address", [])[:2]
        insights.append(SecurityInsightItem(
            title="Location Information Exposure",
            description="Location details were found in the conversation",
            severity="medium",
            impact="Location information can compromise physical security and privacy",
            recommendations=[
                "Avoid sharing precise location information in chats",
                "Use general area names instead of specific addresses",
                "Be cautious about sharing meeting locations publicly"
            ],
            examples=location_examples[:3]  # Show up to 3 examples
        ))
    
    # URL insight
    if "url" in all_sensitive_data and len(all_sensitive_data["url"]) > 0:
        insights.append(SecurityInsightItem(
            title="URL Sharing",
            description="URLs were shared in the conversation",
            severity="low",
            impact="Malicious URLs can lead to phishing, malware, or data theft",
            recommendations=[
                "Verify all URLs before clicking",
                "Use URL preview features to check destinations",
                "Be cautious with shortened URLs"
            ],
            examples=all_sensitive_data["url"][:3]  # Show up to 3 examples
        ))
    
    # Prepare sensitive data for response
    sensitive_data_response = {}
    for data_type, values in all_sensitive_data.items():
        sensitive_data_response[data_type] = SensitiveDataItem(
            count=len(values),
            examples=values[:3]  # Show up to 3 examples
        )
    
    # Calculate metrics
    critical_count = sum(1 for insight in insights if insight.severity == "critical")
    high_count = sum(1 for insight in insights if insight.severity == "high")
    
    # Generate security trends
    trends = [
        SecurityTrend(category="Critical", count=critical_count),
        SecurityTrend(category="High", count=high_count),
        SecurityTrend(category="Medium", count=sum(1 for insight in insights if insight.severity == "medium")),
        SecurityTrend(category="Low", count=sum(1 for insight in insights if insight.severity == "low"))
    ]
    
    # Add data type trends
    for data_type, values in all_sensitive_data.items():
        if len(values) > 0:
            trends.append(SecurityTrend(
                category=data_type.capitalize(),
                count=len(values)
            ))
    
    # Generate detailed recommendations
    recommendations = []
    
    if critical_count > 0 or high_count > 0:
        recommendations.append(SecurityRecommendationDetail(
            title="Secure Sensitive Information",
            description="Remove or secure highly sensitive information found in your conversations",
            impact="Reduces risk of identity theft, financial fraud, and privacy violations",
            priority="high",
            steps=[
                "Review all conversations for sensitive data like credit cards and phone numbers",
                "Delete or redact sensitive information",
                "Use secure channels for sharing necessary sensitive information",
                "Consider using encryption for highly sensitive communications"
            ]
        ))
    
    if "location" in all_sensitive_data or "address" in all_sensitive_data:
        recommendations.append(SecurityRecommendationDetail(
            title="Protect Location Privacy",
            description="Minimize sharing of location information in conversations",
            impact="Enhances physical security and reduces stalking or tracking risks",
            priority="medium",
            steps=[
                "Use general area names instead of specific addresses",
                "Remove exact addresses from shared conversation history",
                "Consider using private channels for coordinating meetings",
                "Be aware of location metadata in shared images"
            ]
        ))
    
    recommendations.append(SecurityRecommendationDetail(
        title="Implement Regular Security Reviews",
        description="Regularly review conversation history for security issues",
        impact="Proactively identifies and addresses security concerns before they lead to incidents",
        priority="medium",
        steps=[
            "Schedule monthly reviews of conversation security",
            "Use this security insights tool to scan conversations",
            "Educate group members about secure communication practices",
            "Establish guidelines for what information should not be shared in chat"
        ]
    ))
    
    # Calculate security score
    # Base score of 100, deduct points based on findings
    security_score = 100
    if critical_count > 0:
        security_score -= 30 * min(critical_count, 3)  # Max deduction of 90 for critical
    if high_count > 0:
        security_score -= 15 * min(high_count, 4)      # Max deduction of 60 for high
    
    # Ensure score is between 0-100
    security_score = max(0, min(100, security_score))
    
    return SecurityInsightsResponse(
        insights=insights,
        metrics=SecurityMetrics(
            securityScore=security_score,
            totalFindings=len(insights),
            criticalCount=critical_count,
            highCount=high_count,
            sensitiveDataCount=sensitive_data_count
        ),
        sensitiveData=sensitive_data_response,
        trends=trends,
        recommendations=recommendations
    ) 