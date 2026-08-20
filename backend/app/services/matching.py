import os
from datetime import datetime
import math
import logging
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from app.models import Profile, Opportunity, Match, Skill, Project

logger = logging.getLogger("career_os.matching")

def calculate_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    norm_a = math.sqrt(sum(a * a for a in vec1))
    norm_b = math.sqrt(sum(b * b for b in vec2))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot_product / (norm_a * norm_b)

class MatchingEngine:
    def __init__(self):
        # Default Weights
        self.weights = {
            "skills": 0.30,
            "experience": 0.20,
            "projects": 0.15,
            "ats": 0.10,
            "eligibility": 0.10,
            "location": 0.05,
            "domain": 0.05,
            "deadline": 0.05
        }

    def calculate_match_score(
        self,
        db: Session,
        profile: Profile,
        opportunity: Opportunity,
        weights: Dict[str, float] = None
    ) -> Tuple[float, Dict[str, Any]]:
        """
        Runs the 5-Stage Hybrid Matching Engine.
        Returns (final_score, breakdown_json)
        """
        active_weights = weights if weights else self.weights
        
        # --- Stage 1: Deterministic Eligibility Filters ---
        # Excludes/penalizes roles if major requirements are not satisfied
        eligibility_score = 100.0
        # If candidate location doesn't match and role is onsite
        if opportunity.location and profile.location:
            # Simple check
            if not opportunity.is_remote and opportunity.location.lower() not in profile.location.lower():
                eligibility_score = 30.0 # High penalty, but not hard crash for demo
                
        # --- Stage 2: Vector Semantic Similarity ---
        vector_score = 70.0 # Default fallback
        if profile.embedding and opportunity.embedding:
            similarity = calculate_cosine_similarity(profile.embedding, opportunity.embedding)
            # Map cosine range [-1, 1] or [0, 1] to 0-100
            vector_score = max(0.0, min(100.0, similarity * 100.0))

        # --- Stage 3: Feature Scoring ---
        # A: Skills Match
        skills_matched = []
        skills_missing = []
        skill_score = 0.0
        
        user_skills = {s.name.lower(): s for s in profile.skills}
        req_skills = opportunity.requirements if opportunity.requirements else []
        
        if req_skills:
            matched_count = 0
            for req in req_skills:
                req_lower = req.lower()
                if req_lower in user_skills:
                    matched_count += 1
                    skills_matched.append(req)
                else:
                    skills_missing.append(req)
            skill_score = (matched_count / len(req_skills)) * 100.0
        else:
            skill_score = 80.0 # Neutral baseline if no JD skills defined
            
        # B: Experience Match
        # Calculate years of experience from profile skills (taking max)
        user_years = max([s.years_experience for s in profile.skills if s.years_experience] or [0.0])
        # Simple heuristic from JD text: search for numbers followed by "years" or "yr"
        required_years = 0.0
        jd_text = opportunity.description.lower()
        if "1 year" in jd_text or "1+ year" in jd_text:
            required_years = 1.0
        elif "2 years" in jd_text or "2+ years" in jd_text:
            required_years = 2.0
        elif "3 years" in jd_text or "3+ years" in jd_text or "mid" in jd_text:
            required_years = 3.0
        elif "5 years" in jd_text or "5+ years" in jd_text or "senior" in jd_text:
            required_years = 5.0
            
        if user_years >= required_years:
            experience_score = 100.0
        elif required_years > 0:
            experience_score = (user_years / required_years) * 100.0
        else:
            experience_score = 90.0

        # C: Projects Match
        # Check project technology tags matching JD description / requirements
        project_score = 50.0
        if profile.projects:
            proj_techs = set()
            for p in profile.projects:
                if p.technologies:
                    for tech in p.technologies:
                        proj_techs.add(tech.lower())
            
            proj_matched = 0
            if req_skills:
                for req in req_skills:
                    if req.lower() in proj_techs:
                        proj_matched += 1
                project_score = (proj_matched / len(req_skills)) * 100.0
            else:
                project_score = 80.0

        # --- Stage 4: LLM Qualitative Reasoning ---
        # Domain alignment & ATS evaluation details
        # For local demo without API key, we generate structured mock reasoning
        # If API key is available, we would invoke Gemini
        domain_score = 85.0
        ats_score = 80.0
        explanation = "The candidate profile exhibits high skill alignment, particularly in Python development. "
        
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if gemini_api_key:
            try:
                # LLM execution will be integrated inside app/services/tailoring.py
                # Let's keep this fast/deterministic here to respect the 2.0s ranking constraint
                pass
            except Exception as e:
                logger.error(f"Gemini evaluation failed: {e}")
                
        # --- Stage 5: Score Composition ---
        # w1 * skills + w2 * exp + w3 * proj + w4 * ats + w5 * elig + w6 * loc + w7 * domain + w8 * dead
        
        # Location score
        location_score = 100.0
        if opportunity.is_remote and profile.remote_preference in ["remote", "hybrid"]:
            location_score = 100.0
        elif not opportunity.is_remote and profile.remote_preference == "remote":
            location_score = 40.0
            
        # Deadline score: higher score for roles with more time left (or lower, depending on priority)
        # Standard: 100.0 unless closed
        deadline_score = 100.0
        if opportunity.deadline and opportunity.deadline < datetime.utcnow():
            deadline_score = 0.0
            eligibility_score = 0.0

        raw_final = (
            active_weights.get("skills", 0.3) * skill_score +
            active_weights.get("experience", 0.2) * experience_score +
            active_weights.get("projects", 0.15) * project_score +
            active_weights.get("ats", 0.10) * ats_score +
            active_weights.get("eligibility", 0.10) * eligibility_score +
            active_weights.get("location", 0.05) * location_score +
            active_weights.get("domain", 0.05) * domain_score +
            active_weights.get("deadline", 0.05) * deadline_score
        )
        
        final_score = round(raw_final, 1)
        
        breakdown = {
            "skills_score": round(skill_score, 1),
            "experience_score": round(experience_score, 1),
            "project_score": round(project_score, 1),
            "ats_score": round(ats_score, 1),
            "eligibility_score": round(eligibility_score, 1),
            "location_score": round(location_score, 1),
            "domain_score": round(domain_score, 1),
            "deadline_score": round(deadline_score, 1),
            "skills_matched": skills_matched,
            "skills_missing": skills_missing,
            "explanation": explanation
        }
        
        return final_score, breakdown

    def recalculate_rankings(
        self,
        db: Session,
        user_id: str,
        preferences: Dict[str, float]
    ) -> List[Dict[str, Any]]:
        """
        Re-calculates opportunity matches with updated slider preference weights.
        Returns a sorted list of matches with rank change deltas.
        """
        # Pref weights mapping from front-end sliders (-1.0 to 1.0)
        # We adjust our active weights based on these sliders
        reweighted = self.weights.copy()
        
        # Remote Slider -> shifts weight towards location
        if "remote_priority" in preferences:
            val = preferences["remote_priority"]
            reweighted["location"] = max(0.01, reweighted["location"] + val * 0.15)
            
        # Salary Slider
        if "salary_priority" in preferences:
            # We don't have a direct salary scoring component, but we can simulate it
            pass
            
        # Learning Slider -> shifts weight towards projects/skills
        if "learning_priority" in preferences:
            val = preferences["learning_priority"]
            reweighted["skills"] = max(0.1, reweighted["skills"] + val * 0.10)
            reweighted["projects"] = max(0.05, reweighted["projects"] + val * 0.05)

        # Deadline Slider -> shifts weight to deadline urgency
        if "deadline_urgency" in preferences:
            val = preferences["deadline_urgency"]
            reweighted["deadline"] = max(0.01, reweighted["deadline"] + val * 0.15)

        # Normalize weights back to sum = 1.0
        total = sum(reweighted.values())
        for k in reweighted:
            reweighted[k] = reweighted[k] / total
            
        # Fetch current matches
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        if not profile:
            return []
            
        opportunities = db.query(Opportunity).all()
        results = []
        
        for opp in opportunities:
            score, breakdown = self.calculate_match_score(db, profile, opp, reweighted)
            results.append({
                "opportunity_id": opp.id,
                "title": opp.title,
                "company": opp.company,
                "score": score,
                "breakdown": breakdown
            })
            
        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        return results

matching_engine = MatchingEngine()
