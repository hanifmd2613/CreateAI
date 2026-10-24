'use client';

import React, { useState } from 'react';
import { Creator, Brief } from '../types';
import { 
  X, 
  ShieldCheck, 
  Send
} from 'lucide-react';

interface HireModalProps {
  creator: Creator;
  briefs: Brief[];
  currentUser?: import('../types').UserAccount | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const HireModal: React.FC<HireModalProps> = ({
  creator,
  briefs,
  currentUser = null,
  onClose,
  onSuccess,
}) => {
  const [selectedBriefId, setSelectedBriefId] = useState<string>(briefs[0]?.id || 'custom');
  const [customTitle, setCustomTitle] = useState('');
  const [customBudget, setCustomBudget] = useState(`₹${(creator.hourlyRate * 20).toLocaleString('en-IN')}`);
  const [projectMessage, setProjectMessage] = useState(`Hi ${creator.name}, we would like to commission you for an upcoming commercial campaign using ${creator.tools[0]}.`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const activeBrief = briefs.find(b => b.id === selectedBriefId);
      const title = selectedBriefId === 'custom' ? (customTitle || 'Direct Commission') : (activeBrief?.title || 'Commercial Campaign');
      const budget = selectedBriefId === 'custom' ? customBudget : (activeBrief?.budget || customBudget);

      const resolvedBrandId = currentUser?.id || 'user-brand-kaveri';
      const resolvedBrandName = currentUser?.companyName || currentUser?.name || 'Kaveri Creative Studios';

      const res = await fetch('/api/engagements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefId: selectedBriefId === 'custom' ? undefined : selectedBriefId,
          creatorId: creator.id,
          brandId: resolvedBrandId,
          brandName: resolvedBrandName,
          brandAvatar: currentUser?.avatar,
          creatorName: creator.name,
          creatorAvatar: creator.avatar,
          projectTitle: title,
          budget,
          initialMessage: projectMessage,
        })
      });

      if (res.ok) {
        // If an existing brief was assigned, update the brief record with the assigned creator
        if (selectedBriefId && selectedBriefId !== 'custom') {
          try {
            await fetch(`/api/briefs/${selectedBriefId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                assignedCreatorId: creator.id,
                assignedCreatorName: creator.name,
                status: 'Assigned',
              }),
            });
          } catch (patchErr) {
            console.warn('Brief assignment PATCH warning:', patchErr);
          }
        }

        onSuccess(`Commission offer sent to ${creator.name}! Engagement initiated in Workspace.`);
        onClose();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error?.message || 'Failed to submit commission proposal to creator.');
      }
    } catch (err: any) {
      alert(`Network error submitting proposal: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div 
        onMouseMove={handleModalMouseMove}
        className="bg-zinc-900 rounded-2xl max-w-lg w-full border border-zinc-800 shadow-2xl overflow-hidden section-glow"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <div className="flex items-center gap-3">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-10 h-10 rounded-xl object-cover border border-zinc-700 bg-zinc-950"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-white text-sm">Commission {creator.name}</h3>
                {creator.isVerified && (
                  <span title="Audited Pipeline">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">{creator.specialization}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Rate & Escrow Banner */}
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-zinc-500 text-[10px] block">Rate</span>
              <span className="font-semibold text-white text-sm">₹{creator.hourlyRate.toLocaleString('en-IN')}/hr</span>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 text-[10px] block">Commercial IP</span>
              <span className="font-medium text-emerald-400 flex items-center gap-1 justify-end">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Protected
              </span>
            </div>
          </div>

          {/* Select Existing Brief or Custom */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
              Select Campaign Brief
            </label>
            <select
              value={selectedBriefId}
              onChange={(e) => setSelectedBriefId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-800 text-xs font-medium text-zinc-200 bg-zinc-950 focus:outline-none focus:border-zinc-600"
            >
              {briefs.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.budget})
                </option>
              ))}
              <option value="custom">+ Create Direct Project Scope</option>
            </select>
          </div>

          {selectedBriefId === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. 15s Commercial Loop"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs focus:outline-none focus:border-zinc-600"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">
                  Offer Budget
                </label>
                <input
                  type="text"
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value)}
                  placeholder="₹1,80,000"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs font-medium focus:outline-none focus:border-zinc-600"
                  required
                />
              </div>
            </div>
          )}

          {/* Message / Scope */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
              Project Brief & Notes
            </label>
            <textarea
              value={projectMessage}
              onChange={(e) => setProjectMessage(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-200 leading-relaxed focus:outline-none focus:border-zinc-600"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Transmitting...' : 'Send Commission Offer'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
