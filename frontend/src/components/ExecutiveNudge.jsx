import React, { useState } from 'react';
import { Megaphone, Copy, Check, Sparkles, Flame, ArrowRight } from 'lucide-react';

export default function ExecutiveNudge({ nudge, personality }) {
  const [copied, setCopied] = useState(false);

  if (!nudge) return null;

  const handleCopy = () => {
    if (nudge.recommended_script) {
      navigator.clipboard.writeText(nudge.recommended_script.replace(/^"|"$/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isRuthless = personality === 'ruthless';

  return (
    <div className={`rounded-2xl p-5 border shadow-2xl transition-all animate-fadeIn ${
      isRuthless
        ? 'bg-gradient-to-br from-[#240e1e] via-[#1c0d1c] to-[#140816] border-red-500/40 shadow-red-950/40'
        : 'bg-gradient-to-br from-[#12162a] via-[#101323] to-[#0c0d18] border-indigo-500/40 shadow-indigo-950/40'
    }`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

        {/* Nudge Content */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${isRuthless ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
              {isRuthless ? <Flame className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              System Two Executive Intervention
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/5 border border-white/10 text-zinc-300">
              {nudge.source || 'gemini'}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">
            {nudge.headline}
          </h3>

          {/* Recommended Chair Script */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 relative group">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Chair: Say this out loud to break the stall
            </div>
            <p className="text-sm font-medium text-amber-100 italic leading-relaxed">
              {nudge.recommended_script}
            </p>
          </div>

          {/* Actionable recommendation */}
          {nudge.suggested_action && (
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 pt-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5" /> Next Move:
              </span>
              <span>{nudge.suggested_action}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex md:flex-col items-center gap-2 self-start">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all shadow"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Script'}
          </button>
        </div>

      </div>
    </div>
  );
}
