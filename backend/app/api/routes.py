import json
import os
from functools import lru_cache
from fastapi import APIRouter, HTTPException
from ..services.date_calc import get_state_timeline, get_global_timeline

router = APIRouter()

# Load states data at module level for performance
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "states.json")

@lru_cache(maxsize=1)
def load_states():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/health")
def health_check():
    return {"status": "ok", "service": "Election Guide API"}


@router.get("/states")
def get_all_states():
    """Return a lightweight list of all states (id, name, abbreviation)."""
    states = load_states()
    return [
        {"id": s["id"], "name": s["name"], "abbreviation": s["abbreviation"]}
        for s in states
    ]


@router.get("/state/{state_id}")
def get_state(state_id: str, year: int = 2026):
    """Return full state rules + computed dates for a given state and election year."""
    states = load_states()
    state = next((s for s in states if s["id"].upper() == state_id.upper()), None)
    if not state:
        raise HTTPException(status_code=404, detail=f"State '{state_id}' not found.")
    
    timeline = get_state_timeline(state, election_year=year)
    return {
        **state,
        "timeline": timeline,
    }


@router.get("/timeline")
def get_timeline(year: int = 2026):
    """Return global election milestones for the given year."""
    milestones = get_global_timeline(election_year=year)
    return {"year": year, "milestones": milestones}
