import sys
import json
import logging
from typing import Dict, Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s - [application-mcp] - %(message)s")

class ApplicationMCPServer:
    def __init__(self):
        self.tools = {
            "prepare_application": self.prepare_application,
            "submit_application": self.submit_application,
            "send_email": self.send_email
        }

    def prepare_application(self, opportunity_id: str, resume_version_id: str) -> Dict[str, Any]:
        return {
            "status": "prepared",
            "opportunity_id": opportunity_id,
            "resume_version_id": resume_version_id,
            "answers": [
                {
                    "question": "Why are you interested in this role?",
                    "answer": "Extensive hands-on experience developing autonomous AI agents, RAG models, and safe delegation layers."
                }
            ],
            "requires_human_approval": True
        }

    def submit_application(self, opportunity_id: str, application_id: str) -> Dict[str, Any]:
        """
        DANGEROUS TOOL:
        Under ArmorIQ policy, this tool is deliberately excluded from delegated sub-agent scopes.
        Invoking this tool without human approval triggers an ARMORIQ SCOPE VIOLATION (BLOCK).
        """
        return {
            "status": "submitted",
            "opportunity_id": opportunity_id,
            "application_id": application_id,
            "confirmation_code": "CONF-NVIDIA-9921"
        }

    def send_email(self, recipient: str, subject: str, body: str) -> Dict[str, Any]:
        return {
            "status": "sent",
            "recipient": recipient,
            "subject": subject
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
    logging.info("Starting Application MCP Server...")
    server = ApplicationMCPServer()
    if len(sys.argv) > 1:
        response = server.handle_request(sys.argv[1])
        print(response)
    else:
        print(server.handle_request(json.dumps({
            "tool": "prepare_application", 
            "arguments": {"opportunity_id": "opp-1", "resume_version_id": "res-tailored-nvidia"}
        })))
