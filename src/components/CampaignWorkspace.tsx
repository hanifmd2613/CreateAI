'use client';

import React, { useState } from 'react';
import { 
  Brief, 
  Creator, 
  CampaignDeliverable, 
  CreatorEngagement, 
  CampaignLifecycleStage 
} from '../types';
import { MatchingResultsView } from './MatchingResultsView';
import { AutoShortlistModal } from './AutoShortlistModal';
import { CreatorComparisonModal } from './CreatorComparisonModal';
import { DeliverablesReviewWorkspace } from './DeliverablesReviewWorkspace';
import { RightsReviewModal } from './RightsReviewModal';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Layers, 
  FileText, 
  Users, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  History, 
  DollarSign,
  ChevronRight,
  ExternalLink,
  Lock,
  RotateCcw
} from 'lucide-react';

interface CampaignWorkspaceProps {
  campaigns: Brief[];
  currentCampaign: Brief;
  onSelectCampaign: (brief: Brief) => void;
  creators: Creator[];
  deliverables: CampaignDeliverable[];
  onUpdateDeliverables: (updated: CampaignDeliverable[]) => void;
  engagements: CreatorEngagement[];
  onUpdateEngagements: (updated: CreatorEngagement[]) => void;
  onUpdateCampaign: (updatedBrief: Brief) => void;
  onNavigateToBuilder: () => void;
  onSelectCreatorProfile: (creator: Creator) => void;
  onOpenChat: (creator: Creator) => void;
  currentUserRole: 'brand' | 'creator';
  currentUserName: string;
}

export const CampaignWorkspace: React.FC<CampaignWorkspaceProps> = ({
  campaigns,
  currentCampaign,
  onSelectCampaign,
  creators,
  deliverables,
  onUpdateDeliverables,
  engagements,
  onUpdateEngagements,
  onUpdateCampaign,
  onNavigateToBuilder,
  onSelectCreatorProfile,
  onOpenChat,
  currentUserRole,
  currentUserName
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'matching' | 'engagements' | 'deliverables' | 'rights' | 'activity'>('matching');
  const [autoShortlistModalOpen, setAutoShortlistModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [rightsModalCreator, setRightsModalCreator] = useState<Creator | null>(null);

  // Filter deliverables and engagements for the active campaign
  const campaignDeliverables = deliverables.filter(d => d.campaignId === currentCampaign.id);
  const campaignEngagements = engagements.filter(e => e.campaignId === currentCampaign.id);

  // Shortlist handling
  const handleToggleShortlist = (creatorId: string) => {
    const isCurrentlyShortlisted = currentCampaign.shortlistCreatorIds.includes(creatorId);
    const updatedIds = isCurrentlyShortlisted
      ? currentCampaign.shortlistCreatorIds.filter(id => id !== creatorId)
      : [...currentCampaign.shortlistCreatorIds, creatorId];

    onUpdateCampaign({
      ...currentCampaign,
      shortlistCreatorIds: updatedIds,
      lifecycleStage: updatedIds.length > 0 && currentCampaign.lifecycleStage === 'matching' ? 'shortlisted' : currentCampaign.lifecycleStage
    });
  };

  const handleApproveAutoShortlist = (selectedIds: string[]) => {
    onUpdateCampaign({
      ...currentCampaign,
      shortlistCreatorIds: selectedIds,
      selectedCreatorIds: selectedIds.slice(0, 2), // Auto-select top candidates for initial commission
      lifecycleStage: 'shortlisted',
      status: 'In Review'
    });
    setActiveTab('engagements');
  };

  // Lifecycle Stage Guardrails & Advancement
  const advanceStage = (nextStage: CampaignLifecycleStage) => {
    // Guardrail: Cannot complete unless deliverables are approved
    if (nextStage === 'approved_completed') {
      const allApproved = campaignDeliverables.length > 0 && campaignDeliverables.every(d => d.status === 'approved');
      if (!allApproved) {
        alert('Cannot mark campaign Completed: All required deliverables must be reviewed and marked Approved first.');
        return;
      }
    }

    onUpdateCampaign({
      ...currentCampaign,
      lifecycleStage: nextStage,
      status: nextStage === 'approved_completed' ? 'Completed' : 'In Production'
    });
  };

  const STAGES_LIST: { key: CampaignLifecycleStage; label: string }[] = [
    { key: 'draft', label: '1. Draft' },
    { key: 'published', label: '2. Published' },
    { key: 'matching', label: '3. AI Matching' },
    { key: 'shortlisted', label: '4. Shortlisted' },
    { key: 'selected', label: '5. Selected' },
    { key: 'rights_confirmed', label: '6. Rights Confirmed' },
    { key: 'in_production', label: '7. Production' },
    { key: 'draft_submitted', label: '8. Draft Review' },
    { key: 'tech_validation', label: '9. Validation' },
    { key: 'approved_completed', label: '10. Completed' }
  ];

  const currentStageIndex = STAGES_LIST.findIndex(s => s.key === currentCampaign.lifecycleStage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Campaign Selector & Hero Banner */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE CAMPAIGN
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-400 font-medium">{currentCampaign.brandName}</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {currentCampaign.title}
              </h1>
            </div>
            
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-2xl leading-relaxed">
              {currentCampaign.campaignObjective}
            </p>
          </div>

          {/* Campaign Selector Dropdown & New Campaign Button */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <select
              value={currentCampaign.id}
              onChange={(e) => {
                const found = campaigns.find(c => c.id === e.target.value);
                if (found) onSelectCampaign(found);
              }}
              className="px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 font-semibold focus:outline-none focus:border-zinc-500"
            >
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.status})
                </option>
              ))}
            </select>

            <button
              onClick={onNavigateToBuilder}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post New Brief</span>
            </button>
          </div>
        </div>

        {/* 10-Stage Visual Lifecycle Progress Pipeline */}
        <div className="pt-4 border-t border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-emerald-400" />
              <span>Campaign Lifecycle Status:</span>
              <strong className="text-white uppercase">{currentCampaign.lifecycleStage.replace('_', ' ')}</strong>
            </span>

            {/* Quick Advance Controls with State Guardrails */}
            <div className="flex items-center gap-2">
              {currentCampaign.lifecycleStage === 'matching' && (
                <button
                  onClick={() => advanceStage('shortlisted')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                >
                  <span>Mark Shortlisted</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
              {currentCampaign.lifecycleStage === 'shortlisted' && (
                <button
                  onClick={() => advanceStage('in_production')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                >
                  <span>Start Production</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
              {currentCampaign.lifecycleStage === 'in_production' && (
                <button
                  onClick={() => advanceStage('approved_completed')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 text-zinc-950 text-[11px] font-bold hover:bg-emerald-400 transition-all flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Mark Approved &amp; Completed</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5">
            {STAGES_LIST.map((stage, i) => {
              const isPast = currentStageIndex > i;
              const isCurrent = currentStageIndex === i;
              return (
                <div
                  key={stage.key}
                  onClick={() => advanceStage(stage.key)}
                  className={`p-2 rounded-lg text-center cursor-pointer transition-all border ${
                    isCurrent
                      ? 'bg-emerald-500 text-zinc-950 font-bold border-emerald-400 shadow-md ring-2 ring-emerald-500/30'
                      : isPast
                      ? 'bg-zinc-950 text-emerald-400 border-emerald-500/30 font-medium'
                      : 'bg-zinc-950/60 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                  }`}
                  title={`Click to set stage: ${stage.label}`}
                >
                  <span className="block text-[10px] truncate">{stage.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-zinc-800 pt-3 no-scrollbar text-xs">
          {[
            { id: 'matching', label: '1. AI Matches & Shortlist', icon: Sparkles, count: currentCampaign.shortlistCreatorIds.length },
            { id: 'engagements', label: '2. Creator Engagements', icon: Users, count: campaignEngagements.length },
            { id: 'deliverables', label: '3. Deliverables & Validation', icon: Layers, count: campaignDeliverables.length },
            { id: 'rights', label: '4. Rights & Licensing', icon: ShieldCheck },
            { id: 'overview', label: '5. Brief Specs', icon: FileText },
            { id: 'activity', label: '6. Activity Timeline', icon: Clock },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isActive ? 'bg-zinc-950 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT 1: AI MATCHING & SHORTLIST */}
      {activeTab === 'matching' && (
        <MatchingResultsView
          brief={currentCampaign}
          creators={creators}
          shortlistedCreatorIds={currentCampaign.shortlistCreatorIds}
          onToggleShortlist={handleToggleShortlist}
          onOpenAutoShortlistModal={() => setAutoShortlistModalOpen(true)}
          onOpenComparisonModal={(ids) => {
            setCompareIds(ids);
            setCompareModalOpen(true);
          }}
          onSelectCreatorProfile={onSelectCreatorProfile}
          onOpenChat={onOpenChat}
        />
      )}

      {/* TAB CONTENT 2: CREATOR ENGAGEMENTS */}
      {activeTab === 'engagements' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Creator Engagements &amp; Escrow Tracking</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Allocated Budget: <strong className="text-white">{currentCampaign.budget}</strong> • Required Creators: <strong className="text-white">{currentCampaign.requiredCreatorsCount}</strong>
              </p>
            </div>

            <button
              onClick={() => setActiveTab('matching')}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add From Matches</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {campaignEngagements.map(eng => (
              <div 
                key={eng.id}
                className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={eng.creator.avatar} 
                      alt={eng.creator.name} 
                      className="w-12 h-12 rounded-xl object-cover bg-zinc-950 border border-zinc-700" 
                    />
                    <div>
                      <h4 className="font-bold text-white text-base hover:text-emerald-400 transition-colors cursor-pointer"
                          onClick={() => onSelectCreatorProfile(eng.creator)}>
                        {eng.creator.name}
                      </h4>
                      <p className="text-xs text-zinc-400">{eng.creator.specialization}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                    {eng.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Agreed Fee:</span>
                    <span className="font-bold text-white">₹{eng.agreedFeeINR.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Payment Escrow:</span>
                    <span className="font-bold text-emerald-400">{eng.paymentStatus}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      setRightsModalCreator(eng.creator);
                    }}
                    className="text-zinc-400 hover:text-emerald-400 flex items-center gap-1 font-medium"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View Rights Agreement</span>
                  </button>

                  <button
                    onClick={() => onOpenChat(eng.creator)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors"
                  >
                    Open Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: DELIVERABLES & TECHNICAL VALIDATION WORKSPACE */}
      {activeTab === 'deliverables' && (
        <DeliverablesReviewWorkspace
          brief={currentCampaign}
          deliverables={campaignDeliverables}
          onUpdateDeliverables={(updatedCampaignDeliverables) => {
            // Merge with global deliverables
            const otherDeliverables = deliverables.filter(d => d.campaignId !== currentCampaign.id);
            onUpdateDeliverables([...otherDeliverables, ...updatedCampaignDeliverables]);
          }}
          currentUserRole={currentUserRole}
          currentUserName={currentUserName}
        />
      )}

      {/* TAB CONTENT 4: RIGHTS & LICENSING AUDIT */}
      {activeTab === 'rights' && (
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Campaign Commercial Usage Rights &amp; Policy</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Formal licensing parameters required from all commissioned creators.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
                <span>Audited Policy Active</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Purpose &amp; Tier</span>
              <div className="font-bold text-white text-sm">{currentCampaign.usageRights.purpose}</div>
              <span className="text-zinc-400 block">{currentCampaign.usageRights.commercialUse}</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Territory &amp; Duration</span>
              <div className="font-bold text-white text-sm">{currentCampaign.usageRights.territory}</div>
              <span className="text-zinc-400 block">{currentCampaign.usageRights.durationMonths} Months Authorized</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Paid Ad Permissions</span>
              <div className="font-bold text-emerald-400 text-sm">Whitelisting Authorized</div>
              <span className="text-zinc-400 block">Subtitles &amp; 9:16 derivative crops permitted</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-2">
            <span className="font-bold text-white block">Custom Licensing Directive:</span>
            <p className="leading-relaxed text-zinc-400">
              {currentCampaign.usageRights.customTerms || 'All master assets delivered under this brief grant complete commercial advertising usage rights in India for 6 months. Model seeds (--sref) and node manifests must be submitted for legal verification.'}
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: BRIEF SPECIFICATIONS */}
      {activeTab === 'overview' && (
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h3 className="text-lg font-bold text-white">Full Brief Technical Specifications</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Parameters configured for AI Matching &amp; Quality Checking.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Format &amp; Ratio</span>
              <div className="font-bold text-white">{currentCampaign.contentType}</div>
              <span className="text-emerald-400 font-mono">{currentCampaign.aspectRatio} (Vertical)</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Budget Allocation</span>
              <div className="font-bold text-white">{currentCampaign.budget}</div>
              <span className="text-zinc-400">₹{Math.round((currentCampaign.budgetMaxINR || 50000) / (currentCampaign.requiredCreatorsCount || 1)).toLocaleString('en-IN')} per creator</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Target Platforms</span>
              <div className="font-bold text-white">{currentCampaign.targetPlatforms.join(', ')}</div>
              <span className="text-zinc-400">Social Ad Whitelisting</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Turnaround</span>
              <div className="font-bold text-white">{currentCampaign.deadline}</div>
              <span className="text-emerald-400 font-medium">Standard Delivery</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase text-zinc-400">Mandatory Criteria (Hard Constraints):</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {currentCampaign.mandatoryCriteria.map((c, i) => (
                <li key={i} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: ACTIVITY TIMELINE */}
      {activeTab === 'activity' && (
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-3">Campaign Audit &amp; Event Log</h3>

          <div className="space-y-4 text-xs">
            {[
              { time: 'Today, 11:45 AM', user: 'DermaGlow Brand Lead', event: 'Approved deliverable v2: "DermaGlow_Hero_Meera_v2_FINAL.mp4" (All checks passed 100%).' },
              { time: 'Today, 11:16 AM', user: 'Automated Delivery Agent', event: 'Validated v2 master cut: Dimensions 1080x1920, duration 15.0s, MP4 format.' },
              { time: 'Today, 11:15 AM', user: 'Meera Krishnan', event: 'Uploaded revised deliverable v2 with changelog: "Locked typography weights and dialed down blur".' },
              { time: 'Yesterday, 06:15 PM', user: 'DermaGlow Brand Lead', event: 'Requested revision on v1 at 00:04: "Sharpen typography on bottle".' },
              { time: 'Yesterday, 04:30 PM', user: 'Meera Krishnan', event: 'Submitted initial v1 deliverable draft for review.' },
              { time: 'Yesterday, 10:30 AM', user: 'Brand Legal Auditor', event: 'Recorded & confirmed 6-month commercial buyout rights agreement with Meera Krishnan.' },
              { time: 'Yesterday, 10:00 AM', user: 'Auto-Shortlist Agent', event: 'Ranked 8 creators, verified hard constraints, and generated 5-candidate shortlist.' },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{log.user}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{log.time}</span>
                  </div>
                  <p className="text-zinc-400 mt-0.5">{log.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-Shortlist AI Agent Modal */}
      <AutoShortlistModal
        isOpen={autoShortlistModalOpen}
        onClose={() => setAutoShortlistModalOpen(false)}
        brief={currentCampaign}
        creators={creators}
        onApproveShortlist={handleApproveAutoShortlist}
      />

      {/* Creator Comparison Matrix Modal */}
      <CreatorComparisonModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        selectedCreatorIds={compareIds}
        creators={creators}
        brief={currentCampaign}
        shortlistedCreatorIds={currentCampaign.shortlistCreatorIds}
        onToggleShortlist={handleToggleShortlist}
        onOpenChat={onOpenChat}
      />

      {/* Rights Review Modal */}
      {rightsModalCreator && (
        <RightsReviewModal
          isOpen={true}
          onClose={() => setRightsModalCreator(null)}
          brief={currentCampaign}
          creator={rightsModalCreator}
          onConfirmRights={() => {
            alert(`Commercial Usage Rights confirmed for ${rightsModalCreator.name}. Signed into campaign audit record.`);
            setRightsModalCreator(null);
          }}
        />
      )}

    </div>
  );
};
