import re
from typing import List, Dict, Optional
from app.core.whatsapp_parser import Message
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# Download required NLTK data
try:
    nltk.data.find('punkt')
    nltk.data.find('stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

class SensitiveDataDetector:
    def __init__(self):
        # Regular expressions for sensitive data
        self.patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'\b(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
            'credit_card': r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
            'date': r'\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b',
            'address': r'\b\d+\s+[A-Za-z\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way)\b',
            'location': r'\b(?:in|at|near|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b',
            'url': r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+'
        }
        
        # Load stopwords
        self.stop_words = set(stopwords.words('english'))

    def detect_sensitive_data(self, text: str) -> Dict[str, List[str]]:
        """Detect sensitive data in text"""
        findings = {}
        
        # Check each pattern
        for data_type, pattern in self.patterns.items():
            matches = re.finditer(pattern, text, re.IGNORECASE)
            matches = list(matches)
            if matches:
                findings[data_type] = [m.group() for m in matches]
        
        return findings

    def analyze_security(self, messages: List[Message]) -> Dict:
        """Analyze messages for security concerns"""
        findings = []
        sensitive_data_count = 0
        risk_levels = {"high": 0, "medium": 0, "low": 0}
        
        for idx, msg in enumerate(messages):
            if msg.message_type != "text":
                continue
                
            # Detect sensitive data
            sensitive_data = self.detect_sensitive_data(msg.content)
            
            if sensitive_data:
                sensitive_data_count += sum(len(items) for items in sensitive_data.values())
                
                # Assess risk level
                risk_level = self._assess_risk_level(sensitive_data)
                risk_levels[risk_level] += 1
                
                # Create finding with the new format
                finding = {
                    "type": "sensitive_data_exposure",
                    "risk_level": risk_level,
                    "message": msg.dict(),
                    "description": f"Found sensitive data: {', '.join(sensitive_data.keys())}",
                    "message_index": idx,
                    "sender": msg.sender,
                    "timestamp": msg.timestamp.isoformat() if hasattr(msg.timestamp, 'isoformat') else str(msg.timestamp)
                }
                findings.append(finding)
        
        # Calculate security score
        total_messages = len([msg for msg in messages if msg.message_type == "text"])
        if total_messages == 0:
            security_score = 100
        else:
            # Score based on sensitive data ratio and risk levels
            sensitive_ratio = sensitive_data_count / total_messages
            risk_score = (risk_levels["high"] * 3 + risk_levels["medium"] * 2 + risk_levels["low"]) / total_messages
            security_score = max(0, min(100, 100 - (sensitive_ratio * 50 + risk_score * 50)))
        
        return {
            "security_score": round(security_score, 2),
            "total_findings": len(findings),
            "findings": findings,
            "risk_levels": risk_levels,
            "recommendations": self._generate_recommendations(findings)
        }

    def _assess_risk_level(self, sensitive_data: Dict[str, List[str]]) -> str:
        """Assess risk level based on sensitive data types"""
        if any(data_type in sensitive_data for data_type in ["credit_card", "phone", "email"]):
            return "high"
        elif any(data_type in sensitive_data for data_type in ["address", "location"]):
            return "medium"
        return "low"

    def _generate_recommendations(self, findings: List[Dict]) -> List[Dict]:
        """Generate security recommendations based on findings"""
        recommendations = []
        
        # Check for sensitive data types
        sensitive_types = set()
        for finding in findings:
            if finding["type"] == "sensitive_data_exposure":
                sensitive_types.update(finding["message"].get("sensitive_data", {}).keys())
        
        # Generate recommendations based on sensitive data types
        if "credit_card" in sensitive_types:
            recommendations.append({
                "title": "Remove credit card information",
                "description": "Credit card numbers should never be shared in chat messages. Remove all instances of credit card numbers from your conversations."
            })
        
        if "phone" in sensitive_types:
            recommendations.append({
                "title": "Be cautious with phone numbers",
                "description": "Phone numbers can be used for identity theft or unwanted contact. Consider removing or obfuscating phone numbers in your chat."
            })
        
        if "email" in sensitive_types:
            recommendations.append({
                "title": "Protect email addresses",
                "description": "Email addresses can lead to spam or phishing attacks. Be careful when sharing email addresses in chat."
            })
        
        if "address" in sensitive_types or "location" in sensitive_types:
            recommendations.append({
                "title": "Limit location sharing",
                "description": "Sharing addresses or specific locations can compromise your privacy and safety. Avoid sharing precise location information."
            })
        
        # Add general recommendations
        if findings:
            recommendations.append({
                "title": "Review chat for sensitive information",
                "description": "Regularly review your chat history and remove any sensitive personal information that doesn't need to be there."
            })
            
            recommendations.append({
                "title": "Use secure communication channels",
                "description": "For highly sensitive information, consider using end-to-end encrypted communication channels or ephemeral messaging."
            })
        
        return recommendations

    def redact_sensitive_data(self, text: str) -> str:
        """Redact sensitive data from text"""
        redacted = text
        
        # Detect and redact each type of sensitive data
        sensitive_data = self.detect_sensitive_data(text)
        for data_type, items in sensitive_data.items():
            for item in items:
                redacted = redacted.replace(item, f"[REDACTED {data_type.upper()}]")
        
        return redacted 