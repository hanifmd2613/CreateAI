'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  X, 
  Send, 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  RefreshCw, 
  ExternalLink, 
  Bot, 
  BookOpen, 
  ShieldCheck, 
  Zap,
  MessageSquare
} from 'lucide-react';

interface SystemAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  geminiKey?: string;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

const STARTER_QUESTIONS = [
  'How do I use this website?',
  'How does the AI Brief Builder work?',
  'What models are supported (Veo, Kling, Sora, Flux)?',
  'How does Indian Rupee (₹) escrow work?',
  'How do I hire or chat with a creator?'
];

export const SystemAssistantModal: React.FC<SystemAssistantModalProps> = ({
  isOpen,
  onClose,
  onOpen,
  geminiKey = '',
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'bot-welcome',
      sender: 'bot',
      text: `**Hello! I am your CreateAI System Assistant powered by Google Gemini.**\n\nI can answer questions on how to use CreateAI, commission creators, build automated briefs, understand our Indian Rupee (₹) escrow, or compare Gen-AI models (*Veo, Kling, Sora, Flux.1, ElevenLabs, Pika*).\n\nHow can I help you today?`,
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleAskQuestion = async (queryText?: string) => {
    const question = queryText || inputText;
    if (!question.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          geminiApiKey: geminiKey,
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          const botMsg: Message = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, botMsg]);
          return;
        }
      }

      // Fallback response if offline
      setTimeout(() => {
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `**CreateAI Guidance:**\n\nTo discover specialized creators, use the top search bar to filter by field or tools (Veo, Kling, Sora, Flux.1, ElevenLabs, Pika). You can directly chat with creator employees using the **Chat** button, or head to **Post a Brief** and use the **AI Assist** button to auto-structure your campaign brief with milestone escrow in Indian Rupees (₹).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      }, 500);

    } catch (err) {
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `**CreateAI System Helper:**\n\nYou can explore vetted Gen-AI creators on the Discover page, post a campaign in the Brief Builder with one-click AI generation, and chat directly with creators. All payments are secured in Indian Rupees (₹) with commercial buyout rights.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Camera Button (Fixed at Bottom-Right) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          aria-label="Open AI System Assistant (Powered by Gemini)"
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 p-3 sm:px-4 sm:py-3 rounded-full bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-700/80 shadow-2xl hover:shadow-white/10 transition-all hover:scale-105 active:scale-95"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute -inset-1 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-zinc-100">
              <Camera className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white">AI Assistant</span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                Gemini
              </span>
            </div>
            <span className="text-[10px] text-zinc-400">Click to learn how to use CreateAI</span>
          </div>
        </button>
      )}

      {/* Slide-out / Modal System Assistant Drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-end sm:justify-end p-0 sm:p-6 animate-fade-in"
          onClick={onClose}
        >
          <div 
            className="w-full sm:w-[480px] h-[90vh] sm:h-[680px] rounded-t-3xl sm:rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-zinc-100"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="p-4 border-b border-zinc-850 bg-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-white">CreateAI System Assistant</h2>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Gemini
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Live Website Navigation & Workflow Guide</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zinc-950/80">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-zinc-850 border border-zinc-700 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                        <Camera className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-white text-zinc-950 font-normal rounded-tr-xs shadow-sm'
                          : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      <div className={`text-[10px] font-mono mt-1 ${isUser ? 'text-zinc-500 text-right' : 'text-zinc-500'}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2.5 text-xs text-zinc-400 animate-pulse">
                  <div className="w-7 h-7 rounded-lg bg-zinc-850 border border-zinc-700 flex items-center justify-center shrink-0 text-emerald-400">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 animate-spin text-zinc-400" />
                    <span>Gemini is generating guidance...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starter Suggestions */}
            <div className="px-3.5 py-2 border-t border-zinc-850 bg-zinc-950/90 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
              <span className="text-[10px] uppercase font-mono text-zinc-500 shrink-0">
                FAQ:
              </span>
              {STARTER_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAskQuestion(q)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-[11px] shrink-0 transition-colors whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3.5 border-t border-zinc-850 bg-zinc-900/60">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskQuestion();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask Gemini anything about using CreateAI..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0"
                >
                  <Send className="w-3.5 h-3.5 text-zinc-950" />
                  <span className="hidden sm:inline">Ask</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
