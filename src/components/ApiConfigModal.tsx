'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle2, ShieldCheck, Zap, ExternalLink, Lock, AlertCircle } from 'lucide-react';
import { UserAccount } from '../types';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserAccount | null;
  groqKey: string;
  geminiKey: string;
  onSaveKeys: (groqKey: string, geminiKey: string) => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  groqKey,
  geminiKey,
  onSaveKeys,
}) => {
  const [currentGroqKey, setCurrentGroqKey] = useState(groqKey);
  const [currentGeminiKey, setCurrentGeminiKey] = useState(geminiKey);
  const [groqMasked, setGroqMasked] = useState<string | undefined>();
  const [geminiMasked, setGeminiMasked] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // STRICT ROLE RESTRICTION: Never render for creator accounts
  if (!isOpen || currentUser?.role !== 'brand') {
    return null;
  }

  // Fetch current server-side configuration status
  useEffect(() => {
    if (!isOpen || currentUser?.role !== 'brand') return;

    const fetchConfig = async () => {
      try {
        const res = await fetch(`/api/ai/config?brandId=${encodeURIComponent(currentUser.id)}&role=brand`, {
          headers: { 'x-user-role': 'brand' }
        });
        const data = await res.json();
        if (data.success) {
          if (data.groqMasked) setGroqMasked(data.groqMasked);
          if (data.geminiMasked) setGeminiMasked(data.geminiMasked);
        }
      } catch (e) {
        // Fallback
      }
    };

    fetchConfig();
  }, [isOpen, currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // 1. Format validation
      if (currentGroqKey.trim() && !currentGroqKey.trim().startsWith('gsk_')) {
        setErrorMsg('Invalid Groq API Key format. Valid keys begin with "gsk_".');
        setIsLoading(false);
        return;
      }
      if (currentGeminiKey.trim() && !currentGeminiKey.trim().startsWith('AIzaSy')) {
        setErrorMsg('Invalid Google Gemini API Key format. Valid keys begin with "AIzaSy".');
        setIsLoading(false);
        return;
      }

      // 2. Persist to authoritative server-side API with role check
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'brand',
        },
        body: JSON.stringify({
          brandId: currentUser.id,
          role: currentUser.role,
          groqKey: currentGroqKey,
          geminiKey: currentGeminiKey,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Failed to securely save AI configuration.');
        setIsLoading(false);
        return;
      }

      if (data.groqMasked) setGroqMasked(data.groqMasked);
      if (data.geminiMasked) setGeminiMasked(data.geminiMasked);

      // 3. Clear sensitive plaintext from component state
      onSaveKeys(currentGroqKey, currentGeminiKey);
      setCurrentGroqKey('');
      setCurrentGeminiKey('');
      setSavedSuccess(true);

      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1400);

    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with AI configuration service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
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
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm">
                  AI Inference Configuration
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Brand Studio
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Configure Groq Cloud or Google Gemini for live LLM campaign generation
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
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

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

            {groqMasked && !currentGroqKey && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950 border border-emerald-500/30 text-[11px] text-emerald-400 font-mono">
                <Lock className="w-3 h-3" />
                <span>Active: {groqMasked}</span>
              </div>
            )}

            <input
              type="password"
              value={currentGroqKey}
              onChange={(e) => setCurrentGroqKey(e.target.value)}
              placeholder={groqMasked ? 'Enter new key to update...' : 'gsk_...'}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-zinc-600"
            />
            <p className="text-[11px] text-zinc-400">
              Sub-second latency token streaming for instant creative brief compilation.
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

            {geminiMasked && !currentGeminiKey && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950 border border-emerald-500/30 text-[11px] text-emerald-400 font-mono">
                <Lock className="w-3 h-3" />
                <span>Active: {geminiMasked}</span>
              </div>
            )}

            <input
              type="password"
              value={currentGeminiKey}
              onChange={(e) => setCurrentGeminiKey(e.target.value)}
              placeholder={geminiMasked ? 'Enter new key to update...' : 'AIzaSy...'}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-zinc-600"
            />
          </div>

          {/* Fallback note */}
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Credentials are encrypted and isolated to your brand organization. If left unconfigured, GenCraft utilizes its deterministic neural engine.
            </span>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Keys validated & securely configured on brand server.</span>
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
              disabled={isLoading || (!currentGroqKey && !currentGeminiKey && !groqMasked && !geminiMasked)}
              className="px-4 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
