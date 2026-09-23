import React from 'react';
import { Award, AlertTriangle, ShieldCheck, Flame, Zap, ArrowRight, BookOpen, CheckCircle2, XCircle } from 'lucide-react';

export default function SpeakerMeritRadar({ metrics, onSelectWinningProposal }) {
  const speakers = metrics?.speakers_analysis || [];
  const groundTruth = metrics?.ground_truth_verdict;
  const realityGap = groundTruth?.reality_gap_detected;

  return (
    <div className="bg-[#171021] border border-[#2d203a] rounded-2xl p-5 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e551ba]">Jev Idea Merit</span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30 rounded">
              Empirical vs Waffle
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-0.5">Speaker Credibility & Idea Quality</h2>
        </div>
        <div className="text-xs text-zinc-400 font-mono">
          Context Cross-Examined
        </div>
      </div>

      {/* Reality Gap Warning Banner: When room is consensus-stalling against facts */}
      {realityGap && groundTruth && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-500/40 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                  Reality Gap Detected: Room Drifting From Truth
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Sub-optimal Consensus
                </span>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed">
                {groundTruth.reality_gap_alert || "The discussion is drifting toward delay or compromises contradicted by uploaded context data."}
              </p>
            </div>
          </div>

          {/* Context Evidence Citations */}
          {groundTruth.evidence_citations && groundTruth.evidence_citations.length > 0 && (
            <div className="pt-2 border-t border-amber-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Verified Facts In Context Documents:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {groundTruth.evidence_citations.slice(0, 4).map((cite, i) => (
                  <div key={i} className="text-[11px] font-mono text-zinc-300 bg-[#120b1c] px-2.5 py-1.5 rounded border border-[#2e1d44] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="truncate">{cite}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enforce Right Call Button */}
          {onSelectWinningProposal && groundTruth.recommended_proposal_id && (
            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-zinc-400">
                Empirical Right Decision: <b className="text-emerald-300 font-semibold">{groundTruth.recommended_proposal_title}</b>
              </div>
              <button
                onClick={() => onSelectWinningProposal(groundTruth.recommended_proposal_id)}
                className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg transition-colors shadow-md"
              >
                <span>Enforce Right Decision</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Speaker Cards List */}
      {speakers.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-[#2f2042] rounded-xl">
          <p className="text-xs text-zinc-400">
            Step through speech turns or speak into the mic to decipher who in the room has data-backed ideas vs who is waffling.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {speakers.map((spk, idx) => {
            const isHighSignal = spk.is_champion;
            const isStaller = spk.is_staller;
            const substancePct = Math.round(spk.substance_score * 100);
            const wafflePct = Math.round(spk.waffle_score * 100);

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all ${
                  isHighSignal
                    ? 'bg-[#181d28]/70 border-emerald-500/40 shadow-sm'
                    : isStaller
                    ? 'bg-[#25131e]/70 border-rose-500/40 shadow-sm'
                    : 'bg-[#1a1226] border-[#2e203f]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{spk.name}</span>
                      
                      {/* Merit Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                          isHighSignal
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isStaller
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-zinc-700/30 text-zinc-300 border border-zinc-600/40'
                        }`}
                      >
                        {isHighSignal ? <Award className="w-3 h-3" /> : isStaller ? <Flame className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                        {spk.merit_tag}
                      </span>

                      <span className="text-[10px] text-zinc-400 font-mono">
                        {spk.turns_count} {spk.turns_count === 1 ? 'turn' : 'turns'}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {spk.idea_assessment}
                    </p>
                  </div>

                  {/* Signal vs Waffle Ratios */}
                  <div className="text-right shrink-0 space-y-1">
                    <div className="text-xs font-mono font-bold">
                      <span className="text-emerald-400">{substancePct}% Signal</span>
                      <span className="text-zinc-500 mx-1">/</span>
                      <span className="text-rose-400">{wafflePct}% Waffle</span>
                    </div>

                    {/* Mini Substance Bar */}
                    <div className="w-28 bg-[#100a18] h-1.5 rounded-full overflow-hidden flex border border-[#2b1b3e] ml-auto">
                      <div
                        style={{ width: `${substancePct}%` }}
                        className="h-full bg-emerald-400"
                        title={`Signal: ${substancePct}%`}
                      />
                      <div
                        style={{ width: `${wafflePct}%` }}
                        className="h-full bg-rose-500"
                        title={`Waffle: ${wafflePct}%`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
