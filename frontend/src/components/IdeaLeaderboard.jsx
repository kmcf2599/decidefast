import React, { useState, useEffect, useRef } from 'react';
import { Award, CheckCircle, BarChart2, ShieldCheck, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function IdeaLeaderboard({ proposals, groundTruth, onSelectProposal }) {
  const prevScoresRef = useRef({});
  const [scoreDeltas, setScoreDeltas] = useState({});

  useEffect(() => {
    if (!proposals) return;
    const newDeltas = {};
    proposals.forEach((p) => {
      const prev = prevScoresRef.current[p.id];
      const curr = p.viability_score ?? 1.0;
      if (prev !== undefined && prev !== curr) {
        newDeltas[p.id] = Math.round((curr - prev) * 100) / 100;
      }
      prevScoresRef.current[p.id] = curr;
    });

    if (Object.keys(newDeltas).length > 0) {
      setScoreDeltas(newDeltas);
      const timer = setTimeout(() => {
        setScoreDeltas({});
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [proposals]);

  if (!proposals || proposals.length === 0) {
    return (
      <div className="bg-[#171021] border border-[#2d203a] rounded-2xl p-5 shadow-xl text-center py-8">
        <p className="text-sm text-zinc-400">No proposals on the table yet. Speak or step through the scenario to formulate ideas.</p>
      </div>
    );
  }

  // Sort proposals by viability score descending
  const sorted = [...proposals].sort((a, b) => (b.viability_score ?? 0) - (a.viability_score ?? 0));

  return (
    <div className="bg-[#171021] border border-[#2d203a] rounded-2xl p-5 shadow-xl space-y-4">
      
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e551ba]">Jev Primitives Ranking</span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded">
              Live Real-Time Shift
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-0.5">Idea Viability Leaderboard</h2>
        </div>
        <div className="text-xs text-zinc-400 font-mono">
          Parallel Evaluation
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((prop, index) => {
          const isObjectiveBest = prop.is_objective_best || prop.id === groundTruth?.recommended_proposal_id;
          const isWinner = index === 0 && (prop.viability_score ?? 0) >= 1.3;
          const viability = prop.viability_score ?? 1.0;
          const viabilityPct = Math.min(100, Math.round((viability / 2.0) * 100));
          const confidence = prop.confidence ?? 0.8;
          const confPct = Math.round(confidence * 100);
          const delta = scoreDeltas[prop.id];
          const isStallingTrap = prop.text.toLowerCase().includes("committee") || prop.text.toLowerCase().includes("offline") || prop.text.toLowerCase().includes("delay");

          // Probabilities breakdown across levels: 0 (rejected), 1 (debated), 2 (supported)
          const p0 = Math.round((prop.probabilities?.[0] ?? prop.probabilities?.['0'] ?? 0.1) * 100);
          const p1 = Math.round((prop.probabilities?.[1] ?? prop.probabilities?.['1'] ?? 0.2) * 100);
          const p2 = Math.round((prop.probabilities?.[2] ?? prop.probabilities?.['2'] ?? 0.7) * 100);

          return (
            <div
              key={prop.id}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                isObjectiveBest
                  ? 'bg-gradient-to-r from-[#172322] to-[#1c1228] border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                  : isWinner
                  ? 'bg-gradient-to-r from-[#241334] to-[#1c1228] border-[#e551ba]/60 shadow-lg shadow-[#e551ba]/10'
                  : 'bg-[#1b1227] border-[#2e203f] hover:border-[#422c5c]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-5 h-5 rounded-full bg-[#2a1a3e] text-zinc-300 font-mono text-[11px] font-bold flex items-center justify-center border border-[#3e2759]">
                      #{index + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white">{prop.title}</h3>
                    
                    {/* Objective Right Decision Badge */}
                    {isObjectiveBest && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle className="w-3 h-3" /> ★ Objective Right Call
                      </span>
                    )}

                    {isWinner && !isObjectiveBest && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <Award className="w-3 h-3" /> Consensus Leader
                      </span>
                    )}

                    {isStallingTrap && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        Stalling Trap
                      </span>
                    )}

                    {/* Real-time score delta badge */}
                    {delta !== undefined && (
                      <span
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded animate-bounce ${
                          delta > 0
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : delta < 0
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-zinc-500/20 text-zinc-300'
                        }`}
                      >
                        {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">{prop.text}</p>
                </div>

                {/* Viability Score & Confidence */}
                <div className="text-right shrink-0 space-y-1">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs text-zinc-400 font-medium">Viability:</span>
                    <span className="text-base font-mono font-extrabold text-[#f48fd9]">
                      {viability.toFixed(2)} <span className="text-xs font-normal text-zinc-500">/ 2.0</span>
                    </span>
                  </div>
                  {prop.objective_truth_score && (
                    <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-end gap-1">
                      <span>Truth: <b>{prop.objective_truth_score.toFixed(2)}</b></span>
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-1 text-[11px] text-zinc-400 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{confPct}% conf</span>
                  </div>
                </div>
              </div>

              {/* Progress & Probabilities Distribution Bar */}
              <div className="mt-3 pt-3 border-t border-[#2a1b3c] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Practical Feasibility: <b className="text-zinc-200">{viabilityPct}%</b></span>
                  <span className="text-[10px] text-zinc-500">
                    P(L0: {p0}% | L1: {p1}% | L2: {p2}%)
                  </span>
                </div>

                {/* Tri-color Jev probability distribution bar */}
                <div className="w-full bg-[#100b18] h-2.5 rounded-full overflow-hidden flex border border-[#2d1c42]">
                  <div
                    style={{ width: `${p0}%` }}
                    className="h-full bg-rose-500/60 transition-all duration-500"
                    title={`Contested / Objected: ${p0}%`}
                  />
                  <div
                    style={{ width: `${p1}%` }}
                    className="h-full bg-amber-500/60 transition-all duration-500"
                    title={`Debated Trade-offs: ${p1}%`}
                  />
                  <div
                    style={{ width: `${p2}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-[#e551ba] transition-all duration-500"
                    title={`Supported / High Leverage: ${p2}%`}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Rejected
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Debated
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Consensus
                    </span>
                  </div>

                  {onSelectProposal && (
                    <button
                      onClick={() => onSelectProposal(prop)}
                      className={`px-3.5 py-1 text-xs font-semibold rounded-lg transition-colors shrink-0 shadow-sm ${
                        isObjectiveBest
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400 font-bold'
                          : 'bg-[#2e1f42] hover:bg-[#e551ba] text-zinc-200 hover:text-white border border-[#3e2b58] hover:border-[#e551ba]'
                      }`}
                    >
                      {isObjectiveBest ? "Select (Right Call)" : "Select"}
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
