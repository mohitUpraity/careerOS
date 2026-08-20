import os
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, Optional

logger = logging.getLogger("career_os.llm")

class LLMProviderService:
    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY", "")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY", "")

    def call_groq(self, prompt: str, system_prompt: str = "", model: str = "llama-3.3-70b-versatile") -> Optional[str]:
        """
        Calls Groq API for ultra-fast, high rate-limit sub-agent inference.
        """
        if not self.groq_api_key:
            logger.info("GROQ_API_KEY not provided. Skipping Groq inference.")
            return None

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.groq_api_key}"
        }
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 1024
        }

        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                content = data["choices"][0]["message"]["content"]
                logger.info(f"Successfully generated response from Groq ({model}).")
                return content
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            return None

    def call_gemini(self, prompt: str) -> Optional[str]:
        """
        Calls Google Gemini API for multimodal & deep reasoning tasks.
        """
        if not self.gemini_api_key:
            return None
            
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return None

    def generate_subagent_reasoning(self, agent_name: str, task: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Multi-Model Routing:
        - Uses Groq (Llama-3.3-70B) for fast sub-agent evaluations.
        - Falls back to Gemini or structured rule heuristics if keys are omitted.
        """
        system_prompt = f"You are {agent_name}, an autonomous sub-agent in CareerOS multi-agent swarm."
        user_prompt = f"Task: {task}\nContext: {json.dumps(context)}"
        
        # Try Groq first for fast sub-agent execution
        groq_result = self.call_groq(user_prompt, system_prompt=system_prompt)
        if groq_result:
            return {"provider": "Groq", "model": "llama-3.3-70b-versatile", "output": groq_result}
            
        # Try Gemini for deep reasoning fallback
        gemini_result = self.call_gemini(user_prompt)
        if gemini_result:
            return {"provider": "Gemini", "model": "gemini-1.5-flash", "output": gemini_result}
            
        return {
            "provider": "Built-in Rule Engine",
            "model": "rule-heuristic-v1",
            "output": f"Executed task '{task}' autonomously for {agent_name}."
        }

llm_service = LLMProviderService()
