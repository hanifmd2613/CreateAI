'use client';

import React, { useState, useEffect } from 'react';
import {
  EngagementRecord,
  DeliverableVersion,
  VersionFeedback,
  DeliveryCheckResult,
  AuditLogEntry,
  UserAccount,
  UserRole
} from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileVideo,
  Upload,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  XCircle,
  FileText,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  User,
  Info,
  Sliders,
  Award
} from 'lucide-react';

interface EngagementWorkspaceProps {
  currentUser: UserAccount | null;
  onNavigateToBriefs?: () => void;
  onShowToast?: (msg: string) => void;
  initialEngagementId?: string;
  onBack?: () => void;
}

export const EngagementWorkspace: React.FC<EngagementWorkspaceProps> = ({
  currentUser,
  onNavigateToBriefs,
  onShowToast = (msg: string) => console.log(msg),
  initialEngagementId,
  onBack,
}) => {
  const [engagements, setEngagements] = useState<EngagementRecord[]>([]);
  const [selectedEngagement, setSelectedEngagement] = useState<EngagementRecord | null>(null);
  const [versions, setVersions] = useState<DeliverableVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<DeliverableVersion | null>(null);
  const [feedbackList, setFeedbackList] = useState<VersionFeedback[]>([]);
  const [deliveryChecks, setDeliveryChecks] = useState<DeliveryCheckResult[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // New feedback input state
  const [newFeedbackComment, setNewFeedbackComment] = useState('');
  const [newFeedbackOffset, setNewFeedbackOffset] = useState<string>('0');

  // New draft version input modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [draftNotes, setDraftNotes] = useState('');
  const [draftDuration, setDraftDuration] = useState('15');
  const [draftRatio, setDraftRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [simulateSpecError, setSimulateSpecError] = useState(false);

  // Decline modal
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const activeRole: UserRole = currentUser?.role || 'brand';

  // Load all engagements
  const fetchEngagements = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/engagements');
      if (res.ok) {
        const data = await res.json();
        setEngagements(data.engagements || []);
        if (data.engagements && data.engagements.length > 0) {
          const target = initialEngagementId
            ? data.engagements.find((e: EngagementRecord) => e.id === initialEngagementId) || data.engagements[0]
            : data.engagements[0];
          setSelectedEngagement(target);
          await loadEngagementDetails(target.id);
        }
      }
    } catch (e) {
      console.error('Failed to load engagements:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Load details for selected engagement
  const loadEngagementDetails = async (engagementId: string) => {
    try {
      const res = await fetch(`/api/engagements/${engagementId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedEngagement(data.engagement);
        setVersions(data.versions || []);
        setFeedbackList(data.feedback || []);
        setDeliveryChecks(data.deliveryChecks || []);
        setAuditLogs(data.auditLogs || []);

        if (data.versions && data.versions.length > 0) {
          setSelectedVersion(data.versions[0]);
        } else {
          setSelectedVersion(null);
        }
      }
    } catch (e) {
      console.error('Failed to load engagement details:', e);
    }
  };

  useEffect(() => {
    fetchEngagements();
  }, []);

  // Transition state handler
  const handleTransition = async (targetState: string, additionalPayload: Record<string, any> = {}) => {
    if (!selectedEngagement) return;
    setIsActionLoading(true);

    try {
      const res = await fetch(`/api/engagements/${selectedEngagement.id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetState,
          actorRole: activeRole,
          actorId: currentUser?.id || 'user-active',
          actorName: currentUser?.name || 'Active User',
          ...additionalPayload,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onShowToast(`Engagement advanced to ${targetState}!`);
        await loadEngagementDetails(selectedEngagement.id);
      } else {
        onShowToast(`Action blocked: ${data.error?.message || 'Invalid transition'}`);
      }
    } catch (e: any) {
      onShowToast(`Transition error: ${e.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Confirm Scope & Licensing handler
  const handleConfirmAgreement = async () => {
    if (!selectedEngagement) return;
    setIsActionLoading(true);

    try {
      const res = await fetch(`/api/engagements/${selectedEngagement.id}/agreements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: currentUser?.id,
          actorName: currentUser?.name,
          actorRole: activeRole,
          confirmedBudget: selectedEngagement.proposedBudget,
          confirmedDeadline: '3 Days',
          maxRevisionRounds: selectedEngagement.maxRevisions || 2,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onShowToast('Scope & Licensing terms formally confirmed! Active in production.');
        await loadEngagementDetails(selectedEngagement.id);
      } else {
        onShowToast(`Cannot confirm: ${data.error?.message || 'Conflict detected'}`);
      }
    } catch (e: any) {
      onShowToast(`Agreement error: ${e.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Submit Draft Version handler
  const handleSubmitDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEngagement) return;
    setIsActionLoading(true);

    try {
      const durationSec = simulateSpecError ? 30 : Number(draftDuration);
      const ratio = simulateSpecError ? '16:9' : draftRatio;

      const res = await fetch(`/api/engagements/${selectedEngagement.id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploaderId: currentUser?.id || selectedEngagement.creatorId,
          uploaderName: currentUser?.name || selectedEngagement.creatorName,
          aspectRatio: ratio,
          durationSeconds: durationSec,
          generationNotes: draftNotes || 'Keyframe generated in Flux.1 -> High-speed camera trajectory in Veo -> Dynamic motion in Kling.',
          width: ratio === '9:16' ? 1080 : 1920,
          height: ratio === '9:16' ? 1920 : 1080,
          format: 'mp4',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onShowToast(`Draft Version ${data.version.versionNumber} submitted! Delivery Check: ${data.deliveryCheck.overallStatus}.`);
        setUploadModalOpen(false);
        setDraftNotes('');
        await loadEngagementDetails(selectedEngagement.id);
      } else {
        onShowToast(`Upload error: ${data.error?.message || 'Failed to submit draft'}`);
      }
    } catch (e: any) {
      onShowToast(`Draft upload error: ${e.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Submit feedback handler
  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEngagement || !selectedVersion || !newFeedbackComment.trim()) return;

    try {
      const res = await fetch(`/api/engagements/${selectedEngagement.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionId: selectedVersion.id,
          comment: newFeedbackComment.trim(),
          timestampOffset: Number(newFeedbackOffset) || 0,
          authorId: currentUser?.id || selectedEngagement.brandId,
          authorName: currentUser?.name || selectedEngagement.brandName,
          authorRole: activeRole,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onShowToast('Version feedback submitted!');
        setNewFeedbackComment('');
        await loadEngagementDetails(selectedEngagement.id);
      }
    } catch (e: any) {
      onShowToast(`Feedback error: ${e.message}`);
    }
  };

  // Resolve feedback item
  const handleResolveFeedback = async (feedbackId: string) => {
    if (!selectedEngagement) return;
    try {
      const res = await fetch(`/api/engagements/${selectedEngagement.id}/feedback`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId,
          actorId: currentUser?.id,
          actorName: currentUser?.name,
          actorRole: activeRole,
          resolvedInVersion: selectedEngagement.currentVersionNumber,
        }),
      });

      if (res.ok) {
        onShowToast('Feedback marked as resolved!');
        await loadEngagementDetails(selectedEngagement.id);
      }
    } catch (e: any) {
      onShowToast(`Error resolving feedback: ${e.message}`);
    }
  };

  // Helpers for Status Badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'DELIVERY_APPROVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'IN_PRODUCTION':
      case 'DRAFT_SUBMITTED':
      case 'REVISION_IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'REVISION_REQUESTED':
      case 'FINAL_REVIEW':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'CREATOR_DECLINED':
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  const getLicensingBadge = (status: string) => {
    switch (status) {
      case 'COMPATIBLE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'MISMATCH':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'NEEDS_REVIEW':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  const getCheckBadge = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'FAIL':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'WARNING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-white font-medium text-sm">Loading Engagement Workspace...</h3>
        <p className="text-zinc-500 text-xs mt-1">Connecting to state machine and draft version registry.</p>
      </div>
    );
  }

  if (engagements.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
          <Layers className="w-7 h-7 text-zinc-300" />
        </div>
        <h2 className="text-xl font-bold text-white">No Active Engagements Yet</h2>
        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
          Commission a creator from the Discovery Grid or publish a Campaign Brief to launch your first end-to-end engagement lifecycle.
        </p>
        <button
          onClick={onNavigateToBriefs}
          className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors"
        >
          Explore Campaign Briefs
        </button>
      </div>
    );
  }

  const latestDeliveryCheck = selectedVersion?.latestCheckResult || (deliveryChecks.find(c => c.versionId === selectedVersion?.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
              ENGAGEMENT LIFECYCLE WORKSPACE
            </span>
            <span className="text-xs text-zinc-500">• Role Mode: <strong className="text-zinc-300 uppercase">{activeRole}</strong></span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {selectedEngagement?.projectTitle || 'Production Engagement'}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Managing deliverables, immutable draft revisions, licensing verification, and physical file inspection.
          </p>
        </div>

        {/* Engagement Selector Dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={selectedEngagement?.id || ''}
            onChange={(e) => {
              const eng = engagements.find(item => item.id === e.target.value);
              if (eng) {
                setSelectedEngagement(eng);
                loadEngagementDetails(eng.id);
              }
            }}
            className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-zinc-700"
          >
            {engagements.map(eng => (
              <option key={eng.id} value={eng.id}>
                {eng.projectTitle} ({eng.status})
              </option>
            ))}
          </select>

          <button
            onClick={() => selectedEngagement && loadEngagementDetails(selectedEngagement.id)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Refresh Workspace State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {selectedEngagement && (
        <>
          {/* Status Pipeline & Key Metrics Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Status Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-zinc-500">Lifecycle Stage</span>
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${getStatusBadge(selectedEngagement.status)}`}>
                  {selectedEngagement.status}
                </span>
                <Clock className="w-4 h-4 text-zinc-500" />
              </div>
              <p className="text-[11px] text-zinc-400">
                Current active state machine phase.
              </p>
            </div>

            {/* Licensing Gate Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-zinc-500">Licensing Compatibility</span>
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${getLicensingBadge(selectedEngagement.licensingStatus)}`}>
                  {selectedEngagement.licensingStatus}
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-zinc-400">
                {selectedEngagement.licensingStatus === 'COMPATIBLE'
                  ? 'Worldwide Commercial Buyout cleared.'
                  : (selectedEngagement.licensingStatus === 'MISMATCH' ? 'Conflicts detected in territory/duration.' : 'Declared rights require confirmation.')}
              </p>
            </div>

            {/* Budget & Escrow Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-zinc-500">Budget & Escrow</span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white font-mono">
                  {selectedEngagement.proposedBudget}
                </span>
                <Award className="w-4 h-4 text-zinc-400" />
              </div>
              <p className="text-[11px] text-zinc-400">
                Protected via milestone release protocol.
              </p>
            </div>

            {/* Revision Allowance Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-zinc-500">Revisions Used</span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white font-mono">
                  {selectedEngagement.revisionsUsed} / {selectedEngagement.maxRevisions} Rounds
                </span>
                <FileVideo className="w-4 h-4 text-zinc-400" />
              </div>
              <p className="text-[11px] text-zinc-400">
                Immutable drafts submitted: {selectedEngagement.currentVersionNumber}.
              </p>
            </div>

          </div>

          {/* Interactive Role-Based Action Bar */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-750 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-semibold text-white">Next Action Required:</span>
              <span className="text-xs text-zinc-400">
                {selectedEngagement.status === 'CONTACTED' && activeRole === 'creator' && 'Review commission proposal and accept or decline.'}
                {selectedEngagement.status === 'CONTACTED' && activeRole === 'brand' && 'Waiting for creator acceptance.'}
                {selectedEngagement.status === 'CREATOR_ACCEPTED' && 'Confirm formal scope and licensing agreement.'}
                {selectedEngagement.status === 'IN_PRODUCTION' && activeRole === 'creator' && 'Upload Draft Version 1 asset for review.'}
                {selectedEngagement.status === 'IN_PRODUCTION' && activeRole === 'brand' && 'Creator is currently producing initial generative keyframes.'}
                {selectedEngagement.status === 'DRAFT_SUBMITTED' && activeRole === 'brand' && 'Inspect automated delivery checks and provide version feedback or approve.'}
                {selectedEngagement.status === 'REVISION_REQUESTED' && activeRole === 'creator' && 'Review brand feedback comments and upload revised cut.'}
                {selectedEngagement.status === 'FINAL_REVIEW' && activeRole === 'brand' && 'Sign off on final deliverable approval.'}
                {selectedEngagement.status === 'DELIVERY_APPROVED' && 'Deliverable approved! Release escrow to complete engagement.'}
                {selectedEngagement.status === 'COMPLETED' && 'Engagement is fully completed and sealed in the audit log.'}
                {selectedEngagement.status === 'CREATOR_DECLINED' && `Creator declined: "${selectedEngagement.declineReason || 'Schedule conflict'}".`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Creator: Accept / Decline Inquiry */}
              {selectedEngagement.status === 'CONTACTED' && activeRole === 'creator' && (
                <>
                  <button
                    onClick={() => handleTransition('CREATOR_ACCEPTED')}
                    disabled={isActionLoading}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Accept Commission</span>
                  </button>
                  <button
                    onClick={() => setDeclineModalOpen(true)}
                    disabled={isActionLoading}
                    className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-red-400 hover:bg-red-950/30 text-xs transition-colors"
                  >
                    Decline
                  </button>
                </>
              )}

              {/* Brand or mutual: Confirm Scope & Licensing */}
              {(selectedEngagement.status === 'CREATOR_ACCEPTED' || selectedEngagement.status === 'SCOPE_CONFIRMATION' || selectedEngagement.status === 'LICENSING_REVIEW') && (
                <button
                  onClick={handleConfirmAgreement}
                  disabled={isActionLoading || selectedEngagement.licensingStatus === 'MISMATCH'}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
                  title={selectedEngagement.licensingStatus === 'MISMATCH' ? 'Resolve licensing mismatch first' : ''}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Lock Agreement & Start Production</span>
                </button>
              )}

              {/* Creator: Upload Draft Asset */}
              {(selectedEngagement.status === 'IN_PRODUCTION' || selectedEngagement.status === 'REVISION_IN_PROGRESS') && (
                <button
                  onClick={() => setUploadModalOpen(true)}
                  disabled={isActionLoading}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-lg"
                >
                  <Upload className="w-4 h-4 text-zinc-900" />
                  <span>Submit Draft Version {selectedEngagement.currentVersionNumber + 1}</span>
                </button>
              )}

              {/* Brand: Request Revision or Move to Final Review */}
              {selectedEngagement.status === 'DRAFT_SUBMITTED' && activeRole === 'brand' && (
                <>
                  <button
                    onClick={() => handleTransition('REVISION_REQUESTED')}
                    disabled={isActionLoading || (selectedEngagement.revisionsUsed >= selectedEngagement.maxRevisions)}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs border border-zinc-700 transition-colors disabled:opacity-40"
                  >
                    Request Revision Round
                  </button>
                  <button
                    onClick={() => handleTransition('FINAL_REVIEW')}
                    disabled={isActionLoading}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors"
                  >
                    Queue for Final Approval
                  </button>
                </>
              )}

              {/* Brand: Approve Final Delivery */}
              {selectedEngagement.status === 'FINAL_REVIEW' && activeRole === 'brand' && (
                <button
                  onClick={() => handleTransition('DELIVERY_APPROVED')}
                  disabled={isActionLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Final Delivery</span>
                </button>
              )}

              {/* Complete Engagement */}
              {selectedEngagement.status === 'DELIVERY_APPROVED' && (
                <button
                  onClick={() => handleTransition('COMPLETED')}
                  disabled={isActionLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Award className="w-4 h-4" />
                  <span>Release Escrow & Complete</span>
                </button>
              )}
            </div>
          </div>

          {/* Main 2-Column Content: Left Versions & Inspection, Right Feedback & Agreed Scope */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 Cols: Draft Version Browser & Physical Delivery Checks */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Version Selector Tabs */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileVideo className="w-4 h-4 text-zinc-400" />
                    <h3 className="font-semibold text-white text-sm">Immutable Draft Versions</h3>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {versions.length} Version(s) on File
                  </span>
                </div>

                {versions.length > 0 ? (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {versions.map((ver) => (
                      <button
                        key={ver.id}
                        onClick={() => setSelectedVersion(ver)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                          selectedVersion?.id === ver.id
                            ? 'bg-white text-zinc-950 shadow-md'
                            : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span>Version {ver.versionNumber}</span>
                        {ver.latestCheckResult && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            ver.latestCheckResult.overallStatus === 'PASS' ? 'bg-emerald-500/20 text-emerald-700' : 'bg-red-500/20 text-red-700'
                          }`}>
                            {ver.latestCheckResult.overallStatus}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-zinc-500">
                    No drafts uploaded yet. Awaiting Creator draft submission.
                  </div>
                )}

                {/* Selected Version Metadata Card */}
                {selectedVersion && (
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Asset File</span>
                        <span className="font-mono text-zinc-200">{selectedVersion.fileName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-500 block text-[10px]">Submitted By</span>
                        <span className="text-zinc-300">{selectedVersion.uploaderName}</span>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-400 border-t border-zinc-850 pt-2.5">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-0.5">Creator Generation Notes:</span>
                      <p className="italic text-zinc-300 font-sans leading-relaxed">
                        &quot;{selectedVersion.generationNotes}&quot;
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono border-t border-zinc-850 pt-2">
                      <span>SHA-256: {selectedVersion.fileChecksum.substring(0, 18)}...</span>
                      <span>Size: {(selectedVersion.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Physical Delivery Check Engine Output */}
              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="font-semibold text-white text-sm">Physical Media Delivery Checker</h3>
                      <p className="text-[11px] text-zinc-400">Automated inspection of binary headers, container duration, and aspect ratio.</p>
                    </div>
                  </div>

                  {latestDeliveryCheck && (
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${getCheckBadge(latestDeliveryCheck.overallStatus)}`}>
                      {latestDeliveryCheck.overallStatus}
                    </span>
                  )}
                </div>

                {latestDeliveryCheck ? (
                  <div className="space-y-3">
                    {/* Guidance alert */}
                    {latestDeliveryCheck.overallStatus === 'FAIL' ? (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-300">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Technical Validation Failed:</strong> {latestDeliveryCheck.actionableGuidance}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2 text-xs text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Container Verified:</strong> {latestDeliveryCheck.actionableGuidance}
                        </div>
                      </div>
                    )}

                    {/* Table of itemized checks */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800">
                        <thead className="bg-zinc-950 font-mono text-zinc-400 text-[10px] uppercase">
                          <tr>
                            <th className="p-2.5">Check Parameter</th>
                            <th className="p-2.5">Requirement</th>
                            <th className="p-2.5">Actual Measured</th>
                            <th className="p-2.5">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-850 bg-zinc-900/40">
                          {latestDeliveryCheck.checks.map(chk => (
                            <tr key={chk.id} className="hover:bg-zinc-800/40 transition-colors">
                              <td className="p-2.5 font-medium text-white">{chk.name}</td>
                              <td className="p-2.5 text-zinc-400 font-mono">{chk.requirement}</td>
                              <td className="p-2.5 text-zinc-300 font-mono">{chk.actual}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getCheckBadge(chk.status)}`}>
                                  {chk.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic p-4 text-center">
                    Select a draft version above to inspect physical container metrics.
                  </p>
                )}
              </div>

              {/* Chronological Audit Log */}
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                    Chronological Audit Trail
                  </span>
                  <span className="text-xs text-zinc-500">{auditLogs.length} Events</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="font-mono text-zinc-200">{log.action}</span>
                        <span className="text-zinc-500">by {log.actorName} ({log.actorRole})</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right 5 Cols: Version Feedback & Confirmed Licensing Scope */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Confirmed Scope & Agreed Licensing Card */}
              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <h3 className="font-semibold text-white text-sm">Confirmed Terms & Scope</h3>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">Audited Contract</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-zinc-850">
                    <span className="text-zinc-500">Project Master:</span>
                    <span className="font-medium text-white">{selectedEngagement.projectTitle}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-850">
                    <span className="text-zinc-500">Brand:</span>
                    <span className="text-zinc-300">{selectedEngagement.brandName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-850">
                    <span className="text-zinc-500">Creator Director:</span>
                    <span className="text-zinc-300">{selectedEngagement.creatorName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-850">
                    <span className="text-zinc-500">Confirmed Rights:</span>
                    <span className="text-emerald-400 font-semibold">Worldwide Commercial Buyout</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-850">
                    <span className="text-zinc-500">Distribution:</span>
                    <span className="text-zinc-300">Paid Advertising & Organic Social</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-850">
                    <span className="text-zinc-500">Duration:</span>
                    <span className="text-zinc-300">12 Months (with Renewal Option)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Milestones:</span>
                    <span className="font-mono text-zinc-300">{(selectedEngagement.milestones?.length || 0)} Phases (50% / 50%)</span>
                  </div>
                </div>
              </div>

              {/* Version-Anchored Feedback Box */}
              <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-zinc-400" />
                    <h3 className="font-semibold text-white text-sm">
                      Version Feedback ({selectedVersion ? `V${selectedVersion.versionNumber}` : 'Draft'})
                    </h3>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {feedbackList.filter(f => f.versionId === selectedVersion?.id).length} Item(s)
                  </span>
                </div>

                {/* Feedback List */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {feedbackList
                    .filter(f => !selectedVersion || f.versionId === selectedVersion.id)
                    .map((item) => (
                      <div key={item.id} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{item.authorName}</span>
                            {item.timestampOffset !== undefined && (
                              <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
                                at {item.timestampOffset}s
                              </span>
                            )}
                          </div>
                          
                          {item.resolved ? (
                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Resolved
                            </span>
                          ) : (
                            activeRole === 'creator' && (
                              <button
                                onClick={() => handleResolveFeedback(item.id)}
                                className="text-[10px] font-mono text-blue-400 hover:text-blue-300 underline"
                              >
                                Mark Resolved
                              </button>
                            )
                          )}
                        </div>

                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {item.comment}
                        </p>
                      </div>
                    ))}

                  {feedbackList.filter(f => !selectedVersion || f.versionId === selectedVersion.id).length === 0 && (
                    <p className="text-xs text-zinc-500 italic p-3 text-center">
                      No feedback comments on this version.
                    </p>
                  )}
                </div>

                {/* Add Feedback Input (Brand role) */}
                {selectedVersion && (
                  <form onSubmit={handleAddFeedback} className="pt-2 border-t border-zinc-800 space-y-3">
                    <div className="flex gap-2">
                      <div className="w-24">
                        <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1">Timestamp</label>
                        <input
                          type="number"
                          step="0.5"
                          value={newFeedbackOffset}
                          onChange={(e) => setNewFeedbackOffset(e.target.value)}
                          placeholder="e.g. 12"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-zinc-700"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase font-mono text-zinc-500 mb-1">Review Critique</label>
                        <input
                          type="text"
                          value={newFeedbackComment}
                          onChange={(e) => setNewFeedbackComment(e.target.value)}
                          placeholder="e.g. Trim duration to 15s or adjust lighting..."
                          className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-700"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Post Version Feedback</span>
                    </button>
                  </form>
                )}

              </div>

            </div>

          </div>
        </>
      )}

      {/* Upload Draft Version Modal */}
      {uploadModalOpen && selectedEngagement && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-750 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-semibold text-white text-base">
                  Submit Draft Version {selectedEngagement.currentVersionNumber + 1}
                </h3>
                <p className="text-xs text-zinc-400">Delivering media cut for technical inspection and brand review.</p>
              </div>
              <button onClick={() => setUploadModalOpen(false)} className="text-zinc-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDraft} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Target Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['9:16', '16:9', '1:1'] as const).map(r => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setDraftRatio(r)}
                      className={`py-2 rounded-xl text-xs font-mono font-semibold border ${
                        draftRatio === r ? 'bg-white text-zinc-950 border-white' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {r} {r === '9:16' && '(Vertical)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Duration (Seconds)</label>
                <input
                  type="number"
                  value={draftDuration}
                  onChange={(e) => setDraftDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Workflow & Generation Notes</label>
                <textarea
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  placeholder="Describe models used (Veo, Kling, Sora), seed lock parameters, prompt iterations..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                  required
                />
              </div>

              {/* Demo test toggle: Simulate Spec Violation */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-zinc-200 block">Simulate Delivery Violation (QA Test)</span>
                  <span className="text-[11px] text-zinc-500">Submits 16:9 / 30s asset to test automated checker failure.</span>
                </div>
                <input
                  type="checkbox"
                  checked={simulateSpecError}
                  onChange={(e) => setSimulateSpecError(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isActionLoading ? 'Inspecting & Uploading...' : 'Upload & Run Delivery Check'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decline Engagement Modal */}
      {declineModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-750 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-semibold text-white text-base">Decline Engagement Proposal</h3>
            <p className="text-xs text-zinc-400">Please provide a reason for declining this campaign commission.</p>

            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. Schedule conflict with upcoming feature film or licensing scope mismatch..."
              rows={3}
              className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeclineModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleTransition('CREATOR_DECLINED', { declineReason });
                  setDeclineModalOpen(false);
                }}
                disabled={!declineReason.trim()}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs disabled:opacity-50"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
