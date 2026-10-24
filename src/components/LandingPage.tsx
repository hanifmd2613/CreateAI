'use client';

import React, { useState } from 'react';
import { UserRole } from '../types';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  Layers,
  FileText,
  Sliders,
  Award,
  Video,
  Clock,
  Zap,
  ChevronRight,
  Sun,
  Moon,
  Users,
  Briefcase,
  Lock,
  Compass,
  FileCheck2,
  Cpu
} from 'lucide-react';

interface LandingPageProps {
  onExplore: () => void;
  onOpenAuth: (mode?: 'login' | 'signup', role?: UserRole) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onExplore,
  onOpenAuth,
  theme,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'brands' | 'creators'>('brands');

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 transition-colors selection:bg-emerald-500 selection:text-white">
      
      {/* 1. PUBLIC NAVBAR */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#09090B]/90 backdrop-blur-md border-b border-zinc-200 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onExplore}>
            <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 font-black text-sm tracking-tighter">
              GC
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-lg tracking-tight text-zinc-950 dark:text-white">
                GenCraft
              </span>
              <span className="text-[10px] font-semibold tracking-wide px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
                PRO
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-600 dark:text-zinc-300">
            <a href="#features" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-zinc-950 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#capabilities" className="hover:text-zinc-950 dark:hover:text-white transition-colors">AI Capabilities</a>
            <button onClick={onExplore} className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Directory
            </button>
          </nav>

          {/* Right Action Group */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              Log in
            </button>

            <button
              onClick={() => onOpenAuth('signup')}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 transition-colors shadow-sm"
            >
              Create Account
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-zinc-200 dark:border-white/5">
        
        {/* Subtle Ambient Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          
          {/* Vetted Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium animate-fade-in shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Enterprise Generative AI Creator Marketplace</span>
            <span className="text-zinc-400 dark:text-zinc-600">•</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-mono text-[11px]">Audited Workflows</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
            The Right Creator. <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 dark:from-emerald-400 dark:via-teal-300 dark:to-indigo-400 bg-clip-text text-transparent">
              The Right Campaign. Real Results.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Discover AI creators, match campaigns to the right talent, and manage every engagement from proposal to final delivery.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onExplore}
              className="px-6 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <span>Explore GenCraft</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAuth('signup', 'creator')}
              className="px-5 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-200 font-semibold text-sm border border-zinc-300 dark:border-zinc-800 transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-emerald-500" />
              <span>I&apos;m a Creator</span>
            </button>

            <button
              onClick={() => onOpenAuth('signup', 'brand')}
              className="px-5 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-200 font-semibold text-sm border border-zinc-300 dark:border-zinc-800 transition-colors flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-indigo-500" />
              <span>I&apos;m a Brand</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Audited Model Seeds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Worldwide Buyout Rights</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Milestone Escrow Protection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-500" />
              <span>Automated 4K Delivery Checks</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. PRODUCT CAPABILITIES & FEATURE SECTIONS */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Core Architecture
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            End-to-End Generative AI Production Engine
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Built specifically for commercial brand campaigns requiring deterministic generation seeds, legal safety, and production-grade delivery.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1: Intelligent Creator Discovery */}
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-zinc-950 dark:text-white">
              Intelligent Creator Discovery
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Find specialized AI filmmakers, 3D animators, and prompt artists. Filter by proprietary models including Veo, Kling, Sora, Flux.1, and ElevenLabs.
            </p>
          </div>

          {/* Feature 2: Explainable Creator Matching */}
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-zinc-950 dark:text-white">
              Explainable Creator-to-Brief Matching
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              6-factor empirical ranking engine evaluates model stack, stylistic fidelity, turnaround speed, and commercial budget alignment with grounded explanations.
            </p>
          </div>

          {/* Feature 3: AI-Powered Campaign Briefs */}
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-zinc-950 dark:text-white">
              AI-Powered Campaign Briefs
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Integrated Groq Llama-3 and Google Gemini co-pilot transforms raw creative ideas into camera trajectories, aspect ratios, and seed lock specs.
            </p>
          </div>

          {/* Feature 4: Creator Portfolios & Capability Profiles */}
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-zinc-950 dark:text-white">
              Audited Capability Profiles
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Inspect verified multi-stage generation manifests: concept generation in Flux.1, motion synthesis in Kling, and audio foley in ElevenLabs.
            </p>
          </div>

          {/* Feature 5: Commission & Engagement Management */}
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-zinc-950 dark:text-white">
              Commission & Engagement Management
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              19-stage state machine powers formal proposal transmission, creator acceptance/decline decisions, milestone escrow, and immutable audit logs.
            </p>
          </div>

          {/* Feature 6: Licensing Compatibility Checks */}
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-zinc-950 dark:text-white">
              Licensing Compatibility Engine
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Automated legal clearance checks verify territory, duration, distribution channels (paid vs organic), category exclusivity, and derivative rights.
            </p>
          </div>

          {/* Feature 7: Versioned Deliverables & Inspection */}
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all md:col-span-2 lg:col-span-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-zinc-950 dark:text-white">
              Versioned Deliverables, Revisions & Physical Media Validation
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Immutable version history with frame-accurate timestamp critique. Built-in ISO-BMFF container parser verifies resolution, aspect ratio (16:9 vs 9:16), maximum runtime constraints, and prevents corrupted deliveries before escrow release.
            </p>
          </div>

        </div>

      </section>

      {/* 4. HOW IT WORKS SECTION (CREATORS & BRANDS) */}
      <section id="how-it-works" className="py-20 bg-zinc-50/60 dark:bg-zinc-900/30 border-y border-zinc-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Workflow Guide
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              How GenCraft Works
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Frictionless collaboration designed for high-velocity commercial production teams and professional AI creators.
            </p>

            {/* Role Tab Switcher */}
            <div className="inline-flex p-1 rounded-xl bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 mt-4">
              <button
                onClick={() => setActiveTab('brands')}
                className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'brands'
                    ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                For Brands & Agencies
              </button>
              <button
                onClick={() => setActiveTab('creators')}
                className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'creators'
                    ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                For AI Creators
              </button>
            </div>
          </div>

          {/* Workflow Steps */}
          {activeTab === 'brands' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
                  01
                </div>
                <h4 className="font-semibold text-sm text-zinc-950 dark:text-white">Define Campaign Brief</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Use the AI Brief Builder to convert ideas into production specs, target aspect ratios, and commercial licensing terms.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
                  02
                </div>
                <h4 className="font-semibold text-sm text-zinc-950 dark:text-white">Explainable Matching</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Review top candidate creators scored across 6 empirical dimensions with transparent match breakdowns.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
                  03
                </div>
                <h4 className="font-semibold text-sm text-zinc-950 dark:text-white">Send Proposal in Escrow</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Transmit commission proposals with milestone payments held securely in escrow until approved.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
                  04
                </div>
                <h4 className="font-semibold text-sm text-zinc-950 dark:text-white">Inspect & Release</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Inspect deliverables via automated format and duration checks, provide version feedback, and disburse escrow.
                </p>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
                  01
                </div>
                <h4 className="font-semibold text-sm text-zinc-950 dark:text-white">Publish Audited Profile</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Showcase generation workflows, prompt strategies, model tools, and transparent commercial buyout pricing.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
                  02
                </div>
                <h4 className="font-semibold text-sm text-zinc-950 dark:text-white">Receive Commission Proposals</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Get notified when verified brands commission you with clear budget, milestones, deliverables, and usage rights.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
                  03
                </div>
                <h4 className="font-semibold text-sm text-zinc-950 dark:text-white">Review & Accept / Decline</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Decide on proposals with a single click. Confirm licensing rights and lock the agreement into active production.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
                  04
                </div>
                <h4 className="font-semibold text-sm text-zinc-950 dark:text-white">Deliver & Get Paid</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Upload versioned drafts, resolve brand comments, pass automated delivery checks, and receive direct escrow disbursement.
                </p>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION BANNER */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-14 rounded-3xl bg-zinc-950 text-white border border-zinc-800 relative overflow-hidden shadow-2xl">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
              Get Started with GenCraft
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Ready to launch your next AI-native campaign?
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Join enterprise brands and verified generative AI creators delivering award-winning commercial productions.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={onExplore}
                className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-lg"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenAuth('signup')}
                className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs sm:text-sm border border-zinc-700 transition-colors"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="py-10 border-t border-zinc-200 dark:border-white/5 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 dark:text-white">GenCraft PRO</span>
            <span>•</span>
            <span>Enterprise Generative AI Creator Marketplace</span>
          </div>
          <div>
            <span>© 2026 GenCraft AI Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
