import React from 'react';
import { AlertTriangle, Repeat, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';

export default function WaffleMeter({ metrics }) {
  const waffle = metrics?.waffle_level?.score ?? 0;
  const waffleMax = 3.0;
  const wafflePct = Math.min(100, Math.round((waffle / waffleMax) * 100));

  const circularProb = metrics?.is_circular?.probability ?? 0;
  const circularPct = Math.round(circularProb * 100);

  const readiness = metrics?.decision_readiness?.score ?? 0;
  const readinessMax = 2.0;
  const readinessPct = Math.min(100, Math.round((readiness / readinessMax) * 100));

  const buzzwords = metrics?.waffle_detected_words || [];

  // Determine waffle status
  let waffleStatus = { label: "Substantive & Direct", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" };
  if (waffle >= 2.0) {
    waffleStatus = { label: "🚨 Critical: Pure Jargon & Stalling", color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/40" };
  } else if (waffle >= 1.1) {
    waffleStatus = { label: "⚠️ Elevated Corporate Fluff", color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30" };
  }

  return (
    <div className="bg-[#171021] border border-[#2d203a] rounded-2xl p-5 shadow-xl space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e551ba]">System One Real-Time Gauges</span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-[#281b39] text-zinc-300 rounded border border-[#3e2b54]">
              {metrics?.source === 'jev-api' ? 'Jev API' : 'Calibrated Jev'}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-0.5">Waffle & Circularity Detector</h2>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${waffleStatus.bg} ${waffleStatus.color} ${waffleStatus.border}`}>
          {waffleStatus.label}
        </div>
      </div>

      {/* Main Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* 1. Waffle / Jargon Index (Score primitive) */}
        <div className="bg-[#1e142c] p-4 rounded-xl border border-[#332249] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Waffle Score
            </span>
            <span className="font-mono text-zinc-300">{waffle.toFixed(1)} / 3.0</span>
          </div>

          <div className="my-3">
            <div className="w-full bg-[#120c1a] h-3 rounded-full overflow-hidden p-0.5 border border-[#2b1c3e]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  waffle >= 2.0
                    ? 'bg-gradient-to-r from-amber-500 to-red-500'
                    : waffle >= 1.0
                    ? 'bg-gradient-to-r from-blue-500 to-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${wafflePct}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-zinc-400">
            Evaluates corporate filler, vague generalities, and evasive corporate speech.
          </p>
        </div>

        {/* 2. Circularity Probability (Noul primitive) */}
        <div className="bg-[#1e142c] p-4 rounded-xl border border-[#332249] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <Repeat className="w-3.5 h-3.5 text-[#e551ba]" />
              Circularity (Noul)
            </span>
            <span className="font-mono font-bold text-white">{circularPct}%</span>
          </div>

          <div className="my-3">
            <div className="w-full bg-[#120c1a] h-3 rounded-full overflow-hidden p-0.5 border border-[#2b1c3e]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  circularProb >= 0.70
                    ? 'bg-gradient-to-r from-red-500 to-rose-600'
                    : circularProb >= 0.40
                    ? 'bg-gradient-to-r from-indigo-500 to-pink-500'
                    : 'bg-zinc-600'
                }`}
                style={{ width: `${circularPct}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-zinc-400">
            Probability speakers are repeating previous arguments without resolving differences.
          </p>
        </div>

        {/* 3. Decision Readiness (Score primitive) */}
        <div className="bg-[#1e142c] p-4 rounded-xl border border-[#332249] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Decision Readiness
            </span>
            <span className="font-mono text-zinc-300">{readiness.toFixed(1)} / 2.0</span>
          </div>

          <div className="my-3">
            <div className="w-full bg-[#120c1a] h-3 rounded-full overflow-hidden p-0.5 border border-[#2b1c3e]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${readinessPct}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-zinc-400">
            0 = Brainstorming, 1 = Trade-off debate, 2 = Ready for definitive call.
          </p>
        </div>

      </div>

      {/* Identified Buzzword Cloud */}
      {buzzwords.length > 0 && (
        <div className="pt-2 border-t border-[#261937] flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-400 font-medium">Bikeshedding Keywords Detected:</span>
          {buzzwords.map((word, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-xs font-mono font-semibold bg-red-500/15 text-red-300 border border-red-500/30 rounded-md animate-pulse"
            >
              "{word}"
            </span>
          ))}
        </div>
      )}

    </div>
  );
}
