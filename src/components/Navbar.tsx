'use client';

import React, { useState } from 'react';
import { PageView, UserAccount, UserRole } from '../types';
import { 
  Plus, 
  Briefcase, 
  Bookmark, 
  ChevronDown, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  User, 
  RefreshCw, 
  Key, 
  Menu, 
  X,
  Search,
  ArrowRightLeft,
  Sun,
  Moon,
  MessageSquare,
  Camera
} from 'lucide-react';

interface NavbarProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  savedCount: number;
  briefsCount: number;
  onOpenSavedModal: () => void;
  currentUser: UserAccount | null;
  onOpenAuthModal: () => void;
  onOpenApiConfig: () => void;
  onSyncLiveRealPersons: () => void;
  isSyncing: boolean;
  onLogout: () => void;
  onSwitchRole: (newRole: UserRole) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenChat?: () => void;
  onOpenSystemAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  savedCount,
  briefsCount,
  onOpenSavedModal,
  currentUser,
  onOpenAuthModal,
  onOpenApiConfig,
  onSyncLiveRealPersons,
  isSyncing,
  onLogout,
  onSwitchRole,
  theme,
  onToggleTheme,
  onOpenChat,
  onOpenSystemAssistant,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#09090B]/95 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Clean Brand Logo */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onNavigate('discovery')}
              className="flex items-center gap-2.5 focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-950 font-black text-sm tracking-tighter">
                GC
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                  GenCraft
                </span>
                <span className="text-[10px] font-medium tracking-wide px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  PRO
                </span>
                <span className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-medium text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Public Access • Lifetime Free
                </span>
              </div>
            </button>

            {/* Center-Left: Primary Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigate('discovery')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'discovery' || currentView === 'profile'
                    ? 'text-white bg-zinc-800/90'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                Discover Creators
              </button>

              <button
                onClick={() => onNavigate('briefs-feed')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'briefs-feed'
                    ? 'text-white bg-zinc-800/90'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                <span>Campaign Briefs</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {briefsCount}
                </span>
              </button>

              <button
                onClick={() => onNavigate('brief-builder')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'brief-builder'
                    ? 'text-white bg-zinc-800/90'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post a Brief</span>
              </button>
            </nav>
          </div>

          {/* Right: Uncluttered Utility Group */}
          <div className="hidden sm:flex items-center gap-2.5">
            
            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-zinc-800 transition-colors flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-zinc-200" />
              )}
            </button>

            {/* Live Sync Trigger (Clean subtle button) */}
            <button
              onClick={onSyncLiveRealPersons}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-zinc-800 transition-colors disabled:opacity-50"
              title="Sync fresh real-person creators from live data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-zinc-200' : ''}`} />
              <span className="text-[11px]">{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
            </button>

            {/* Saved Shortlist Bookmark */}
            <button
              onClick={onOpenSavedModal}
              className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-zinc-800 transition-colors"
              title="Shortlisted Creators"
            >
              <Bookmark className="w-3.5 h-3.5" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white text-zinc-950 text-[9px] font-bold flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Direct Messages Button */}
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-zinc-800 transition-colors"
                title="Client ⇄ Creator Direct Messages"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
              </button>
            )}

            {/* Camera Symbol AI Assistant Button */}
            {onOpenSystemAssistant && (
              <button
                onClick={onOpenSystemAssistant}
                className="p-2 rounded-lg text-emerald-400 hover:text-white hover:bg-zinc-800/60 border border-zinc-800 transition-colors flex items-center justify-center"
                title="Open GenCraft Gemini System Assistant"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Vertical Divider */}
            <div className="h-5 w-px bg-zinc-800 mx-1" />

            {/* User Session Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 pl-2.5 pr-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-left focus:outline-none"
                >
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-white leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium capitalize">
                      {currentUser.role === 'creator' ? 'Creator Account' : 'Enterprise Client'}
                    </span>
                  </div>

                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-md object-cover bg-zinc-800 ring-1 ring-zinc-700"
                  />
                  <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-zinc-900 rounded-xl shadow-xl border border-zinc-800 py-1.5 z-50 text-xs"
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    <div className="px-3.5 py-2.5 border-b border-zinc-800">
                      <p className="font-semibold text-white text-xs">{currentUser.name}</p>
                      <p className="text-zinc-400 text-[11px] mt-0.5">{currentUser.email}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium uppercase text-[9px]">
                          Role: {currentUser.role}
                        </span>
                        <button
                          onClick={() => {
                            onSwitchRole(currentUser.role === 'creator' ? 'brand' : 'creator');
                            setProfileOpen(false);
                          }}
                          className="text-zinc-300 hover:text-white font-medium flex items-center gap-1 hover:underline"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Switch Role</span>
                        </button>
                      </div>
                    </div>

                    <div className="py-1">
                      <button 
                        onClick={() => {
                          onOpenAuthModal();
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 text-left font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Register New Profile</span>
                      </button>

                      <button 
                        onClick={() => {
                          onOpenApiConfig();
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 text-left font-medium"
                      >
                        <Key className="w-3.5 h-3.5 text-zinc-400" />
                        <span>AI API Keys (Groq / Gemini)</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-zinc-800">
                      <button 
                        onClick={() => {
                          onLogout();
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-1.5 text-rose-400 hover:bg-zinc-800 text-left font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors"
              >
                Sign In
              </button>
            )}

          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenAuthModal}
              className="px-2.5 py-1 rounded bg-zinc-800 text-white text-xs font-medium"
            >
              {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3 space-y-2">
          <button
            onClick={() => {
              onNavigate('discovery');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
              currentView === 'discovery' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
            }`}
          >
            Discover Creators
          </button>
          <button
            onClick={() => {
              onNavigate('briefs-feed');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
              currentView === 'briefs-feed' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
            }`}
          >
            <span>Campaign Briefs</span>
            <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{briefsCount}</span>
          </button>
          <button
            onClick={() => {
              onNavigate('brief-builder');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
              currentView === 'brief-builder' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
            }`}
          >
            Post a Brief
          </button>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                onToggleTheme();
                setMobileMenuOpen(false);
              }}
              className="text-zinc-300 hover:text-white flex items-center gap-1.5"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onSyncLiveRealPersons();
                  setMobileMenuOpen(false);
                }}
                className="text-zinc-400 hover:text-white"
              >
                Sync Data
              </button>
              <button
                onClick={() => {
                  onOpenApiConfig();
                  setMobileMenuOpen(false);
                }}
                className="text-zinc-400 hover:text-white"
              >
                AI Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
