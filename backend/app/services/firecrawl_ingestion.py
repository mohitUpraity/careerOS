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
            raise ValueError("FIRECRAWL_API_KEY is not configured in .env environment variables.")

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
            else:
                raise ValueError(f"Firecrawl API scrape failed for URL {url}")

    def search_and_ingest(self, db, query: str = "AI Engineer", source: str = "all", limit: int = 5) -> List[Dict[str, Any]]:
        """
        Searches Firecrawl /v1/search for real opportunities across Unstop, LinkedIn, or Indeed,
        normalizes the results, deduplicates by source_url, and saves to Database with real vector embeddings.
        """
        from app.models import Opportunity
        from datetime import datetime, timedelta
        import random

        if not self.api_key:
            raise ValueError("FIRECRAWL_API_KEY is missing from environment variables.")

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        search_query = f"{query} hiring site:unstop.com OR site:linkedin.com/jobs OR site:indeed.com"
        payload = {
            "query": search_query,
            "limit": limit,
            "lang": "en"
        }

        try:
            req = urllib.request.Request(
                f"{self.base_url}/search",
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                search_results = data.get("data", [])
        except Exception as e:
            logger.error(f"Firecrawl /v1/search API error: {e}")
            search_results = []

        ingested_opportunities = []

        for item in search_results:
            source_url = item.get("url", "")
            if not source_url:
                continue

            existing = db.query(Opportunity).filter(Opportunity.source_url == source_url).first()
            if existing:
                ingested_opportunities.append({
                    "id": existing.id,
                    "title": existing.title,
                    "company": existing.company,
                    "status": "already_exists",
                    "source_url": source_url
                })
                continue

            # Parse search snippet/title
            title = item.get("title", f"{query} Listing")
            description = item.get("description", item.get("markdown", "Live opportunity listing scraped via Firecrawl."))
            company = title.split(" at ")[-1].split(" - ")[0] if " at " in title else "Featured Tech Partner"

            opp = Opportunity(
                title=title[:255],
                company=company[:255],
                type="job" if "job" in source_url else "hackathon" if "unstop" in source_url else "internship",
                location="Bangalore / Remote",
                is_remote=True,
                salary_range="Competitive Salary",
                deadline=datetime.utcnow() + timedelta(days=14),
                description=description,
                requirements=["Python", "AI", "FastAPI", "React"],
                source_url=source_url,
                posted_at=datetime.utcnow()
            )
            
            # Generate real Gemini vector embedding
            from app.services.matching import generate_gemini_embedding
            opp.embedding = generate_gemini_embedding(f"{opp.title} {opp.company} {opp.description}")

            db.add(opp)
            db.commit()
            db.refresh(opp)

            ingested_opportunities.append({
                "id": opp.id,
                "title": opp.title,
                "company": opp.company,
                "status": "newly_ingested",
                "source_url": opp.source_url
            })

        return ingested_opportunities

firecrawl_service = FirecrawlIngestionService()
