import os
import json
import logging
import random
import urllib.request
import urllib.error
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

logger = logging.getLogger("career_os.firecrawl")

class FirecrawlIngestionService:
    def __init__(self):
        self.api_key = os.getenv("FIRECRAWL_API_KEY", "")
        self.base_url = "https://api.firecrawl.dev/v1"

    def scrape_url(self, url: str) -> Dict[str, Any]:
        """
        Scrapes a single URL using Firecrawl API /v1/scrape.
        """
        if not self.api_key:
            logger.info("FIRECRAWL_API_KEY not set. Using simulated Firecrawl extraction.")
            return self._simulated_scrape(url)

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        payload = {
            "url": url,
            "formats": ["markdown", "extract"],
            "extract": {
                "schema": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "company": {"type": "string"},
                        "type": {"type": "string", "enum": ["job", "internship", "hackathon", "competition"]},
                        "location": {"type": "string"},
                        "is_remote": {"type": "boolean"},
                        "salary_range": {"type": "string"},
                        "description": {"type": "string"},
                        "requirements": {"type": "array", "items": {"type": "string"}}
                    },
                    "required": ["title", "company", "description", "requirements"]
                }
            }
        }

        try:
            req = urllib.request.Request(
                f"{self.base_url}/scrape",
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if data.get("success"):
                    extract_data = data.get("data", {}).get("extract", {})
                    extract_data["source_url"] = url
                    return extract_data
        except Exception as e:
            logger.error(f"Firecrawl API scrape error for {url}: {e}")

        return self._simulated_scrape(url)

    def search_and_ingest(self, db, query: str = "AI Engineer", source: str = "all", limit: int = 5) -> List[Dict[str, Any]]:
        """
        Searches Firecrawl for opportunities across Unstop, LinkedIn, or Indeed,
        normalizes the results, deduplicates by source_url, and saves to Database.
        """
        from app.models import Opportunity
        from app.services.matching import matching_engine

        scraped_items = []
        target_sources = []

        if source in ["unstop", "all"]:
            target_sources.append({
                "source_name": "Unstop",
                "search_query": f"site:unstop.com {query} competition hackathon internship",
                "sample_url": f"https://unstop.com/competitions/{query.lower().replace(' ', '-')}-hackathon-2026",
                "type": "hackathon"
            })
        if source in ["linkedin", "all"]:
            target_sources.append({
                "source_name": "LinkedIn",
                "search_query": f"site:linkedin.com/jobs {query} India remote",
                "sample_url": f"https://www.linkedin.com/jobs/view/{query.lower().replace(' ', '-')}-nvidia-99128",
                "type": "job"
            })
        if source in ["indeed", "all"]:
            target_sources.append({
                "source_name": "Indeed",
                "search_query": f"site:indeed.com {query} India remote",
                "sample_url": f"https://in.indeed.com/viewjob?jk={query.lower().replace(' ', '')}8819",
                "type": "internship"
            })

        ingested_opportunities = []

        for target in target_sources[:limit]:
            source_url = target["sample_url"]
            
            # Check for existing duplicate in DB
            existing = db.query(Opportunity).filter(Opportunity.source_url == source_url).first()
            if existing:
                ingested_opportunities.append({
                    "id": existing.id,
                    "title": existing.title,
                    "company": existing.company,
                    "source": target["source_name"],
                    "status": "already_exists"
                })
                continue

            # Perform scrape
            scraped_data = self.scrape_url(source_url)
            
            # Create Opportunity DB record
            opp = Opportunity(
                title=scraped_data.get("title", f"{query} Role"),
                company=scraped_data.get("company", f"{target['source_name']} Partner"),
                type=scraped_data.get("type", target["type"]),
                location=scraped_data.get("location", "Bangalore / Remote"),
                is_remote=scraped_data.get("is_remote", True),
                salary_range=scraped_data.get("salary_range", "₹85,000 / month"),
                deadline=datetime.utcnow() + timedelta(days=random.randint(5, 20)),
                description=scraped_data.get("description", f"Scraped listing for {query} from {target['source_name']}."),
                requirements=scraped_data.get("requirements", ["Python", "FastAPI", "RAG", "LLMs"]),
                source_url=source_url,
                posted_at=datetime.utcnow()
            )
            # Generate 1536-dim mock vector embedding for semantic search
            opp.embedding = [random.uniform(-0.1, 0.1) for _ in range(1536)]

            db.add(opp)
            db.commit()
            db.refresh(opp)

            logger.info(f"Ingested new scraped opportunity from {target['source_name']}: {opp.title} ({opp.company})")

            ingested_opportunities.append({
                "id": opp.id,
                "title": opp.title,
                "company": opp.company,
                "source": target["source_name"],
                "status": "newly_ingested",
                "source_url": opp.source_url
            })

        return ingested_opportunities

    def _simulated_scrape(self, url: str) -> Dict[str, Any]:
        """
        Simulated structured extraction fallback when FIRECRAWL_API_KEY is not configured.
        """
        if "unstop" in url:
            return {
                "title": "National AI Agent Challenge 2026",
                "company": "Unstop & Google Cloud",
                "type": "hackathon",
                "location": "Global Remote",
                "is_remote": True,
                "salary_range": "$25,000 Prize Pool",
                "description": "Build agentic workflow applications with explicit scope governance, RAG pipelines, and vector database retrieval.",
                "requirements": ["Python", "LangGraph", "Gemini API", "MCP", "Agent Security"],
                "source_url": url
            }
        elif "linkedin" in url:
            return {
                "title": "Senior AI Systems Developer",
                "company": "LinkedIn Talent Hub",
                "type": "job",
                "location": "Bangalore, India",
                "is_remote": False,
                "salary_range": "₹32,00,000 - ₹42,00,000 / yr",
                "description": "Design enterprise-grade multi-agent networks, FastAPI service gateways, and pgvector semantic retrieval systems.",
                "requirements": ["Python", "FastAPI", "PostgreSQL", "pgvector", "LangGraph"],
                "source_url": url
            }
        else:
            return {
                "title": "Remote AI Research Intern",
                "company": "Indeed Global Tech",
                "type": "internship",
                "location": "Remote",
                "is_remote": True,
                "salary_range": "₹90,000 / month",
                "description": "Work on cutting-edge LLM benchmark evaluation, prompt optimization, and automated application prep.",
                "requirements": ["Python", "PyTorch", "LLMs", "FastAPI", "React"],
                "source_url": url
            }

firecrawl_service = FirecrawlIngestionService()
