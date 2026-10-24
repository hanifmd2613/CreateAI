'use client';

import React, { useState } from 'react';
import { 
  Creator, 
  Brief, 
  CampaignDeliverable, 
  CreatorEngagement 
} from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Upload, 
  MessageSquare, 
  ShieldCheck, 
  FileText, 
  DollarSign, 
  Check, 
  X,
  ExternalLink,
  Layers,
  ChevronRight
} from 'lucide-react';

interface CreatorDashboardViewProps {
  creator: Creator;
  briefs: Brief[];
  deliverables: CampaignDeliverable[];
  engagements: CreatorEngagement[];
  onAcceptInvitation: (campaignId: string) => void;
  onDeclineInvitation: (campaignId: string) => void;
  onNavigateToDeliverable: (campaignId: string) => void;
  onOpenChat: (creator: Creator) => void;
}

export const CreatorDashboardView: React.FC<CreatorDashboardViewProps> = ({
  creator,
  briefs,
  deliverables,
  engagements,
  onAcceptInvitation,
  onDeclineInvitation,
  onNavigateToDeliverable,
  onOpenChat
}) => {
  const creatorDeliverables = deliverables.filter(d => d.creatorId === creator.id);
  const creatorEngagements = engagements.filter(e => e.creatorId === creator.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Creator Studio Hero Card */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-zinc-950 border border-zinc-700 ring-4 ring-white/10"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  CREATOR STUDIO PORTAL
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs text-zinc-400 font-medium">{creator.location}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                Welcome back, {creator.name}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                {creator.specialization} • Verified Commercial Production Pipeline
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-center flex-1 md:flex-none min-w-[100px]">
              <span className="text-xs text-zinc-500 block uppercase font-mono">Rate</span>
              <span className="text-base font-bold text-white">₹{creator.hourlyRate.toLocaleString('en-IN')}/hr</span>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-center flex-1 md:flex-none min-w-[100px]">
              <span className="text-xs text-zinc-500 block uppercase font-mono">Completed</span>
              <span className="text-base font-bold text-emerald-400">{creator.completedProjects} Projects</span>
            </div>
          </div>
        </div>

        {/* Studio Status Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800 text-xs">
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-zinc-400 font-medium block">Licensing Stance</span>
              <strong className="text-white text-sm">{creator.usageTerms.licensingType}</strong>
              <span className="text-[10px] text-zinc-500 block">Territory: {creator.usageTerms.territory}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-zinc-400 font-medium block">Active Deliverables</span>
              <strong className="text-white text-sm">{creatorDeliverables.length} Deliverables</strong>
              <span className="text-[10px] text-emerald-400 block">1 Approved • 1 In Review</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-zinc-400 font-medium block">Turnaround Standard</span>
              <strong className="text-white text-sm">{creator.avgTurnaround}</strong>
              <span className="text-[10px] text-zinc-500 block">Guaranteed SLA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Opportunities & Active Engagements */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <span>Active Campaign Assignments &amp; Opportunities</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {briefs.map(brief => {
            const isAssigned = creatorEngagements.some(e => e.campaignId === brief.id);
            const deliverable = creatorDeliverables.find(d => d.campaignId === brief.id);

            return (
              <div 
                key={brief.id}
                className="p-5 sm:p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white text-base">{brief.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                        {brief.contentType} ({brief.aspectRatio})
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                      Brand: <strong className="text-zinc-200">{brief.brandName}</strong> • Budget: <strong className="text-white">{brief.budget}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAssigned ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                        Assigned • Production Active
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onAcceptInvitation(brief.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Brief</span>
                        </button>
                        <button
                          onClick={() => onDeclineInvitation(brief.id)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deliverable submission status if assigned */}
                {isAssigned && (
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-mono block">Deliverable Status:</span>
                      <span className="font-bold text-white">
                        {deliverable ? `${deliverable.title} (${deliverable.status.replace('_', ' ')})` : 'Awaiting v1 submission'}
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigateToDeliverable(brief.id)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Review &amp; Upload Revisions</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
