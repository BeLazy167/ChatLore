from fastapi import APIRouter, HTTPException, Query, Body
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from collections import Counter
import math
from typing import List, Dict, Optional
from app.core.whatsapp_parser import WhatsAppParser, Message

from app.services.search_service import SearchService
from datetime import datetime, timedelta
from app.api.models import (
    MessageBase,
    MessageContext,
    SearchResult,
    TimeContext,    
    ContextResponse,
    TopicCluster,
    ConversationInsights,
    SemanticSearchRequest,
    SimilarMessagesRequest,
    TopicClustersRequest,
    ConversationInsightsRequest
)

router = APIRouter()
search_service = SearchService()

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def preprocess_text(text: str) -> List[str]:
    """Preprocess text for similarity comparison"""
    # Tokenize and convert to lowercase
    tokens = word_tokenize(text.lower())
    # Remove stopwords and lemmatize
    tokens = [lemmatizer.lemmatize(token) for token in tokens if token.isalnum() and token not in stop_words]
    return tokens

def get_tf_idf_vector(text: str, idf_dict: Dict[str, float]) -> Dict[str, float]:
    """Calculate TF-IDF vector for a text"""
    tokens = preprocess_text(text)
    tf = Counter(tokens)
    vector = {}
    for token in tf:
        if token in idf_dict:
            vector[token] = tf[token] * idf_dict[token]
    return vector

def cosine_similarity(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
    """Calculate cosine similarity between two vectors"""
    intersection = set(vec1.keys()) & set(vec2.keys())
    
    numerator = sum([vec1[x] * vec2[x] for x in intersection])
    
    sum1 = sum([vec1[x]**2 for x in vec1.keys()])
    sum2 = sum([vec2[x]**2 for x in vec2.keys()])
    denominator = math.sqrt(sum1) * math.sqrt(sum2)
    
    if not denominator:
        return 0.0
    return float(numerator) / denominator

def get_message_similarity(query: str, message: str, idf_dict: Dict[str, float]) -> float:
    """Calculate semantic similarity between query and message"""
    query_vector = get_tf_idf_vector(query, idf_dict)
    message_vector = get_tf_idf_vector(message, idf_dict)
    return cosine_similarity(query_vector, message_vector)

def get_message_context(messages: List[Message], target_idx: int, window: int = 2) -> MessageContext:
    """Get context messages around a specific message"""
    start_idx = max(0, target_idx - window)
    end_idx = min(len(messages), target_idx + window + 1)
    
    return MessageContext(
        before=[msg.content for msg in messages[start_idx:target_idx]],
        after=[msg.content for msg in messages[target_idx + 1:end_idx]]
    )

def calculate_idf(messages: List[Message]) -> Dict[str, float]:
    """Calculate IDF values for all terms in the corpus"""
    document_frequency = Counter()
    total_documents = len(messages)
    
    # Count document frequency for each term
    for msg in messages:
        if msg.message_type != "text":
            continue
        unique_terms = set(preprocess_text(msg.content))
        for term in unique_terms:
            document_frequency[term] += 1
    
    # Calculate IDF
    idf_dict = {}
    for term, freq in document_frequency.items():
        idf_dict[term] = math.log(total_documents / (1 + freq))
    
    return idf_dict

@router.post("/semantic", response_model=List[SearchResult])
async def semantic_search_stateless(request: SemanticSearchRequest):
    """
    Perform semantic search on messages using Gemini.
    Returns messages ranked by relevance to the query.
    (Stateless approach)
    """
    # Create a temporary search service
    temp_search_service = SearchService()
    
    # Create a parser from the provided messages
    parser = request.messages
    
    # Initialize the search service
    await temp_search_service.initialize(parser)
    
    # Perform semantic search
    results = await temp_search_service.semantic_search(
        query=request.query,
        min_similarity=request.min_similarity,
        limit=request.limit,
        with_explanation=request.with_explanation
    )
    
    return results

@router.post("/similar", response_model=List[SearchResult])
async def get_similar_messages_stateless(request: SimilarMessagesRequest):
    """
    Find messages similar to a specific message.
    (Stateless approach)
    """
    # Create a temporary search service
    temp_search_service = SearchService()
    
    # Get the messages from the request
    messages = request.messages
    
    # Initialize the search service
    await temp_search_service.initialize(messages)
    
    # Perform semantic search using the message content directly
    results = await temp_search_service.semantic_search(
        query=request.message,
        min_similarity=request.min_similarity,
        limit=request.limit,
        with_explanation=True   
    )
    
    return [
        SearchResult(
            message=result.message.dict(),
            similarity=result.similarity,
            context=MessageContext(**result.context),
            explanation=None
        )
        for result in results
        if result.message.dict()["content"] != request.message  # Exclude the query message if it matches exactly
    ]

@router.post("/topics", response_model=List[TopicCluster])
async def get_topic_clusters_stateless(request: TopicClustersRequest):
    """
    Group messages into topic clusters and generate summaries.
    (Stateless approach)
    """
    # Create a temporary search service
    temp_search_service = SearchService()
    
    # Create a parser from the provided messages
    parser = request.messages
    
    # Initialize the search service
    await temp_search_service.initialize(parser)
    
    # Get topic clusters
    clusters = await temp_search_service.get_topic_clusters()
    
    # Generate summaries for each cluster
    topic_clusters = []
    for topic_id, message_indices in clusters.items():
        cluster_messages = [parser.messages[idx] for idx in message_indices]
        
        # Generate summary for cluster with error handling
        try:
            insights = await temp_search_service.get_conversation_insights(cluster_messages)
            summary = insights.get("insights", "No insights available")
        except Exception as e:
            print(f"Error generating cluster summary: {e}")
            # Provide a fallback summary that doesn't rely on the API
            summary = f"Cluster with {len(cluster_messages)} messages"
            if len(cluster_messages) > 0:
                # Include the most common words or phrases if possible
                try:
                    words = " ".join([msg.content for msg in cluster_messages]).split()
                    word_counts = Counter(words)
                    common_words = ", ".join([word for word, _ in word_counts.most_common(5)])
                    summary = f"Cluster with {len(cluster_messages)} messages. Common terms: {common_words}"
                except Exception:
                    pass
        
        topic_clusters.append(TopicCluster(
            topic_id=topic_id,
            messages=[msg.dict() for msg in cluster_messages],
            summary=summary
        ))
    
    return topic_clusters

@router.post("/insights", response_model=ConversationInsights)
async def get_conversation_insights_stateless(request: ConversationInsightsRequest):
    """
    Generate AI insights about the conversation.
    (Stateless approach)
    """
    # Create a temporary search service
    temp_search_service = SearchService()
    
    # Create a parser from the provided messages
    parser = create_parser_from_messages(request.messages)
    
    # Initialize the search service
    await temp_search_service.initialize(parser.messages)
    
    # Filter messages by date range if specified
    messages = parser.messages
    if request.start_date or request.end_date:
        if request.start_date and request.end_date:
            messages = [msg for msg in messages if request.start_date <= msg.timestamp <= request.end_date]
        elif request.start_date:
            messages = [msg for msg in messages if request.start_date <= msg.timestamp]
        elif request.end_date:
            messages = [msg for msg in messages if msg.timestamp <= request.end_date]
    
    # Get insights
    insights = await temp_search_service.get_conversation_insights(messages)
    
    return ConversationInsights(
        insights=insights.get("insights", "No insights available"),
        timestamp=insights.get("timestamp", datetime.now().isoformat())
    ) 