# ⚡ DecideFast — Real-Time Meeting Decider & Anti-Waffle Copilot
> **Powered by TypeSafe Jev (System One Sub-Second Primitives) & Google Gemini 3.8 Flash (System Two Deliberation)**

DecideFast is a real-time meeting copilot built to eliminate middle management circularity, bikeshedding, and corporate jargon ("waffle"). While people talk in meetings, DecideFast listens to the transcript stream in real time, grounds the conversation in your **uploaded decks, past minutes, and OKRs**, calculates calibrated probabilities on the viability of competing ideas, detects conversation bottlenecks, and prompts the meeting chair with sharp executive interventions to force decisions.

---

## 🧠 Architecture: Context-Grounded System One + System Two

```
┌─────────────────────────────────────────────────────────────┐
│          Context Knowledge Base (Decks, Minutes, OKRs)      │
│          PDF, Markdown, TXT, CSV, or Past Meeting Notes     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Meeting Audio Stream                   │
│   (Web Speech API Mic / Live Typing / Canned Scenarios)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Sliding Context Turns + Docs)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│         System One: TypeSafe Jev (Sub-Second Primitives)     │
│   • waffle_level (Score): Jargon / corporate fluff (0-3.0)  │
│   • is_circular (Noul): Probability of repeating arguments  │
│   • already_answered_in_context (Noul): Is someone stalling │
│     over a metric already in the deck / past minutes?       │
│   • decision_readiness (Score): Readiness to commit (0-2.0)  │
│   • primary_bottleneck (Choice): Risk aversion, ignoring    │
│     context, scope creep, bikeshedding, or clear to proceed │
│   • best_chair_action (Choice): Cite deck, call vote, etc.  │
│   • viability & alignment (Score per proposal): Feasibility │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Gated Trigger: High Waffle /
                               │  Circularity / Ignoring Context)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             System Two: Google Gemini 3.8 Flash             │
│   • Real-Time Executive Nudges ("Say this out loud now")    │
│     (e.g. "Karen is asking for margin studies, but Slide 4  │
│      of the Q3 Deck already verified 82% margin. Cite it!") │
│   • Synthesized Implementation Plans (Single-threaded       │
│     owners, 48-hour deliverables, pre-mortem guardrails)    │
│   • Parked Ideas Memo (Officially archives distractions)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Reactive Real-Time Dashboard                   │
│   • Context Documents Drawer (PDF upload + raw paste)       │
│   • Waffle & Circularity Radial Gauges                      │
│   • Live Idea Viability Leaderboard & Probabilities         │
│   • Stalling Factor Radar & Next Action                     │
│   • Executive Nudge Banner with 1-Click Script Copy         │
│   • Formal Decision Record & Markdown Export Modal          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📖 How to Use DecideFast in Your Meetings

### Step 1: Upload Your Meeting Context (1 Minute)
Before the meeting begins, click the **Context (Decks & Minutes)** button in the top navigation:
- Upload your pitch deck, quarterly board presentation, or architecture memo (PDF, TXT, Markdown, CSV).
- Or paste notes from last week's meeting minutes.
- *How this works in Jev*: Jev ingests this into the structured `state["context_documents"]` object.

### Step 2: Listen in Real Time
When the meeting starts:
- Click **Microphone** to allow the browser's Web Speech API to transcribe live speech as participants talk.
- Or, paste/type conversation turns into the quick-entry bar.
- To test immediately without speaking, select one of the built-in corporate scenarios (e.g. *The Enterprise Pricing Deadlock*) and click **Auto-Run** or **Step**.

### Step 3: Monitor Real-Time System One Gauges
- **Waffle Meter**: Spikes when speakers use filler words (*"synergy"*, *"boil the ocean"*, *"circle back offline"*).
- **Already Answered Check**: When a manager says *"We don't know customer sentiment on this"*, Jev cross-references your uploaded deck, calculates an 88% probability that it's already answered, and flags `ignoring_context`.

### Step 4: Speaker Credibility & Idea Quality Radar
- **Signal-to-Noise Ranking**: Jev cross-examines what speakers say against your uploaded context decks, scoring each speaker's data grounding vs. evasive waffle.
- **Identifies Top Thinkers vs. Stalling Blockers**: Highlights the data-driven champion (e.g. *Sarah citing margin requirements and grandfathering clauses*) while flagging procedural delay tactics (e.g. *Karen demanding synergy and taking conversations offline*).
- **Reality Gap Alert**: When the room drifts toward a bad compromise or unnecessary delay, Jev immediately fires an alert with context citations and an **Enforce Right Decision** button.

### Step 5: Follow the Executive Nudge
- When circularity, context ignorance, or stalling spikes, the copilot generates an **Executive Nudge** banner for the meeting chair.
- Click **Copy Script** to read the exact suggested response aloud (e.g. *"Karen, Slide 4 of our Q3 Deck already confirmed 88% customer pilot approval. We don't need another study. Let's move to a vote."*).

### Step 6: Force Decision & Adjourn Early 🎉
- Click **Force Decision** (or **Select Right Call**) to trigger the decision synthesis engine.
- Generates a complete **Decision Record**:
  - The winning proposal (backed by Jev viability probabilities and context citations).
  - Key Idea Champion and Overruled Objections.
  - Single-threaded owners with 48-hour deadlines.
  - Pre-mortem risk mitigations.
  - A "Parked Ideas Memo" that firmly archives alternative tangents.
- Click **Copy as Markdown** to paste into Slack, Linear, or Jira, and adjourn 15 minutes early!

---

## 🎭 Dual Personality Modes

1. **😈 Anti-Waffle Boss (Ruthless)**: Sharp, witty, and zero-tolerance for corporate buzzwords. Directly calls out circular debates, backs data-driven thinkers, and tells the meeting chair to force a vote or adjourn early.
2. **🤝 Diplomatic Facilitator**: Polished, constructive executive coach. Helps transition tense or stalled debates into calm alignment, consensus checks, and structured next steps.

---

## 🚀 Getting Started

### 1. Requirements
* Python >= 3.10 (or `uv`)
* Node.js >= 18

### 2. Setup & Installation

```bash
# Clone the repository
git clone https://github.com/kmcf2599/decidefast.git
cd decidefast

# Backend Setup (using uv or python venv)
uv venv
uv pip install -r requirements.txt
# Or standard pip:
# python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt

# Frontend Setup & Build
cd frontend
npm install
npm run build
cd ..

# Copy environment template
cp .env.example .env
```

### 3. Launching the App

```bash
# Start the unified backend (serves API, WebSockets, and frontend production assets)
.venv/bin/uvicorn app.main:app --app-dir backend --port 8000

# Open your browser
open http://localhost:8000
```

### 4. API Keys & Configuration

* **TypeSafe API Key**: Set `TYPESAFE_API_KEY=...` in your `.env` or in the in-app **Settings ⚙️** modal. When not set, DecideFast uses an internal calibrated System One simulation matching Jev schemas.
* **Google Gemini (Optional)**: Set `GEMINI_API_KEY=...` for Google AI Studio Free Tier cloud deliberation.
* **OpenAI (Optional)**: Set `OPENAI_API_KEY=...` if you prefer GPT-4o-mini.

---

## 🧪 Testing

Run backend unit tests:
```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_backend.py
```
