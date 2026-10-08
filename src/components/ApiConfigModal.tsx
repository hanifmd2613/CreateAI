'use client';

import React, { useState } from 'react';
import { X, Key, CheckCircle2, ShieldCheck, Zap, ExternalLink } from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  groqKey: string;
  geminiKey: string;
  onSaveKeys: (groqKey: string, geminiKey: string) => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  groqKey,
  geminiKey,
  onSaveKeys,
}) => {
  const [currentGroqKey, setCurrentGroqKey] = useState(groqKey);
  const [currentGeminiKey, setCurrentGeminiKey] = useState(geminiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKeys(currentGroqKey, currentGeminiKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleModalMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div 
        onMouseMove={handleModalMouseMove}
        className="bg-zinc-900 rounded-2xl max-w-lg w-full border border-zinc-800 shadow-2xl overflow-hidden section-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">
                AI Inference Configuration
              </h3>
              <p className="text-xs text-zinc-400">
                Configure Groq Cloud or Google Gemini for live LLM brief generation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          
          {/* Groq Cloud Option */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-zinc-400" />
                <span>Groq Cloud API Key (Llama 3.3 70B)</span>
              </label>
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-zinc-400 hover:text-white underline flex items-center gap-0.5"
              >
                <span>Console</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="password"
              value={currentGroqKey}
              onChange={(e) => setCurrentGroqKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-zinc-600"
            />
            <p className="text-[11px] text-zinc-400">
              Ultra-fast real-time inference (no credit card required).
            </p>
          </div>

          {/* Google AI Studio Option */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                <span>Google AI Studio API Key (Gemini 1.5 Flash)</span>
              </label>
              <a
                href="https://aistudio.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-zinc-400 hover:text-white underline flex items-center gap-0.5"
              >
                <span>AI Studio</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="password"
              value={currentGeminiKey}
              onChange={(e) => setCurrentGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-zinc-600"
            />
          </div>

          {/* Fallback note */}
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              If no API key is specified, CreateAI utilizes its built-in engine with structured enterprise output.
            </span>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Keys saved successfully.</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors"
            >
              Save Configuration
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
