from datetime import date, timedelta
from typing import Optional


def get_election_day(year: int) -> date:
    """
    Returns the US federal Election Day: first Tuesday after the first Monday in November.
    """
    nov_1 = date(year, 11, 1)
    # Find the first Monday of November
    days_until_monday = (7 - nov_1.weekday()) % 7  # Monday = 0
    first_monday = nov_1 + timedelta(days=days_until_monday)
    # Election Day is the Tuesday after the first Monday
    election_day = first_monday + timedelta(days=1)
    return election_day


def calculate_deadline(election_day: date, days_before: int) -> Optional[date]:
    """
    Calculate a deadline date given election day and offset days.
    Returns None if days_before is 0 (same-day or N/A).
    """
    if days_before <= 0:
        return election_day
    return election_day - timedelta(days=days_before)


def get_state_timeline(state_data: dict, election_year: int = 2026) -> dict:
    """
    Given a state's rules dict, return a computed timeline with actual dates.
    """
    election_day = get_election_day(election_year)

    # Registration deadline
    reg_days = state_data.get("registration_deadline_days_before", 30)
    reg_deadline = calculate_deadline(election_day, reg_days)

    # Early voting window
    ev_start_days = state_data.get("early_voting_start_days_before", 0)
    ev_end_days = state_data.get("early_voting_end_days_before", 0)
    has_ev = state_data.get("has_early_voting", False)

    early_voting_start = None
    early_voting_end = None
    if has_ev and ev_start_days > 0:
        early_voting_start = calculate_deadline(election_day, ev_start_days)
        early_voting_end = calculate_deadline(election_day, ev_end_days)

    # Primary date
    primary_date_str = state_data.get("primary_date")
    primary_date = None
    if primary_date_str:
        try:
            primary_date = date.fromisoformat(primary_date_str)
        except ValueError:
            primary_date = None

    return {
        "election_year": election_year,
        "election_day": election_day.isoformat(),
        "registration_deadline": reg_deadline.isoformat() if reg_deadline else None,
        "registration_deadline_days_before": reg_days,
        "has_same_day_registration": state_data.get("has_same_day_registration", False),
        "has_early_voting": has_ev,
        "early_voting_start": early_voting_start.isoformat() if early_voting_start else None,
        "early_voting_end": early_voting_end.isoformat() if early_voting_end else None,
        "primary_date": primary_date.isoformat() if primary_date else None,
    }


def get_global_timeline(election_year: int = 2026) -> list:
    """
    Returns a list of global election milestones for the given year.
    """
    election_day = get_election_day(election_year)

    milestones = [
        {
            "id": "primary_start",
            "title": "First State Primaries Begin",
            "date": f"{election_year}-03-03",
            "description": "States like North Carolina and Texas hold their primary elections from March onwards.",
            "type": "primary",
            "icon": "🗳️",
        },
        {
            "id": "voter_reg_awareness",
            "title": "National Voter Registration Day",
            "date": f"{election_year}-09-22",
            "description": "Annual day to encourage Americans to register to vote. Check your state's deadline!",
            "type": "awareness",
            "icon": "📝",
        },
        {
            "id": "primary_end",
            "title": "Last State Primary",
            "date": f"{election_year}-09-15",
            "description": "The final state primaries wrap up before the general election.",
            "type": "primary",
            "icon": "🗳️",
        },
        {
            "id": "general_early_start",
            "title": "Early Voting Opens (Most States)",
            "date": (election_day - timedelta(days=14)).isoformat(),
            "description": "Many states open early in-person voting approximately two weeks before Election Day.",
            "type": "early_voting",
            "icon": "🏛️",
        },
        {
            "id": "absentee_deadline_general",
            "title": "Mail-in / Absentee Request Deadline (Most States)",
            "date": (election_day - timedelta(days=7)).isoformat(),
            "description": "Most states require mail-in ballot requests at least a week before Election Day. Check your state!",
            "type": "deadline",
            "icon": "📬",
        },
        {
            "id": "election_day",
            "title": "2026 General Election Day",
            "date": election_day.isoformat(),
            "description": f"The 2026 US Midterm Elections. Polls typically open 6am–8pm local time. All 435 House seats and 33 Senate seats are on the ballot.",
            "type": "election_day",
            "icon": "🇺🇸",
        },
    ]

    return sorted(milestones, key=lambda x: x["date"])
