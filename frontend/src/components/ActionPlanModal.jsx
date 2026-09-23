import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, X, Download, Copy, Calendar, UserCheck, ShieldAlert, Archive, Sparkles } from 'lucide-react';

export default function ActionPlanModal({ memo, onClose }) {
  useEffect(() => {
    if (memo) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [memo]);

  if (!memo) return null;

  const decision = memo.winning_decision || {};
  const actions = memo.action_items || [];
  const risks = memo.risks_and_mitigations || [];
  const parked = memo.parked_ideas_memo || "";

  const handleCopyMarkdown = () => {
    const md = `
# 🏁 Formal Decision Record & Implementation Plan
**Topic**: ${decision.title || "Meeting Decision"}
**System Two Model**: Gemini 3.8 Flash (Backed by TypeSafe Jev Calibrated Primitives)

## Winning Decision
${decision.summary || ""}

### Rationale
${decision.rationale || ""}

## Action Items & Ownership
${actions.map((a) => `- [ ] **${a.task}** | Owner: ${a.owner} | Deadline: ${a.deadline}`).join('\n')}

## Risks & Mitigations
${risks.map((r) => `- **Risk**: ${r.risk}\n  - *Mitigation*: ${r.mitigation}`).join('\n')}

## Parked Alternatives
${parked}
`.trim();

    navigator.clipboard.writeText(md);
    alert("Decision Memo copied to clipboard as Markdown!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#181123] border border-[#e551ba]/50 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl shadow-[#e551ba]/20 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Executive Consensus Reached
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/5 text-zinc-400 border border-white/10">
                {memo.source || 'gemini'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {decision.title || "Winning Decision Plan"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Winning Decision Summary Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#29173b] to-[#1c1128] border border-[#e551ba]/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#f48fd9]">
              Objective Truth & Strategic Execution
            </span>
            {decision.champion && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Champion: {decision.champion}
              </span>
            )}
          </div>

          <p className="text-sm font-semibold text-white leading-relaxed">
            {decision.summary}
          </p>

          {decision.rationale && (
            <p className="text-xs text-zinc-300 pt-2 border-t border-[#3d2458] leading-relaxed">
              <span className="text-zinc-400 font-semibold">Analytical Rationale:</span> {decision.rationale}
            </p>
          )}

          {decision.overruled_objection && (
            <p className="text-xs text-rose-300 pt-1.5 border-t border-[#3d2458] leading-relaxed flex items-center gap-1.5">
              <span className="text-rose-400 font-semibold">Overruled:</span> {decision.overruled_objection}
            </p>
          )}

          {decision.evidence_citations && decision.evidence_citations.length > 0 && (
            <div className="pt-2 border-t border-[#3d2458] space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Context Document Citations:</span>
              <ul className="text-[11px] font-mono text-zinc-300 space-y-0.5 list-disc list-inside">
                {decision.evidence_citations.slice(0, 3).map((cite, i) => (
                  <li key={i}>{cite}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Items */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#e551ba]" />
            Immediate Execution Tasks (Single-Threaded Owners)
          </h3>
          <div className="space-y-2">
            {actions.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#211631] border border-[#372450] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="font-medium text-zinc-200">
                  <span className="font-bold text-[#f48fd9] mr-2">#{idx + 1}</span>
                  {item.task}
                </div>
                <div className="flex items-center gap-3 shrink-0 text-zinc-400 font-mono">
                  <span className="text-emerald-300 font-semibold">{item.owner}</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-amber-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.deadline}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risks & Mitigations */}
        {risks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Pre-Mortem Risk Guardrails
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {risks.map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#211631] border border-[#372450] text-xs space-y-1">
                  <div className="font-semibold text-rose-300">⚠️ {r.risk}</div>
                  <div className="text-zinc-300">🛡️ {r.mitigation}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parked Ideas Memo */}
        {parked && (
          <div className="p-4 rounded-xl bg-[#1d142b] border border-[#34224b] text-xs space-y-1">
            <div className="font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5 text-zinc-400" />
              Parked Tangents Memo (Bikeshedding Freeze)
            </div>
            <p className="text-zinc-300 leading-relaxed italic">{parked}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2d1e40]">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#291b3b] hover:bg-[#382650] text-zinc-200 border border-[#402a5c] transition-all"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy as Markdown
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#e551ba] to-[#9b3bff] text-white hover:opacity-90 transition-opacity shadow-lg"
          >
            Adjourn Meeting Early 🎉
          </button>
        </div>

      </div>
    </div>
  );
}
