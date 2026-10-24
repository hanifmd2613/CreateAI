'use client';

import React, { useState } from 'react';
import { Brief, Creator, MatchResult } from '../types';
import { rankCreatorsForCampaign } from '../utils/matchingEngine';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle2, 
  Plus, 
  Check, 
  Layers, 
  ArrowRight,
  Filter,
  DollarSign,
  Clock,
  ExternalLink,
  MessageSquare,
  Scale
} from 'lucide-react';

interface MatchingResultsViewProps {
  brief: Brief;
  creators: Creator[];
  shortlistedCreatorIds: string[];
  onToggleShortlist: (creatorId: string) => void;
  onOpenAutoShortlistModal: () => void;
  onOpenComparisonModal: (selectedIds: string[]) => void;
  onSelectCreatorProfile: (creator: Creator) => void;
  onOpenChat: (creator: Creator) => void;
}

export const MatchingResultsView: React.FC<MatchingResultsViewProps> = ({
  brief,
  creators,
  shortlistedCreatorIds,
  onToggleShortlist,
  onOpenAutoShortlistModal,
  onOpenComparisonModal,
  onSelectCreatorProfile,
  onOpenChat
}) => {
  const [filterRights, setFilterRights] = useState<'all' | 'compatible' | 'conflicts'>('all');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'rate-low' | 'rating'>('score');

  // Compute matching results dynamically from engine
  const allResults = rankCreatorsForCampaign(brief, creators);

  const filteredResults = allResults
    .filter(res => {
      if (filterRights === 'compatible') return res.rightsCompatibility === 'compatible';
      if (filterRights === 'conflicts') return res.rightsCompatibility === 'conflict';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.matchScore - a.matchScore;
      if (sortBy === 'rate-low') return a.creator.hourlyRate - b.creator.hourlyRate;
      if (sortBy === 'rating') return b.creator.rating - a.creator.rating;
      return 0;
    });

  const toggleCompare = (creatorId: string) => {
    if (selectedForCompare.includes(creatorId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== creatorId));
    } else {
      if (selectedForCompare.length >= 4) {
        alert('You can compare up to 4 creators side-by-side.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, creatorId]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Agent Action Bar */}
      <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-800 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Matching Engine Active</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-300 font-mono text-[11px]">Hard-Constraint Verification Enforced</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Ranked Creator Matches for &ldquo;{brief.title}&rdquo;
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Hybrid evaluation across Creative Fit (30%), Portfolio Evidence (25%), Pipeline Tools (20%), Budget (15%), & Trust Verification (10%).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {selectedForCompare.length >= 2 && (
            <button
              onClick={() => onOpenComparisonModal(selectedForCompare)}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700 transition-all flex items-center gap-2 shadow-md animate-pulse"
            >
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <span>Compare Selected ({selectedForCompare.length})</span>
            </button>
          )}

          <button
            onClick={onOpenAutoShortlistModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-zinc-950" />
            <span>Run Auto-Shortlist Agent ({brief.requiredCreatorsCount} Creators)</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-medium">Filter Rights:</span>
          <div className="flex p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setFilterRights('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterRights === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Matches ({allResults.length})
            </button>
            <button
              onClick={() => setFilterRights('compatible')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                filterRights === 'compatible' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400 hover:text-emerald-400'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Compatible Only</span>
            </button>
            <button
              onClick={() => setFilterRights('conflicts')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                filterRights === 'conflicts' ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30' : 'text-zinc-400 hover:text-rose-400'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>With Flagged Conflicts</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-medium">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-600"
          >
            <option value="score">Match Score (High to Low)</option>
            <option value="rate-low">Price: Low to High</option>
            <option value="rating">Top Rated (Stars)</option>
          </select>
        </div>
      </div>

      {/* MATCHED CREATORS CARDS LIST */}
      <div className="grid grid-cols-1 gap-5">
        {filteredResults.map((result, idx) => {
          const creator = result.creator;
          const isShortlisted = shortlistedCreatorIds.includes(creator.id);
          const isComparing = selectedForCompare.includes(creator.id);

          return (
            <div
              key={creator.id}
              className={`rounded-2xl border transition-all p-5 sm:p-6 shadow-xl ${
                !result.isEligible
                  ? 'bg-rose-950/10 border-rose-900/40 opacity-90'
                  : result.matchScore >= 90
                  ? 'bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-emerald-950/20 border-emerald-500/40 shadow-emerald-950/10'
                  : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                
                {/* Creator Header & Avatar */}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-16 h-16 rounded-2xl object-cover bg-zinc-950 border border-zinc-700 ring-2 ring-white/10"
                    />
                    <span className="absolute -top-1.5 -left-1.5 px-2 py-0.5 rounded-md bg-zinc-950 text-white font-mono font-bold text-[10px] border border-zinc-700">
                      #{idx + 1}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 
                        onClick={() => onSelectCreatorProfile(creator)}
                        className="text-lg font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer"
                      >
                        {creator.name}
                      </h3>

                      {creator.isVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Audited Pipeline</span>
                        </span>
                      )}

                      {/* Rights Compatibility Pill */}
                      {result.rightsCompatibility === 'compatible' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Rights: Compatible</span>
                        </span>
                      )}

                      {result.rightsCompatibility === 'conflict' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>Rights Conflict</span>
                        </span>
                      )}

                      {result.rightsCompatibility === 'unknown' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          <HelpCircle className="w-3 h-3 text-amber-400" />
                          <span>Rights: Unconfirmed</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 font-medium mt-0.5">
                      {creator.specialization} • {creator.location}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-zinc-300 mt-2">
                      <span className="font-bold text-white">₹{creator.hourlyRate.toLocaleString('en-IN')}/hr</span>
                      <span className="text-zinc-600">•</span>
                      <span>Avg {creator.avgTurnaround}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-emerald-400 font-medium">★ {creator.rating} ({creator.completedProjects} campaigns)</span>
                    </div>
                  </div>
                </div>

                {/* Match Score & Action Buttons */}
                <div className="flex items-center gap-4 self-end lg:self-center shrink-0">
                  
                  {/* Score Dial */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center min-w-[85px]">
                    <div className="text-2xl font-black text-white tracking-tight flex items-baseline justify-center">
                      <span className={result.matchScore >= 90 ? 'text-emerald-400' : result.matchScore >= 75 ? 'text-zinc-100' : 'text-amber-400'}>
                        {result.matchScore}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-normal">/100</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">Match Score</span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onToggleShortlist(creator.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        isShortlisted
                          ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/40'
                          : 'bg-white hover:bg-zinc-200 text-zinc-950'
                      }`}
                    >
                      {isShortlisted ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{isShortlisted ? 'Shortlisted' : 'Add Shortlist'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleCompare(creator.id)}
                        className={`p-1.5 px-2.5 rounded-lg text-[11px] font-medium border transition-colors ${
                          isComparing
                            ? 'bg-blue-950 text-blue-300 border-blue-600'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                        title="Compare side-by-side with other creators"
                      >
                        {isComparing ? 'Comparing' : 'Compare'}
                      </button>

                      <button
                        onClick={() => onOpenChat(creator)}
                        className="p-1.5 px-2 rounded-lg bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                        title="Direct message creator"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* Hard Constraint Conflict Banner (if any) */}
              {!result.isEligible && (
                <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-2.5 text-xs text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Hard Constraint Warning:</span> {result.hardConstraintViolations.join(' ')}
                    <span className="block text-rose-400/80 text-[11px] mt-0.5">
                      Excluded from automated shortlist unless mandatory conditions are explicitly relaxed.
                    </span>
                  </div>
                </div>
              )}

              {/* Detailed Reasoning Breakdown Grid */}
              <div className="mt-4 pt-4 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* 1. Why this ranks high */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    ✨ Why this creator ranks high:
                  </span>
                  <ul className="space-y-1 text-zinc-300">
                    {result.reasonsForRank.map((reason, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Potential Concerns & Rights Diagnostics */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    ⚠️ Potential Concerns & Rights Fit:
                  </span>
                  {result.potentialConcerns.length > 0 ? (
                    <ul className="space-y-1 text-amber-300/90">
                      {result.potentialConcerns.map((concern, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-emerald-400/90 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Zero rights or budget conflicts detected.</span>
                    </p>
                  )}
                </div>

                {/* 3. Suggested Questions for Creator */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    💬 Suggested Questions for Creator:
                  </span>
                  <ul className="space-y-1 text-zinc-400">
                    {result.suggestedQuestions.map((q, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-zinc-600 font-bold">?</span>
                        <span className="italic">&ldquo;{q}&rdquo;</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Tools and Portfolio Quick Preview */}
              <div className="mt-4 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-medium text-zinc-500 uppercase mr-1">Tools:</span>
                  {creator.tools.map(tool => (
                    <span 
                      key={tool}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
                        brief.requiredTools.includes(tool)
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {tool}
                    </span>
                  ))}
                </div>

                {creator.portfolio.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-zinc-500 uppercase">Relevant Sample:</span>
                    <span 
                      onClick={() => onSelectCreatorProfile(creator)}
                      className="text-zinc-300 hover:text-white cursor-pointer underline underline-offset-2 flex items-center gap-1"
                    >
                      <span>{creator.portfolio[0].title} ({creator.portfolio[0].aspectRatio})</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
