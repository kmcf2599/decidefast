import pytest
from app.jev_service import JevEvaluationService
from app.meeting_manager import MeetingManager
from app.scenarios import SCENARIOS

@pytest.mark.asyncio
async def test_jev_service_simulation():
    service = JevEvaluationService()
    scenario = SCENARIOS[0]
    metrics = await service.evaluate_meeting_state(
        meeting_topic=scenario["topic"],
        recent_turns=scenario["script"][:4],
        proposals=scenario["proposals"],
        context_documents=scenario.get("context_documents", [])
    )
    
    assert "waffle_level" in metrics
    assert "score" in metrics["waffle_level"]
    assert "is_circular" in metrics
    assert "probability" in metrics["is_circular"]
    assert "already_answered_in_context" in metrics
    assert "decision_readiness" in metrics
    assert "primary_bottleneck" in metrics
    assert "best_chair_action" in metrics
    assert len(metrics["proposals"]) == len(scenario["proposals"])

@pytest.mark.asyncio
async def test_meeting_manager_flow():
    mgr = MeetingManager()
    mgr.load_scenario("pricing_deadlock")
    assert mgr.topic == "Q3 Enterprise Tier Pricing & Grandfathering Strategy"
    assert len(mgr.proposals) == 3
    assert len(mgr.context_documents) == 2
    
    # Add a custom document
    doc = mgr.add_context_document("Q3 Margin Target", "Gross margin target is 82%")
    assert len(mgr.context_documents) == 3
    
    # Add a turn
    state = await mgr.add_turn("Dave (VP)", "We need to make a decision today.")
    assert len(state["transcript"]) == 1
    assert state["jev_metrics"] is not None
    
    # Toggle personality
    mgr.set_personality("diplomatic")
    assert mgr.personality == "diplomatic"
    mgr.set_personality("ruthless")
    assert mgr.personality == "ruthless"

@pytest.mark.asyncio
async def test_force_decision_with_context():
    mgr = MeetingManager()
    mgr.load_scenario("pricing_deadlock")
    await mgr.add_turn("Dave (VP)", "Let's raise the pricing.")
    state = await mgr.force_decision()
    
    assert state["decision_memo"] is not None
    assert "winning_decision" in state["decision_memo"]
    assert "action_items" in state["decision_memo"]
