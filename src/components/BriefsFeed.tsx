'use client';

import React, { useState } from 'react';
import { Brief } from '../types';
import { 
  Briefcase, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Filter
} from 'lucide-react';

interface BriefsFeedProps {
  briefs: Brief[];
  onNavigateToBuilder: () => void;
  onExploreMatchingCreators: (tools: string[]) => void;
}

export const BriefsFeed: React.FC<BriefsFeedProps> = ({
  briefs,
  onNavigateToBuilder,
  onExploreMatchingCreators,
}) => {
  const [filterType, setFilterType] = useState('all');
  const [filterRights, setFilterRights] = useState('all');

  const filteredBriefs = briefs.filter((b) => {
    if (filterType !== 'all' && !b.contentType.toLowerCase().includes(filterType.toLowerCase())) {
      return false;
    }
    if (filterRights !== 'all' && b.commercialUse !== filterRights) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium mb-2">
            <Briefcase className="w-3.5 h-3.5 text-zinc-300" />
            <span>Open Brand Campaigns</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight">
            Marketplace Production Briefs
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse active commercial briefs seeking audited Generative AI pipelines and directors.
          </p>
        </div>

        <button
          onClick={onNavigateToBuilder}
          className="px-5 py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-2 transition-colors shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
          <span>Post a Campaign Brief</span>
        </button>
      </div>

      {/* Filter Chips Bar */}
      <div 
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }}
        className="bg-zinc-900/60 rounded-2xl border border-zinc-800 section-glow p-4 mb-6 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="font-medium text-zinc-500 uppercase tracking-wider text-[11px] mr-1">
            Format:
          </span>
          {['all', 'Video', 'Imagery', 'Motion', 'Animation'].map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterType === ft
                  ? 'bg-white text-zinc-950 font-semibold'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-850 hover:bg-zinc-900'
              }`}
            >
              {ft === 'all' ? 'All Formats' : ft}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-zinc-500 uppercase tracking-wider text-[11px]">
            Rights:
          </span>
          <select
            value={filterRights}
            onChange={(e) => setFilterRights(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-medium text-zinc-200 bg-zinc-950 focus:outline-none focus:border-zinc-600"
          >
            <option value="all">All Rights</option>
            <option value="Full Buyout">Full Buyout (Perpetual)</option>
            <option value="Licensed">Licensed (1-Year)</option>
          </select>
        </div>
      </div>

      {/* Briefs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredBriefs.map((brief) => (
          <div
            key={brief.id}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            }}
            className="bg-zinc-900/60 rounded-2xl border border-zinc-800 section-glow p-6 shadow-sm transition-colors flex flex-col justify-between"
          >
            <div>
              {/* Header Info */}
              <div className="flex items-start justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center font-bold text-xs">
                    {brief.brandName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">{brief.brandName}</h3>
                    <p className="text-[11px] text-zinc-400 font-mono">{brief.createdAt || 'Active'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-zinc-800 text-zinc-200 border border-zinc-700">
                    {brief.budget}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-950 text-zinc-400 border border-zinc-800">
                    {brief.commercialUse}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h4 className="text-base font-semibold text-white leading-snug">
                {brief.title}
              </h4>
              
              <div className="flex items-center gap-1.5 my-2.5 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-750">
                  {brief.contentType}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-950 text-zinc-400 border border-zinc-800">
                  {brief.style}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 bg-zinc-950 border border-zinc-800">
                  {brief.aspectRatio}
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                {brief.description}
              </p>

              {/* Required Tools */}
              <div className="mt-3.5 pt-3.5 border-t border-zinc-800 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mr-1">
                  Stack:
                </span>
                {brief.requiredTools.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 bg-zinc-950 border border-zinc-800"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-5 pt-3.5 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Turnaround: <strong className="text-zinc-200">{brief.deadline}</strong></span>
              </div>

              <button
                onClick={() => onExploreMatchingCreators(brief.requiredTools)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-medium text-xs border border-zinc-700 transition-colors"
              >
                <span>Matching Talent</span>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
