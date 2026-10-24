'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Creator, PortfolioItem, UserAccount, PageView, UserRole } from '../../../types';
import { CreatorProfile } from '../../../components/CreatorProfile';
import { PortfolioModal } from '../../../components/PortfolioModal';
import { HireModal } from '../../../components/HireModal';
import { ChatModal } from '../../../components/ChatModal';
import { Navbar } from '../../../components/Navbar';
import { RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';

export default function PublicCreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [creator, setCreator] = useState<Creator | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Modals
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  useEffect(() => {
    // Read theme
    try {
      const savedTheme = localStorage.getItem('gencraft_theme') as 'dark' | 'light' | null;
      if (savedTheme) setTheme(savedTheme);

      const storedUser = localStorage.getItem('gencraft_current_user');
      if (storedUser) setCurrentUser(JSON.parse(storedUser));
    } catch (e) {}

    const fetchCreator = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/creators/${id}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error?.message || `Creator with ID "${id}" not found.`);
        }
        setCreator(data.creator);
      } catch (err: any) {
        console.error('Error fetching creator:', err);
        setError(err.message || 'Failed to load creator.');
      } finally {
        setLoading(false);
      }
    };

    fetchCreator();
  }, [id]);

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

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans">
        <div className="max-w-md mx-auto my-auto p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Creator Not Found</h2>
          <p className="text-xs text-zinc-400">
            {error || `Creator profile "${id}" could not be retrieved from the marketplace database.`}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Marketplace</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      <Navbar
        currentView={'profile' as PageView}
        onNavigate={(view) => {
          if (view === 'discovery') router.push('/');
          else if (view === 'workspace') router.push('/?view=workspace');
          else if (view === 'briefs-feed') router.push('/?view=briefs-feed');
          else if (view === 'brief-builder') router.push('/?view=brief-builder');
        }}
        savedCount={isSaved ? 1 : 0}
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
          if (currentUser) setCurrentUser({ ...currentUser, role: newRole });
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1 pb-16">
        <CreatorProfile
          creator={creator}
          onBack={() => router.push('/')}
          onSelectPortfolioItem={(c, item) => setSelectedPortfolioItem(item)}
          isSaved={isSaved}
          onToggleSave={() => setIsSaved(!isSaved)}
          onHireDirect={() => setHireModalOpen(true)}
          onRequestBriefForCreator={() => {
            router.push(`/?view=brief-builder&creator=${creator.id}`);
          }}
          onOpenChat={() => setChatModalOpen(true)}
        />
      </main>

      {/* Portfolio Item Detail Modal */}
      {selectedPortfolioItem && (
        <PortfolioModal
          onClose={() => setSelectedPortfolioItem(null)}
          item={selectedPortfolioItem}
          creator={creator}
          onRequestSimilar={() => {
            setSelectedPortfolioItem(null);
            router.push(`/?view=brief-builder&creator=${creator.id}`);
          }}
        />
      )}

      {/* Direct Hire Modal */}
      {hireModalOpen && (
        <HireModal
          onClose={() => setHireModalOpen(false)}
          creator={creator}
          briefs={[]}
          onSuccess={(_msg: string) => {
            setHireModalOpen(false);
            router.push('/?view=workspace');
          }}
        />
      )}

      {/* Direct Creator Chat Modal */}
      <ChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        targetCreator={creator}
        creators={[creator]}
        currentUser={currentUser}
        onOpenBriefBuilderWithCreator={() => {
          setChatModalOpen(false);
          router.push(`/?view=brief-builder&creator=${creator.id}`);
        }}
      />
    </div>
  );
}
