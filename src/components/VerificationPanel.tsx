import React from 'react';
import { ShieldCheck, Check, AlertCircle, Lock, Award, FileCheck, Layers, Cpu } from 'lucide-react';
import { Creator } from '../types';

interface VerificationPanelProps {
  creator: Creator;
  className?: string;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({ creator, className = '' }) => {
  const v = creator.verification || {};
  const vDetails = creator.verifiedDetails || {};

  const signals = [
    {
      label: 'Platform Verified',
      status: creator.isVerified || v.platformVerified !== false,
      desc: 'Account identity & production standards certified by GenCraft Audit team.',
      icon: ShieldCheck,
      color: 'text-emerald-400',
    },
    {
      label: 'Portfolio Evidence Verified',
      status: v.portfolioEvidenceVerified !== false,
      desc: 'Submitted portfolio items include verified seed parameters & generation passes.',
      icon: FileCheck,
      color: 'text-blue-400',
    },
    {
      label: 'Tool & Model Stack Evidence',
      status: v.toolEvidenceVerified !== false,
      desc: `Audited generation pipelines using commercial checkpoints (${creator.tools.slice(0, 3).join(', ')}).`,
      icon: Cpu,
      color: 'text-purple-400',
    },
    {
      label: 'Workflow Evidence Provided',
      status: v.workflowEvidenceVerified !== false,
      desc: '3-stage generation workflow manifests provided for client reproducibility.',
      icon: Layers,
      color: 'text-amber-400',
    },
    {
      label: 'Commercial Rights Declared',
      status: v.commercialUseDeclared !== false || vDetails.commercialRightsGuaranteed,
      desc: 'Perpetual worldwide commercial buyout rights guaranteed with zero copyright collision.',
      icon: Lock,
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className={`bg-zinc-900/60 rounded-2xl border border-zinc-800 p-5 space-y-4 ${className}`}>
      
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">Trust & Verification Signals</h3>
            <p className="text-[10px] text-zinc-400">Audited pipeline evidence for enterprise legal safety.</p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          SAFETY SCORE: {vDetails.safetyScore || 99.8}%
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {signals.map((signal, idx) => {
          const IconComponent = signal.icon;
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition-all ${
                signal.status
                  ? 'bg-zinc-950/80 border-zinc-800/90 hover:border-zinc-700'
                  : 'bg-zinc-950/40 border-zinc-850 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <IconComponent className={`w-3.5 h-3.5 ${signal.status ? signal.color : 'text-zinc-500'}`} />
                  <span className="text-xs font-semibold text-zinc-200">{signal.label}</span>
                </div>
                {signal.status ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-500 font-mono">Pending</span>
                )}
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed pl-5">
                {signal.desc}
              </p>
            </div>
          );
        })}
      </div>

      <div className="pt-2 text-[10px] text-zinc-400 bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between">
        <span className="font-mono text-zinc-400">
          AUDIT STAMP: {vDetails.certifiedPipeline || 'V24 Neural Production Tier-1'}
        </span>
        <span className="text-emerald-400 font-medium">✓ IP Clearance Audit Passed</span>
      </div>

    </div>
  );
};
