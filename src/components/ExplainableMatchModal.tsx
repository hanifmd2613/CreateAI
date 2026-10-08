import React, { useState, useEffect } from 'react';
import { Sparkles, X, ShieldCheck, Check, ArrowRight, MessageSquare, Briefcase, ChevronRight, Award, Zap } from 'lucide-react';
import { Brief, Creator } from '../types';
import { rankCreatorsForBrief, CreatorMatchCalculation } from '../lib/matching';

interface ExplainableMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  brief: Brief;
  creators: Creator[];
  onSelectCreator: (creator: Creator) => void;
  onHireDirect: (creator: Creator) => void;
  onOpenChat: (creator: Creator) => void;
}

export const ExplainableMatchModal: React.FC<ExplainableMatchModalProps> = ({
  isOpen,
  onClose,
  brief,
  creators,
  onSelectCreator,
  onHireDirect,
  onOpenChat,
}) => {
  const [rankedMatches, setRankedMatches] = useState<CreatorMatchCalculation[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<CreatorMatchCalculation | null>(null);

  useEffect(() => {
    if (brief && creators.length > 0) {
      const matches = rankCreatorsForBrief(brief, creators);
      setRankedMatches(matches);
      if (matches.length > 0) {
        setSelectedMatch(matches[0]);
      }
    }
  }, [brief, creators]);

  if (!isOpen || !brief) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-750 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  EXPLAINABLE MATCHING ENGINE
                </span>
                <span className="text-xs text-zinc-400">• {rankedMatches.length} Candidates Evaluated</span>
              </div>
              <h2 className="text-lg font-semibold text-white mt-0.5">
                Ranked Creators for &quot;{brief.title}&quot;
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content (Split view: Left list of matches, Right details & explanation) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
          
          {/* Left Column: Ranked Candidates List */}
          <div className="lg:col-span-5 p-4 space-y-3 max-h-[65vh] overflow-y-auto">
            <span className="text-[11px] font-mono uppercase text-zinc-400 block px-1">
              Deterministic Hybrid Ranking:
            </span>

            {rankedMatches.map((m, idx) => {
              const isSelected = selectedMatch?.creatorId === m.creatorId;
              return (
                <div
                  key={m.creatorId}
                  onClick={() => setSelectedMatch(m)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-zinc-800/90 border-zinc-600 shadow-md ring-1 ring-zinc-600'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={m.creator.avatar}
                        alt={m.creator.name}
                        className="w-11 h-11 rounded-full object-cover border border-zinc-700 bg-zinc-900"
                      />
                      <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center text-[10px] font-mono font-bold">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate">{m.creator.name}</span>
                        {m.creator.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">{m.creator.specialization}</p>
                      <div className="text-[10px] text-zinc-400 mt-1 font-mono">
                        <span className="text-emerald-400 font-semibold">₹{m.creator.hourlyRate.toLocaleString('en-IN')}/hr</span>
                        <span className="mx-1">•</span>
                        <span>{m.creator.tools.slice(0, 2).join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Match Percentage Badge */}
                  <div className="text-right shrink-0">
                    <div className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-750 text-center">
                      <span className="text-xs font-bold text-emerald-400 block">{m.finalScore}%</span>
                      <span className="text-[9px] text-zinc-400 uppercase font-mono">MATCH</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Transparent Score Breakdown & Reasons */}
          {selectedMatch && (
            <div className="lg:col-span-7 p-6 space-y-6 bg-zinc-900/40">
              
              {/* Selected Candidate Header */}
              <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedMatch.creator.avatar}
                    alt={selectedMatch.creator.name}
                    className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <span>{selectedMatch.creator.name}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </h3>
                    <p className="text-xs text-zinc-400">{selectedMatch.creator.specialization}</p>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{selectedMatch.creator.location}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-bold text-emerald-400 font-mono">{selectedMatch.finalScore}%</span>
                  <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-mono">
                    Hybrid Calculated Score
                  </span>
                </div>
              </div>

              {/* Empirical Reasons List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono text-zinc-400">
                  Why {selectedMatch.creator.name} is a Top Match:
                </h4>
                <div className="space-y-1.5">
                  {selectedMatch.reasons.map((reason, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 text-xs text-zinc-200 flex items-start gap-2.5"
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="leading-snug">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categorized Score Breakdown Bars */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-800">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono text-zinc-400">
                  Weighted Score Category Breakdown (0-100%):
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                      <span>40% Semantic / Intent Match:</span>
                      <strong className="text-zinc-200">{selectedMatch.categories.semanticScore}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${selectedMatch.categories.semanticScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                      <span>20% Skills Match:</span>
                      <strong className="text-zinc-200">{selectedMatch.categories.skillScore}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${selectedMatch.categories.skillScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                      <span>15% Tools & AI Models:</span>
                      <strong className="text-zinc-200">{selectedMatch.categories.toolScore}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-purple-400 rounded-full" style={{ width: `${selectedMatch.categories.toolScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                      <span>10% Content-Type Match:</span>
                      <strong className="text-zinc-200">{selectedMatch.categories.contentTypeScore}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${selectedMatch.categories.contentTypeScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                      <span>5% Format & Aspect Ratio:</span>
                      <strong className="text-zinc-200">{selectedMatch.categories.formatScore}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${selectedMatch.categories.formatScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                      <span>5% IP Commercial Buyout:</span>
                      <strong className="text-zinc-200">{selectedMatch.categories.commercialScore}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${selectedMatch.categories.commercialScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Selected Creator */}
              <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onSelectCreator(selectedMatch.creator);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-medium border border-zinc-700"
                >
                  View Full Profile
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChat(selectedMatch.creator);
                      onClose();
                    }}
                    className="px-3 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-850 text-zinc-300 text-xs border border-zinc-800 flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onHireDirect(selectedMatch.creator);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Commission Creator</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
