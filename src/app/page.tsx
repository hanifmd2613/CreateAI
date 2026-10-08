'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { CreatorCard } from '../components/CreatorCard';
import { CreatorProfile } from '../components/CreatorProfile';
import { BriefBuilder } from '../components/BriefBuilder';
import { BriefsFeed } from '../components/BriefsFeed';
import { PortfolioModal } from '../components/PortfolioModal';
import { HireModal } from '../components/HireModal';
import { SavedModal } from '../components/SavedModal';
import { AuthModal } from '../components/AuthModal';
import { AuthGate } from '../components/AuthGate';
import { ChatModal } from '../components/ChatModal';
import { SystemAssistantModal } from '../components/SystemAssistantModal';
import { ApiConfigModal } from '../components/ApiConfigModal';
import { FadeInSection } from '../components/FadeInSection';
import { 
  MOCK_CREATORS, 
  INITIAL_BRIEFS, 
  TOOL_OPTIONS, 
  CONTENT_TYPE_OPTIONS, 
  SPECIALIZATION_OPTIONS 
} from '../data/mockData';
import { Creator, Brief, PortfolioItem, PageView, UserAccount, UserRole } from '../types';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ShieldCheck, 
  Sparkles, 
  X, 
  RotateCcw, 
  Layers, 
  ArrowUpDown,
  Check,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  Activity,
  Flame,
  ArrowRight,
  RefreshCw,
  User,
  Key,
  UserCheck,
  Camera,
  MessageSquare,
  Volume2
} from 'lucide-react';

const DEFAULT_BRAND_USER: UserAccount = {
  id: 'user-brand-kaveri',
  name: 'Kaveri Creative Studios',
  email: 'campaigns@kaveristudios.in',
  role: 'brand',
  avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=KaveriStudios',
  handle: '@kaveri_studios',
  companyName: 'Kaveri Creative Studios (Bengaluru & Delhi)',
  isVerified: true,
};

const POPULAR_FIELDS = [
  { label: '🏎️ Automotive & Speed', query: 'Automotive' },
  { label: '👗 High-Fashion Editorial', query: 'Fashion' },
  { label: '🧸 3D Mascots & Animation', query: 'Mascot' },
  { label: '🎙️ Sonic & Multilingual Voice', query: 'Sonic' },
  { label: '🚀 Sci-Fi Worldbuilding', query: 'Sci-Fi' },
  { label: '🧴 Product Packshots', query: 'Product' },
  { label: '🎥 Veo Cinematic', query: 'Veo' },
  { label: '⚡ Kling Motion', query: 'Kling' },
];

export default function Home() {
  // Navigation / View State
  const [currentView, setCurrentView] = useState<PageView>('discovery');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  
  // Data State
  const [creators, setCreators] = useState<Creator[]>(MOCK_CREATORS);
  const [briefs, setBriefs] = useState<Brief[]>(INITIAL_BRIEFS);
  const [savedCreatorIds, setSavedCreatorIds] = useState<string[]>(['creator-1', 'creator-3']);

  // Authentication Gate State (Website starts from login page first)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoaded, setAuthLoaded] = useState<boolean>(false);
  const [voiceBanner, setVoiceBanner] = useState<string | null>(null);

  // Auth & User State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(DEFAULT_BRAND_USER);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [apiConfigModalOpen, setApiConfigModalOpen] = useState(false);
  const [groqKey, setGroqKey] = useState<string>('');
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Client ⇄ Employee Direct Chat State
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatTargetCreator, setChatTargetCreator] = useState<Creator | null>(null);

  // Camera Symbol AI System Assistant State (Gemini powered)
  const [systemAssistantOpen, setSystemAssistantOpen] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTool, setSelectedTool] = useState('All Tools');
  const [selectedContentType, setSelectedContentType] = useState('All Types');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All Specializations');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'projects' | 'rate-low' | 'rate-high'>('rating');

  // Modals State
  const [inspectingItem, setInspectingItem] = useState<{ creator: Creator; item: PortfolioItem } | null>(null);
  const [hiringCreator, setHiringCreator] = useState<Creator | null>(null);
  const [savedModalOpen, setSavedModalOpen] = useState(false);
  const [builderInitialPrompt, setBuilderInitialPrompt] = useState('');
  const [builderTargetCreator, setBuilderTargetCreator] = useState<Creator | null>(null);

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Toast System State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Restore session, API keys, theme from localStorage
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('createai_is_authenticated');
      const storedUser = localStorage.getItem('createai_current_user');
      const storedGroq = localStorage.getItem('createai_groq_key');
      const storedGemini = localStorage.getItem('createai_gemini_key');
      const storedTheme = localStorage.getItem('createai_theme') as 'dark' | 'light' | null;

      if (storedGroq) setGroqKey(storedGroq);
      if (storedGemini) setGeminiKey(storedGemini);

      if (storedAuth === 'true' && storedUser) {
        setIsAuthenticated(true);
        setCurrentUser(JSON.parse(storedUser));
      } else {
        // Requirement: website starts from the login page first
        setIsAuthenticated(false);
      }

      if (storedTheme === 'light' || storedTheme === 'dark') {
        setTheme(storedTheme);
        if (storedTheme === 'light') {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        }
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      // LocalStorage fallback
    } finally {
      setAuthLoaded(true);
    }
  }, []);

  // Close search suggestions on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('createai_theme', nextTheme);
    } catch (e) {}

    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      showToast('Switched to Light Mode');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      showToast('Switched to Dark Mode');
    }
  };

  const handleSaveApiKeys = (newGroq: string, newGemini: string) => {
    setGroqKey(newGroq);
    setGeminiKey(newGemini);
    try {
      localStorage.setItem('createai_groq_key', newGroq);
      localStorage.setItem('createai_gemini_key', newGemini);
    } catch (e) {}
    showToast('AI inference API keys saved successfully!');
  };

  // Login / Register Success Callback
  const handleLoginSuccess = (user: UserAccount, newCreator?: Creator) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('createai_is_authenticated', 'true');
      localStorage.setItem('createai_current_user', JSON.stringify(user));
    } catch (e) {}

    if (newCreator) {
      setCreators(prev => [newCreator, ...prev]);
      setSelectedCreator(newCreator);
      setCurrentView('profile');
      showToast(`Welcome ${user.name}! Your Creator Studio profile is live in the marketplace.`);
    } else {
      showToast(`Welcome ${user.name}! Logged in as ${user.role.toUpperCase()}.`);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    try {
      localStorage.removeItem('createai_is_authenticated');
      localStorage.removeItem('createai_current_user');
    } catch (e) {}
    showToast('Signed out of CreateAI.');
  };

  const handleSwitchRole = (newRole: UserRole) => {
    if (!currentUser) return;
    const updated: UserAccount = {
      ...currentUser,
      role: newRole,
    };
    setCurrentUser(updated);
    try {
      localStorage.setItem('createai_current_user', JSON.stringify(updated));
    } catch (e) {}
    showToast(`Switched active view to ${newRole.toUpperCase()} mode.`);
  };

  // Live Sync Real Person Creators from /api/live-sync
  const handleSyncLiveRealPersons = async () => {
    setIsSyncing(true);
    showToast('Fetching live real-person Gen-AI creators...');

    try {
      const res = await fetch('/api/live-sync');
      if (res.ok) {
        const data = await res.json();
        if (data.creators && Array.isArray(data.creators)) {
          setCreators(prev => [...data.creators, ...prev]);
          showToast(`⚡ Successfully synced ${data.creators.length} real creators into the marketplace!`);
        }
      }
    } catch (err) {
      console.error('Error syncing real creators:', err);
      showToast('Live sync completed.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle Saved Creator
  const handleToggleSave = (creatorId: string) => {
    if (savedCreatorIds.includes(creatorId)) {
      setSavedCreatorIds(savedCreatorIds.filter(id => id !== creatorId));
      showToast('Creator removed from your shortlist.');
    } else {
      setSavedCreatorIds([...savedCreatorIds, creatorId]);
      showToast('Creator saved to your shortlist!');
    }
  };

  // Switch to Creator Profile View
  const handleSelectCreator = (creator: Creator) => {
    setSelectedCreator(creator);
    setCurrentView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Inspect Portfolio Item Modal
  const handleSelectPortfolioItem = (creator: Creator, item: PortfolioItem) => {
    setInspectingItem({ creator, item });
  };

  // Request Similar Asset from Brief Builder
  const handleRequestSimilar = (item: PortfolioItem, creator: Creator) => {
    setBuilderInitialPrompt(`Create a campaign in the style of "${item.title}" using ${item.specificModel}. Workflow: ${item.workflowDescription}`);
    setBuilderTargetCreator(creator);
    setCurrentView('brief-builder');
    showToast(`Pre-filled AI Brief Builder with ${creator.name}’s style!`);
  };

  // Open Direct Chat with Creator
  const handleOpenChat = (creator?: Creator | null) => {
    setChatTargetCreator(creator || creators[0] || null);
    setChatModalOpen(true);
  };

  // Publish New Brief from Builder
  const handlePublishBrief = (newBrief: Brief) => {
    setBriefs([newBrief, ...briefs]);
    showToast(`Campaign Brief "${newBrief.title}" published with commercial buyout clearance!`);
  };

  // Direct Hire Modal trigger
  const handleHireDirect = (creator: Creator) => {
    setHiringCreator(creator);
  };

  // Explore Matching Creators from Briefs
  const handleExploreMatchingCreators = (tools: string[]) => {
    if (tools.length > 0) {
      setSelectedTool(tools[0]);
    }
    setCurrentView('discovery');
    showToast(`Filtered creators specialized in ${tools.join(', ')}.`);
  };

  // Live matching creators in Search Bar Dropdown
  const searchDropdownCreators = useMemo(() => {
    if (!searchQuery.trim()) {
      return creators.slice(0, 5);
    }
    const q = searchQuery.toLowerCase().trim();
    return creators.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.specialization.toLowerCase().includes(q) ||
      c.skills.some(s => s.toLowerCase().includes(q)) ||
      c.tools.some(t => t.toLowerCase().includes(q)) ||
      c.location.toLowerCase().includes(q) ||
      c.bio.toLowerCase().includes(q) ||
      c.portfolio.some(p => p.title.toLowerCase().includes(q) || p.specificModel.toLowerCase().includes(q))
    );
  }, [creators, searchQuery]);

  // Filtered and Sorted Creators List for the Grid
  const filteredCreators = useMemo(() => {
    return creators
      .filter((creator) => {
        // Search query filter
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = creator.name.toLowerCase().includes(q);
          const matchesHandle = creator.handle.toLowerCase().includes(q);
          const matchesBio = creator.bio.toLowerCase().includes(q);
          const matchesSpec = creator.specialization.toLowerCase().includes(q);
          const matchesSkills = creator.skills.some(s => s.toLowerCase().includes(q));
          const matchesTools = creator.tools.some(t => t.toLowerCase().includes(q));
          const matchesLocation = creator.location.toLowerCase().includes(q);
          const matchesPortfolio = creator.portfolio.some(p => 
            p.title.toLowerCase().includes(q) || 
            p.specificModel.toLowerCase().includes(q) ||
            p.workflowDescription.toLowerCase().includes(q)
          );

          if (!matchesName && !matchesHandle && !matchesBio && !matchesSpec && !matchesSkills && !matchesTools && !matchesLocation && !matchesPortfolio) {
            return false;
          }
        }

        // Tools filter
        if (selectedTool !== 'All Tools') {
          if (!creator.tools.includes(selectedTool)) {
            return false;
          }
        }

        // Content Type filter
        if (selectedContentType !== 'All Types') {
          const typeMatch = creator.portfolio.some(item => {
            if (selectedContentType === 'Video') return item.type === 'video';
            if (selectedContentType === 'Image') return item.type === 'image';
            if (selectedContentType === 'Audio') return item.type === 'audio';
            return true;
          });
          if (!typeMatch) return false;
        }

        // Specialization filter
        if (selectedSpecialization !== 'All Specializations') {
          if (creator.specialization !== selectedSpecialization) {
            return false;
          }
        }

        // Verified only filter
        if (verifiedOnly && !creator.isVerified) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'projects') return b.completedProjects - a.completedProjects;
        if (sortBy === 'rate-low') return a.hourlyRate - b.hourlyRate;
        if (sortBy === 'rate-high') return b.hourlyRate - a.hourlyRate;
        return 0;
      });
  }, [creators, searchQuery, selectedTool, selectedContentType, selectedSpecialization, verifiedOnly, sortBy]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTool('All Tools');
    setSelectedContentType('All Types');
    setSelectedSpecialization('All Specializations');
    setVerifiedOnly(false);
  };

  const hasActiveFilters = searchQuery !== '' || selectedTool !== 'All Tools' || selectedContentType !== 'All Types' || selectedSpecialization !== 'All Specializations' || verifiedOnly;

  // Saved Creators Objects
  const savedCreatorsList = useMemo(() => {
    return creators.filter(c => savedCreatorIds.includes(c.id));
  }, [creators, savedCreatorIds]);

  // REQUIREMENT: If not authenticated, always show the full-screen Login/Register Gate first!
  if (authLoaded && !isAuthenticated) {
    return (
      <AuthGate
        onAuthSuccess={(user, newCreator) => {
          handleLoginSuccess(user, newCreator);
        }}
        onVoiceSpoken={(candidateName) => {
          setVoiceBanner(`🎙️ AI Voice Bot: "Hello ${candidateName}, and welcome to CreateAI."`);
          setTimeout(() => setVoiceBanner(null), 6500);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-zinc-800 selection:text-white relative">
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-grid-subtle pointer-events-none opacity-30" />

      {/* Fluent AI Voice Greeting Banner Alert */}
      {voiceBanner && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-zinc-900/95 border border-emerald-500/60 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in text-xs text-white">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="font-medium text-emerald-300">{voiceBanner}</span>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view === 'discovery') {
            setSelectedCreator(null);
          }
        }}
        savedCount={savedCreatorIds.length}
        briefsCount={briefs.length}
        onOpenSavedModal={() => setSavedModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenApiConfig={() => setApiConfigModalOpen(true)}
        onSyncLiveRealPersons={handleSyncLiveRealPersons}
        isSyncing={isSyncing}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenChat={() => handleOpenChat()}
        onOpenSystemAssistant={() => setSystemAssistantOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16 relative z-10">
        
        {/* VIEW 1: CREATOR DISCOVERY (HOME) */}
        {currentView === 'discovery' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Hero / Header Section */}
            <FadeInSection delayMs={40} className="text-center max-w-3xl mx-auto mb-10 pt-4 p-5 rounded-2xl border border-transparent">
              {/* Vetted Talent Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Enterprise Generative AI Creator Directory</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-300 font-mono text-[11px]">Audited Workflows</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-semibold text-white tracking-tight leading-[1.15]">
                Specialized Generative AI Talent for Commercial Campaigns
              </h1>
              
              <p className="text-sm sm:text-base text-zinc-400 mt-3.5 max-w-2xl mx-auto leading-relaxed">
                Directly commission vetted AI filmmakers, 3D animators, and visual artists with audited generation pipelines, seed verification, and full commercial buyout rights.
              </p>
            </FadeInSection>

            {/* Search & Filter Command Bar with Live In-Search Dropdown */}
            <FadeInSection delayMs={100} className="bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-800 p-5 mb-8 space-y-4 shadow-sm relative">
              
              {/* Primary Search Input with Interactive Dropdown Container */}
              <div ref={searchContainerRef} className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsSearchFocused(false);
                    }
                  }}
                  placeholder="Search creators by topic or model (Automotive, Fashion, 3D Mascots, Veo, Kling, Sora, Flux.1)..."
                  className="w-full pl-10 pr-14 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-700 transition-all"
                />
                <div className="absolute right-3.5 top-2.5 flex items-center gap-1.5 z-10">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                    /
                  </span>
                </div>

                {/* Permanent Topic Pills for Easy 1-Click Filtering */}
                <div className="pt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mr-1 shrink-0">
                    Topics:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors shrink-0 ${
                      searchQuery === ''
                        ? 'bg-white text-zinc-950 font-semibold'
                        : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-850 hover:bg-zinc-900'
                    }`}
                  >
                    All Topics
                  </button>
                  {POPULAR_FIELDS.map((field) => {
                    const isActive = searchQuery.toLowerCase() === field.query.toLowerCase();
                    return (
                      <button
                        key={field.label}
                        type="button"
                        onClick={() => {
                          if (isActive) {
                            setSearchQuery('');
                          } else {
                            setSearchQuery(field.query);
                          }
                          setIsSearchFocused(false);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1 ${
                          isActive
                            ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                            : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-850 hover:bg-zinc-900'
                        }`}
                      >
                        <span>{field.label}</span>
                        {isActive && <Check className="w-3 h-3 text-zinc-950" />}
                      </button>
                    );
                  })}
                </div>

                {/* Live Suggestions Dropdown (100% Solid Opaque Background, Closes on Enter/Click/Esc) */}
                {isSearchFocused && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-[#09090b] border border-zinc-700 shadow-2xl p-4 z-[999] space-y-3 ring-1 ring-white/10"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase text-zinc-400 pb-2 border-b border-zinc-800">
                      <span>Search Creators by Topic / Field:</span>
                      <button
                        type="button"
                        onClick={() => setIsSearchFocused(false)}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] transition-colors"
                      >
                        Close ✕
                      </button>
                    </div>

                    {/* Quick Topic Chips Inside Dropdown */}
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_FIELDS.map((field) => (
                        <button
                          key={field.label}
                          type="button"
                          onClick={() => {
                            setSearchQuery(field.query);
                            setIsSearchFocused(false);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-colors"
                        >
                          {field.label}
                        </button>
                      ))}
                    </div>

                    {/* Matching Creators of that Field */}
                    <div className="border-t border-zinc-800 pt-2.5">
                      <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-2">
                        {searchQuery ? `Creators in "${searchQuery}":` : 'Top Specialists in Selected Fields:'}
                      </span>

                      {searchDropdownCreators.length === 0 ? (
                        <div className="py-4 text-center text-xs text-zinc-500">
                          No creators found matching &ldquo;{searchQuery}&rdquo;. Click one of the topic tags above to explore specialists.
                        </div>
                      ) : (
                        <div className="max-h-72 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                          {searchDropdownCreators.slice(0, 6).map((c) => (
                            <div
                              key={c.id}
                              className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-between gap-3 group"
                            >
                              <div 
                                onClick={() => {
                                  handleSelectCreator(c);
                                  setIsSearchFocused(false);
                                }}
                                className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                              >
                                <img
                                  src={c.avatar}
                                  alt={c.name}
                                  className="w-10 h-10 rounded-full object-cover border border-zinc-700 bg-zinc-900 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-white group-hover:text-zinc-200 truncate">
                                      {c.name}
                                    </span>
                                    {c.isVerified && (
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-zinc-400 truncate">
                                    {c.specialization}
                                  </p>
                                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                                    <span className="text-emerald-400 font-medium">₹{c.hourlyRate.toLocaleString('en-IN')}/hr</span>
                                    <span>•</span>
                                    <span>{c.tools.slice(0, 3).join(', ')}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenChat(c);
                                    setIsSearchFocused(false);
                                  }}
                                  className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1"
                                >
                                  <MessageSquare className="w-3 h-3 text-zinc-400" />
                                  <span>Chat</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectCreator(c);
                                    setIsSearchFocused(false);
                                  }}
                                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white hover:bg-zinc-200 text-zinc-950"
                                >
                                  Profile
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Filters Row: Tools Used, Content Type, Verified Toggle & Sort */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
                
                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-2.5">
                  
                  {/* Tools Used Filter Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Tool:
                    </span>
                    <select
                      value={selectedTool}
                      onChange={(e) => setSelectedTool(e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-200 bg-zinc-950 border border-zinc-800 focus:outline-none focus:border-zinc-600"
                    >
                      {TOOL_OPTIONS.map((tool) => (
                        <option key={tool} value={tool} className="bg-zinc-950">{tool}</option>
                      ))}
                    </select>
                  </div>

                  {/* Content Type Filter Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Format:
                    </span>
                    <select
                      value={selectedContentType}
                      onChange={(e) => setSelectedContentType(e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-200 bg-zinc-950 border border-zinc-800 focus:outline-none focus:border-zinc-600"
                    >
                      {CONTENT_TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type} className="bg-zinc-950">{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Verified Only Toggle */}
                  <button
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      verifiedOnly
                        ? 'bg-zinc-800 text-emerald-400 border-zinc-700'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Only</span>
                  </button>

                  {/* Reset Filters */}
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 px-2 py-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 self-end lg:self-auto">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-200 bg-zinc-950 border border-zinc-800 focus:outline-none focus:border-zinc-600"
                  >
                    <option value="rating">Top Rated (Stars)</option>
                    <option value="projects">Most Campaigns</option>
                    <option value="rate-low">Rate: Low to High</option>
                    <option value="rate-high">Rate: High to Low</option>
                  </select>
                </div>

              </div>

              {/* Specialization Quick Pills */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mr-1 shrink-0">
                  Disciplines:
                </span>
                {SPECIALIZATION_OPTIONS.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpecialization(spec)}
                    className={`px-3 py-1 rounded-lg whitespace-nowrap text-xs transition-colors shrink-0 ${
                      selectedSpecialization === spec
                        ? 'bg-white text-zinc-950 font-semibold'
                        : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-850 hover:bg-zinc-900'
                    }`}
                  >
                    {spec === 'All Specializations' ? 'All Disciplines' : spec}
                  </button>
                ))}
              </div>
            </FadeInSection>

            {/* Results Counter Bar */}
            <FadeInSection delayMs={160} className="space-y-5" enableGlow={false}>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1 px-1">
                <p>
                  Showing <strong className="text-zinc-100 font-semibold">{filteredCreators.length}</strong> specialized Gen-AI creators
                  {selectedTool !== 'All Tools' && <span> with <strong className="text-zinc-200">{selectedTool}</strong></span>}
                  {selectedContentType !== 'All Types' && <span> for <strong className="text-zinc-200">{selectedContentType}</strong></span>}
                </p>
                
                <div className="hidden sm:flex items-center gap-2 text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[11px]">Workflows Audited For Commercial IP</span>
                </div>
              </div>

              {/* CREATOR GRID */}
              {filteredCreators.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {filteredCreators.map((creator) => (
                    <CreatorCard
                      key={creator.id}
                      creator={creator}
                      onSelectCreator={handleSelectCreator}
                      onSelectPortfolioItem={handleSelectPortfolioItem}
                      isSaved={savedCreatorIds.includes(creator.id)}
                      onToggleSave={handleToggleSave}
                      onHireDirect={handleHireDirect}
                      onOpenChat={handleOpenChat}
                    />
                  ))}
                </div>
              ) : (
                /* EMPTY SEARCH RESULTS STATE */
                <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 p-10 text-center max-w-md mx-auto my-12 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      No creators found
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      No verified AI creators match &quot;{searchQuery || selectedTool}&quot;. Try broadening your filter selection.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={() => {
                        resetFilters();
                        setSelectedTool('Veo');
                      }}
                      className="px-3 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-zinc-300 text-xs border border-zinc-800"
                    >
                      Veo Creators
                    </button>
                  </div>
                </div>
              )}
            </FadeInSection>

            {/* Bottom Callout: Need custom brief? */}
            <FadeInSection delayMs={200} className="mt-14 bg-zinc-900/50 rounded-2xl p-6 sm:p-8 border border-zinc-800 text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Custom Multi-Model Pipeline?</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  Post an AI Campaign Brief & Receive Targeted Proposals
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl font-normal leading-relaxed">
                  Use our AI Brief Co-Pilot (Groq Llama-3 / Google Gemini) to convert concepts into production parameters, seed targets, and commercial clearance specs.
                </p>
              </div>

              <button
                onClick={() => {
                  setBuilderInitialPrompt('');
                  setBuilderTargetCreator(null);
                  setCurrentView('brief-builder');
                }}
                className="px-5 py-2.5 rounded-lg bg-white hover:bg-zinc-200 font-semibold text-xs sm:text-sm text-zinc-950 transition-colors shrink-0"
              >
                Create Campaign Brief
              </button>
            </FadeInSection>

          </div>
        )}

        {/* VIEW 2: CREATOR PROFILE & PORTFOLIO VIEW */}
        {currentView === 'profile' && selectedCreator && (
          <FadeInSection delayMs={20} className="w-full">
            <CreatorProfile
              creator={selectedCreator}
              onBack={() => setCurrentView('discovery')}
              onSelectPortfolioItem={handleSelectPortfolioItem}
              isSaved={savedCreatorIds.includes(selectedCreator.id)}
              onToggleSave={handleToggleSave}
              onHireDirect={handleHireDirect}
              onRequestBriefForCreator={(creator) => {
                setBuilderTargetCreator(creator);
                setBuilderInitialPrompt(`Campaign brief specifically tailored for ${creator.name} (${creator.specialization}).`);
                setCurrentView('brief-builder');
              }}
              onOpenChat={handleOpenChat}
            />
          </FadeInSection>
        )}

        {/* VIEW 3: AI-ASSISTED BRIEF BUILDER */}
        {currentView === 'brief-builder' && (
          <FadeInSection delayMs={20} className="w-full">
            <BriefBuilder
              onPublishBrief={handlePublishBrief}
              onExploreMatchingCreators={handleExploreMatchingCreators}
              initialPrompt={builderInitialPrompt}
              preselectedCreator={builderTargetCreator}
              groqKey={groqKey}
              geminiKey={geminiKey}
              onOpenApiConfig={() => setApiConfigModalOpen(true)}
            />
          </FadeInSection>
        )}

        {/* VIEW 4: MARKETPLACE BRIEFS FEED */}
        {currentView === 'briefs-feed' && (
          <FadeInSection delayMs={20} className="w-full">
            <BriefsFeed
              briefs={briefs}
              onNavigateToBuilder={() => {
                setBuilderInitialPrompt('');
                setBuilderTargetCreator(null);
                setCurrentView('brief-builder');
              }}
              onExploreMatchingCreators={handleExploreMatchingCreators}
            />
          </FadeInSection>
        )}

      </main>

      {/* Direct Client ⇄ Employee Creator Chat Modal */}
      <ChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        targetCreator={chatTargetCreator}
        creators={creators}
        currentUser={currentUser}
        onOpenBriefBuilderWithCreator={(creator) => {
          setBuilderTargetCreator(creator);
          setBuilderInitialPrompt(`Direct project commission for ${creator.name} (${creator.specialization}).`);
          setCurrentView('brief-builder');
        }}
      />

      {/* Floating Camera Symbol Gemini AI System Assistant */}
      <SystemAssistantModal
        isOpen={systemAssistantOpen}
        onClose={() => setSystemAssistantOpen(false)}
        onOpen={() => setSystemAssistantOpen(true)}
        geminiKey={geminiKey}
      />

      {/* Global Modals */}

      {/* 1. Auth & Role-Based Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 2. API Config Modal (Groq / Gemini) */}
      <ApiConfigModal
        isOpen={apiConfigModalOpen}
        onClose={() => setApiConfigModalOpen(false)}
        groqKey={groqKey}
        geminiKey={geminiKey}
        onSaveKeys={handleSaveApiKeys}
      />

      {/* 3. Portfolio Detail Modal (Click-to-Inspect) */}
      {inspectingItem && (
        <PortfolioModal
          creator={inspectingItem.creator}
          item={inspectingItem.item}
          onClose={() => setInspectingItem(null)}
          onRequestSimilar={handleRequestSimilar}
        />
      )}

      {/* 4. Hire Direct Modal */}
      {hiringCreator && (
        <HireModal
          creator={hiringCreator}
          briefs={briefs}
          onClose={() => setHiringCreator(null)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {/* 5. Saved Creators Modal */}
      {savedModalOpen && (
        <SavedModal
          savedCreators={savedCreatorsList}
          onClose={() => setSavedModalOpen(false)}
          onSelectCreator={(c) => {
            handleSelectCreator(c);
            setSavedModalOpen(false);
          }}
          onRemoveSaved={handleToggleSave}
          onClearAll={() => {
            setSavedCreatorIds([]);
            showToast('Shortlist cleared.');
          }}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-20 z-50 bg-zinc-900 text-zinc-100 text-xs font-medium px-4 py-3 rounded-xl shadow-lg border border-zinc-750 flex items-center gap-2.5 backdrop-blur-xl animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-850 bg-zinc-950 py-8 text-xs text-zinc-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center font-bold text-[10px]">
              CA
            </div>
            <span className="font-semibold text-zinc-200 text-xs">CreateAI</span>
            <span className="text-zinc-700">•</span>
            <span>Enterprise Generative AI Creator Platform</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-zinc-400">
            <button onClick={() => setCurrentView('discovery')} className="hover:text-white transition-colors">Discover</button>
            <button onClick={() => setCurrentView('brief-builder')} className="hover:text-white transition-colors">Brief Co-Pilot</button>
            <button onClick={() => setCurrentView('briefs-feed')} className="hover:text-white transition-colors">Campaign Briefs</button>
            <button onClick={() => handleOpenChat()} className="hover:text-white transition-colors">Direct Messages</button>
            <button onClick={() => setSystemAssistantOpen(true)} className="hover:text-emerald-400 transition-colors">AI Assistant</button>
            <span className="text-zinc-600">© 2025 CreateAI</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
