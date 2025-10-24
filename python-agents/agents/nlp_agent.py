from .base_agent import BaseAgent
from typing import Any, Dict
import os

class NLPAgent(BaseAgent):
    """NLP Processing Agent using OpenAI"""
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute NLP processing task
        
        Args:
            input_data: Should contain 'text' key with text to process
            
        Returns:
            Dict with processed text and metadata
        """
        try:
            text = input_data.get("text", "")
            
            if not text:
                return {
                    "success": False,
                    "error": "No text provided for processing"
                }
            
            openai_api_key = os.getenv("OPENAI_API_KEY")
            
            if openai_api_key:
                try:
                    import openai
                    
                    client = openai.OpenAI(api_key=openai_api_key)
                    
                    response = client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=[
                            {"role": "system", "content": "You are a helpful assistant for NLP processing."},
                            {"role": "user", "content": text}
                        ],
                        max_tokens=1000
                    )
                    
                    processed_text = response.choices[0].message.content
                    
                    return {
                        "success": True,
                        "processed_text": processed_text,
                        "original_text": text,
                        "model": "gpt-4o-mini"
                    }
                except Exception as e:
                    return {
                        "success": False,
                        "error": f"OpenAI processing failed: {str(e)}"
                    }
            else:
                return {
                    "success": True,
                    "processed_text": f"[NLP Processing] Text analyzed: {len(text)} characters",
                    "original_text": text,
                    "model": "mock",
                    "note": "OpenAI API key not configured, using mock response"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
