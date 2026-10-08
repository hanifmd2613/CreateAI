'use client';

import React, { useState } from 'react';
import { Creator, PortfolioItem } from '../types';
import { 
  ShieldCheck, 
  Star, 
  Bookmark, 
  ArrowRight, 
  Clock, 
  Play,
  MessageSquare
} from 'lucide-react';

interface CreatorCardProps {
  creator: Creator;
  onSelectCreator: (creator: Creator) => void;
  onSelectPortfolioItem: (creator: Creator, item: PortfolioItem) => void;
  isSaved: boolean;
  onToggleSave: (creatorId: string) => void;
  onHireDirect: (creator: Creator) => void;
  onOpenChat?: (creator: Creator) => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  onSelectCreator,
  onSelectPortfolioItem,
  isSaved,
  onToggleSave,
  onHireDirect,
  onOpenChat,
}) => {
  const [showVerifiedTooltip, setShowVerifiedTooltip] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="bg-[#121215] rounded-xl border border-zinc-800 section-glow transition-all flex flex-col overflow-hidden"
    >
      
      {/* Top Header Section */}
      <div className="p-5 pb-3.5">
        <div className="flex items-start justify-between gap-3">
          
          {/* Avatar & Main Identity */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => onSelectCreator(creator)}
              className="relative cursor-pointer shrink-0"
            >
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-12 h-12 rounded-lg object-cover bg-zinc-900 border border-zinc-700"
              />
              {creator.availableNow && (
                <span 
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-zinc-950" 
                  title="Available for projects"
                />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 
                  onClick={() => onSelectCreator(creator)}
                  className="font-bold text-white text-base hover:text-zinc-300 transition-colors cursor-pointer tracking-tight"
                >
                  {creator.name}
                </h3>

                {/* Verified AI Workflow Badge with Tooltip */}
                {creator.isVerified && (
                  <div className="relative inline-block">
                    <span
                      onMouseEnter={() => setShowVerifiedTooltip(true)}
                      onMouseLeave={() => setShowVerifiedTooltip(false)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowVerifiedTooltip(!showVerifiedTooltip);
                      }}
                      className="cursor-pointer inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-emerald-400 border border-zinc-700"
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Verified</span>
                    </span>

                    {/* Tooltip explaining verified pipeline */}
                    {showVerifiedTooltip && (
                      <div className="absolute left-0 bottom-full mb-2 w-64 bg-zinc-900 text-white text-xs rounded-lg p-3 shadow-xl border border-zinc-700 z-50 pointer-events-none">
                        <div className="flex items-center gap-1 font-semibold text-emerald-400 mb-1 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified AI Pipeline</span>
                        </div>
                        <p className="text-zinc-300 text-[11px] leading-relaxed">
                          Audited seeds, clean checkpoints, and guaranteed commercial buyout safety.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-zinc-400 font-medium mt-0.5">
                {creator.specialization}
              </p>
              
              <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1">
                <span className="flex items-center gap-0.5 font-medium text-zinc-300">
                  <Star className="w-3 h-3 fill-zinc-300 text-zinc-300" />
                  {creator.rating}
                </span>
                <span>•</span>
                <span>{creator.completedProjects} campaigns</span>
                <span>•</span>
                <span>{creator.location}</span>
              </div>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(creator.id);
            }}
            className={`p-1.5 rounded-lg transition-colors border ${
              isSaved 
                ? 'text-white bg-zinc-800 border-zinc-700' 
                : 'text-zinc-500 hover:text-white hover:bg-zinc-800/60 border-transparent'
            }`}
            title={isSaved ? 'Remove from shortlist' : 'Save to shortlist'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Short Bio */}
        <p className="text-xs text-zinc-300 mt-3 line-clamp-2 leading-relaxed font-normal">
          {creator.bio}
        </p>

        {/* Model Tools Badges (Clean, neutral, mature) */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          {creator.tools.slice(0, 4).map((tool) => (
            <span
              key={tool}
              className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/60"
            >
              {tool}
            </span>
          ))}
          {creator.tools.length > 4 && (
            <span className="text-[10px] text-zinc-500 font-medium">
              +{creator.tools.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Portfolio Thumbnails Preview Strip */}
      <div className="px-5 pb-3.5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center justify-between">
          <span>Recent Work</span>
          <button 
            className="hover:text-zinc-300 cursor-pointer lowercase" 
            onClick={() => onSelectCreator(creator)}
          >
            view all ({creator.portfolio.length})
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {creator.portfolio.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPortfolioItem(creator, item);
              }}
              className="relative aspect-square rounded-md overflow-hidden cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-zinc-700 group/thumb"
              title={`${item.title} (${item.specificModel})`}
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
              />
              
              <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider bg-black/80 text-zinc-300 border border-zinc-800">
                {item.type === 'video' && <Play className="w-1.5 h-1.5 fill-white inline mr-0.5" />}
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Pricing & Action Buttons */}
      <div className="mt-auto px-5 py-3 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center justify-between gap-3">
        <div>
          <span className="text-sm font-bold text-white">
            ₹{creator.hourlyRate.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-zinc-500 font-normal"> / hr</span>
          <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-0.5">
            <Clock className="w-2.5 h-2.5 text-zinc-500" />
            <span>Avg {creator.avgTurnaround}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenChat && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenChat(creator);
              }}
              className="p-1.5 px-2.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors flex items-center gap-1"
              title={`Direct message ${creator.name}`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
              <span>Chat</span>
            </button>
          )}

          <button
            onClick={() => onHireDirect(creator)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            Hire
          </button>
          
          <button
            onClick={() => onSelectCreator(creator)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 transition-colors"
          >
            <span>Profile</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>
  );
};
