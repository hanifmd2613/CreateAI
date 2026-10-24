'use client';

import React from 'react';
import { Creator, Brief } from '../types';
import { rankCreatorsForCampaign } from '../utils/matchingEngine';
import { 
  X, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  MessageSquare,
  Check,
  Plus
} from 'lucide-react';

interface CreatorComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCreatorIds: string[];
  creators: Creator[];
  brief: Brief;
  shortlistedCreatorIds: string[];
  onToggleShortlist: (id: string) => void;
  onOpenChat: (creator: Creator) => void;
}

export const CreatorComparisonModal: React.FC<CreatorComparisonModalProps> = ({
  isOpen,
  onClose,
  selectedCreatorIds,
  creators,
  brief,
  shortlistedCreatorIds,
  onToggleShortlist,
  onOpenChat
}) => {
  if (!isOpen) return null;

  const compareCreators = creators.filter(c => selectedCreatorIds.includes(c.id));
  const matchResults = rankCreatorsForCampaign(brief, compareCreators);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>Multi-Creator Comparison Matrix</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Side-by-Side Candidate Evaluation
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comparing {compareCreators.length} creators against requirements for &ldquo;{brief.title}&rdquo;
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="p-3 text-zinc-500 font-mono uppercase text-[10px] w-40">Attribute</th>
                {matchResults.map(({ creator, matchScore, rightsCompatibility }) => (
                  <th key={creator.id} className="p-3 min-w-[220px]">
                    <div className="flex items-center gap-3">
                      <img 
                        src={creator.avatar} 
                        alt={creator.name} 
                        className="w-12 h-12 rounded-xl object-cover bg-zinc-950 border border-zinc-700" 
                      />
                      <div>
                        <div className="font-bold text-sm text-white">{creator.name}</div>
                        <div className="text-[11px] text-zinc-400">{creator.specialization}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-emerald-400 font-bold">{matchScore}/100 Match</span>
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/80">
              
              {/* Row 1: Hourly Rate & Turnaround */}
              <tr className="bg-zinc-950/40">
                <td className="p-3 font-semibold text-zinc-400">Pricing &amp; Speed</td>
                {matchResults.map(({ creator }) => (
                  <td key={creator.id} className="p-3">
                    <span className="text-sm font-bold text-white">₹{creator.hourlyRate.toLocaleString('en-IN')}/hr</span>
                    <span className="block text-[11px] text-zinc-400 mt-0.5">Avg Turnaround: {creator.avgTurnaround}</span>
                  </td>
                ))}
              </tr>

              {/* Row 2: Rights Compatibility */}
              <tr>
                <td className="p-3 font-semibold text-zinc-400">Usage Rights Fit</td>
                {matchResults.map(({ creator, rightsCompatibility, rightsDiagnostic }) => (
                  <td key={creator.id} className="p-3">
                    {rightsCompatibility === 'compatible' && (
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Fully Compatible</span>
                      </div>
                    )}
                    {rightsCompatibility === 'conflict' && (
                      <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Flagged Conflict</span>
                      </div>
                    )}
                    {rightsCompatibility === 'unknown' && (
                      <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                        <HelpCircle className="w-4 h-4 shrink-0" />
                        <span>Unconfirmed</span>
                      </div>
                    )}
                    <span className="block text-[10px] text-zinc-400 mt-1 leading-tight">
                      {creator.usageTerms.licensingType} ({creator.usageTerms.territory})
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 3: Key Tools */}
              <tr className="bg-zinc-950/40">
                <td className="p-3 font-semibold text-zinc-400">AI Toolchain</td>
                {matchResults.map(({ creator }) => (
                  <td key={creator.id} className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {creator.tools.map(tool => (
                        <span 
                          key={tool}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 4: Relevant Portfolio Evidence */}
              <tr>
                <td className="p-3 font-semibold text-zinc-400">Portfolio Proof</td>
                {matchResults.map(({ creator }) => (
                  <td key={creator.id} className="p-3">
                    {creator.portfolio.length > 0 ? (
                      <div className="space-y-1">
                        <span className="font-semibold text-white block">{creator.portfolio[0].title}</span>
                        <span className="text-[10px] text-zinc-400 block line-clamp-2">
                          {creator.portfolio[0].workflowDescription}
                        </span>
                        <span className="inline-block text-[10px] font-mono text-emerald-400">
                          Format: {creator.portfolio[0].aspectRatio} ({creator.portfolio[0].type})
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-500 italic">No samples uploaded</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 5: Key Strength */}
              <tr className="bg-zinc-950/40">
                <td className="p-3 font-semibold text-zinc-400">Primary Strength</td>
                {matchResults.map(({ creator, reasonsForRank }) => (
                  <td key={creator.id} className="p-3 text-zinc-300">
                    {reasonsForRank[0] || 'High verified delivery score.'}
                  </td>
                ))}
              </tr>

              {/* Row 6: Potential Risks */}
              <tr>
                <td className="p-3 font-semibold text-zinc-400">Potential Risks</td>
                {matchResults.map(({ creator, potentialConcerns }) => (
                  <td key={creator.id} className="p-3">
                    {potentialConcerns.length > 0 ? (
                      <span className="text-amber-400/90">{potentialConcerns[0]}</span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> None detected
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 7: Actions */}
              <tr className="bg-zinc-950/60">
                <td className="p-3 font-semibold text-zinc-400">Direct Actions</td>
                {matchResults.map(({ creator }) => {
                  const isShortlisted = shortlistedCreatorIds.includes(creator.id);
                  return (
                    <td key={creator.id} className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onToggleShortlist(creator.id)}
                          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 ${
                            isShortlisted
                              ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                              : 'bg-white hover:bg-zinc-200 text-zinc-950'
                          }`}
                        >
                          {isShortlisted ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                          <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                        </button>

                        <button
                          onClick={() => onOpenChat(creator)}
                          className="p-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs flex items-center gap-1"
                          title="Message creator"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>

            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
