from fastapi.testclient import TestClient
import os
import pytest
from app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/api")
    assert response.status_code == 200
    assert "Election Guide & Timeline Assistant API" in response.json()["message"]

def test_get_states():
    response = client.get("/api/states")
    assert response.status_code == 200
    states = response.json()
    assert isinstance(states, list)
    assert len(states) > 0
    # Check if first state has id and name
    assert "id" in states[0]
    assert "name" in states[0]

def test_get_state_data_valid():
    response = client.get("/api/state/CA")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "CA"
    assert data["name"] == "California"
    assert "id_requirements" in data
    assert "timeline" in data

def test_get_state_data_invalid():
    response = client.get("/api/state/XX")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_get_timeline_default():
    response = client.get("/api/timeline")
    assert response.status_code == 200
    data = response.json()
    assert "milestones" in data
    assert isinstance(data["milestones"], list)
    # Check for election day
    election_day = next((item for item in data["milestones"] if item["id"] == "election_day"), None)
    assert election_day is not None
    assert election_day["title"] == "2026 General Election Day"

def test_get_timeline_custom_year():
    response = client.get("/api/timeline?year=2028")
    assert response.status_code == 200
    data = response.json()
    election_day = next((item for item in data["milestones"] if item["id"] == "election_day"), None)
    assert election_day is not None
    # 2028 election day should be Nov 7, 2028
    assert election_day["date"] == "2028-11-07"
