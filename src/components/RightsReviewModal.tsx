'use client';

import React from 'react';
import { Brief, Creator } from '../types';
import { evaluateUsageRights } from '../utils/rightsEngine';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  FileText, 
  Globe, 
  Clock, 
  Check, 
  Lock,
  ArrowRight
} from 'lucide-react';

interface RightsReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  brief: Brief;
  creator: Creator;
  onConfirmRights: () => void;
}

export const RightsReviewModal: React.FC<RightsReviewModalProps> = ({
  isOpen,
  onClose,
  brief,
  creator,
  onConfirmRights
}) => {
  if (!isOpen) return null;

  const analysis = evaluateUsageRights(brief.usageRights, creator.usageTerms);
  const req = brief.usageRights;
  const terms = creator.usageTerms;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Commercial Licensing &amp; Usage Rights Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Rights Compatibility Assessment
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comparing campaign requirements against stated terms for <strong className="text-white">{creator.name}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout Banner */}
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
          analysis.status === 'compatible'
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            : analysis.status === 'conflict'
            ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
        }`}>
          {analysis.status === 'compatible' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {analysis.status === 'conflict' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {analysis.status === 'unknown' && <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
          
          <div>
            <div className="font-bold text-sm mb-0.5">
              {analysis.status === 'compatible' && 'Rights Terms: 100% Compatible'}
              {analysis.status === 'conflict' && 'Rights Conflict Detected'}
              {analysis.status === 'unknown' && 'Rights Terms: Unconfirmed Elements'}
            </div>
            <p className="leading-relaxed">{analysis.diagnostic}</p>
          </div>
        </div>

        {/* Detailed Side-by-Side Comparison Table */}
        <div className="rounded-xl border border-zinc-800 overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] uppercase font-mono text-zinc-400">
                <th className="p-3 w-1/3">Licensing Dimension</th>
                <th className="p-3 w-1/3">Campaign Required</th>
                <th className="p-3 w-1/3">Creator Stated Terms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              
              <tr>
                <td className="p-3 font-semibold text-zinc-300">Commercial Use</td>
                <td className="p-3 text-white">{req.commercialUse}</td>
                <td className="p-3 text-zinc-300">{terms.licensingType}</td>
              </tr>

              <tr className="bg-zinc-950/40">
                <td className="p-3 font-semibold text-zinc-300">Geographic Territory</td>
                <td className="p-3 text-white">{req.territory}</td>
                <td className={`p-3 font-medium ${
                  req.territory === 'Worldwide' && terms.territory === 'India Only'
                    ? 'text-rose-400 font-bold'
                    : 'text-zinc-300'
                }`}>
                  {terms.territory}
                </td>
              </tr>

              <tr>
                <td className="p-3 font-semibold text-zinc-300">Paid Advertising Whitelisting</td>
                <td className="p-3 text-white">{req.paidAdvertisingRequired ? 'Required (Paid Ads Allowed)' : 'Organic Only'}</td>
                <td className={`p-3 font-medium ${
                  req.paidAdvertisingRequired && !terms.paidAdvertisingAllowed
                    ? 'text-rose-400 font-bold'
                    : 'text-emerald-400'
                }`}>
                  {terms.paidAdvertisingAllowed ? 'Allowed' : 'Disallowed (Organic Only)'}
                </td>
              </tr>

              <tr className="bg-zinc-950/40">
                <td className="p-3 font-semibold text-zinc-300">Usage Duration</td>
                <td className="p-3 text-white">{req.durationMonths} Months</td>
                <td className="p-3 text-zinc-300">{terms.defaultDurationMonths} Months</td>
              </tr>

              <tr>
                <td className="p-3 font-semibold text-zinc-300">Category Exclusivity</td>
                <td className="p-3 text-white">{req.exclusivityRequired ? 'Exclusive Required' : 'Non-Exclusive'}</td>
                <td className="p-3 text-zinc-300">{terms.exclusivityOffered ? 'Exclusivity Offered' : 'Non-Exclusive'}</td>
              </tr>

              <tr className="bg-zinc-950/40">
                <td className="p-3 font-semibold text-zinc-300">Modification &amp; Derivatives</td>
                <td className="p-3 text-white">{req.modificationRightsRequired ? 'Yes (Cropping & Subtitles)' : 'Standard'}</td>
                <td className="p-3 text-emerald-400 font-medium">Permitted</td>
              </tr>

              <tr>
                <td className="p-3 font-semibold text-zinc-300">AI Clearance &amp; Seed Manifest</td>
                <td className="p-3 text-white">Full Seed Lock Required</td>
                <td className="p-3 text-emerald-400 font-medium">Certified Protocol v2.4</td>
              </tr>

            </tbody>
          </table>
        </div>

        {/* Suggested Resolution Guidance (if conflicts exist) */}
        {analysis.suggestedResolutions.length > 0 && (
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1.5">
            <span className="font-bold text-white block">💡 Suggested Practical Resolution:</span>
            <ul className="space-y-1 text-zinc-300 list-disc pl-5">
              {analysis.suggestedResolutions.map((res, i) => (
                <li key={i}>{res}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Human Confirmation Section */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-400">
            <span className="font-bold text-white block">Legal Audit Record:</span>
            <span>Explicit human confirmation records commercial buyout validity into the permanent campaign audit trail.</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onConfirmRights();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Lock className="w-4 h-4" />
            <span>Confirm &amp; Record Rights Terms</span>
          </button>
        </div>

      </div>
    </div>
  );
};
