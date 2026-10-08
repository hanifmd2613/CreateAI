'use client';

import React, { useState } from 'react';
import { Creator, PortfolioItem } from '../types';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Eye,
  Heart,
  Copy
} from 'lucide-react';

interface PortfolioModalProps {
  creator: Creator;
  item: PortfolioItem;
  onClose: () => void;
  onRequestSimilar: (item: PortfolioItem, creator: Creator) => void;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  creator,
  item,
  onClose,
  onRequestSimilar,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likes || 420);
  const [hasLiked, setHasLiked] = useState(false);

  const handleCopyPrompt = () => {
    if (item.promptSnippet) {
      navigator.clipboard.writeText(item.promptSnippet);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const handleToggleLike = () => {
    if (!hasLiked) {
      setLikesCount(prev => prev + 1);
      setHasLiked(true);
    } else {
      setLikesCount(prev => prev - 1);
      setHasLiked(false);
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        onMouseMove={handleModalMouseMove}
        className="relative w-full max-w-5xl bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] section-glow"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-9 h-9 rounded-lg object-cover border border-zinc-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm sm:text-base">{item.title}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium uppercase tracking-wider border border-zinc-700">
                  {item.type}
                </span>
                {item.aspectRatio && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 font-mono border border-zinc-850">
                    {item.aspectRatio}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Created by <strong className="text-zinc-200">{creator.name}</strong> • {item.client || 'Featured Showcase'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLike}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                hasLiked
                  ? 'border-zinc-700 bg-zinc-800 text-rose-400'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two Column Layout */}
        <div className="overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
          
          {/* Media Column (Left - 7 cols) */}
          <div className="lg:col-span-7 bg-zinc-950 flex flex-col items-center justify-center p-6 relative group select-none">
            
            <div className="relative w-full max-h-[460px] flex items-center justify-center rounded-xl overflow-hidden bg-zinc-950 border border-zinc-850">
              <img
                src={item.mediaUrl}
                alt={item.title}
                className="max-h-[460px] w-auto max-w-full object-contain"
              />

              {/* Video Playback Simulator Overlay */}
              {item.type === 'video' && (
                <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between text-white text-xs">
                    <span className="bg-zinc-900/90 border border-zinc-750 px-2 py-0.5 rounded font-mono text-[10px] text-zinc-300">
                      4K UHD • 60 FPS
                    </span>
                    <span className="bg-zinc-800 px-2 py-0.5 rounded text-[10px] text-zinc-200 border border-zinc-750 flex items-center gap-1">
                      <span>Neural Motion</span>
                    </span>
                  </div>

                  {/* Play / Pause Button in Center */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-14 h-14 rounded-full bg-white/90 hover:bg-white text-zinc-950 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5 fill-zinc-950" />}
                    </button>
                  </div>

                  {/* Video Control Bar */}
                  <div className="pointer-events-auto space-y-1.5">
                    <div className="w-full bg-zinc-700/60 h-1 rounded-full overflow-hidden cursor-pointer">
                      <div className={`h-full bg-white rounded-full transition-all duration-300 ${isPlaying ? 'w-2/3' : 'w-1/4'}`} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-300">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white">
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <span>{isPlaying ? '0:18' : '0:00'} / {item.duration || '0:30'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setIsMuted(!isMuted)} className="hover:text-white">
                          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                        <span className="font-mono text-[10px] text-zinc-400">Master Pass</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Visualizer Simulator */}
              {item.type === 'audio' && (
                <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-8 text-white space-y-4">
                  <div className="flex items-center gap-1.5 h-16">
                    {[40, 65, 30, 85, 95, 45, 70, 80, 50, 90, 60, 75, 40, 85, 90, 35, 60, 80].map((h, idx) => (
                      <div 
                        key={idx} 
                        className={`w-1.5 bg-zinc-400 rounded-full transition-all ${isPlaying ? 'animate-pulse' : ''}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-5 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs flex items-center gap-2 transition-colors hover:bg-zinc-200"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-zinc-950" />}
                    <span>{isPlaying ? 'Pause Audio' : 'Play Spatial Audio'}</span>
                  </button>
                  <p className="text-xs text-zinc-500 font-mono">Synthesized with ElevenLabs & Stable Audio</p>
                </div>
              )}

            </div>

            {/* Quick stats under media */}
            <div className="mt-3.5 flex items-center gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {item.views || '45K'} views
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" /> {likesCount} saves
              </span>
              <span>•</span>
              <span className="font-mono">{item.aspectRatio} Aspect Ratio</span>
            </div>

          </div>

          {/* Details & Verified Workflow Column (Right - 5 cols) */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-zinc-900 space-y-5">
            
            <div className="space-y-4">
              
              {/* Specific Models & Tools Stack */}
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 block mb-1.5">
                  Production Models & Pipeline
                </span>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <p className="text-xs font-semibold text-white">{item.specificModel}</p>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    {item.workflowDescription}
                  </p>
                </div>
              </div>

              {/* Step-by-Step Verified AI Pipeline */}
              {item.steps && item.steps.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Verified AI Pipeline Nodes
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3 h-3" /> Audited
                    </span>
                  </div>

                  <div className="space-y-2.5 border-l border-zinc-800 pl-3 ml-1.5">
                    {item.steps.map((st) => (
                      <div key={st.step} className="relative">
                        <span className="absolute -left-[17px] top-1.5 w-1.5 h-1.5 rounded-full bg-zinc-400 ring-2 ring-zinc-900" />
                        <div className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{st.phase}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 font-mono text-zinc-300 border border-zinc-700">
                              {st.tool}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{st.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompt & Seed Details */}
              {item.promptSnippet && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Master Prompt Parameters
                    </span>
                    <button
                      onClick={handleCopyPrompt}
                      className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {copiedPrompt ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 font-mono text-[11px] text-zinc-300 leading-relaxed select-all">
                    {item.promptSnippet}
                  </div>
                </div>
              )}

              {/* Enterprise Safety Seal */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Commercial Rights Audited</h4>
                  <p className="text-[11px] text-zinc-400">
                    Eligible for full commercial buyout and broadcast clearance.
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  onRequestSimilar(item, creator);
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
                <span>Request Similar Asset from {creator.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              
              <p className="text-center text-[10px] text-zinc-500 font-mono">
                Populates AI Brief Builder with this pipeline
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
