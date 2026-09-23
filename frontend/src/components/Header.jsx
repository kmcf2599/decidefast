import React from 'react';
import { Zap, ShieldAlert, Sparkles, Settings as SettingsIcon, Play, SkipForward, RotateCcw, Flame, BookOpen, HelpCircle } from 'lucide-react';

export default function Header({
  personality,
  onTogglePersonality,
  scenarios,
  selectedScenario,
  onSelectScenario,
  onPlayNextTurn,
  onAutoPlay,
  isPlaying,
  onReset,
  onForceDecision,
  onOpenSettings,
  contextDocuments = [],
  onOpenContext,
  onOpenHelp,
  jevMetrics
}) {
  const readiness = jevMetrics?.decision_readiness?.score || 0;
  const isReady = readiness >= 1.4;

  return (
    <header className="border-b border-[#2d2238] bg-[#140e1b]/90 backdrop-blur sticky top-0 z-30 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#e551ba] to-[#9b3bff] flex items-center justify-center shadow-lg shadow-[#e551ba]/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">DecideFast</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e551ba]/20 text-[#f48fd9] border border-[#e551ba]/40">
                Jev + Gemini
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Real-time Meeting Decider & Anti-Waffle Copilot
            </p>
          </div>
        </div>

        {/* Center Controls: Scenario & Playback */}
        <div className="flex items-center gap-2 bg-[#1b1424] p-1.5 rounded-xl border border-[#30233f]">
          <select
            value={selectedScenario?.id || ''}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="bg-[#241a31] text-xs font-medium text-zinc-200 border border-[#3e2c52] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#e551ba]"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          <button
            onClick={onPlayNextTurn}
            title="Step next speaker turn"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-[#2e213e] hover:bg-[#3d2b54] text-zinc-200 rounded-lg transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5 text-[#e551ba]" />
            Step
          </button>

          <button
            onClick={onAutoPlay}
            title={isPlaying ? "Pause auto-playback" : "Auto-play meeting simulation"}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-[#e551ba]/20 text-[#f48fd9] border border-[#e551ba]/40 hover:bg-[#e551ba]/30'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isPlaying ? 'fill-amber-300' : ''}`} />
            {isPlaying ? 'Pause' : 'Auto-Run'}
          </button>

          <button
            onClick={onReset}
            title="Reset meeting transcript"
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-[#2e213e]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Controls: Context Docs, Personality Toggle, Force Decision */}
        <div className="flex items-center gap-3">
          
          {/* Context / Decks Button */}
          <button
            onClick={onOpenContext}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#251736] hover:bg-[#331f4a] text-zinc-200 border border-[#3e2659] transition-all"
            title="Upload pitch deck, past minutes, OKRs"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#e551ba]" />
            <span>Context</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#e551ba]/20 text-[#f48fd9]">
              {contextDocuments.length}
            </span>
          </button>

          {/* Personality Switcher */}
          <div className="flex items-center bg-[#1b1424] p-1 rounded-xl border border-[#30233f]">
            <button
              onClick={() => onTogglePersonality('ruthless')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                personality === 'ruthless'
                  ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Flame className="w-3 h-3" />
              Boss
            </button>
            <button
              onClick={() => onTogglePersonality('diplomatic')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                personality === 'diplomatic'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Diplomat
            </button>
          </div>

          {/* Force Decision Action Button */}
          <button
            onClick={onForceDecision}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
              isReady
                ? 'bg-gradient-to-r from-[#e551ba] to-[#7928ca] hover:opacity-90 ring-2 ring-[#e551ba]/50 glow-urgent animate-pulse'
                : 'bg-[#352549] hover:bg-[#453160] text-zinc-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            Decide
          </button>

          {/* How to use Help button */}
          <button
            onClick={onOpenHelp}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-[#251a33] border border-transparent hover:border-[#3a284e]"
            title="How to use DecideFast"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-[#251a33] border border-transparent hover:border-[#3a284e]"
            title="Settings & API Keys"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
