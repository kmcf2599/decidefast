import React from 'react';
import { Target, Compass, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function DecisionRadar({ metrics }) {
  const bottleneck = metrics?.primary_bottleneck?.choice || "clear_to_proceed";
  const bConf = Math.round((metrics?.primary_bottleneck?.confidence || 0.7) * 100);

  const action = metrics?.best_chair_action?.choice || "let_discussion_flow";
  const aConf = Math.round((metrics?.best_chair_action?.confidence || 0.7) * 100);

  const BOTTLENECK_INFO = {
    risk_aversion: {
      title: "Risk Aversion",
      desc: "Speakers fear taking accountability or making a wrong call. Need reassurance or low-risk pilot.",
      badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/30"
    },
    lack_of_data: {
      title: "Legitimate Missing Data",
      desc: "Specific numbers, metrics, or feedback are absent. Needs an assigned owner rather than continued guessing.",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30"
    },
    scope_creep: {
      title: "Scope Creep",
      desc: "Discussion expanding into tangential architectures or future edge cases.",
      badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30"
    },
    bikeshedding: {
      title: "Bikeshedding",
      desc: "Over-analyzing trivial details or phrasing instead of key business drivers.",
      badgeColor: "text-red-400 bg-red-500/15 border-red-500/40"
    },
    clear_to_proceed: {
      title: "Clear to Decide",
      desc: "No substantial blockage detected. Ready to commit.",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
    }
  };

  const ACTION_INFO = {
    call_the_vote: {
      title: "Call the Vote Immediately",
      desc: "Positions are known. Ask for unanimous assent or majority vote now.",
      style: "text-emerald-400"
    },
    assign_data_owner: {
      title: "Assign Data Owner & Adjourn",
      desc: "Name one single owner to retrieve the missing metric by a strict 24h deadline.",
      style: "text-amber-400"
    },
    cut_the_waffle: {
      title: "Interrupt & Demand Concrete Ask",
      desc: "Stop vague corporate statements and ask: 'What exact change are you proposing?'",
      style: "text-red-400"
    },
    timebox_and_park: {
      title: "Timebox 3 Mins & Table",
      desc: "Set a 3-minute hard timer; if not resolved, archive for offline follow-up.",
      style: "text-blue-400"
    },
    let_discussion_flow: {
      title: "Facilitate Productive Exchange",
      desc: "Conversation is healthy and making forward progress.",
      style: "text-zinc-300"
    }
  };

  const bData = BOTTLENECK_INFO[bottleneck] || BOTTLENECK_INFO.clear_to_proceed;
  const aData = ACTION_INFO[action] || ACTION_INFO.let_discussion_flow;

  return (
    <div className="bg-[#171021] border border-[#2d203a] rounded-2xl p-5 shadow-xl space-y-4">
      
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#e551ba]">Choice Primitives</span>
          <h2 className="text-lg font-bold text-white mt-0.5">Decision Radar & Tactical Action</h2>
        </div>
        <div className="text-xs text-zinc-400 font-mono">
          Jev Choice Primitives
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Bottleneck Card */}
        <div className="bg-[#1e132c] p-4 rounded-xl border border-[#32204a] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              Primary Stalling Factor
            </span>
            <span className="text-[11px] font-mono text-zinc-400">{bConf}% conf</span>
          </div>

          <div className="pt-1">
            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${bData.badgeColor}`}>
              {bData.title}
            </span>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              {bData.desc}
            </p>
          </div>
        </div>

        {/* Recommended Action Card */}
        <div className="bg-[#1e132c] p-4 rounded-xl border border-[#32204a] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#e551ba]" />
              Recommended Facilitator Move
            </span>
            <span className="text-[11px] font-mono text-zinc-400">{aConf}% conf</span>
          </div>

          <div className="pt-1">
            <h4 className={`text-sm font-bold ${aData.style} flex items-center gap-1`}>
              <ArrowUpRight className="w-4 h-4" />
              {aData.title}
            </h4>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              {aData.desc}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
