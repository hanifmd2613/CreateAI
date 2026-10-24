'use client';

import React, { useState } from 'react';
import { Brief, Creator, AutoShortlistReport } from '../types';
import { generateAutoShortlist } from '../utils/matchingEngine';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Trash2, 
  Plus, 
  ArrowRight,
  Info
} from 'lucide-react';

interface AutoShortlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  brief: Brief;
  creators: Creator[];
  onApproveShortlist: (selectedCreatorIds: string[]) => void;
}

export const AutoShortlistModal: React.FC<AutoShortlistModalProps> = ({
  isOpen,
  onClose,
  brief,
  creators,
  onApproveShortlist
}) => {
  const [requestedCount, setRequestedCount] = useState<number>(brief.requiredCreatorsCount || 5);
  const [report, setReport] = useState<AutoShortlistReport>(() => 
    generateAutoShortlist(brief, creators, requestedCount)
  );
  const [editableSelectedIds, setEditableSelectedIds] = useState<string[]>(() =>
    report.selectedCreators.map(s => s.creatorId)
  );

  if (!isOpen) return null;

  const handleRegenerate = () => {
    const newReport = generateAutoShortlist(brief, creators, requestedCount);
    setReport(newReport);
    setEditableSelectedIds(newReport.selectedCreators.map(s => s.creatorId));
  };

  const handleRemoveCreator = (id: string) => {
    setEditableSelectedIds(editableSelectedIds.filter(cid => cid !== id));
  };

  const handleApprove = () => {
    onApproveShortlist(editableSelectedIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Shortlist AI Agent</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400 font-mono text-[11px]">Human-in-the-Loop Protocol</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              AI Creator Shortlist Generator
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Campaign: <strong className="text-white">&ldquo;{brief.title}&rdquo;</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortlist Configuration Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 font-medium">Requested Creators:</span>
            <div className="flex items-center gap-1">
              {[3, 5, 8].map(count => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setRequestedCount(count)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    requestedCount === count 
                      ? 'bg-emerald-500 text-zinc-950' 
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {count} Creators
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleRegenerate}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs border border-zinc-700 transition-colors"
          >
            Regenerate Shortlist
          </button>
        </div>

        {/* Selected Creators by the Agent */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Selected by Agent ({editableSelectedIds.length} Eligible Candidates):
            </h3>
            <span className="text-[11px] text-zinc-500">
              Click trash icon to remove any individual creator
            </span>
          </div>

          <div className="space-y-2.5">
            {editableSelectedIds.map(creatorId => {
              const creator = creators.find(c => c.id === creatorId);
              const reportItem = report.selectedCreators.find(s => s.creatorId === creatorId);
              if (!creator) return null;

              return (
                <div 
                  key={creatorId}
                  className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={creator.avatar} 
                      alt={creator.name} 
                      className="w-10 h-10 rounded-xl object-cover bg-zinc-900 border border-zinc-700" 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{creator.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                          {reportItem?.score || 95}/100 Match
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {reportItem?.selectionRationale || creator.specialization}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-xs">
                      <span className="font-bold text-white">₹{creator.hourlyRate.toLocaleString('en-IN')}/hr</span>
                      <span className="block text-[10px] text-zinc-500">{creator.location}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCreator(creatorId)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Remove creator from shortlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Excluded Creators & Agent Reasoning Report */}
        {report.excludedCreators.length > 0 && (
          <div className="space-y-2 p-4 rounded-xl bg-rose-950/20 border border-rose-900/30 text-xs">
            <span className="font-bold text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Excluded Creators &amp; Constraint Rationale ({report.excludedCreators.length}):</span>
            </span>
            <ul className="space-y-1 text-rose-400/90 pl-5 list-disc">
              {report.excludedCreators.map(ex => (
                <li key={ex.creatorId}>
                  <strong>{ex.creatorName}</strong>: {ex.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Unresolved Rights & Profile Items to Confirm */}
        {report.unresolvedItems.length > 0 && (
          <div className="space-y-2 p-4 rounded-xl bg-amber-950/20 border border-amber-900/30 text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Unresolved Items for Brand Confirmation ({report.unresolvedItems.length}):</span>
            </span>
            <ul className="space-y-1 text-amber-400/90 pl-5 list-disc">
              {report.unresolvedItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety Disclaimer */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Safety &amp; Compliance Guarantee:</strong> The Auto-Shortlist Agent never automatically contacts creators or accepts financial commitments. You review, edit, and approve the shortlist before any invitations are sent.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white font-medium text-xs transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApprove}
            disabled={editableSelectedIds.length === 0}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve &amp; Save Shortlist ({editableSelectedIds.length} Creators)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
