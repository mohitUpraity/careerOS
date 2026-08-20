import sys
import json
import logging
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO, format="%(asctime)s - [opportunity-mcp] - %(message)s")

MOCK_CATALOG = [
    {
        "id": "opp-1",
        "title": "AI/ML Engineer Intern",
        "company": "NVIDIA",
        "type": "internship",
        "location": "Bangalore / Remote",
        "requirements": ["Python", "FastAPI", "RAG", "LLMs", "LangGraph"],
        "description": "Build high-throughput multi-agent AI systems for GPU orchestration."
    },
    {
        "id": "opp-2",
        "title": "Autonomous Agents Engineer",
        "company": "Microsoft Research",
        "type": "job",
        "location": "Bangalore, India",
        "requirements": ["Python", "LangChain", "TypeScript", "Vector DBs"],
        "description": "Develop enterprise agent governance and scope policy protocols."
    },
    {
        "id": "opp-3",
        "title": "Generative AI Developer Hackathon 2026",
        "company": "Google Cloud & ArmorIQ",
        "type": "hackathon",
        "location": "Global Remote",
        "requirements": ["Python", "Gemini API", "MCP", "Agent Security"],
        "description": "Build innovative multi-agent systems with explicit delegation scope checks."
    }
]

class OpportunityMCPServer:
    def __init__(self):
        self.tools = {
            "search_jobs": self.search_jobs,
            "search_competitions": self.search_competitions,
            "get_opportunity": self.get_opportunity
        }

    def search_jobs(self, query: str = "", location: str = "", limit: int = 10) -> List[Dict[str, Any]]:
        results = []
        for opp in MOCK_CATALOG:
            if opp["type"] in ["job", "internship"]:
                if not query or query.lower() in opp["title"].lower() or any(query.lower() in req.lower() for req in opp["requirements"]):
                    results.append(opp)
        return results[:limit]

    def search_competitions(self, query: str = "", limit: int = 10) -> List[Dict[str, Any]]:
        results = []
        for opp in MOCK_CATALOG:
            if opp["type"] in ["hackathon", "competition"]:
                if not query or query.lower() in opp["title"].lower():
                    results.append(opp)
        return results[:limit]

    def get_opportunity(self, opportunity_id: str) -> Dict[str, Any]:
        for opp in MOCK_CATALOG:
            if opp["id"] == opportunity_id:
                return opp
        return {"error": "Opportunity not found"}

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
    logging.info("Starting Opportunity MCP Server...")
    server = OpportunityMCPServer()
    if len(sys.argv) > 1:
        response = server.handle_request(sys.argv[1])
        print(response)
    else:
        # Default test run
        print(server.handle_request(json.dumps({"tool": "search_jobs", "arguments": {"query": "AI"}})))
