import React, { useState } from 'react';
import { X, Key, Shield, Save, Check, ExternalLink, Sparkles } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onSaveConfig }) {
  const [typesafeKey, setTypesafeKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveConfig({
      typesafe_api_key: typesafeKey.trim() || undefined,
      gemini_api_key: geminiKey.trim() || undefined,
      openai_api_key: openaiKey.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#181123] border border-[#38264f] rounded-3xl max-w-lg w-full p-6 md:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#e551ba]" />
            <h2 className="text-base font-bold text-white">LLM & API Configuration</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-[#221532] border border-[#3d2459] text-xs text-zinc-300 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Zero Surprise Charges:</span> Google Cloud Vertex AI billing has been disabled by default. If you use Google AI Studio's key, it operates on the <b>100% Free Tier</b> with hard usage limits (15 RPM / 1,500 requests/day).
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* 1. TypeSafe Jev API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>TypeSafe API Key (Jev System One)</span>
              <a
                href="https://console.typesafe.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-[#e551ba] hover:underline flex items-center gap-0.5"
              >
                Dashboard <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </label>
            <input
              type="password"
              value={typesafeKey}
              onChange={(e) => setTypesafeKey(e.target.value)}
              placeholder="apikey_..."
              className="w-full bg-[#20152f] text-xs text-zinc-200 border border-[#38264f] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e551ba]"
            />
            <p className="text-[11px] text-zinc-500">
              Evaluates state in parallel at $0.042/Mtok (output tokens free).
            </p>
          </div>

          {/* 2. Google AI Studio Free Tier Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Google Gemini API Key (100% Free Tier)</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                Get Free Key (0$) <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#20152f] text-xs text-zinc-200 border border-[#38264f] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e551ba]"
            />
            <p className="text-[11px] text-zinc-500">
              Google AI Studio gives 15 requests/min and 1,500 requests/day for <b>$0.00 with hard caps</b> (never bills your card).
            </p>
          </div>

          {/* 3. OpenAI API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>OpenAI API Key (Optional)</span>
              <span className="text-[10px] text-zinc-400">GPT-4o-mini</span>
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full bg-[#20152f] text-xs text-zinc-200 border border-[#38264f] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e551ba]"
            />
            <p className="text-[11px] text-zinc-500">
              Uses OpenAI Developer Platform API key.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#e551ba] to-[#9b3bff] text-white hover:opacity-90 transition-all shadow"
            >
              {saved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
