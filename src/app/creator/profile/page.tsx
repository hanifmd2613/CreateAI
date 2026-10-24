'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorProfileEditor } from '../../../components/CreatorProfileEditor';
import { Navbar } from '../../../components/Navbar';
import { UserAccount, PageView, UserRole } from '../../../types';
import { RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react';

export default function CreatorProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Read theme
    try {
      const savedTheme = localStorage.getItem('gencraft_theme') as 'dark' | 'light' | null;
      if (savedTheme) setTheme(savedTheme);
    } catch (e) {}

    // Check user session
    const loadSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
            setLoading(false);
            return;
          }
        }

        // Fallback to localStorage session
        const storedUser = localStorage.getItem('gencraft_current_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setCurrentUser(parsed);
          setLoading(false);
          return;
        }

        // Default mock creator if exploring
        setCurrentUser({
          id: 'creator-1',
          name: 'Karthik Subramanian',
          email: 'karthik@karthiksubramanian.ai',
          role: 'creator',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KarthikSubramanian',
          handle: '@karthik_director.ai',
          isVerified: true,
        });
      } catch (err) {
        console.warn('Session check warning:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('gencraft_theme', next);
      if (next === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      <Navbar
        currentView={'creator-profile' as PageView}
        onNavigate={(view) => {
          if (view === 'discovery') router.push('/');
          else if (view === 'workspace') router.push('/?view=workspace');
          else if (view === 'briefs-feed') router.push('/?view=briefs-feed');
          else if (view === 'brief-builder') router.push('/?view=brief-builder');
        }}
        savedCount={0}
        briefsCount={2}
        onOpenSavedModal={() => router.push('/')}
        currentUser={currentUser}
        onOpenAuthModal={() => router.push('/')}
        onOpenApiConfig={() => {}}
        onSyncLiveRealPersons={() => {}}
        isSyncing={false}
        onLogout={() => {
          try {
            localStorage.removeItem('gencraft_is_authenticated');
            localStorage.removeItem('gencraft_current_user');
          } catch (e) {}
          router.push('/');
        }}
        onSwitchRole={(newRole: UserRole) => {
          if (currentUser) {
            setCurrentUser({ ...currentUser, role: newRole });
          }
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1">
        {currentUser ? (
          <CreatorProfileEditor
            currentUser={currentUser}
            onBack={() => router.push('/')}
            onPreviewPublicProfile={(creatorId) => router.push(`/creators/${creatorId}`)}
          />
        ) : (
          <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">Sign In Required</h2>
            <p className="text-xs text-zinc-400">
              Please sign in with your creator account to edit your profile and manage portfolio projects.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-5 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs transition-colors"
            >
              Go to Sign In
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
