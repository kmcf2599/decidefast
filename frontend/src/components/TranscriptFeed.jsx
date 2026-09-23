import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, MessageSquare, User, Volume2, Sparkles } from 'lucide-react';

const SPEAKER_COLORS = [
  'from-pink-500 to-rose-500',
  'from-purple-500 to-indigo-500',
  'from-blue-500 to-cyan-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500'
];

export default function TranscriptFeed({
  transcript,
  onAddTurn,
  isListening,
  onToggleMic,
  hasSpeechSupport
}) {
  const [speaker, setSpeaker] = useState('Kyle (Meeting Chair)');
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTurn(speaker, text);
      setText('');
    }
  };

  return (
    <div className="bg-[#171021] border border-[#2d203a] rounded-2xl p-5 shadow-xl flex flex-col h-[580px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#281b37]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#e551ba]" />
          <h2 className="text-base font-bold text-white">Live Meeting Transcript Stream</h2>
          <span className="text-xs text-zinc-400 font-mono">({transcript.length} turns)</span>
        </div>

        {/* Microphone Toggle */}
        <div className="flex items-center gap-2">
          {hasSpeechSupport && (
            <button
              onClick={onToggleMic}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                  : 'bg-[#251736] hover:bg-[#34214c] text-zinc-300 border border-[#3c2755]'
              }`}
            >
              {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              {isListening ? 'Listening (Speak)...' : 'Microphone'}
            </button>
          )}
        </div>
      </div>

      {/* Transcript Log */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2">
        {transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <Volume2 className="w-8 h-8 mb-2 opacity-50 text-[#e551ba]" />
            <p className="text-sm font-medium">Meeting transcript is currently empty.</p>
            <p className="text-xs mt-1 text-zinc-600">
              Click <span className="text-[#f48fd9] font-semibold">"Step"</span> above or speak into your microphone to start Jev's real-time evaluation.
            </p>
          </div>
        ) : (
          transcript.map((turn, i) => {
            const colorClass = SPEAKER_COLORS[i % SPEAKER_COLORS.length];
            const initials = turn.speaker
              .split(' ')
              .map((w) => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div key={i} className="flex items-start gap-3 group animate-fadeIn">
                <div
                  className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${colorClass} flex items-center justify-center text-[10px] font-bold text-white shadow shrink-0 mt-0.5`}
                >
                  {initials}
                </div>

                <div className="bg-[#1e132c] group-hover:bg-[#251737] p-3 rounded-2xl rounded-tl-sm border border-[#2f1f45] transition-colors flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-zinc-200">{turn.speaker}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Turn #{i + 1}</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{turn.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Turn Form */}
      <form onSubmit={handleSubmit} className="pt-3 border-t border-[#281b37] flex gap-2">
        <input
          type="text"
          value={speaker}
          onChange={(e) => setSpeaker(e.target.value)}
          placeholder="Speaker Name"
          className="w-36 bg-[#211631] text-xs text-zinc-200 border border-[#38264f] rounded-xl px-3 py-2 focus:outline-none focus:border-[#e551ba]"
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste what was just said..."
          className="flex-1 bg-[#211631] text-xs text-zinc-200 border border-[#38264f] rounded-xl px-3 py-2 focus:outline-none focus:border-[#e551ba]"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-3 py-2 bg-gradient-to-r from-[#e551ba] to-[#9b3bff] disabled:opacity-40 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1 shadow"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
}
