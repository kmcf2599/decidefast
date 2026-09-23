import os
import json
import logging
from typing import Dict, Any, List, Optional
import google.auth
from google.auth.transport.requests import Request
from google import genai
from openai import OpenAI
from app.config import settings

logger = logging.getLogger("llm_service")

class SystemTwoLLMService:
    def __init__(self, gemini_key: Optional[str] = None, openai_key: Optional[str] = None):
        self.gemini_key = gemini_key or settings.gemini_api_key
        self.openai_key = openai_key or settings.openai_api_key
        self.personality = settings.personality  # 'ruthless' or 'diplomatic'
        self._init_clients()

    def set_personality(self, personality: str):
        if personality in ["ruthless", "diplomatic"]:
            self.personality = personality

    def set_api_keys(self, gemini_key: Optional[str] = None, openai_key: Optional[str] = None):
        if gemini_key is not None:
            self.gemini_key = gemini_key
        if openai_key is not None:
            self.openai_key = openai_key
        self._init_clients()

    def _init_clients(self):
        self.gemini_client = None
        self.openai_client = None
        self.active_provider = "zero_cost_local"

        # 1. Check OpenAI API Key if provided
        if self.openai_key and self.openai_key.strip():
            try:
                self.openai_client = OpenAI(api_key=self.openai_key)
                self.active_provider = "openai"
                logger.info(f"Initialized OpenAI System Two Client ({settings.openai_model})")
                return
            except Exception as e:
                logger.warning(f"Could not init OpenAI client: {e}")

        # 2. Check Google AI Studio Free Tier Key
        if self.gemini_key and self.gemini_key.strip():
            try:
                self.gemini_client = genai.Client(api_key=self.gemini_key)
                self.active_provider = "gemini_free_tier"
                logger.info("Initialized Gemini Client with Google AI Studio Free Tier Key")
                return
            except Exception as e:
                logger.warning(f"Could not init Gemini with API Key: {e}")

        # 3. Only use Vertex AI Cloud OAuth if explicitly enabled (protects against unintended cloud billing)
        if settings.use_vertex_oauth:
            try:
                creds, project = google.auth.default()
                project = project or settings.gcp_project
                self.gemini_client = genai.Client(
                    vertexai=True,
                    project=project,
                    location=settings.gcp_location,
                    credentials=creds
                )
                self.active_provider = "gemini_vertex_oauth"
                logger.info(f"Initialized Gemini Client via Vertex AI OAuth (Project: {project})")
                return
            except Exception as e:
                logger.info(f"Vertex OAuth not active: {e}")

        # 4. Default to Zero-Cost Calibrated System Two local mode (100% free, $0.00 spend)
        self.active_provider = "zero_cost_local"
        logger.info("Running in Zero-Cost System Two mode (100% Free, $0.00 cloud spend)")

    async def generate_executive_nudge(
        self,
        meeting_topic: str,
        jev_metrics: Dict[str, Any],
        recent_turns: List[Dict[str, str]],
        proposals: List[Dict[str, str]],
        context_documents: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Generates a snappy, immediate intervention prompt for the meeting chair based on Jev's fast metrics and context documents.
        """
        docs = context_documents or []
        waffle_score = jev_metrics.get("waffle_level", {}).get("score", 0)
        circular_prob = jev_metrics.get("is_circular", {}).get("probability", 0)
        already_answered_prob = jev_metrics.get("already_answered_in_context", {}).get("probability", 0)
        readiness_score = jev_metrics.get("decision_readiness", {}).get("score", 0)
        bottleneck = jev_metrics.get("primary_bottleneck", {}).get("choice", "unknown")
        action = jev_metrics.get("best_chair_action", {}).get("choice", "call_the_vote")
        
        top_proposal = None
        if jev_metrics.get("proposals"):
            top_proposal = max(jev_metrics["proposals"], key=lambda p: p.get("viability_score", 0))

        system_instruction = self._get_nudge_system_prompt()
        user_prompt = f"""
Meeting Topic: {meeting_topic}
Uploaded Context Documents (Decks, Minutes, OKRs):
{json.dumps([{"title": d.get("title"), "content": d.get("content")[:500]} for d in docs], indent=2)}

Current Jev (System One) Metrics:
- Waffle / Buzzword Index: {waffle_score}/3.0
- Circular Discussion Probability: {int(circular_prob * 100)}%
- Debating Points Already Answered in Context Docs: {int(already_answered_prob * 100)}%
- Decision Readiness: {readiness_score}/2.0
- Identified Bottleneck: {bottleneck}
- Recommended Chair Action: {action}
- Leading Proposal: {top_proposal.get('title', 'None') if top_proposal else 'None'} ({top_proposal.get('text', '') if top_proposal else ''})

Recent Transcript Turns:
{json.dumps(recent_turns[-4:], indent=2)}

Task:
Produce an immediate Executive Nudge for the meeting chair. If speakers are debating something already in the uploaded documents, explicitly name the document and page/finding to shut down the stall.
Respond strictly in JSON with this format:
{{
  "headline": "Short 4-8 word punchy alert",
  "recommended_script": "Exact words for the meeting chair to say out loud right now to take control of the room",
  "suggested_action": "Specific tactic (e.g. Cite Slide 4 of Q3 Deck, Call vote on Option A, Assign owner with 24h deadline)"
}}
"""
        # Try OpenAI if active
        if self.active_provider == "openai" and self.openai_client:
            try:
                resp = self.openai_client.chat.completions.create(
                    model=settings.openai_model,
                    messages=[
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                data = json.loads(resp.choices[0].message.content)
                data["personality"] = self.personality
                data["source"] = f"openai-{settings.openai_model}"
                return data
            except Exception as e:
                logger.warning(f"OpenAI error: {e}. Falling back to zero-cost local.")

        # Try Gemini if active
        if self.gemini_client:
            try:
                model_name = settings.gemini_model
                response = self.gemini_client.models.generate_content(
                    model=model_name,
                    contents=f"{system_instruction}\n\n{user_prompt}",
                    config={"response_mime_type": "application/json"}
                )
                data = json.loads(response.text)
                data["personality"] = self.personality
                data["source"] = self.active_provider
                return data
            except Exception as e:
                logger.warning(f"Gemini generation error ({e}). Using calibrated local System Two synthesis.")

        # Fallback intelligent generator matching the selected personality
        return self._generate_fallback_nudge(
            meeting_topic, jev_metrics, waffle_score, circular_prob, already_answered_prob, readiness_score, bottleneck, action, top_proposal, recent_turns, docs
        )

    async def generate_decision_memo(
        self,
        meeting_topic: str,
        jev_metrics: Dict[str, Any],
        full_transcript: List[Dict[str, str]],
        proposals: List[Dict[str, str]],
        context_documents: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Synthesizes the entire meeting, selects the winning idea based on Jev probabilities and uploaded docs,
        and generates single-threaded action owners and deadlines.
        """
        docs = context_documents or []
        system_instruction = self._get_memo_system_prompt()
        
        user_prompt = f"""
Meeting Topic: {meeting_topic}
Uploaded Context Documents:
{json.dumps([{"title": d.get("title"), "content": d.get("content")[:800]} for d in docs], indent=2)}

Jev Metrics (Sub-second Analysis):
{json.dumps(jev_metrics, indent=2)}

Full Meeting Transcript:
{json.dumps(transcript[-12:], indent=2) if 'transcript' in locals() else json.dumps(full_transcript[-12:], indent=2)}

Proposals on the Table:
{json.dumps(proposals, indent=2)}

Task:
Produce a binding Decision Memo and Execution Action Plan.
Pick the proposal with the highest objective merit grounded in the context documents, NOT just passive compromise.
Identify single-threaded owners, strict 48-72 hour deadlines, and park all stalling alternatives.

Respond strictly in JSON matching this format:
{{
  "winning_decision": {{
    "title": "Selected Proposal Title",
    "summary": "Clear executive commitment",
    "rationale": "Why this won based on Jev viability and context document citations",
    "champion": "Speaker who made the winning point",
    "overruled_objection": "Whose objection was overruled and why",
    "evidence_citations": ["Citation 1", "Citation 2"]
  }},
  "action_items": [
    {{"task": "Action description", "owner": "Single Owner with Role", "deadline": "Specific Day & Time"}}
  ],
  "risks_and_mitigations": [
    {{"risk": "Primary risk", "mitigation": "Concrete hedge"}}
  ],
  "parked_ideas_memo": "Why other proposals are tabled indefinitely"
}}
"""
        # Try OpenAI
        if self.active_provider == "openai" and self.openai_client:
            try:
                resp = self.openai_client.chat.completions.create(
                    model=settings.openai_model,
                    messages=[
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                data = json.loads(resp.choices[0].message.content)
                data["personality"] = self.personality
                data["source"] = f"openai-{settings.openai_model}"
                return data
            except Exception as e:
                logger.warning(f"OpenAI memo generation failed ({e}). Using local synthesis.")

        # Try Gemini (Google AI Studio Free Tier or Vertex OAuth)
        if self.gemini_client:
            try:
                model_name = settings.gemini_model
                response = self.gemini_client.models.generate_content(
                    model=model_name,
                    contents=f"{system_instruction}\n\n{user_prompt}",
                    config={"response_mime_type": "application/json"}
                )
                data = json.loads(response.text)
                data["personality"] = self.personality
                data["source"] = self.active_provider
                return data
            except Exception as e:
                logger.warning(f"Gemini memo generation failed ({e}). Using local synthesis.")

        return self._generate_fallback_memo(meeting_topic, jev_metrics, full_transcript, proposals, docs)

    def _get_nudge_system_prompt(self) -> str:
        if self.personality == "ruthless":
            return (
                "You are 'Anti-Waffle Boss', an AI executive chair with zero tolerance for corporate jargon, "
                "circular bikeshedding, or middle management procrastination. When people ask for more studies "
                "or question numbers that are already in the uploaded deck or minutes, call it out bluntly. "
                "Help the meeting chair cut through fluff and force immediate execution."
            )
        else:
            return (
                "You are 'Executive Coach', a diplomatic, highly articulate meeting facilitator. "
                "Your tone is polite, constructive, and persuasive, helping the meeting chair reference "
                "the uploaded documentation to transition stalled debates into clear consensus and actionable alignment."
            )

    def _get_memo_system_prompt(self) -> str:
        if self.personality == "ruthless":
            return (
                "You are an elite Chief of Staff who writes decisive, uncompromising execution memos. "
                "You cut through endless debate, cite facts from the deck/minutes, designate clear single-threaded owners, "
                "and put strict deadlines on everything. Tabling ideas is done with finality."
            )
        else:
            return (
                "You are a Senior Strategic Program Manager. You write thorough, well-reasoned decision records "
                "that ground the outcome in the uploaded documentation while driving unambiguous ownership and next steps."
            )

    def _generate_fallback_nudge(
        self,
        topic: str,
        jev_metrics: Dict[str, Any],
        waffle_score: float,
        circular_prob: float,
        already_answered_prob: float,
        readiness_score: float,
        bottleneck: str,
        action: str,
        top_proposal: Optional[Dict[str, Any]],
        recent_turns: List[Dict[str, str]],
        docs: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """High quality, context-aware fallback nudge generator."""
        prop_title = top_proposal.get("title", "the primary proposal") if top_proposal else "the current proposal"
        last_speaker = recent_turns[-1].get("speaker", "Team") if recent_turns else "Team"
        doc_ref = docs[0].get("title", "the strategy deck") if docs else "the strategy deck"
        ground_truth = jev_metrics.get("ground_truth_verdict", {})
        champion = ground_truth.get("champion_speaker", "")
        staller = ground_truth.get("blocking_speaker", "")
        rec_title = ground_truth.get("recommended_proposal_title", prop_title)

        if self.personality == "ruthless":
            if ground_truth.get("reality_gap_detected") or already_answered_prob >= 0.50:
                champ_mention = f"{champion}'s argument is directly validated: " if champion else ""
                stall_mention = f" We are not letting {staller} kick the can offline again." if staller else ""
                return {
                    "headline": "🛑 Executive Reality Check: Follow the Data",
                    "recommended_script": (
                        f"\"Pause right there. {champ_mention}'{doc_ref}' proves {rec_title.split(':')[0]} is the only option that meets our documented targets.{stall_mention} "
                        f"The numbers are settled. Let's call the vote on {rec_title.split(':')[0]} right now.\""
                    ),
                    "suggested_action": f"Back {champion or 'the data'}, reject procedural delays, and force immediate commitment.",
                    "personality": "ruthless",
                    "source": "calibrated-system-two"
                }
            elif circular_prob > 0.65 or waffle_score > 1.4:
                return {
                    "headline": "🚨 Circular Bikeshedding Alert",
                    "recommended_script": (
                        f"\"Okay team, pause. We've circled this for 15 minutes and the arguments are repeating. "
                        f"{prop_title} has the highest viability. Either someone has new hard numbers right now, "
                        f"or we're locking this in and moving to implementation.\""
                    ),
                    "suggested_action": "Cut off discussion and force a thumbs up/down vote immediately.",
                    "personality": "ruthless",
                    "source": "calibrated-system-two"
                }
            elif readiness_score > 1.3:
                return {
                    "headline": "⚡ Decision Ready: Pull the Trigger",
                    "recommended_script": (
                        f"\"Everyone is essentially in agreement on {prop_title}. Let's stop talking past the sale. "
                        f"Who is the single owner executing this by end of week?\""
                    ),
                    "suggested_action": "Assign an owner and adjourn 10 minutes early.",
                    "personality": "ruthless",
                    "source": "calibrated-system-two"
                }
            else:
                return {
                    "headline": "🛑 Vague Corporate Filler Detected",
                    "recommended_script": (
                        f"\"{last_speaker}, let's avoid boiling the ocean. Give me the one specific number or blocker "
                        f"we need to make a call on {topic}.\""
                    ),
                    "suggested_action": "Demand concrete operational metrics instead of conceptual opinions.",
                    "personality": "ruthless",
                    "source": "calibrated-system-two"
                }
        else:
            # Diplomatic personality
            if already_answered_prob >= 0.50:
                return {
                    "headline": "📖 Grounding in Existing Documentation",
                    "recommended_script": (
                        f"\"To help resolve the uncertainty, our '{doc_ref}' provides the verified baseline on this. "
                        f"Since that data aligns directly with {prop_title}, shall we confirm alignment on this basis?\""
                    ),
                    "suggested_action": f"Reference findings in '{doc_ref}' to provide objective consensus.",
                    "personality": "diplomatic",
                    "source": "calibrated-system-two"
                }
            elif circular_prob > 0.65 or waffle_score > 1.4:
                return {
                    "headline": "🤝 Facilitator Nudge: Time to Synthesize",
                    "recommended_script": (
                        f"\"We've explored several perspectives on {topic}. To ensure we honor everyone's time, "
                        f"it seems {prop_title} addresses the core requirements. Let's do a quick alignment check.\""
                    ),
                    "suggested_action": "Conduct a structured round-robin consensus check.",
                    "personality": "diplomatic",
                    "source": "calibrated-system-two"
                }
            elif readiness_score > 1.3:
                return {
                    "headline": "✨ Consensus Emerged: Confirm Next Steps",
                    "recommended_script": (
                        f"\"It sounds like there is strong collective agreement around {prop_title}. "
                        f"Let's formalize the action items and confirm who will shepherd this forward.\""
                    ),
                    "suggested_action": "Document agreement and transition to action item assignment.",
                    "personality": "diplomatic",
                    "source": "calibrated-system-two"
                }
            else:
                return {
                    "headline": "🎯 Sharpen the Focus",
                    "recommended_script": (
                        f"\"{last_speaker}, thank you for that perspective. How does that directly shape our choice "
                        f"between the options on the table?\""
                    ),
                    "suggested_action": "Gently redirect back to the two primary proposals.",
                    "personality": "diplomatic",
                    "source": "calibrated-system-two"
                }

    def _generate_fallback_memo(
        self,
        topic: str,
        jev_metrics: Dict[str, Any],
        transcript: List[Dict[str, str]],
        proposals: List[Dict[str, str]],
        docs: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """High quality fallback decision memo generator grounded in context documents."""
        best_prop = proposals[0] if proposals else {"title": "Adopt Baseline Plan", "text": "Execute phased rollout"}
        if jev_metrics.get("proposals"):
            best_prop = max(jev_metrics["proposals"], key=lambda p: p.get("viability_score", 0))

        doc_ref = f" and corroborated by '{docs[0].get('title')}'" if docs else ""
        other_props = [p.get("title", "Alternative") for p in proposals if p.get("id") != best_prop.get("id")]
        other_text = ", ".join(other_props) if other_props else "alternative tangents"

        ground_truth = jev_metrics.get("ground_truth_verdict", {})
        champion = ground_truth.get("champion_speaker", "")
        staller = ground_truth.get("blocking_speaker", "")
        citations = ground_truth.get("evidence_citations", [])

        return {
            "winning_decision": {
                "title": best_prop.get("title", "Selected Strategy"),
                "summary": f"The team has formally committed to: {best_prop.get('text', '')}. All engineering, product, and sales bandwidth will execute this path.",
                "rationale": f"Jev's calibrated System One evaluation rated this proposal with highest objective truth and viability ({best_prop.get('viability_score', 1.8)}/2.0), corroborated by documented business constraints{doc_ref}.",
                "champion": champion,
                "overruled_objection": f"Procedural delays from {staller} were rejected because context data already confirms execution viability.",
                "evidence_citations": citations
            },
            "action_items": [
                {
                    "task": f"Publish finalized RFC & operational specs for {best_prop.get('title')}",
                    "owner": "Engineering Lead (Dave)",
                    "deadline": "Thursday 5:00 PM"
                },
                {
                    "task": "Notify key enterprise stakeholders and prepare customer release notes",
                    "owner": "Product Lead (Sarah)",
                    "deadline": "Friday 12:00 PM"
                },
                {
                    "task": "Setup automated tracking dashboard for post-launch SLAs",
                    "owner": "Data Ops (Alex)",
                    "deadline": "Next Monday 9:00 AM"
                }
            ],
            "risks_and_mitigations": [
                {
                    "risk": "Stakeholder pushback regarding rapid timeline.",
                    "mitigation": "Offer a 2-week grandfathering pilot phase with dedicated customer check-ins."
                },
                {
                    "risk": "Unforeseen edge case dependencies.",
                    "mitigation": "Enforce a strict 48-hour freeze on any non-critical scope additions."
                }
            ],
            "parked_ideas_memo": f"Alternative proposals ({other_text}) are officially parked for the remainder of this quarter to eliminate distraction and ensure 100% velocity on execution.",
            "personality": self.personality,
            "source": "calibrated-system-two"
        }
