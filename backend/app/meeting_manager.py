import asyncio
import logging
import uuid
from typing import List, Dict, Any, Optional
from app.jev_service import JevEvaluationService
from app.llm_service import SystemTwoLLMService
from app.scenarios import SCENARIOS
from app.config import settings

logger = logging.getLogger("meeting_manager")

class MeetingManager:
    def __init__(self):
        self.jev_service = JevEvaluationService()
        self.llm_service = SystemTwoLLMService()
        self.personality = settings.personality
        self.load_scenario("pricing_deadlock")

    def reset(self):
        self.topic: str = "Q3 Enterprise Strategy & Priorities"
        self.transcript: List[Dict[str, str]] = []
        self.proposals: List[Dict[str, str]] = []
        self.context_documents: List[Dict[str, Any]] = []
        self.latest_jev_metrics: Optional[Dict[str, Any]] = None
        self.latest_nudge: Optional[Dict[str, Any]] = None
        self.decision_memo: Optional[Dict[str, Any]] = None
        self.elapsed_minutes: int = 5
        self.is_processing: bool = False

    def set_personality(self, personality: str):
        if personality in ["ruthless", "diplomatic"]:
            self.personality = personality
            self.llm_service.set_personality(personality)

    def set_api_keys(
        self,
        typesafe_key: Optional[str] = None,
        gemini_key: Optional[str] = None,
        openai_key: Optional[str] = None
    ):
        if typesafe_key:
            self.jev_service.set_api_key(typesafe_key)
        self.llm_service.set_api_keys(gemini_key=gemini_key, openai_key=openai_key)

    def load_scenario(self, scenario_id: str):
        import copy
        self.reset()
        scenario = next((s for s in SCENARIOS if s["id"] == scenario_id), SCENARIOS[0])
        self.topic = scenario["topic"]
        self.proposals = copy.deepcopy(scenario["proposals"])
        self.context_documents = copy.deepcopy(scenario.get("context_documents", []))
        self.latest_jev_metrics = {
            "source": "jev-initialized",
            "model": "jev-1.13.0",
            "waffle_detected_words": [],
            "already_answered_in_context": {"probability": 0.15, "verdict": False},
            "waffle_level": {"score": 0.4, "confidence": 0.75, "probabilities": {"0": 0.65, "1": 0.25, "2": 0.08, "3": 0.02}},
            "is_circular": {"probability": 0.25, "verdict": False},
            "decision_readiness": {"score": 1.25, "confidence": 0.70, "probabilities": {"0": 0.15, "1": 0.55, "2": 0.30}},
            "primary_bottleneck": {"choice": "clear_to_proceed", "confidence": 0.62, "probabilities": {"clear_to_proceed": 0.62, "risk_aversion": 0.14, "bikeshedding": 0.10, "lack_of_data": 0.08, "scope_creep": 0.04, "ignoring_context": 0.02}},
            "best_chair_action": {"choice": "let_discussion_flow", "confidence": 0.65, "probabilities": {"let_discussion_flow": 0.65, "call_the_vote": 0.15, "cite_context_deck": 0.10, "assign_data_owner": 0.05, "cut_the_waffle": 0.05}},
            "proposals": self.proposals,
            "ground_truth_verdict": self.jev_service._evaluate_ground_truth_decision(self.proposals, self.context_documents, [], self.proposals),
            "speakers_analysis": self.jev_service._evaluate_speakers_merit([], self.context_documents)
        }
        return scenario

    def add_context_document(self, title: str, content: str, source: str = "upload") -> Dict[str, Any]:
        doc_id = f"doc_{uuid.uuid4().hex[:8]}"
        doc = {
            "id": doc_id,
            "title": title.strip() or "Uploaded Document",
            "content": content.strip(),
            "source": source
        }
        self.context_documents.append(doc)
        logger.info(f"Added context document: {title} ({len(content)} chars)")
        return doc

    def remove_context_document(self, doc_id: str):
        self.context_documents = [d for d in self.context_documents if d["id"] != doc_id]

    def clear_context_documents(self):
        self.context_documents = []

    async def add_turn(self, speaker: str, text: str) -> Dict[str, Any]:
        """
        Appends a new turn to the meeting transcript, then runs fast Jev System One evaluation,
        and optionally triggers System Two Gemini nudge if thresholds are met.
        """
        turn = {"speaker": speaker.strip() or "Speaker", "text": text.strip()}
        self.transcript.append(turn)
        self.elapsed_minutes += 2

        # Run fast Jev evaluation with context_documents
        recent_turns = self.transcript[-6:] if len(self.transcript) > 6 else self.transcript
        self.latest_jev_metrics = await self.jev_service.evaluate_meeting_state(
            meeting_topic=self.topic,
            recent_turns=recent_turns,
            proposals=self.proposals,
            context_documents=self.context_documents,
            elapsed_minutes=self.elapsed_minutes
        )

        # Sync proposals with newly evaluated scores and probabilities
        if self.latest_jev_metrics and "proposals" in self.latest_jev_metrics:
            prop_map = {p["id"]: p for p in self.latest_jev_metrics["proposals"]}
            for p in self.proposals:
                if p["id"] in prop_map:
                    p.update(prop_map[p["id"]])

        # Evaluate if System Two LLM Nudge should trigger
        circular_prob = self.latest_jev_metrics.get("is_circular", {}).get("probability", 0)
        waffle_score = self.latest_jev_metrics.get("waffle_level", {}).get("score", 0)
        readiness_score = self.latest_jev_metrics.get("decision_readiness", {}).get("score", 0)
        ignoring_context = self.latest_jev_metrics.get("already_answered_in_context", {}).get("probability", 0) >= 0.50

        # Trigger nudge when circularity, waffle, readiness, or ignoring context is detected
        should_nudge = (
            circular_prob >= settings.circularity_threshold or
            waffle_score >= settings.waffle_threshold or
            readiness_score >= settings.decision_readiness_threshold or
            ignoring_context
        )

        if should_nudge:
            self.latest_nudge = await self.llm_service.generate_executive_nudge(
                meeting_topic=self.topic,
                jev_metrics=self.latest_jev_metrics,
                recent_turns=recent_turns,
                proposals=self.proposals,
                context_documents=self.context_documents
            )

        return self.get_state()

    def add_proposal(self, title: str, text: str) -> Dict[str, Any]:
        prop_id = f"prop_{len(self.proposals) + 1}"
        self.proposals.append({
            "id": prop_id,
            "title": title.strip(),
            "text": text.strip()
        })
        return self.get_state()

    async def force_decision(self) -> Dict[str, Any]:
        """
        Forces an immediate decision using System Two Gemini synthesis backed by Jev's metrics & context documents.
        """
        if not self.latest_jev_metrics:
            recent_turns = self.transcript[-6:] if len(self.transcript) > 6 else self.transcript
            self.latest_jev_metrics = await self.jev_service.evaluate_meeting_state(
                meeting_topic=self.topic,
                recent_turns=recent_turns,
                proposals=self.proposals,
                context_documents=self.context_documents,
                elapsed_minutes=self.elapsed_minutes
            )

        self.decision_memo = await self.llm_service.generate_decision_memo(
            meeting_topic=self.topic,
            jev_metrics=self.latest_jev_metrics,
            full_transcript=self.transcript,
            proposals=self.proposals,
            context_documents=self.context_documents
        )

        return self.get_state()

    def get_state(self) -> Dict[str, Any]:
        return {
            "topic": self.topic,
            "elapsed_minutes": self.elapsed_minutes,
            "personality": self.personality,
            "transcript_count": len(self.transcript),
            "transcript": self.transcript,
            "proposals": self.proposals,
            "context_documents": self.context_documents,
            "jev_metrics": self.latest_jev_metrics,
            "latest_nudge": self.latest_nudge,
            "decision_memo": self.decision_memo,
            "has_decision": self.decision_memo is not None
        }

# Global singleton manager instance
meeting_manager = MeetingManager()
