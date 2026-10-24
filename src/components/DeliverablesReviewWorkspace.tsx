'use client';

import React, { useState } from 'react';
import { 
  Brief, 
  CampaignDeliverable, 
  DeliverableVersion, 
  VersionComment,
  ValidationRunResult
} from '../types';
import { validateDeliverableFile, extractBrowserMediaMetadata, MediaMetadata } from '../utils/validationEngine';
import { 
  FileVideo, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Upload, 
  MessageSquare, 
  Check, 
  RefreshCw, 
  Send, 
  ShieldCheck, 
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  History,
  FileText
} from 'lucide-react';

interface DeliverablesReviewWorkspaceProps {
  brief: Brief;
  deliverables: CampaignDeliverable[];
  onUpdateDeliverables: (updated: CampaignDeliverable[]) => void;
  currentUserRole: 'brand' | 'creator';
  currentUserName: string;
}

export const DeliverablesReviewWorkspace: React.FC<DeliverablesReviewWorkspaceProps> = ({
  brief,
  deliverables,
  onUpdateDeliverables,
  currentUserRole,
  currentUserName
}) => {
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string>(
    deliverables[0]?.id || ''
  );
  const [selectedVersionNum, setSelectedVersionNum] = useState<number>(() => {
    return deliverables[0]?.currentVersionNumber || 1;
  });

  // Comment & Revision Form State
  const [commentText, setCommentText] = useState('');
  const [timecodeSec, setTimecodeSec] = useState<string>('');
  const [isRevisionRequestCheck, setIsRevisionRequestCheck] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [changelogNote, setChangelogNote] = useState('');

  const currentDeliverable = deliverables.find(d => d.id === selectedDeliverableId) || deliverables[0];
  const activeVersion = currentDeliverable?.versions.find(v => v.versionNumber === selectedVersionNum) ||
                        currentDeliverable?.versions[currentDeliverable.versions.length - 1];

  const spec = brief.deliverableSpecs[0] || {
    id: 'spec-default',
    title: '15s Vertical Video',
    format: 'MP4',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    targetDurationSeconds: 15,
    durationToleranceSeconds: 1.5,
    maxFileSizeBytes: 50 * 1024 * 1024,
    requiredVariantsCount: 1,
    isStrict: true
  };

  // Add a version-specific feedback comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentDeliverable || !activeVersion) return;

    const newComment: VersionComment = {
      id: `comm-${Date.now()}`,
      authorName: currentUserName,
      authorRole: currentUserRole,
      timestamp: 'Just now',
      text: commentText.trim(),
      timecodeSeconds: timecodeSec ? parseFloat(timecodeSec) : undefined,
      isRevisionRequest: isRevisionRequestCheck
    };

    const updatedDeliverables = deliverables.map(d => {
      if (d.id !== currentDeliverable.id) return d;

      const updatedVersions = d.versions.map(v => {
        if (v.versionNumber !== activeVersion.versionNumber) return v;
        return {
          ...v,
          comments: [...v.comments, newComment]
        };
      });

      return {
        ...d,
        status: isRevisionRequestCheck ? 'changes_requested' as const : d.status,
        versions: updatedVersions
      };
    });

    onUpdateDeliverables(updatedDeliverables);
    setCommentText('');
    setTimecodeSec('');
    setIsRevisionRequestCheck(false);
  };

  // Upload or Resubmit a New Revision (Preserving previous versions!)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentDeliverable) return;

    setIsUploading(true);

    try {
      // 1. Inspect real browser metadata
      const meta: MediaMetadata = await extractBrowserMediaMetadata(file);

      // 2. Run automated delivery validation check
      const validationRun: ValidationRunResult = validateDeliverableFile(spec, meta);

      // 3. Create new Version (v + 1)
      const nextVersionNum = currentDeliverable.versions.length + 1;
      const newVersion: DeliverableVersion = {
        versionNumber: nextVersionNum,
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileSizeBytes: file.size,
        fileType: file.type || 'video/mp4',
        dimensions: meta.width && meta.height ? { width: meta.width, height: meta.height } : { width: 1080, height: 1920 },
        durationSeconds: meta.durationSeconds || 15.0,
        aspectRatioDetected: meta.width && meta.height ? (meta.width < meta.height ? '9:16' : '16:9') : '9:16',
        submittedAt: 'Just now',
        submittedBy: currentUserName,
        changelog: changelogNote.trim() || `Version ${nextVersionNum} submission uploaded by ${currentUserName}.`,
        comments: [],
        validationRun
      };

      const updatedDeliverables = deliverables.map(d => {
        if (d.id !== currentDeliverable.id) return d;
        return {
          ...d,
          currentVersionNumber: nextVersionNum,
          status: 'resubmitted' as const,
          versions: [...d.versions, newVersion]
        };
      });

      onUpdateDeliverables(updatedDeliverables);
      setSelectedVersionNum(nextVersionNum);
      setChangelogNote('');
    } catch (err) {
      console.error('File validation failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Brand Approves Deliverable
  const handleApproveDeliverable = () => {
    if (!currentDeliverable) return;
    const updatedDeliverables = deliverables.map(d => {
      if (d.id !== currentDeliverable.id) return d;
      return {
        ...d,
        status: 'approved' as const
      };
    });
    onUpdateDeliverables(updatedDeliverables);
  };

  if (!currentDeliverable || !activeVersion) {
    return (
      <div className="p-8 text-center bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-400">
        No deliverables registered for this campaign yet.
      </div>
    );
  }

  const validation = activeVersion.validationRun;

  return (
    <div className="space-y-6">
      
      {/* Deliverable Header & Status Pill */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
              Deliverable #{currentDeliverable.id.split('-').pop()}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400">{brief.title}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>{currentDeliverable.title}</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide border ${
              currentDeliverable.status === 'approved'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : currentDeliverable.status === 'changes_requested'
                ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                : 'bg-blue-950/80 text-blue-300 border-blue-500/40'
            }`}>
              {currentDeliverable.status.replace('_', ' ')}
            </span>
          </h2>
        </div>

        {/* Brand Approval Action Button */}
        {currentUserRole === 'brand' && currentDeliverable.status !== 'approved' && (
          <button
            onClick={handleApproveDeliverable}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve Deliverable</span>
          </button>
        )}
      </div>

      {/* Main Review Grid: Media Preview + Version History + Validation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Media Player Preview + Timecode Feedback */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Version Selector Tabs */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-mono uppercase text-zinc-500 px-2 flex items-center gap-1">
                <History className="w-3.5 h-3.5" />
                <span>Versions:</span>
              </span>
              {currentDeliverable.versions.map(v => (
                <button
                  key={v.versionNumber}
                  onClick={() => setSelectedVersionNum(v.versionNumber)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    v.versionNumber === activeVersion.versionNumber
                      ? 'bg-white text-zinc-950 shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  v{v.versionNumber} {v.versionNumber === currentDeliverable.currentVersionNumber && '(Latest)'}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline-block pr-2">
              Submitted: {activeVersion.submittedAt}
            </span>
          </div>

          {/* Media Player Card */}
          <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl relative group">
            <div className="aspect-[9/16] max-h-[500px] w-full bg-zinc-900 flex items-center justify-center relative mx-auto">
              <img
                src={activeVersion.fileUrl}
                alt={activeVersion.fileName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-white border border-white/10">
                  {activeVersion.dimensions ? `${activeVersion.dimensions.width}×${activeVersion.dimensions.height}` : '1080×1920'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                  {activeVersion.durationSeconds ? `${activeVersion.durationSeconds}s` : '15.0s'}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                <div>
                  <span className="font-semibold block">{activeVersion.fileName}</span>
                  <span className="text-[11px] text-zinc-400">By {activeVersion.submittedBy}</span>
                </div>
                <span className="font-mono text-[11px] text-zinc-400">
                  {(activeVersion.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>
            </div>

            {/* Version Changelog Banner */}
            {activeVersion.changelog && (
              <div className="p-3 bg-zinc-900/90 border-t border-zinc-800 text-xs text-zinc-300 flex items-start gap-2">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">v{activeVersion.versionNumber} Changelog:</span> {activeVersion.changelog}
                </div>
              </div>
            )}
          </div>

          {/* Timecoded Feedback Thread for this specific version */}
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Version {activeVersion.versionNumber} Feedback &amp; Revision Log:</span>
              <span className="text-[11px] text-zinc-500">{activeVersion.comments.length} Comments</span>
            </h3>

            {activeVersion.comments.length > 0 ? (
              <div className="space-y-3">
                {activeVersion.comments.map(c => (
                  <div 
                    key={c.id} 
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      c.isRevisionRequest 
                        ? 'bg-rose-950/20 border-rose-900/40 text-rose-200' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{c.authorName}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                          {c.authorRole}
                        </span>
                        {c.timecodeSeconds !== undefined && (
                          <span className="font-mono text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-500/30">
                            ⏱ 00:{c.timecodeSeconds < 10 ? `0${c.timecodeSeconds}` : c.timecodeSeconds}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500">{c.timestamp}</span>
                    </div>

                    <p className="leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic py-2">
                No feedback comments recorded for version {activeVersion.versionNumber} yet.
              </p>
            )}

            {/* Post Feedback Form */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-zinc-800 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={`Leave feedback on v${activeVersion.versionNumber} (e.g. "Sharpen logo reflection")...`}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                />

                <input
                  type="number"
                  min="0"
                  max="60"
                  step="1"
                  value={timecodeSec}
                  onChange={(e) => setTimecodeSec(e.target.value)}
                  placeholder="Sec (e.g. 4)"
                  className="w-24 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                  title="Optional timestamp in seconds"
                />

                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>

              {currentUserRole === 'brand' && (
                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRevisionRequestCheck}
                    onChange={(e) => setIsRevisionRequestCheck(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-rose-500 focus:ring-0"
                  />
                  <span className="text-rose-300 font-medium">Mark as formal Revision Request (Updates status to &ldquo;Changes Requested&rdquo;)</span>
                </label>
              )}
            </form>

          </div>

        </div>

        {/* Right Column (5 cols): Automated Technical Delivery Validation Card */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Automated Delivery Validation Agent Report */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Automated Technical Delivery Agent</h3>
              </div>
              
              {validation && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                  validation.overallStatus === 'pass'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : validation.overallStatus === 'fail'
                    ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                    : 'bg-amber-950 text-amber-300 border-amber-500/40'
                }`}>
                  {validation.overallStatus}
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-400">
              Validating actual video metadata against campaign specification (Format: <strong className="text-zinc-200">{spec.format}</strong>, Aspect Ratio: <strong className="text-zinc-200">{spec.aspectRatio}</strong>, Duration: <strong className="text-zinc-200">{spec.targetDurationSeconds}s</strong>).
            </p>

            {/* Individual Check Results */}
            {validation ? (
              <div className="space-y-2.5">
                {validation.checks.map(chk => (
                  <div
                    key={chk.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      chk.passed
                        ? 'bg-zinc-950/60 border-zinc-800 text-zinc-300'
                        : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        {chk.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                        <span>{chk.name}</span>
                      </span>

                      <span className="font-mono text-[10px] text-zinc-400">
                        {chk.actual} (Req: {chk.expected})
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 pl-5">{chk.message}</p>

                    {chk.correctiveAction && (
                      <div className="pl-5 text-[11px] text-rose-400 font-medium">
                        💡 Remediation: {chk.correctiveAction}
                      </div>
                    )}
                  </div>
                ))}

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400">
                  <strong>Agent Summary:</strong> {validation.summary}
                </div>
              </div>
            ) : (
              <div className="text-xs text-zinc-500 italic p-3">
                No automated validation run recorded for this file yet.
              </div>
            )}
          </div>

          {/* Upload New Revision Box (For Creator or Brand Testing) */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Upload New Revision</h3>
            </div>
            
            <p className="text-xs text-zinc-400">
              Submit a revised master cut. Earlier versions (v1, v2) and previous feedback will be strictly preserved in the revision history.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                value={changelogNote}
                onChange={(e) => setChangelogNote(e.target.value)}
                placeholder="What was changed in this version? (e.g. Sharpened logo typography)"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
              />

              <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 bg-zinc-950/60 transition-colors cursor-pointer text-center">
                <Upload className="w-6 h-6 text-zinc-400 mb-2 group-hover:text-emerald-400" />
                <span className="text-xs font-semibold text-white">
                  {isUploading ? 'Extracting Metadata & Validating...' : 'Select or Drop Revised Video File'}
                </span>
                <span className="text-[10px] text-zinc-500 mt-1">MP4 or MOV • Up to 50MB</span>
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
