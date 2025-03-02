from typing import List, Dict, Optional
import google.generativeai as genai
from google.generativeai.types import GenerateContentResponse
from app.core.whatsapp_parser import Message
from datetime import datetime, timedelta
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import os
from dotenv import load_dotenv
import time
import random

load_dotenv()

# Configure Gemini
print(os.getenv("GEMINI_API_KEY"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

class SearchResult:
    def __init__(self, message: Message, similarity: float, context: Dict[str, List[str]], explanation: str = ""):
        self.message = message
        self.similarity = similarity
        self.context = context
        self.explanation = explanation

class SearchService:
    def __init__(self):
        self.messages: List[Message] = []
        self.embeddings: Dict[int, np.ndarray] = {}
        self.last_query_embedding: Optional[np.ndarray] = None
        self.vectorizer: Optional[TfidfVectorizer] = None

    async def initialize(self, messages: List[Message]):
        """Initialize the search service with messages"""
        self.messages = messages
        # Generate embeddings for all messages
        await self._generate_embeddings()

    async def _generate_embeddings(self):
        """Generate embeddings for all messages using TF-IDF"""
        # Get all text messages
        texts = [msg.content for msg in self.messages if msg.message_type == "text"]
        
        if not texts:
            return
        
        # Create and fit TF-IDF vectorizer
        self.vectorizer = TfidfVectorizer()
        tfidf_matrix = self.vectorizer.fit_transform(texts)
        
        # Store embeddings
        idx = 0
        for i, msg in enumerate(self.messages):
            if msg.message_type == "text":
                self.embeddings[i] = tfidf_matrix[idx].toarray()[0]
                idx += 1

    async def _get_embedding(self, text: str) -> np.ndarray:
        """Get embedding for a text using TF-IDF"""
        if self.vectorizer is None:
            return np.zeros(1)
        
        # Transform text using fitted vectorizer
        tfidf_matrix = self.vectorizer.transform([text])
        return tfidf_matrix.toarray()[0]

    def _calculate_similarity(self, query_embedding: np.ndarray, message_embedding: np.ndarray) -> float:
        """Calculate cosine similarity between query and message embeddings"""
        if len(query_embedding.shape) == 1:
            query_embedding = query_embedding.reshape(1, -1)
        if len(message_embedding.shape) == 1:
            message_embedding = message_embedding.reshape(1, -1)
        
        return float(cosine_similarity(query_embedding, message_embedding)[0][0])

    async def _get_context(self, message_idx: int, window_size: int = 2) -> Dict[str, List[str]]:
        """Get context messages around a specific message"""
        start_idx = max(0, message_idx - window_size)
        end_idx = min(len(self.messages), message_idx + window_size + 1)
        
        return {
            "before": [msg.content for msg in self.messages[start_idx:message_idx]],
            "after": [msg.content for msg in self.messages[message_idx + 1:end_idx]]
        }

    async def _generate_explanation(self, query: str, message: Message, context: Dict[str, List[str]]) -> str:
        """Generate explanation for why this message is relevant using Gemini"""
        if not os.getenv("GEMINI_API_KEY"):
            return "No API key provided for explanation generation"
            
        prompt = f"""
        Given the following search query and message with its context, explain why this message is relevant to the query.
        Be concise and focus on the key points of relevance.

        Query: {query}

        Message: {message.content}

        Context before: {' | '.join(context['before'])}
        Context after: {' | '.join(context['after'])}

        Explanation:
        """

        # Add retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = await model.generate_content_async(prompt)
                return response.text
            except Exception as e:
                print(f"Error generating explanation (attempt {attempt+1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    # Add exponential backoff with jitter
                    wait_time = (2 ** attempt) + random.random()
                    print(f"Retrying in {wait_time:.2f} seconds...")
                    time.sleep(wait_time)
                else:
                    # If all retries fail, return a friendly message
                    if "429" in str(e):
                        return "API rate limit exceeded. Please try again later."
                    elif "404" in str(e):
                        return "The AI model is currently unavailable. Please check your API configuration."
                    else:
                        return "Explanation generation failed. Please ensure you have a valid Gemini API key."

    async def semantic_search(
        self,
        query: str,
        min_similarity: float = 0.3,
        limit: int = 10,
        with_explanation: bool = False
    ) -> List[SearchResult]:
        """
        Perform semantic search on messages using TF-IDF and cosine similarity
        """
        if self.vectorizer is None:
            return []
            
        # Generate embedding for query
        query_embedding = await self._get_embedding(query)
        self.last_query_embedding = query_embedding

        results = []
        for idx, msg in enumerate(self.messages):
            if msg.message_type != "text":
                continue

            # Get message embedding
            message_embedding = self.embeddings.get(idx)
            if message_embedding is None or not any(message_embedding):  # Check if embedding exists and is non-zero
                continue

            # Calculate similarity
            similarity = self._calculate_similarity(query_embedding, message_embedding)
            
            if similarity >= min_similarity:
                # Get context
                context = await self._get_context(idx)
                
                # Generate explanation if requested
                explanation = ""
                if with_explanation:
                    explanation = await self._generate_explanation(query, msg, context)
                
                results.append(SearchResult(
                    message=msg,
                    similarity=similarity,
                    context=context,
                    explanation=explanation
                ))

        # Sort by similarity
        results.sort(key=lambda x: x.similarity, reverse=True)
        return results[:limit]

    async def get_similar_messages(
        self,
        message_id: int,
        min_similarity: float = 0.3,
        limit: int = 10
    ) -> List[SearchResult]:
        """Find messages similar to a specific message"""
        if message_id < 0 or message_id >= len(self.messages):
            return []

        target_message = self.messages[message_id]
        if target_message.message_type != "text":
            return []

        # Use the target message as query
        return await self.semantic_search(
            target_message.content,
            min_similarity=min_similarity,
            limit=limit + 1  # Add 1 to account for the message itself
        )

    async def get_conversation_insights(self, messages: List[Message]) -> Dict:
        """Generate AI insights about a conversation using Gemini"""
        if not messages:
            return {"insights": "No messages to analyze", "timestamp": datetime.now().isoformat()}

        if not os.getenv("GEMINI_API_KEY"):
            return {
                "insights": "No API key provided for insights generation",
                "timestamp": datetime.now().isoformat()
            }

        # Prepare conversation text
        conversation_text = "\n".join([
            f"{msg.sender}: {msg.content}" 
            for msg in messages 
            if msg.message_type == "text"
        ])

        prompt = f"""
        Analyze this conversation and provide insights about:
        1. Main topics discussed
        2. Key decisions or plans made
        3. Important information shared
        4. Overall tone and sentiment
        5. Notable patterns or trends

        Conversation:
        {conversation_text}

        Provide a structured analysis focusing on the most important points.
        """

        # Add retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = await model.generate_content_async(prompt)
                return {
                    "insights": response.text,
                    "timestamp": datetime.now().isoformat()
                }
            except Exception as e:
                print(f"Error generating insights (attempt {attempt+1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    # Add exponential backoff with jitter
                    wait_time = (2 ** attempt) + random.random()
                    print(f"Retrying in {wait_time:.2f} seconds...")
                    time.sleep(wait_time)
                else:
                    # If all retries fail, return a friendly message
                    if "429" in str(e):
                        return {
                            "insights": "API rate limit exceeded. Please try again later.",
                            "timestamp": datetime.now().isoformat()
                        }
                    elif "404" in str(e):
                        return {
                            "insights": "The AI model is currently unavailable. Please check your API configuration.",
                            "timestamp": datetime.now().isoformat()
                        }
                    else:
                        return {
                            "insights": "Insights generation failed. Please ensure you have a valid Gemini API key.",
                            "timestamp": datetime.now().isoformat()
                        }

    async def get_topic_clusters(self) -> Dict[str, List[int]]:
        """Group messages into topic clusters using TF-IDF and DBSCAN"""
        from sklearn.cluster import DBSCAN
        
        # Collect all text message embeddings
        embeddings_list = []
        message_indices = []
        
        for idx, msg in enumerate(self.messages):
            if msg.message_type == "text" and idx in self.embeddings:
                embeddings_list.append(self.embeddings[idx])
                message_indices.append(idx)

        if not embeddings_list:
            return {}

        # Perform clustering
        embeddings_array = np.array(embeddings_list)
        clustering = DBSCAN(eps=0.3, min_samples=2).fit(embeddings_array)
        
        # Group messages by cluster
        clusters = {}
        for idx, label in enumerate(clustering.labels_):
            if label >= 0:  # Ignore noise points (-1)
                cluster_name = f"topic_{label}"
                if cluster_name not in clusters:
                    clusters[cluster_name] = []
                clusters[cluster_name].append(message_indices[idx])

        return clusters 