import axios from 'axios';
import statesData from '../data/states.json';

// Direct backend URL — falls back to local JSON if backend is down
const BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 3000,
  headers: { 'Content-Type': 'application/json' },
});

// Always fall through to local data on any error (network, 502, timeout, etc.)
const safeFetch = async (fetchFn, fallbackFn) => {
  try {
    const result = await fetchFn();
    return result;
  } catch {
    return fallbackFn();
  }
};

// ── Helper: compute election day client-side as fallback ──────────────────
function getElectionDay(year = 2026) {
  const nov1 = new Date(year, 10, 1); // November 1
  const dayOfWeek = nov1.getDay(); // 0=Sun,1=Mon,...
  // Days until Monday
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
  const firstMonday = new Date(nov1);
  firstMonday.setDate(nov1.getDate() + daysUntilMonday);
  // Tuesday after first Monday
  const electionDay = new Date(firstMonday);
  electionDay.setDate(firstMonday.getDate() + 1);
  return electionDay;
}

function computeStateTimeline(state, year = 2026) {
  const electionDay = getElectionDay(year);
  const msPerDay = 86400000;

  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  return {
    election_year: year,
    election_day: electionDay.toISOString().split('T')[0],
    registration_deadline: state.registration_deadline_days_before > 0
      ? addDays(electionDay, state.registration_deadline_days_before)
      : electionDay.toISOString().split('T')[0],
    registration_deadline_days_before: state.registration_deadline_days_before,
    has_same_day_registration: state.has_same_day_registration,
    has_early_voting: state.has_early_voting,
    early_voting_start: state.has_early_voting && state.early_voting_start_days_before > 0
      ? addDays(electionDay, state.early_voting_start_days_before)
      : null,
    early_voting_end: state.has_early_voting && state.early_voting_end_days_before > 0
      ? addDays(electionDay, state.early_voting_end_days_before)
      : null,
    primary_date: state.primary_date || null,
  };
}

// ── Local fallback ────────────────────────────────────────────────────────
const localFallback = {
  getStates: () => statesData.map(s => ({ id: s.id, name: s.name, abbreviation: s.abbreviation })),
  getStateData: (stateId) => {
    const state = statesData.find(s => s.id.toUpperCase() === stateId.toUpperCase());
    if (!state) return null;
    return { ...state, timeline: computeStateTimeline(state) };
  },
  getTimeline: (year = 2026) => {
    const electionDay = getElectionDay(year);
    const fmt = (d) => d.toISOString().split('T')[0];
    const sub = (days) => { const d = new Date(electionDay); d.setDate(d.getDate() - days); return fmt(d); };

    return {
      year,
      milestones: [
        { id: 'primary_start', title: 'First State Primaries Begin', date: `${year}-03-03`, description: 'States like North Carolina and Texas hold their primary elections from March onwards.', type: 'primary', icon: '🗳️' },
        { id: 'voter_reg_awareness', title: 'National Voter Registration Day', date: `${year}-09-22`, description: 'Annual day to encourage Americans to register to vote. Check your state\'s deadline!', type: 'awareness', icon: '📝' },
        { id: 'primary_end', title: 'Last State Primary', date: `${year}-09-15`, description: 'The final state primaries wrap up before the general election.', type: 'primary', icon: '🗳️' },
        { id: 'general_early_start', title: 'Early Voting Opens (Most States)', date: sub(14), description: 'Many states open early in-person voting approximately two weeks before Election Day.', type: 'early_voting', icon: '🏛️' },
        { id: 'absentee_deadline', title: 'Mail-in / Absentee Request Deadline (Most States)', date: sub(7), description: 'Most states require mail-in ballot requests at least a week before Election Day.', type: 'deadline', icon: '📬' },
        { id: 'election_day', title: '2026 General Election Day', date: fmt(electionDay), description: `The 2026 US Midterm Elections. All 435 House seats and 33 Senate seats are on the ballot.`, type: 'election_day', icon: '🇺🇸' },
      ].sort((a, b) => a.date.localeCompare(b.date))
    };
  }
};

// ── API Methods ───────────────────────────────────────────────────────────
export async function getStates() {
  return safeFetch(
    async () => { const res = await apiClient.get('/states'); return res.data; },
    () => localFallback.getStates()
  );
}

export async function getStateData(stateId) {
  return safeFetch(
    async () => { const res = await apiClient.get(`/state/${stateId}`); return res.data; },
    () => localFallback.getStateData(stateId)
  );
}

export async function getTimeline(year = 2026) {
  return safeFetch(
    async () => { const res = await apiClient.get(`/timeline?year=${year}`); return res.data; },
    () => localFallback.getTimeline(year)
  );
}

