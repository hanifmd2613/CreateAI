'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Creator, UserAccount, ChatMessage } from '../types';
import { 
  X, 
  Send, 
  Sparkles, 
  CheckCheck, 
  Clock, 
  Smile, 
  Paperclip, 
  MessageSquare, 
  IndianRupee, 
  ShieldCheck, 
  User, 
  ArrowRight,
  Circle
} from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCreator: Creator | null;
  creators: Creator[];
  currentUser: UserAccount | null;
  onOpenBriefBuilderWithCreator?: (creator: Creator) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  targetCreator,
  creators,
  currentUser,
  onOpenBriefBuilderWithCreator,
}) => {
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>(
    targetCreator ? targetCreator.id : creators[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [isCreatorTyping, setIsCreatorTyping] = useState(false);
  
  // Thread store by creatorId
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update selected creator when targetCreator prop changes
  useEffect(() => {
    if (targetCreator) {
      setSelectedCreatorId(targetCreator.id);
    }
  }, [targetCreator]);

  // Active selected creator object
  const activeCreator = creators.find(c => c.id === selectedCreatorId) || creators[0] || targetCreator;

  // Initialize greeting messages for creators
  useEffect(() => {
    if (!activeCreator) return;

    setConversations((prev) => {
      if (prev[activeCreator.id] && prev[activeCreator.id].length > 0) {
        return prev;
      }

      const initialGreeting: ChatMessage = {
        id: `msg-init-${activeCreator.id}`,
        senderId: activeCreator.id,
        senderName: activeCreator.name,
        senderRole: 'creator',
        text: `Hello! I'm ${activeCreator.name}, specialized in ${activeCreator.specialization}. My production pipeline utilizes ${activeCreator.tools.join(', ')}. How can I assist with your campaign today?`,
        timestamp: 'Just now',
        isCreatorReply: true,
      };

      return {
        ...prev,
        [activeCreator.id]: [initialGreeting],
      };
    });
  }, [activeCreator?.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, isCreatorTyping, selectedCreatorId]);

  if (!isOpen || !activeCreator) return null;

  const currentMessages = conversations[activeCreator.id] || [];

  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      senderId: currentUser?.id || 'client-user',
      senderName: currentUser?.name || 'Client',
      senderRole: 'brand',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) => ({
      ...prev,
      [activeCreator.id]: [...(prev[activeCreator.id] || []), userMessage],
    }));

    setInputText('');
    setIsCreatorTyping(true);

    // Simulate smart Creator / Employee response
    setTimeout(() => {
      let replyText = `Thanks for reaching out! I can deliver high-resolution assets within my typical turnaround (${activeCreator.avgTurnaround}). Let's lock the concept and style reference seeds!`;

      const lower = textToSend.toLowerCase();
      if (lower.includes('rate') || lower.includes('budget') || lower.includes('cost') || lower.includes('price')) {
        replyText = `My typical commercial project rate is around ₹${activeCreator.hourlyRate.toLocaleString('en-IN')}/hr or packaged on milestone deliverables. All payments are secured via GenCraft Indian Rupee escrow with full commercial buyout guarantee!`;
      } else if (lower.includes('turnaround') || lower.includes('time') || lower.includes('deadline') || lower.includes('rush')) {
        replyText = `I can deliver the initial motion passes in ${activeCreator.avgTurnaround}. For urgent brand requirements, we can expedite through our priority neural rendering pipeline.`;
      } else if (lower.includes('veo') || lower.includes('kling') || lower.includes('sora') || lower.includes('flux')) {
        replyText = `Yes! I work extensively with ${activeCreator.tools.join(', ')}. I calibrate seed consistency across character keyframes and camera motion so your brand visual identity remains razor-sharp.`;
      } else if (lower.includes('brief') || lower.includes('campaign') || lower.includes('project')) {
        replyText = `Feel free to send over the structured brief directly through the GenCraft Brief Builder! Once received, I'll review the keyframe requirements and issue an instant production quote.`;
      }

      const creatorReply: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        senderId: activeCreator.id,
        senderName: activeCreator.name,
        senderRole: 'creator',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCreatorReply: true,
      };

      setConversations((prev) => ({
        ...prev,
        [activeCreator.id]: [...(prev[activeCreator.id] || []), creatorReply],
      }));
      setIsCreatorTyping(false);
    }, 1400);
  };

  const QUICK_PROMPTS = [
    `Are you available for a 48-hour commercial campaign?`,
    `What are your delivery formats for ${activeCreator.tools[0] || 'Veo'}?`,
    `Can we discuss commercial buyout under GenCraft escrow?`,
    `Could you review our campaign reference images?`
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div 
        className="w-full max-w-4xl h-[85vh] max-h-[700px] rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Left Sidebar: Creator Conversations List */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-850 bg-zinc-900/60 flex flex-col shrink-0">
          <div className="p-4 border-b border-zinc-850 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-zinc-300" />
              <h2 className="text-sm font-semibold text-white">Direct Messaging</h2>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
              Client ⇄ Creator
            </span>
          </div>

          {/* Creators List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {creators.map((c) => {
              const isSelected = c.id === selectedCreatorId;
              const hasMessages = conversations[c.id]?.length || 0;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCreatorId(c.id)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-zinc-800 text-white border border-zinc-700/80 shadow-sm'
                      : 'hover:bg-zinc-850/60 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700 bg-zinc-900"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate">
                        {c.name}
                      </span>
                      {hasMessages > 1 && (
                        <span className="text-[10px] text-zinc-500">Active</span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {c.specialization}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-zinc-500">
                      <span>₹{c.hourlyRate.toLocaleString('en-IN')}/hr</span>
                      <span>•</span>
                      <span>{c.tools.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 border-t border-zinc-850 text-[11px] text-zinc-500 flex items-center justify-between bg-zinc-950/40 font-mono">
            <span>Secure Indian Rupee Escrow</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Right Main Chat Thread Area */}
        <div className="flex-1 flex flex-col bg-zinc-950 min-w-0">
          
          {/* Active Creator Header */}
          <div className="p-4 border-b border-zinc-850 flex items-center justify-between bg-zinc-900/40">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={activeCreator.avatar}
                  alt={activeCreator.name}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-700 bg-zinc-900"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {activeCreator.name}
                  </h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Employee / Creator
                  </span>
                </div>
                <div className="text-xs text-zinc-400 flex items-center gap-2 truncate">
                  <span>{activeCreator.specialization}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-mono text-[11px]">Online Now</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenBriefBuilderWithCreator && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenBriefBuilderWithCreator(activeCreator);
                    onClose();
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-xs font-medium text-zinc-200 border border-zinc-700 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Send Campaign Brief</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Thread Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {currentMessages.map((msg) => {
              const isMe = !msg.isCreatorReply;
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <img
                      src={activeCreator.avatar}
                      alt={activeCreator.name}
                      className="w-7 h-7 rounded-full object-cover border border-zinc-700 shrink-0 mt-0.5"
                    />
                  )}

                  <div
                    className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'bg-white text-zinc-950 font-normal shadow-sm rounded-tr-xs'
                        : 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tl-xs'
                    }`}
                  >
                    {!isMe && (
                      <div className="text-[11px] font-semibold text-zinc-400 mb-1 flex items-center justify-between gap-3">
                        <span>{activeCreator.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{msg.timestamp}</span>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {isMe && (
                      <div className="text-[10px] text-zinc-500 flex items-center justify-end gap-1 mt-1 font-mono">
                        <span>{msg.timestamp}</span>
                        <CheckCheck className="w-3 h-3 text-zinc-600" />
                      </div>
                    )}
                  </div>

                  {isMe && (
                    <img
                      src={currentUser?.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=ClientUser'}
                      alt="You"
                      className="w-7 h-7 rounded-full object-cover border border-zinc-700 shrink-0 mt-0.5"
                    />
                  )}
                </div>
              );
            })}

            {/* Creator Typing Indicator */}
            {isCreatorTyping && (
              <div className="flex items-center gap-2.5 text-xs text-zinc-400 animate-pulse">
                <img
                  src={activeCreator.avatar}
                  alt={activeCreator.name}
                  className="w-7 h-7 rounded-full object-cover border border-zinc-700"
                />
                <div className="px-3.5 py-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] ml-1">{activeCreator.name} is typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Inquiry Chips */}
          <div className="px-4 py-2 border-t border-zinc-850/80 bg-zinc-950/60 overflow-x-auto flex items-center gap-2 no-scrollbar">
            <span className="text-[10px] uppercase font-mono text-zinc-500 shrink-0">
              Quick Inquiries:
            </span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-[11px] shrink-0 transition-colors whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3.5 sm:p-4 border-t border-zinc-850 bg-zinc-900/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${activeCreator.name} about project scope, budget (₹), or models...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isCreatorTyping}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-zinc-950" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
