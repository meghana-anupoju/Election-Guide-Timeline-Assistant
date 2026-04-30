from datetime import date
import pytest
from app.services.date_calc import get_election_day, calculate_deadline, get_state_timeline, get_global_timeline

def test_get_election_day():
    # 2026: Nov 1 is Sunday. First Monday is Nov 2. Election day is Nov 3.
    assert get_election_day(2026) == date(2026, 11, 3)
    # 2024: Nov 1 is Friday. First Monday is Nov 4. Election day is Nov 5.
    assert get_election_day(2024) == date(2024, 11, 5)

def test_calculate_deadline():
    election_day = date(2026, 11, 3)
    # 30 days before Nov 3 is Oct 4
    assert calculate_deadline(election_day, 30) == date(2026, 10, 4)
    assert calculate_deadline(election_day, 0) == election_day

def test_get_state_timeline():
    state_data = {
        "id": "TX",
        "registration_deadline_days_before": 30,
        "has_early_voting": True,
        "early_voting_start_days_before": 15,
        "early_voting_end_days_before": 4
    }
    timeline = get_state_timeline(state_data, 2026)
    assert timeline["election_day"] == "2026-11-03"
    assert timeline["registration_deadline"] == "2026-10-04"
    assert timeline["early_voting_start"] == "2026-10-19"
    assert timeline["early_voting_end"] == "2026-10-30"

def test_get_global_timeline():
    timeline = get_global_timeline(2026)
    assert isinstance(timeline, list)
    assert len(timeline) > 0
    # ensure election day is there
    assert any(item["id"] == "election_day" for item in timeline)
