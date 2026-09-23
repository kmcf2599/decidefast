import React from 'react';
import { X, BookOpen, Mic, Zap, CheckCircle2, ShieldAlert, FileText, ArrowRight } from 'lucide-react';

export default function HowToUseModal({ isOpen, onClose, onOpenContext }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#171021] border border-[#e551ba]/40 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[88vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2d1e40]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#e551ba] to-[#9b3bff] flex items-center justify-center text-white shadow">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">How to Use DecideFast in Meetings</h2>
              <p className="text-xs text-zinc-400">Step-by-step workflow for the meeting chair & participants</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Grid */}
        <div className="space-y-4 text-xs">

          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-[#1e132c] border border-[#33224b] space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <span className="w-6 h-6 rounded-full bg-[#e551ba]/20 text-[#f48fd9] flex items-center justify-center text-xs border border-[#e551ba]/40">
                1
              </span>
              <span>Upload Decks, Minutes & OKRs (Context Grounding)</span>
            </div>
            <p className="text-zinc-300 leading-relaxed pl-8">
              Click the <b className="text-white">"Context (Decks & Minutes)"</b> button in the top bar. Upload your meeting slides (PDF), previous meeting minutes, or target OKRs. Jev injects this directly into the evaluation <b>State</b>.
            </p>
            <div className="pl-8 pt-1">
              <button
                onClick={() => { onClose(); onOpenContext(); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2f1b47] hover:bg-[#3d245c] text-[#f48fd9] border border-[#e551ba]/40 font-semibold"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Open Context Drawer Now →
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-[#1e132c] border border-[#33224b] space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <span className="w-6 h-6 rounded-full bg-[#e551ba]/20 text-[#f48fd9] flex items-center justify-center text-xs border border-[#e551ba]/40">
                2
              </span>
              <span>Listen in Real Time (Mic or Simulation)</span>
            </div>
            <p className="text-zinc-300 leading-relaxed pl-8">
              In your live meeting, click <b className="text-white">"Microphone"</b> to let your browser listen as people speak. Or, test immediately by selecting a pre-loaded corporate scenario (*The Enterprise Pricing Deadlock*) and clicking <b className="text-white">"Auto-Run"</b> or <b className="text-white">"Step"</b>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-[#1e132c] border border-[#33224b] space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <span className="w-6 h-6 rounded-full bg-[#e551ba]/20 text-[#f48fd9] flex items-center justify-center text-xs border border-[#e551ba]/40">
                3
              </span>
              <span>Watch Jev's Parallel Sub-Second Primitives</span>
            </div>
            <p className="text-zinc-300 leading-relaxed pl-8">
              In parallel, Jev evaluates the transcript against your uploaded context:
            </p>
            <ul className="list-disc list-inside pl-8 space-y-1 text-zinc-400">
              <li><b className="text-zinc-200">Waffle Score (Score)</b>: Catches buzzwords like <i>"synergy"</i> and <i>"boil the ocean"</i>.</li>
              <li><b className="text-zinc-200">Circularity (Noul)</b>: Detects when the group is repeating points without new data.</li>
              <li><b className="text-zinc-200">Already Answered Check</b>: Flags when a speaker is stalling over numbers already on Slide 4 of your deck!</li>
            </ul>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-[#1e132c] border border-[#33224b] space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <span className="w-6 h-6 rounded-full bg-[#e551ba]/20 text-[#f48fd9] flex items-center justify-center text-xs border border-[#e551ba]/40">
                4
              </span>
              <span>Follow the Executive Nudges</span>
            </div>
            <p className="text-zinc-300 leading-relaxed pl-8">
              When Jev spots a stall, Gemini 3.8 Flash generates an <b>Executive Nudge</b> banner. The chair can read the suggested script out loud to cut the waffle, cite the deck, and redirect the room.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-2xl bg-[#1e132c] border border-[#33224b] space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <span className="w-6 h-6 rounded-full bg-[#e551ba]/20 text-[#f48fd9] flex items-center justify-center text-xs border border-[#e551ba]/40">
                5
              </span>
              <span>Force Decision & Adjourn 15 Mins Early 🎉</span>
            </div>
            <p className="text-zinc-300 leading-relaxed pl-8">
              Click <b className="text-white">"Force Decision"</b> at any time. DecideFast selects the highest-scoring proposal, assigns single-threaded owners with 48-hour deadlines, produces risk guardrails, and lets you copy the complete Action Memo to Slack or Jira!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#2d1e40] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#e551ba] to-[#9b3bff] text-white hover:opacity-90 shadow"
          >
            Got it, Let's Decide!
          </button>
        </div>

      </div>
    </div>
  );
}
