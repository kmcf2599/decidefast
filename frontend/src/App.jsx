import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import WaffleMeter from './components/WaffleMeter';
import ExecutiveNudge from './components/ExecutiveNudge';
import IdeaLeaderboard from './components/IdeaLeaderboard';
import SpeakerMeritRadar from './components/SpeakerMeritRadar';
import DecisionRadar from './components/DecisionRadar';
import TranscriptFeed from './components/TranscriptFeed';
import ActionPlanModal from './components/ActionPlanModal';
import SettingsModal from './components/SettingsModal';
import ContextDocsDrawer from './components/ContextDocsDrawer';
import HowToUseModal from './components/HowToUseModal';
import { BookOpen, AlertCircle, FileText } from 'lucide-react';

export default function App() {
  const [state, setState] = useState({
    topic: "Q3 Enterprise Pricing Strategy",
    elapsed_minutes: 15,
    personality: "ruthless",
    transcript: [],
    proposals: [],
    context_documents: [],
    jev_metrics: null,
    latest_nudge: null,
    decision_memo: null,
    has_decision: false,
  });

  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [scenarioTurnIndex, setScenarioTurnIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isActionPlanOpen, setIsActionPlanOpen] = useState(false);
  const [isContextDrawerOpen, setIsContextDrawerOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Web Speech API & Playback Refs
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const autoPlayIntervalRef = useRef(null);
  const wsRef = useRef(null);
  const selectedScenarioRef = useRef(null);
  const scenarioTurnIndexRef = useRef(0);
  const isPlayingRef = useRef(false);

  // 1. Initial Load: Fetch Scenarios & State
  useEffect(() => {
    fetch('/api/scenarios')
      .then((res) => res.json())
      .then((data) => {
        setScenarios(data);
        if (data.length > 0) {
          handleSelectScenario(data[0].id, data);
        }
      })
      .catch((err) => console.error("Could not load scenarios:", err));

    // WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'state_update') {
          setState(msg.data);
          if (msg.data.decision_memo) {
            setIsActionPlanOpen(true);
          }
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // 2. Setup Web Speech Recognition
  const hasSpeechSupport = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  useEffect(() => {
    if (!hasSpeechSupport) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onresult = (e) => {
      const lastIndex = e.results.length - 1;
      const transcriptText = e.results[lastIndex][0].transcript.trim();
      if (transcriptText) {
        handleAddTurn("You (Mic)", transcriptText);
      }
    };

    rec.onerror = (e) => {
      console.warn("Speech recognition error:", e);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
  }, [hasSpeechSupport]);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Start mic error:", err);
      }
    }
  };

  // 3. Scenario Selection & Stepping
  const handleSelectScenario = async (scenarioId, loadedScenarios = null) => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }

    const list = loadedScenarios || scenarios;
    const sc = list.find((s) => s.id === scenarioId) || list[0];
    setSelectedScenario(sc);
    selectedScenarioRef.current = sc;
    scenarioTurnIndexRef.current = 0;
    setScenarioTurnIndex(0);

    try {
      const res = await fetch('/api/scenario/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_id: scenarioId }),
      });
      const data = await res.json();
      setState(data);
    } catch (err) {
      console.error("Error loading scenario:", err);
    }
  };

  const handlePlayNextTurn = async () => {
    const sc = selectedScenarioRef.current;
    if (!sc || !sc.script || sc.script.length === 0) return;

    const curIdx = scenarioTurnIndexRef.current;
    if (curIdx >= sc.script.length) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
      return;
    }

    const nextTurn = sc.script[curIdx];
    scenarioTurnIndexRef.current = curIdx + 1;
    setScenarioTurnIndex(curIdx + 1);
    await handleAddTurn(nextTurn.speaker, nextTurn.text);
  };

  // Auto-play toggle
  const handleToggleAutoPlay = () => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      handlePlayNextTurn();
      autoPlayIntervalRef.current = setInterval(() => {
        handlePlayNextTurn();
      }, 4000);
    }
  };

  useEffect(() => {
    return () => {
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
    };
  }, []);

  // 4. Meeting Actions
  const handleAddTurn = async (speaker, text) => {
    try {
      const res = await fetch('/api/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speaker, text }),
      });
      const data = await res.json();
      setState(data);
    } catch (err) {
      console.error("Error adding turn:", err);
    }
  };

  const handleForceDecision = async () => {
    try {
      const res = await fetch('/api/force-decision', { method: 'POST' });
      const data = await res.json();
      setState(data);
      setIsActionPlanOpen(true);
    } catch (err) {
      console.error("Error forcing decision:", err);
    }
  };

  const handleTogglePersonality = async (newPersonality) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personality: newPersonality }),
      });
      const data = await res.json();
      setState(data.state);
    } catch (err) {
      console.error("Error setting personality:", err);
    }
  };

  const handleSaveConfig = async (cfg) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
      const data = await res.json();
      setState(data.state);
    } catch (err) {
      console.error("Error saving config:", err);
    }
  };

  // 5. Document Context Handlers
  const handleUploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/context/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      alert(`Upload error: ${err.detail || 'Failed to upload'}`);
      return;
    }
    const data = await res.json();
    setState(data.state);
  };

  const handleAddTextDoc = async (title, content) => {
    const res = await fetch('/api/context/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(`Error: ${err.detail || 'Failed to add'}`);
      return;
    }
    const data = await res.json();
    setState(data.state);
  };

  const handleDeleteDoc = async (docId) => {
    const res = await fetch(`/api/context/${docId}`, { method: 'DELETE' });
    const data = await res.json();
    setState(data.state);
  };

  const handleReset = async () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
    scenarioTurnIndexRef.current = 0;
    setScenarioTurnIndex(0);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      setState(data);
      const cur = selectedScenarioRef.current || selectedScenario;
      if (cur) {
        handleSelectScenario(cur.id);
      }
    } catch (err) {
      console.error("Error resetting:", err);
    }
  };

  const contextDocs = state.context_documents || [];

  return (
    <div className="min-h-screen bg-[#0d0914] text-zinc-100 flex flex-col selection:bg-[#e551ba]/30">
      
      {/* Top Header */}
      <Header
        personality={state.personality}
        onTogglePersonality={handleTogglePersonality}
        scenarios={scenarios}
        selectedScenario={selectedScenario}
        onSelectScenario={handleSelectScenario}
        onPlayNextTurn={handlePlayNextTurn}
        onAutoPlay={handleToggleAutoPlay}
        isPlaying={isPlaying}
        onReset={handleReset}
        onForceDecision={handleForceDecision}
        onOpenSettings={() => setIsSettingsOpen(true)}
        contextDocuments={contextDocs}
        onOpenContext={() => setIsContextDrawerOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        jevMetrics={state.jev_metrics}
      />

      {/* Main Workspace Layout */}
      <main className="max-w-7xl w-full mx-auto p-4 md:p-6 flex-1 space-y-5">
        
        {/* Topic & Context Bar */}
        <div className="bg-[#170f22] border border-[#2b1b3e] rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Current Discussion Topic</span>
            <h2 className="text-base font-bold text-white tracking-tight">{state.topic}</h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <span>Elapsed: <b className="text-zinc-200">{state.elapsed_minutes}m</b></span>
            <span>Turns: <b className="text-zinc-200">{state.transcript.length}</b></span>
            <span>Mode: <b className="text-[#f48fd9] uppercase">{state.personality}</b></span>
          </div>
        </div>

        {/* Active Context Documents Preview Banner */}
        {contextDocs.length > 0 && (
          <div className="bg-[#150d1e] border border-[#301c44] rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="p-1 rounded-md bg-[#e551ba]/20 text-[#f48fd9] shrink-0">
                <BookOpen className="w-3.5 h-3.5" />
              </span>
              <span className="text-zinc-400 font-semibold shrink-0">Grounding Documents in Jev State:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                {contextDocs.map((doc) => (
                  <span
                    key={doc.id}
                    className="px-2.5 py-0.5 rounded-md bg-[#251537] text-zinc-200 border border-[#3c2457] whitespace-nowrap font-medium flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3 text-[#e551ba]" />
                    {doc.title}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsContextDrawerOpen(true)}
              className="text-[#f48fd9] hover:text-white font-semibold text-[11px] shrink-0 hover:underline"
            >
              + Add / Edit Decks →
            </button>
          </div>
        )}

        {/* Real-Time Executive Nudge Alert (Floats prominently above when active) */}
        {state.latest_nudge && (
          <ExecutiveNudge
            nudge={state.latest_nudge}
            personality={state.personality}
          />
        )}

        {/* 2-Column Responsive Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Gauges, Leaderboard, & Radar (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <WaffleMeter metrics={state.jev_metrics} />
            <SpeakerMeritRadar
              metrics={state.jev_metrics}
              onSelectWinningProposal={() => handleForceDecision()}
            />
            <IdeaLeaderboard
              proposals={state.jev_metrics?.proposals || state.proposals}
              groundTruth={state.jev_metrics?.ground_truth_verdict}
              onSelectProposal={() => handleForceDecision()}
            />
            <DecisionRadar metrics={state.jev_metrics} />
          </div>

          {/* Right Column: Live Transcript Feed & Audio Mic (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <TranscriptFeed
              transcript={state.transcript}
              onAddTurn={handleAddTurn}
              isListening={isListening}
              onToggleMic={toggleMic}
              hasSpeechSupport={hasSpeechSupport}
            />
          </div>

        </div>

      </main>

      {/* Modals */}
      <ActionPlanModal
        memo={state.decision_memo}
        onClose={() => setIsActionPlanOpen(false)}
      />

      <ContextDocsDrawer
        isOpen={isContextDrawerOpen}
        onClose={() => setIsContextDrawerOpen(false)}
        documents={contextDocs}
        onUploadFile={handleUploadFile}
        onAddTextDoc={handleAddTextDoc}
        onDeleteDoc={handleDeleteDoc}
      />

      <HowToUseModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onOpenContext={() => setIsContextDrawerOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveConfig={handleSaveConfig}
      />

      {/* Persistent Footer */}
      <footer className="border-t border-[#231733] py-3 text-center text-xs text-zinc-500">
        DecideFast • Architecture: TypeSafe Jev (System One Sub-second Primitives) + Google Gemini 3.8 Flash (System Two Deliberation)
      </footer>

    </div>
  );
}
