import os
import io
from pathlib import Path
import logging
from typing import Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pypdf import PdfReader
from pydantic import BaseModel

from app.meeting_manager import meeting_manager
from app.scenarios import SCENARIOS
from app.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("main")

app = FastAPI(title="DecideFast API", description="Real-time Meeting Decider with Jev & Gemini")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections
connected_clients = set()

class TurnRequest(BaseModel):
    speaker: str
    text: str

class ProposalRequest(BaseModel):
    title: str
    text: str

class ConfigRequest(BaseModel):
    personality: Optional[str] = None
    typesafe_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

class ScenarioLoadRequest(BaseModel):
    scenario_id: str

async def broadcast_state():
    state = meeting_manager.get_state()
    disconnected = set()
    for ws in connected_clients:
        try:
            await ws.send_json({"type": "state_update", "data": state})
        except Exception:
            disconnected.add(ws)
    connected_clients.difference_update(disconnected)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    try:
        # Send initial state on connection
        await websocket.send_json({"type": "state_update", "data": meeting_manager.get_state()})
        while True:
            msg = await websocket.receive_json()
            msg_type = msg.get("type")
            if msg_type == "add_turn":
                speaker = msg.get("speaker", "Speaker")
                text = msg.get("text", "")
                await meeting_manager.add_turn(speaker, text)
                await broadcast_state()
            elif msg_type == "force_decision":
                await meeting_manager.force_decision()
                await broadcast_state()
    except WebSocketDisconnect:
        connected_clients.discard(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        connected_clients.discard(websocket)

@app.get("/api/state")
async def get_state():
    return meeting_manager.get_state()

@app.get("/api/scenarios")
async def get_scenarios():
    return SCENARIOS

@app.post("/api/scenario/load")
async def load_scenario(req: ScenarioLoadRequest):
    meeting_manager.load_scenario(req.scenario_id)
    await broadcast_state()
    return meeting_manager.get_state()

@app.post("/api/turn")
async def add_turn(req: TurnRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Turn text cannot be empty")
    state = await meeting_manager.add_turn(req.speaker, req.text)
    await broadcast_state()
    return state

@app.post("/api/proposal")
async def add_proposal(req: ProposalRequest):
    if not req.title.strip() or not req.text.strip():
        raise HTTPException(status_code=400, detail="Title and text required")
    state = meeting_manager.add_proposal(req.title, req.text)
    await broadcast_state()
    return state

@app.post("/api/force-decision")
async def force_decision():
    state = await meeting_manager.force_decision()
    await broadcast_state()
    return state

@app.post("/api/config")
async def update_config(req: ConfigRequest):
    if req.personality:
        meeting_manager.set_personality(req.personality)
    if req.typesafe_api_key or req.gemini_api_key or req.openai_api_key:
        meeting_manager.set_api_keys(
            typesafe_key=req.typesafe_api_key,
            gemini_key=req.gemini_api_key,
            openai_key=req.openai_api_key
        )
    await broadcast_state()
    return {"status": "ok", "state": meeting_manager.get_state()}

class ContextTextRequest(BaseModel):
    title: str
    content: str

@app.post("/api/context/upload")
async def upload_context_document(file: UploadFile = File(...)):
    filename = file.filename or "uploaded_document"
    contents = await file.read()
    extracted_text = ""

    if filename.lower().endswith(".pdf"):
        try:
            reader = PdfReader(io.BytesIO(contents))
            pages_text = [page.extract_text() or "" for page in reader.pages]
            extracted_text = "\n".join(pages_text)
        except Exception as e:
            logger.error(f"Failed to parse PDF {filename}: {e}")
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
    else:
        try:
            extracted_text = contents.decode("utf-8", errors="ignore")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Document contains no readable text")

    doc = meeting_manager.add_context_document(title=filename, content=extracted_text, source="upload")
    
    # Re-evaluate Jev metrics with the new context
    recent_turns = meeting_manager.transcript[-6:] if len(meeting_manager.transcript) > 6 else meeting_manager.transcript
    meeting_manager.latest_jev_metrics = await meeting_manager.jev_service.evaluate_meeting_state(
        meeting_topic=meeting_manager.topic,
        recent_turns=recent_turns,
        proposals=meeting_manager.proposals,
        context_documents=meeting_manager.context_documents,
        elapsed_minutes=meeting_manager.elapsed_minutes
    )

    await broadcast_state()
    return {"status": "ok", "document": doc, "state": meeting_manager.get_state()}

@app.post("/api/context/text")
async def add_context_text(req: ContextTextRequest):
    if not req.title.strip() or not req.content.strip():
        raise HTTPException(status_code=400, detail="Title and content are required")

    doc = meeting_manager.add_context_document(title=req.title, content=req.content, source="manual")
    
    # Re-evaluate Jev metrics
    recent_turns = meeting_manager.transcript[-6:] if len(meeting_manager.transcript) > 6 else meeting_manager.transcript
    meeting_manager.latest_jev_metrics = await meeting_manager.jev_service.evaluate_meeting_state(
        meeting_topic=meeting_manager.topic,
        recent_turns=recent_turns,
        proposals=meeting_manager.proposals,
        context_documents=meeting_manager.context_documents,
        elapsed_minutes=meeting_manager.elapsed_minutes
    )

    await broadcast_state()
    return {"status": "ok", "document": doc, "state": meeting_manager.get_state()}

@app.delete("/api/context/{doc_id}")
async def remove_context_document(doc_id: str):
    meeting_manager.remove_context_document(doc_id)
    await broadcast_state()
    return {"status": "ok", "state": meeting_manager.get_state()}

@app.post("/api/reset")
async def reset_meeting():
    meeting_manager.reset()
    await broadcast_state()
    return meeting_manager.get_state()

# Mount frontend production build if available
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")

