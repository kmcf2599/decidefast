import React, { useState } from 'react';
import { X, Upload, FileText, Trash2, Plus, BookOpen, Check, File } from 'lucide-react';

export default function ContextDocsDrawer({
  isOpen,
  onClose,
  documents,
  onUploadFile,
  onAddTextDoc,
  onDeleteDoc
}) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'paste'
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUploadFile(file);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handlePasteSubmit = async (e) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      await onAddTextDoc(title, content);
      setTitle('');
      setContent('');
      setActiveTab('list');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#171021] border border-[#37244f] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2b1b3f]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#e551ba]/20 text-[#f48fd9]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Meeting Context & Knowledge Base</h2>
              <p className="text-xs text-zinc-400">
                Decks, past meeting minutes, OKRs, and constraints evaluated in Jev's State
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 p-1 bg-[#20152f] rounded-xl border border-[#33214b]">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'list'
                ? 'bg-[#e551ba] text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Active Documents ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'paste'
                ? 'bg-[#e551ba] text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            + Paste Minutes / Notes
          </button>
        </div>

        {/* Tab 1: Documents List & File Upload */}
        {activeTab === 'list' ? (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            
            {/* Upload Box */}
            <label className="border-2 border-dashed border-[#3c2858] hover:border-[#e551ba]/60 rounded-2xl p-4 text-center cursor-pointer transition-colors block bg-[#1d132b]/50">
              <Upload className="w-6 h-6 mx-auto mb-1.5 text-[#e551ba]" />
              <span className="text-xs font-semibold text-zinc-200 block">
                {uploading ? 'Processing & Extracting...' : 'Upload Deck, Minutes, or Policy (PDF, TXT, MD, CSV)'}
              </span>
              <span className="text-[11px] text-zinc-500 mt-0.5 block">
                Click to browse files from your computer
              </span>
              <input
                type="file"
                accept=".pdf,.txt,.md,.markdown,.csv,.json"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {/* Document Cards */}
            <div className="space-y-2.5">
              {documents.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  No context documents added yet. Upload a pitch deck or past minutes so Jev can detect when people are debating already-answered questions!
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl bg-[#20152f] border border-[#33224b] hover:border-[#422c5e] transition-colors flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#f48fd9] shrink-0" />
                        <h4 className="text-xs font-bold text-white">{doc.title}</h4>
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-3 font-mono bg-black/20 p-2 rounded-lg">
                        {doc.content}
                      </p>
                    </div>

                    <button
                      onClick={() => onDeleteDoc(doc.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                      title="Remove document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        ) : (
          /* Tab 2: Manual Text / Minutes Paste */
          <form onSubmit={handlePasteSubmit} className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Previous Meeting Minutes (Sept 15) or Q3 Board Deck"
                className="w-full bg-[#20152f] text-xs text-zinc-200 border border-[#38264f] rounded-xl px-3 py-2 focus:outline-none focus:border-[#e551ba]"
                required
              />
            </div>

            <div className="space-y-1 flex-1 flex flex-col">
              <label className="text-xs font-semibold text-zinc-300">Document Content / Notes</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste key takeaways, unit economics, approved budgets, or slide summaries..."
                rows={8}
                className="w-full bg-[#20152f] text-xs text-zinc-200 border border-[#38264f] rounded-xl p-3 focus:outline-none focus:border-[#e551ba] font-mono leading-relaxed"
                required
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-[#e551ba] to-[#9b3bff] text-white rounded-xl hover:opacity-90 shadow"
              >
                Save Document
              </button>
            </div>
          </form>
        )}

        {/* Footer info */}
        <div className="pt-3 border-t border-[#2b1b3f] flex items-center justify-between text-[11px] text-zinc-400">
          <span>Documents fed directly into Jev's parallel evaluation state</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
