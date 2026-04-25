# 🗳️ Election Guide & Timeline Assistant

> **Your complete guide to the 2026 US Midterm Elections** — personalized voter timelines, step-by-step checklists, Google Calendar integration, and polling place finder for all 50 states.

![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-FF0055?logo=framer)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📅 **Interactive Timeline** | Animated vertical timeline with global + state-specific election milestones. Each event has an "Add to Calendar" button. |
| 🧙 **4-Step Voter Wizard** | Personalized guide based on your state and voter status (first-time, returning, mail-in, overseas). Generates a checklist + action plan. |
| 📍 **Polling Place Finder** | Enter your ZIP code to find polling places via Google Maps. Falls back to state official sites without an API key. |
| 🗓️ **Google Calendar Integration** | Add any election date to Google Calendar with one click (works without OAuth via pre-filled Google Calendar links). |
| 🏛️ **All 50 States Covered** | State-specific data including registration deadlines, ID requirements, mail-in rules, early voting windows, and primary dates. |
| 📱 **Mobile-Friendly** | Fully responsive design tested at 375px, 768px, and 1280px breakpoints. |
| ♿ **Accessible** | WCAG 2.1 AA baseline — keyboard navigation, ARIA labels, and focus management throughout. |

---

## 🏗️ Architecture

```
Election Assistant/
├── backend/                   ← FastAPI (Python 3.11+)
│   ├── app/
│   │   ├── main.py            # Entry point + CORS
│   │   ├── api/routes.py      # /api/states, /api/state/{id}, /api/timeline
│   │   ├── services/date_calc.py  # Election date calculation logic
│   │   └── data/states.json   # All 50 states + DC data
│   └── requirements.txt
└── frontend/                  ← React 19 + Vite + Tailwind v4 + Framer Motion
    ├── src/
    │   ├── components/
    │   │   ├── Timeline/ElectionTimeline.jsx
    │   │   ├── Wizard/VoterWizard.jsx
    │   │   ├── Maps/PollingPlaceFinder.jsx
    │   │   ├── Layout/NavFooter.jsx
    │   │   └── UI/             (CountdownClock, StateSelector)
    │   ├── pages/              (Home, Timeline, Guide, FindPolling)
    │   ├── hooks/              (useGoogleCalendar, useStateData)
    │   ├── services/api.js     # Axios client + local JSON fallback
    │   └── data/states.json    # Offline fallback copy
    └── .env.example
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([download](https://nodejs.org/))
- **Python** 3.11+ ([download](https://python.org/))

### 1. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env      # Add your API keys (optional — see below)
npm run dev               # Starts at http://localhost:5173
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

> **Both running?** The frontend Vite dev server proxies `/api` requests to `localhost:8000` automatically. If the backend is not running, the app falls back gracefully to local JSON data — all features still work.

---

## 🔑 Google API Setup (Optional)

The app works fully without Google API keys. Here's what you get with and without them:

| Feature | Without Keys | With Keys |
|---|---|---|
| Add to Calendar | Opens pre-filled Google Calendar link in new tab ✅ | Full OAuth → events added silently ✅ |
| Polling Place Map | Deep links to Google Maps + state official site ✅ | Interactive embedded map ✅ |

### Getting a Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → **APIs & Services → Library**
3. Enable **Maps Embed API**
4. **Credentials → Create API Key**
5. Add to `frontend/.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_key_here
   ```

### Getting a Google OAuth Client ID
1. **APIs & Services → OAuth consent screen** → External
2. **Credentials → Create OAuth 2.0 Client ID** → Web Application
3. Authorized JS origins: `http://localhost:5173`
4. Enable **Google Calendar API** in the Library
5. Add to `frontend/.env`:
   ```
   VITE_GOOGLE_CLIENT_ID=your_client_id_here
   ```

---

## 📊 Backend API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check |
| `/api/states` | GET | List all states (id, name, abbreviation) |
| `/api/state/{state_id}` | GET | Full state rules + computed 2026 dates |
| `/api/timeline?year=2026` | GET | Global election milestones |

**Example: Get California data**
```bash
curl http://localhost:8000/api/state/CA
```

**Example response:**
```json
{
  "id": "CA",
  "name": "California",
  "has_same_day_registration": true,
  "has_early_voting": true,
  "id_requirements": ["No photo ID required for registered voters"],
  "timeline": {
    "election_day": "2026-11-03",
    "registration_deadline": "2026-10-19",
    "early_voting_start": "2026-10-05",
    "primary_date": "2026-06-02"
  }
}
```

---

## 🎨 Design System

The app uses a **"Government/Trust"** aesthetic with the following palette:

| Token | Value | Usage |
|---|---|---|
| Primary | `#1A3A6B` | Patriot Blue — nav, buttons, timeline |
| Accent | `#C8253C` | Civic Red — election day, CTAs |
| Gold | `#D4AF37` | Star Gold — countdown, highlights |
| Surface | `#F0F4F8` | Off-white background |

**Fonts:** Merriweather (headings) + Inter (body) from Google Fonts

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_GOOGLE_MAPS_API_KEY` | Optional | Google Maps Embed API key for interactive polling place map |
| `VITE_GOOGLE_CLIENT_ID` | Optional | Google OAuth 2.0 Client ID for Calendar API integration |

---

## 📝 Assumptions & Data Limitations

1. **Election Day**: Calculated automatically as the first Tuesday after the first Monday in November (standard US law). For 2026, this is **November 3, 2026**.
2. **Registration Deadlines**: Sourced from Ballotpedia and official state election sites as of early 2026. Always verify at your state's official election website before relying on these dates.
3. **Primary Dates**: 2026 primary dates are included for states where they were announced. Those TBD are noted.
4. **Polling Places**: Real-time polling place data requires state-specific APIs (not publicly unified). The Maps integration searches Google Maps for "polling place near [ZIP]" and links to state official finders.
5. **North Dakota**: Does not require voter registration — this is correctly handled in the wizard.

---

## 📜 License

Educational purposes only. Not affiliated with any government entity. Always verify voting information with your official state or local election authority.

**Official resources:**
- [vote.gov](https://vote.gov) — Official US government voting information
- [Ballotpedia](https://ballotpedia.org) — Election research
- [NCSL](https://www.ncsl.org/elections-and-campaigns/voter-id) — Voter ID laws by state

---

🇺🇸 **Your vote matters.** Register. Plan. Vote.
