'use client';

import React, { useState } from 'react';
import { Creator, PortfolioItem } from '../types';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Star, 
  Bookmark, 
  Share2, 
  Briefcase, 
  Clock, 
  MapPin, 
  Plus, 
  Cpu, 
  CheckCircle2, 
  Layers, 
  Film, 
  Play,
  MessageSquare
} from 'lucide-react';

interface CreatorProfileProps {
  creator: Creator;
  onBack: () => void;
  onSelectPortfolioItem: (creator: Creator, item: PortfolioItem) => void;
  isSaved: boolean;
  onToggleSave: (creatorId: string) => void;
  onHireDirect: (creator: Creator) => void;
  onRequestBriefForCreator: (creator: Creator) => void;
  onOpenChat?: (creator: Creator) => void;
}

export const CreatorProfile: React.FC<CreatorProfileProps> = ({
  creator,
  onBack,
  onSelectPortfolioItem,
  isSaved,
  onToggleSave,
  onHireDirect,
  onRequestBriefForCreator,
  onOpenChat,
}) => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'workflow' | 'reviews' | 'specs'>('portfolio');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'image' | 'audio'>('all');
  const [copiedShare, setCopiedShare] = useState(false);

  const filteredPortfolio = creator.portfolio.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Back Button Bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Creators</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors text-xs font-medium flex items-center gap-1.5"
          >
            <Share2 className="w-3 h-3 text-zinc-400" />
            <span>{copiedShare ? 'Copied' : 'Share'}</span>
          </button>
          
          <button
            onClick={() => onToggleSave(creator.id)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isSaved 
                ? 'border-zinc-700 bg-zinc-800 text-white' 
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-white' : ''}`} />
            <span>{isSaved ? 'Shortlisted' : 'Shortlist'}</span>
          </button>
        </div>
      </div>

      {/* Profile Header Box */}
      <div 
        onMouseMove={handleCardMouseMove}
        className="bg-[#121215] rounded-xl border border-white/10 overflow-hidden mb-8 section-glow relative"
      >
        
        {/* Cover Image */}
        <div className="h-48 sm:h-56 w-full relative bg-zinc-950 overflow-hidden">
          <img
            src={creator.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'}
            alt={creator.name}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent" />
          
          {creator.availableNow && (
            <div className="absolute top-4 right-4 bg-zinc-900/90 border border-zinc-700 text-zinc-200 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Available for Hire</span>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-6 sm:px-8 pb-7 pt-0 relative">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-5 -mt-16 sm:-mt-20 mb-6">
            
            {/* Avatar & Headings */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="relative">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover bg-zinc-900 border-2 border-zinc-800 shadow-lg"
                />
                {creator.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-zinc-900 text-emerald-400 p-1.5 rounded-lg border border-zinc-700" title="Verified AI Workflow">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {creator.name}
                  </h1>
                  <span className="text-xs text-zinc-400 font-mono">
                    {creator.handle}
                  </span>
                </div>

                <p className="text-sm font-medium text-zinc-300 mt-0.5">
                  {creator.specialization}
                </p>

                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-2 flex-wrap font-normal">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    {creator.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 font-medium text-zinc-300">
                    <Star className="w-3.5 h-3.5 fill-zinc-300 text-zinc-300" />
                    {creator.rating} ({creator.reviewCount} reviews)
                  </span>
                  <span>•</span>
                  <span>{creator.completedProjects} campaigns completed</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-2.5 w-full lg:w-auto">
              {onOpenChat && (
                <button
                  onClick={() => onOpenChat(creator)}
                  className="flex-1 lg:flex-initial px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Chat Directly</span>
                </button>
              )}

              <button
                onClick={() => onRequestBriefForCreator(creator)}
                className="flex-1 lg:flex-initial px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium text-xs transition-colors"
              >
                Send Brief
              </button>

              <button
                onClick={() => onHireDirect(creator)}
                className="flex-1 lg:flex-initial px-5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Hire Creator (₹{creator.hourlyRate.toLocaleString('en-IN')}/hr)</span>
              </button>
            </div>

          </div>

          {/* Verified Workflow Seal */}
          {creator.isVerified && (
            <div 
              onMouseMove={handleCardMouseMove}
              className="mb-6 p-4 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 section-glow relative"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-zinc-800 text-emerald-400 shrink-0 mt-0.5 md:mt-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                      Verified AI Workflow Guarantee
                    </h2>
                    <span className="text-[10px] bg-zinc-800 text-emerald-400 font-mono px-2 py-0.2 rounded border border-zinc-700">
                      Audit Score: {creator.verifiedDetails?.safetyScore || 99.8}%
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-2xl">
                    Audited model checkpoints ({creator.verifiedDetails?.certifiedPipeline}) with deterministic seed consistency and full legal commercial buyout rights.
                  </p>
                </div>
              </div>

              <div className="text-left md:text-right shrink-0">
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Compliance</span>
                <span className="text-xs font-semibold text-zinc-200">Commercial Buyout Ready</span>
              </div>
            </div>
          )}

          {/* Bio & Skills Tag Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            
            {/* Bio Column */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                  About & Direction
                </h2>
                <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                  {creator.bio}
                </p>
              </div>

              {/* Skills Tags */}
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Specialized Capabilities
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {creator.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded text-xs font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tools Stack & Stats (Right Column) */}
            <div 
              onMouseMove={handleCardMouseMove}
              className="lg:col-span-5 bg-zinc-900 rounded-xl p-5 border border-zinc-800 space-y-4 section-glow relative"
            >
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 flex items-center justify-between">
                  <span>Model Toolset</span>
                  <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {creator.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-zinc-800 text-zinc-200 border border-zinc-700"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800 text-xs">
                <div>
                  <span className="text-zinc-500 text-[11px] block">Average Turnaround</span>
                  <span className="font-semibold text-zinc-200 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-zinc-400" /> {creator.avgTurnaround}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[11px] block">Standard Hourly Rate</span>
                  <span className="font-semibold text-zinc-200 mt-0.5 block">
                    ₹{creator.hourlyRate.toLocaleString('en-IN')} / hour
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-zinc-800 mb-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-6 shrink-0">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'portfolio'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Portfolio ({creator.portfolio.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'workflow'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Workflow Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Client Reviews ({creator.reviews?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'specs'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Technical Specs</span>
          </button>
        </div>

        {/* Portfolio Type Filter Controls */}
        {activeTab === 'portfolio' && (
          <div className="hidden sm:flex items-center gap-1 pb-2">
            {(['all', 'video', 'image', 'audio'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
                  filterType === t
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab Content 1: Portfolio Grid */}
      {activeTab === 'portfolio' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPortfolio.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectPortfolioItem(creator, item)}
              onMouseMove={handleCardMouseMove}
              className="bg-[#121215] rounded-xl border border-white/10 hover:border-white/30 overflow-hidden transition-all cursor-pointer flex flex-col section-glow relative"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-black/80 text-zinc-300 border border-zinc-800">
                    {item.type}
                  </span>
                  {item.aspectRatio && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/80 text-zinc-400 border border-zinc-800">
                      {item.aspectRatio}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-1 font-mono">
                    {item.specificModel}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                  <span>Client: {item.client || 'Featured'}</span>
                  <span className="text-zinc-300 font-medium hover:underline">Inspect</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 2: Verified AI Workflows */}
      {activeTab === 'workflow' && (
        <div 
          onMouseMove={handleCardMouseMove}
          className="bg-[#121215] rounded-xl border border-white/10 p-6 sm:p-7 space-y-6 section-glow relative"
        >
          <div>
            <h2 className="text-base font-bold text-white">
              Audited Generation Pipeline
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Every deliverable from {creator.name} is processed through a strict four-stage seed verification pipeline for enterprise safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
              <span className="text-xs font-mono font-bold text-zinc-400">01</span>
              <h4 className="font-semibold text-xs text-white">Prompt & Seed Locking</h4>
              <p className="text-xs text-zinc-400">Deterministic seeds generated with style reference flags (--sref).</p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
              <span className="text-xs font-mono font-bold text-zinc-400">02</span>
              <h4 className="font-semibold text-xs text-white">LoRA & ControlNet</h4>
              <p className="text-xs text-zinc-400">Surface normal maps and depth buffers to preserve product geometry.</p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
              <span className="text-xs font-mono font-bold text-zinc-400">03</span>
              <h4 className="font-semibold text-xs text-white">Motion Interpolation</h4>
              <p className="text-xs text-zinc-400">Camera paths rendered at 60 FPS with optical flow stabilization.</p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-400">04</span>
              <h4 className="font-semibold text-xs text-white">Commercial Clearance</h4>
              <p className="text-xs text-zinc-400">Certified for 100% enterprise copyright buyout.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {creator.reviews && creator.reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {creator.reviews.map((rev) => (
                <div 
                  key={rev.id} 
                  onMouseMove={handleCardMouseMove}
                  className="bg-[#121215] rounded-xl border border-white/10 p-5 space-y-2.5 section-glow relative"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-xs text-white">{rev.brandName}</h4>
                      <p className="text-[11px] text-zinc-500">{rev.projectTitle}</p>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-300 text-xs font-medium">
                      <Star className="w-3 h-3 fill-zinc-300" />
                      <span>{rev.rating}.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                  <span className="text-[10px] text-zinc-500 font-mono block">{rev.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center text-zinc-500 text-xs">
              No public reviews yet for this creator.
            </div>
          )}
        </div>
      )}

      {/* Tab Content 4: Specs */}
      {activeTab === 'specs' && (
        <div 
          onMouseMove={handleCardMouseMove}
          className="bg-[#121215] rounded-xl border border-white/10 p-6 space-y-4 section-glow relative"
        >
          <h2 className="text-sm font-semibold text-white">Technical Infrastructure</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500 text-[11px] block uppercase font-medium">Compute Cluster</span>
              <p className="font-medium text-white mt-1">Dual NVIDIA RTX 4090 24GB + A100 Nodes</p>
            </div>
            <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500 text-[11px] block uppercase font-medium">Upscaling</span>
              <p className="font-medium text-white mt-1">Up to 16K Latent Resolution (Flux.1 Pro HD)</p>
            </div>
            <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500 text-[11px] block uppercase font-medium">Commercial Terms</span>
              <p className="font-medium text-white mt-1">Perpetual Worldwide Commercial Buyout</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
