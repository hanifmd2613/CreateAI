'use client';

import React from 'react';
import { PlatformAnalytics } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Users, 
  FileCheck,
  Scale,
  Zap,
  ArrowUpRight
} from 'lucide-react';

interface AnalyticsDashboardViewProps {
  analytics: PlatformAnalytics;
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({ analytics }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Hero Header */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Product Performance Telemetry</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400 font-mono text-[11px]">Audit Engine v2.4</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Platform Efficiency &amp; Business Value Analytics
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Measurable creator sourcing, commercial clearance velocity, and quality compliance metrics comparing automated GenCraft workflows against traditional agency procurement.
        </p>
      </div>

      {/* Top 4 Key Efficiency Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Time to Shortlist */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Avg Shortlist Time</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {analytics.avgShortlistTimeHours} <span className="text-sm font-normal text-zinc-500">hours</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>95% faster than manual agency search (28 hrs)</span>
          </div>
        </div>

        {/* Metric 2: Rights Conflicts Prevented */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Rights Conflicts Caught</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 tracking-tight">
            {analytics.rightsConflictsPrevented}
          </div>
          <div className="text-[11px] text-zinc-400 font-medium">
            Pre-contract copyright &amp; territory mismatches intercepted
          </div>
        </div>

        {/* Metric 3: Technical Validation Pass Rate */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Delivery Validation Pass</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {analytics.deliveryValidationPassRatePct}%
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Aspect ratio &amp; duration verified by agent</span>
          </div>
        </div>

        {/* Metric 4: Average Revision Cycles */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Avg Revision Rounds</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {analytics.avgRevisionRounds} <span className="text-sm font-normal text-zinc-500">rounds</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            Down from 3.8 rounds via deterministic seed locks
          </div>
        </div>

      </div>

      {/* Deep-Dive Sourcing and Conversion Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sourcing Conversion Funnel */}
        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-5 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Sourcing &amp; Match Funnel Conversion</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1 text-zinc-300">
                <span>Match Recommendation Acceptance</span>
                <span className="font-bold text-white">{analytics.matchAcceptanceRatePct}%</span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${analytics.matchAcceptanceRatePct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-zinc-300">
                <span>Creator Invitation Response Rate</span>
                <span className="font-bold text-white">{analytics.creatorResponseRatePct}%</span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${analytics.creatorResponseRatePct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-zinc-300">
                <span>Shortlist-to-Engagement Conversion</span>
                <span className="font-bold text-white">{analytics.shortlistToEngagementPct}%</span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-400 h-full rounded-full" style={{ width: `${analytics.shortlistToEngagementPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-zinc-300">
                <span>Total Campaign Completion Rate</span>
                <span className="font-bold text-white">{analytics.campaignCompletionRatePct}%</span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full" style={{ width: `${analytics.campaignCompletionRatePct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Pilot Benchmark Comparison */}
        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-400" />
            <span>Pilot Benchmark: Manual vs. GenCraft Platform</span>
          </h3>

          <div className="rounded-xl border border-zinc-800 overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 text-[10px] font-mono uppercase text-zinc-400 border-b border-zinc-800">
                  <th className="p-2.5">Workflow Phase</th>
                  <th className="p-2.5">Traditional Agency</th>
                  <th className="p-2.5 text-emerald-400">GenCraft Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                <tr>
                  <td className="p-2.5 font-semibold text-zinc-300">Creator Shortlisting</td>
                  <td className="p-2.5 text-zinc-400">3 - 5 business days</td>
                  <td className="p-2.5 font-bold text-emerald-400">Under 90 minutes (AI Agent)</td>
                </tr>
                <tr className="bg-zinc-950/40">
                  <td className="p-2.5 font-semibold text-zinc-300">Rights &amp; IP Clearance</td>
                  <td className="p-2.5 text-rose-400">Manual email back-and-forth</td>
                  <td className="p-2.5 font-bold text-emerald-400">Automated pre-flight check</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-zinc-300">Draft Revision Rounds</td>
                  <td className="p-2.5 text-zinc-400">3 to 4 rounds avg</td>
                  <td className="p-2.5 font-bold text-emerald-400">1.2 rounds (Seed Locking)</td>
                </tr>
                <tr className="bg-zinc-950/40">
                  <td className="p-2.5 font-semibold text-zinc-300">Format QC Validation</td>
                  <td className="p-2.5 text-zinc-400">Manual review after delivery</td>
                  <td className="p-2.5 font-bold text-emerald-400">Instant metadata agent check</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400">
            <strong>Pilot Evaluation Summary:</strong> Enables brands to pilot with 3–5 creators with zero infrastructure setup and measured ROI validation.
          </div>
        </div>

      </div>

    </div>
  );
};
