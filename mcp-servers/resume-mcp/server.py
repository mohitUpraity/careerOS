import sys
import json
import logging
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO, format="%(asctime)s - [resume-mcp] - %(message)s")

MOCK_RESUME = {
    "id": "res-baseline",
    "title": "Mohit_Upraity_Baseline_Resume.json",
    "candidate": "Mohit Upraity",
    "skills": ["Python", "FastAPI", "React", "TypeScript", "LangGraph", "LLMs", "RAG", "PostgreSQL"],
    "experience": [
        {
            "role": "Fullstack & AI Engineer",
            "company": "Sarthi-AI Projects",
            "description": "Developed autonomous multi-agent workflow orchestration and ATS matching algorithms."
        }
    ]
}

class ResumeMCPServer:
    def __init__(self):
        self.tools = {
            "get_resume": self.get_resume,
            "analyze_resume": self.analyze_resume,
            "create_resume_version": self.create_resume_version
        }

    def get_resume(self, user_id: str = "default") -> Dict[str, Any]:
        return MOCK_RESUME

    def analyze_resume(self, resume_id: str, opportunity_requirements: List[str]) -> Dict[str, Any]:
        candidate_skills = set(MOCK_RESUME["skills"])
        required_skills = set(opportunity_requirements)
        
        matched = list(candidate_skills.intersection(required_skills))
        missing = list(required_skills.difference(candidate_skills))
        
        coverage = (len(matched) / max(len(required_skills), 1)) * 100
        ats_score = min(100, round(coverage * 0.9 + 10))
        
        return {
            "ats_score": ats_score,
            "matched_keywords": matched,
            "missing_keywords": missing,
            "keyword_coverage": round(coverage, 1),
            "explanation": f"Matched {len(matched)} of {len(required_skills)} required technical skills."
        }

    def create_resume_version(self, opportunity_company: str, target_role: str) -> Dict[str, Any]:
        tailored = dict(MOCK_RESUME)
        tailored["id"] = f"res-tailored-{opportunity_company.lower()}"
        tailored["title"] = f"Mohit_{opportunity_company}_Tailored_v3.json"
        return {
            "status": "success",
            "version": tailored,
            "diff": {
                "added": [f"Emphasized verified skills for {target_role} at {opportunity_company}."],
                "modified": ["Reordered projects to surface relevant RAG & agentic architecture evidence."]
            }
        }

    def handle_request(self, request_json: str) -> str:
        try:
            req = json.loads(request_json)
            tool_name = req.get("tool")
            args = req.get("arguments", {})

            if tool_name not in self.tools:
                return json.dumps({"status": "error", "message": f"Unknown tool: {tool_name}"})

            result = self.tools[tool_name](**args)
            return json.dumps({"status": "success", "tool": tool_name, "result": result})
        except Exception as e:
            return json.dumps({"status": "error", "message": str(e)})

if __name__ == "__main__":
    logging.info("Starting Resume MCP Server...")
    server = ResumeMCPServer()
    if len(sys.argv) > 1:
        response = server.handle_request(sys.argv[1])
        print(response)
    else:
        print(server.handle_request(json.dumps({
            "tool": "analyze_resume", 
            "arguments": {"resume_id": "res-baseline", "opportunity_requirements": ["Python", "FastAPI", "Kubernetes"]}
        })))
