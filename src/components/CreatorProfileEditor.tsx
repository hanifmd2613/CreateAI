'use client';

import React, { useState, useEffect } from 'react';
import { Creator, PortfolioItem, UserAccount } from '../types';
import { calculateProfileCompleteness, CompletenessReport } from '../lib/profileCompleteness';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  Star, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Share2, 
  ChevronUp, 
  ChevronDown,
  Cpu, 
  Layers, 
  Film, 
  Image as ImageIcon, 
  Music, 
  Clock, 
  DollarSign, 
  Globe, 
  MapPin, 
  Check, 
  X,
  FileText
} from 'lucide-react';

interface CreatorProfileEditorProps {
  currentUser: UserAccount;
  onBack?: () => void;
  onPreviewPublicProfile?: (creatorId: string) => void;
}

const COMMON_AI_TOOLS = [
  'Veo', 'Kling', 'Midjourney v6.1', 'Runway Gen-3 Alpha', 'Luma Dream Machine', 
  'ElevenLabs', 'Flux.1 Pro', 'Stable Diffusion 3.5', 'Pika 2.0', 'Suno AI', 
  'ComfyUI', 'Topaz Video AI'
];

const COMMON_CATEGORIES = [
  'Skincare & Beauty', 'Automotive & Speed', 'High-Fashion Editorial', 
  'B2B SaaS & Tech', '3D Gaming & Animation', 'Food & Artisan Culinary', 
  'Sustainability & Documentary', 'Luxury & Horlogerie'
];

const COMMON_LANGUAGES = [
  'English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam', 'Bengali', 'Spanish', 'Japanese'
];

export const CreatorProfileEditor: React.FC<CreatorProfileEditorProps> = ({
  currentUser,
  onBack,
  onPreviewPublicProfile,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [completeness, setCompleteness] = useState<CompletenessReport | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [activeTab, setActiveTab] = useState<'info' | 'portfolio' | 'commercial'>('info');

  // Portfolio Item Modal State
  const [portfolioModalOpen, setPortfolioModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [itemDeletingId, setItemDeletingId] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState<boolean>(false);

  // New/Edit Item Form State
  const [formItemTitle, setFormItemTitle] = useState('');
  const [formItemType, setFormItemType] = useState<'video' | 'image' | 'audio'>('video');
  const [formItemMediaUrl, setFormItemMediaUrl] = useState('');
  const [formItemThumbnail, setFormItemThumbnail] = useState('');
  const [formItemDescription, setFormItemDescription] = useState('');
  const [formItemCategory, setFormItemCategory] = useState('Skincare & Beauty');
  const [formItemStyle, setFormItemStyle] = useState('Photorealistic Cinematic');
  const [formItemAudience, setFormItemAudience] = useState('Gen Z');
  const [formItemRatio, setFormItemRatio] = useState('9:16');
  const [formItemDuration, setFormItemDuration] = useState('30s');
  const [formItemLanguage, setFormItemLanguage] = useState('Telugu');
  const [formItemTools, setFormItemTools] = useState<string[]>(['Veo', 'ElevenLabs']);
  const [formItemRole, setFormItemRole] = useState('AI Director');
  const [formItemClient, setFormItemClient] = useState('');
  const [formItemVisibility, setFormItemVisibility] = useState<'public' | 'private'>('public');
  const [formItemFeatured, setFormItemFeatured] = useState<boolean>(false);

  // Tool tag input state
  const [newToolInput, setNewToolInput] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch Profile Data from API
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/creators/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.creator) {
          setCreator(data.creator);
          setCompleteness(data.completeness || calculateProfileCompleteness(data.creator));
        }
      } else {
        // Fallback to local user account data
        const fallbackCreator: Creator = {
          id: currentUser.id,
          name: currentUser.name,
          handle: currentUser.handle || `@${currentUser.name.toLowerCase().replace(/\s+/g, '_')}.ai`,
          headline: 'Generative AI Director & Visual Cinematographer',
          avatar: currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}`,
          specialization: currentUser.specialization || 'Commercial AI Filmmaking',
          categories: ['Skincare & Beauty', 'Automotive & Speed'],
          bio: currentUser.bio || 'AI Director crafting high-fidelity commercials with Veo, Kling, and Runway Gen-3.',
          location: currentUser.location || 'Bengaluru, India',
          languages: ['English', 'Telugu'],
          skills: currentUser.skills || ['Prompt Architecture', 'Lighting Simulation', 'Voice Dubbing'],
          tools: currentUser.tools || ['Veo', 'Kling', 'Midjourney v6.1'],
          hourlyRate: currentUser.hourlyRate || 12000,
          projectRate: 45000,
          pricingModel: 'Hourly / Milestone',
          avgTurnaround: '48 Hours',
          availableNow: true,
          isVerified: currentUser.isVerified ?? true,
          rating: 5.0,
          reviewCount: 3,
          completedProjects: 8,
          commercialUse: 'Full Buyout',
          portfolio: [],
        };
        setCreator(fallbackCreator);
        setCompleteness(calculateProfileCompleteness(fallbackCreator));
      }
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      showToast('Could not load profile from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 2. Save Profile Changes
  const handleSaveProfile = async () => {
    if (!creator) return;
    setSaving(true);
    try {
      const res = await fetch('/api/creators/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creator),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update profile.');
      }

      setCreator(data.creator);
      setCompleteness(data.completeness || calculateProfileCompleteness(data.creator));
      showToast('Profile and commercial preferences saved successfully!');
    } catch (err: any) {
      console.error('Save profile error:', err);
      showToast(err.message || 'Error saving profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 3. Media Upload Handler (File to Server)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'media' | 'thumbnail' | 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'File upload failed.');
      }

      const fileUrl = data.url;
      if (target === 'media') {
        setFormItemMediaUrl(fileUrl);
        if (!formItemThumbnail) setFormItemThumbnail(fileUrl);
        showToast('Media file uploaded successfully!');
      } else if (target === 'thumbnail') {
        setFormItemThumbnail(fileUrl);
        showToast('Thumbnail uploaded successfully!');
      } else if (target === 'avatar' && creator) {
        setCreator({ ...creator, avatar: fileUrl });
        showToast('Avatar uploaded successfully!');
      } else if (target === 'cover' && creator) {
        setCreator({ ...creator, coverImage: fileUrl });
        showToast('Cover photo uploaded successfully!');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      showToast(err.message || 'Failed to upload media.', 'error');
    } finally {
      setUploadingMedia(false);
      e.target.value = '';
    }
  };

  // 4. Open Add/Edit Portfolio Modal
  const openPortfolioModal = (item?: PortfolioItem) => {
    if (item) {
      setEditingItem(item);
      setFormItemTitle(item.title);
      setFormItemType(item.type);
      setFormItemMediaUrl(item.mediaUrl);
      setFormItemThumbnail(item.thumbnail || item.mediaUrl);
      setFormItemDescription(item.workflowDescription || item.workflow || '');
      setFormItemCategory(item.category || item.contentType || 'Skincare & Beauty');
      setFormItemStyle(item.style || 'Photorealistic Cinematic');
      setFormItemAudience(item.targetAudience || 'Gen Z');
      setFormItemRatio(item.aspectRatio || '9:16');
      setFormItemDuration(item.duration || '30s');
      setFormItemLanguage(item.language || 'English');
      setFormItemTools(item.tools || ['Veo', 'Kling']);
      setFormItemRole(item.projectRole || 'AI Director');
      setFormItemClient(item.client || '');
      setFormItemVisibility(item.visibility || 'public');
      setFormItemFeatured(Boolean(item.featured));
    } else {
      setEditingItem(null);
      setFormItemTitle('');
      setFormItemType('video');
      setFormItemMediaUrl('');
      setFormItemThumbnail('');
      setFormItemDescription('');
      setFormItemCategory('Skincare & Beauty');
      setFormItemStyle('Photorealistic Cinematic');
      setFormItemAudience('Gen Z');
      setFormItemRatio('9:16');
      setFormItemDuration('30s');
      setFormItemLanguage('Telugu');
      setFormItemTools(['Veo', 'ElevenLabs']);
      setFormItemRole('Lead AI Director');
      setFormItemClient('');
      setFormItemVisibility('public');
      setFormItemFeatured(false);
    }
    setPortfolioModalOpen(true);
  };

  // 5. Submit Portfolio Project (Create or Update)
  const handleSubmitPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItemTitle.trim()) {
      showToast('Project title is required.', 'error');
      return;
    }
    if (!formItemMediaUrl.trim()) {
      showToast('Media URL or uploaded file is required.', 'error');
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        const res = await fetch(`/api/creators/portfolio/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formItemTitle,
            type: formItemType,
            mediaUrl: formItemMediaUrl,
            thumbnail: formItemThumbnail || formItemMediaUrl,
            workflowDescription: formItemDescription,
            category: formItemCategory,
            style: formItemStyle,
            targetAudience: formItemAudience,
            aspectRatio: formItemRatio,
            duration: formItemDuration,
            language: formItemLanguage,
            tools: formItemTools,
            projectRole: formItemRole,
            client: formItemClient,
            visibility: formItemVisibility,
            featured: formItemFeatured,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error?.message || 'Failed to update portfolio project.');
        }

        if (creator) {
          const updatedPortfolio = creator.portfolio.map(p => p.id === editingItem.id ? data.item : p);
          const updatedCreator = { ...creator, portfolio: updatedPortfolio };
          setCreator(updatedCreator);
          setCompleteness(calculateProfileCompleteness(updatedCreator));
        }
        showToast('Portfolio project updated successfully!');
      } else {
        // Create new item
        const res = await fetch('/api/creators/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formItemTitle,
            type: formItemType,
            mediaUrl: formItemMediaUrl,
            thumbnail: formItemThumbnail || formItemMediaUrl,
            workflowDescription: formItemDescription,
            category: formItemCategory,
            style: formItemStyle,
            targetAudience: formItemAudience,
            aspectRatio: formItemRatio,
            duration: formItemDuration,
            language: formItemLanguage,
            tools: formItemTools,
            projectRole: formItemRole,
            client: formItemClient,
            visibility: formItemVisibility,
            featured: formItemFeatured,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error?.message || 'Failed to publish portfolio project.');
        }

        if (creator) {
          const updatedPortfolio = [data.item, ...creator.portfolio];
          const updatedCreator = { ...creator, portfolio: updatedPortfolio };
          setCreator(updatedCreator);
          setCompleteness(calculateProfileCompleteness(updatedCreator));
        }
        showToast('New project published to portfolio and indexed for AI matching!');
      }

      setPortfolioModalOpen(false);
    } catch (err: any) {
      console.error('Portfolio save error:', err);
      showToast(err.message || 'Failed to save portfolio project.', 'error');
    }
  };

  // 6. Delete Portfolio Project
  const handleDeletePortfolioItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/creators/portfolio/${itemId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to delete portfolio project.');
      }

      if (creator) {
        const updatedPortfolio = creator.portfolio.filter(p => p.id !== itemId);
        const updatedCreator = { ...creator, portfolio: updatedPortfolio };
        setCreator(updatedCreator);
        setCompleteness(calculateProfileCompleteness(updatedCreator));
      }
      setItemDeletingId(null);
      showToast('Project removed from portfolio.');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete project.', 'error');
    }
  };

  // 7. Toggle Featured Status
  const handleToggleFeatured = async (item: PortfolioItem) => {
    try {
      const nextFeatured = !item.featured;
      const res = await fetch(`/api/creators/portfolio/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: nextFeatured }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update featured status.');
      }

      if (creator) {
        const updatedPortfolio = creator.portfolio.map(p => p.id === item.id ? { ...p, featured: nextFeatured } : p);
        setCreator({ ...creator, portfolio: updatedPortfolio });
      }
      showToast(nextFeatured ? 'Project marked as Featured!' : 'Project unfeatured.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // 8. Toggle Visibility (Public ⇄ Private)
  const handleToggleVisibility = async (item: PortfolioItem) => {
    try {
      const nextVis: 'public' | 'private' = item.visibility === 'private' ? 'public' : 'private';
      const res = await fetch(`/api/creators/portfolio/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: nextVis }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update visibility.');
      }

      if (creator) {
        const updatedPortfolio: PortfolioItem[] = creator.portfolio.map(p => p.id === item.id ? { ...p, visibility: nextVis } : p);
        setCreator({ ...creator, portfolio: updatedPortfolio });
      }
      showToast(nextVis === 'public' ? 'Project is now public.' : 'Project is now private.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // 9. Reorder Portfolio Items
  const handleReorder = (index: number, direction: 'up' | 'down') => {
    if (!creator) return;
    const items = [...creator.portfolio];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    setCreator({ ...creator, portfolio: items });
    showToast('Reordered. Click "Save Profile" to persist order.');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-3" />
        <p className="text-sm text-zinc-400">Loading creator profile and portfolio workspace...</p>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Creator Profile Not Found</h2>
        <p className="text-xs text-zinc-400 mt-1">Please ensure you are signed in with a creator account.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border text-xs font-medium flex items-center gap-2 backdrop-blur-xl ${
            toastType === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200' 
              : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
          }`}
        >
          {toastType === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
              title="Return to Workspace"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Creator Profile & Portfolio Studio
              </h1>
              {creator.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-medium text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manage your commercial identity, verified tools, and portfolio evidence.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onPreviewPublicProfile && (
            <button
              onClick={() => onPreviewPublicProfile(creator.id)}
              className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              <span>Public Preview</span>
            </button>
          )}

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex-1 sm:flex-initial px-5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      {/* Profile Completeness Score Card */}
      {completeness && (
        <div className="mb-6 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">Profile Completeness: {completeness.score}%</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              {completeness.score >= 80 ? 'Optimal for AI Match Engine' : 'Recommendations available'}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
              style={{ width: `${completeness.score}%` }}
            />
          </div>

          {completeness.suggestions.length > 0 && (
            <div className="pt-1 text-[11px] text-zinc-400 space-y-1">
              <span className="font-medium text-zinc-300">Actionable Suggestions:</span>
              <ul className="list-disc list-inside space-y-0.5 text-zinc-400 pl-1">
                {completeness.suggestions.slice(0, 3).map((sugg, i) => (
                  <li key={i}>{sugg}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'info' 
              ? 'bg-zinc-800 text-white font-semibold' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          General & Bio
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'portfolio' 
              ? 'bg-zinc-800 text-white font-semibold' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>Portfolio Studio</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-900 border border-zinc-700 text-zinc-300">
            {creator.portfolio.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('commercial')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'commercial' 
              ? 'bg-zinc-800 text-white font-semibold' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Commercial & Pricing
        </button>
      </div>

      {/* TAB 1: GENERAL INFO & BIO */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          
          {/* Photos Box */}
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Profile Visuals</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <img 
                  src={creator.avatar} 
                  alt={creator.name}
                  className="w-16 h-16 rounded-xl object-cover bg-zinc-950 border border-zinc-700 shrink-0" 
                />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <label className="text-xs font-medium text-zinc-300 block">Avatar Photo</label>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium cursor-pointer border border-zinc-700 transition-colors inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingMedia ? 'Uploading...' : 'Upload'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        disabled={uploadingMedia}
                        onChange={(e) => handleFileUpload(e, 'avatar')} 
                      />
                    </label>
                    <input 
                      type="text" 
                      value={creator.avatar}
                      onChange={(e) => setCreator({ ...creator, avatar: e.target.value })}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300 font-mono focus:outline-none focus:border-zinc-700 truncate"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Cover Photo */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">Cover Banner Photo</label>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium cursor-pointer border border-zinc-700 transition-colors inline-flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      disabled={uploadingMedia}
                      onChange={(e) => handleFileUpload(e, 'cover')} 
                    />
                  </label>
                  <input 
                    type="text" 
                    value={creator.coverImage || ''}
                    onChange={(e) => setCreator({ ...creator, coverImage: e.target.value })}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300 font-mono focus:outline-none focus:border-zinc-700 truncate"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Core Information */}
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Professional Identity</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Full Name</label>
                <input 
                  type="text"
                  value={creator.name}
                  onChange={(e) => setCreator({ ...creator, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Handle / Username</label>
                <input 
                  type="text"
                  value={creator.handle}
                  onChange={(e) => setCreator({ ...creator, handle: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-zinc-300 block mb-1">Professional Headline</label>
                <input 
                  type="text"
                  value={creator.headline || ''}
                  onChange={(e) => setCreator({ ...creator, headline: e.target.value })}
                  placeholder="e.g. Lead Generative AI Cinematographer & Creative Technologist"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Primary Specialization</label>
                <input 
                  type="text"
                  value={creator.specialization}
                  onChange={(e) => setCreator({ ...creator, specialization: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Location / Base City</label>
                <input 
                  type="text"
                  value={creator.location}
                  onChange={(e) => setCreator({ ...creator, location: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-zinc-300 block mb-1">Biography & Creative Direction</label>
                <textarea 
                  rows={4}
                  value={creator.bio}
                  onChange={(e) => setCreator({ ...creator, bio: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 leading-relaxed font-normal"
                />
              </div>
            </div>
          </div>

          {/* Languages & Categories */}
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Supported Languages & Target Markets</h3>
            
            <div className="flex flex-wrap gap-2">
              {COMMON_LANGUAGES.map((lang) => {
                const isSelected = (creator.languages || []).includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      const cur = creator.languages || [];
                      const next = isSelected ? cur.filter(l => l !== lang) : [...cur, lang];
                      setCreator({ ...creator, languages: next });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      isSelected 
                        ? 'bg-white text-zinc-950 font-semibold border-white' 
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {lang} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Tools & Skills Stack */}
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Production AI Tools Stack</h3>
              <span className="text-[11px] text-zinc-500 font-mono">Used for factor 3 AI matching</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(creator.tools || []).map((tool) => (
                <span
                  key={tool}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-zinc-800 text-zinc-200 border border-zinc-700"
                >
                  <span>{tool}</span>
                  <button
                    type="button"
                    onClick={() => setCreator({ ...creator, tools: creator.tools.filter(t => t !== tool) })}
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Quick Add Tool buttons */}
            <div className="pt-2">
              <span className="text-[11px] text-zinc-400 block mb-1.5">Quick Add Verified Models:</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_AI_TOOLS.filter(t => !(creator.tools || []).includes(t)).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCreator({ ...creator, tools: [...(creator.tools || []), t] })}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="text" 
                value={newToolInput}
                onChange={(e) => setNewToolInput(e.target.value)}
                placeholder="Custom tool or proprietary model..."
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700 flex-1 max-w-sm"
              />
              <button
                type="button"
                onClick={() => {
                  if (newToolInput.trim()) {
                    setCreator({ ...creator, tools: [...(creator.tools || []), newToolInput.trim()] });
                    setNewToolInput('');
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors"
              >
                Add Tool
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PORTFOLIO MANAGEMENT STUDIO */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/60 rounded-xl border border-zinc-800 p-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Portfolio Projects ({creator.portfolio.length})</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Each project acts as verified evidence in GenCraft&apos;s 6-factor matching engine.
              </p>
            </div>

            <button
              onClick={() => openPortfolioModal()}
              className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Project</span>
            </button>
          </div>

          {/* Project Cards Grid */}
          {creator.portfolio.length === 0 ? (
            <div className="bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800 p-12 text-center space-y-3">
              <Film className="w-10 h-10 text-zinc-600 mx-auto" />
              <h4 className="text-sm font-semibold text-white">No Portfolio Projects Yet</h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Add projects showcasing your AI video directing, aspect ratios, tools used, and creative briefs to start matching with brands.
              </p>
              <button
                onClick={() => openPortfolioModal()}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish First Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {creator.portfolio.map((item, index) => (
                <div 
                  key={item.id}
                  className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col group relative"
                >
                  {/* Media Preview Thumbnail */}
                  <div className="aspect-video w-full bg-zinc-950 relative overflow-hidden">
                    <img 
                      src={item.thumbnail || item.mediaUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                    
                    {/* Badges Overlay */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900/90 border border-zinc-700 text-zinc-200 backdrop-blur-sm">
                        {item.aspectRatio}
                      </span>
                      {item.duration && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-900/90 border border-zinc-700 text-zinc-300 backdrop-blur-sm">
                          {item.duration}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                      {/* Featured Star Button */}
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        className={`p-1.5 rounded-lg border backdrop-blur-sm transition-colors ${
                          item.featured 
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                            : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white'
                        }`}
                        title={item.featured ? 'Featured Project' : 'Click to feature'}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.featured ? 'fill-amber-400' : ''}`} />
                      </button>

                      {/* Visibility Toggle Button */}
                      <button
                        onClick={() => handleToggleVisibility(item)}
                        className={`p-1.5 rounded-lg border backdrop-blur-sm transition-colors ${
                          item.visibility === 'private'
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                            : 'bg-zinc-900/80 border-zinc-700 text-emerald-400 hover:text-emerald-300'
                        }`}
                        title={item.visibility === 'private' ? 'Private (Owner only)' : 'Public to brands'}
                      >
                        {item.visibility === 'private' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Category Title bottom left */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-emerald-400 drop-shadow">
                        {item.category || item.contentType || 'Commercial'}
                      </span>
                      {item.client && (
                        <span className="text-[10px] text-zinc-300 drop-shadow">
                          {item.client}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-snug line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.workflowDescription || 'No workflow description provided.'}
                      </p>
                    </div>

                    {/* Tools Tags */}
                    {item.tools && item.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tools.slice(0, 3).map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom Action Row */}
                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-zinc-400">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleReorder(index, 'up')}
                          className="p-1 hover:text-white disabled:opacity-20"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === creator.portfolio.length - 1}
                          onClick={() => handleReorder(index, 'down')}
                          className="p-1 hover:text-white disabled:opacity-20"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openPortfolioModal(item)}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3 h-3 text-zinc-400" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setItemDeletingId(item.id)}
                          className="p-1.5 rounded bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 3: COMMERCIAL & AVAILABILITY */}
      {activeTab === 'commercial' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Rates & Pricing Model</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Standard Hourly Rate (₹ INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-zinc-500">₹</span>
                  <input 
                    type="number"
                    value={creator.hourlyRate}
                    onChange={(e) => setCreator({ ...creator, hourlyRate: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Estimated Milestone / Project Rate (₹ INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-zinc-500">₹</span>
                  <input 
                    type="number"
                    value={creator.projectRate || 40000}
                    onChange={(e) => setCreator({ ...creator, projectRate: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Average Turnaround Time</label>
                <input 
                  type="text"
                  value={creator.avgTurnaround}
                  onChange={(e) => setCreator({ ...creator, avgTurnaround: e.target.value })}
                  placeholder="e.g. 48 Hours"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Pricing Model</label>
                <select
                  value={creator.pricingModel || 'Hourly / Milestone'}
                  onChange={(e) => setCreator({ ...creator, pricingModel: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
                >
                  <option value="Hourly / Milestone">Hourly / Milestone Based</option>
                  <option value="Fixed Deliverable">Fixed Deliverable Package</option>
                  <option value="Retainer Contract">Monthly Agency Retainer</option>
                </select>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-white block">Availability Status</label>
                    <p className="text-[11px] text-zinc-400">Display "Available Now" badge to brands browsing marketplace.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCreator({ ...creator, availableNow: !creator.availableNow })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      creator.availableNow ? 'bg-emerald-500' : 'bg-zinc-800'
                    }`}
                  >
                    <span 
                      className={`w-4 h-4 rounded-full bg-white transition-transform block absolute top-1 ${
                        creator.availableNow ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PORTFOLIO ITEM CREATE / EDIT MODAL */}
      {portfolioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                {editingItem ? 'Edit Portfolio Project' : 'Publish New Portfolio Project'}
              </h3>
              <button
                onClick={() => setPortfolioModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPortfolio} className="space-y-4">
              
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Project Title *</label>
                <input 
                  type="text" 
                  required
                  value={formItemTitle}
                  onChange={(e) => setFormItemTitle(e.target.value)}
                  placeholder="e.g. Aura Hydration Serum — Vertical Cinematic 4K Spot"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
                />
              </div>

              {/* Media File Upload or URL */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300 block">Project Media Asset *</label>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium cursor-pointer border border-zinc-700 transition-colors inline-flex items-center justify-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingMedia ? 'Uploading...' : 'Upload Video/Image'}</span>
                    <input 
                      type="file" 
                      accept="video/*,image/*,audio/*" 
                      className="hidden" 
                      disabled={uploadingMedia}
                      onChange={(e) => handleFileUpload(e, 'media')} 
                    />
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formItemMediaUrl}
                    onChange={(e) => setFormItemMediaUrl(e.target.value)}
                    placeholder="Or enter media URL (Vimeo, YouTube, S3, Cloudinary, MP4)..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-zinc-700 truncate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Media Type</label>
                  <select
                    value={formItemType}
                    onChange={(e) => setFormItemType(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="video">Video (MP4 / WebM)</option>
                    <option value="image">Image (High-Res)</option>
                    <option value="audio">Audio / Voice Spot</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Aspect Ratio</label>
                  <select
                    value={formItemRatio}
                    onChange={(e) => setFormItemRatio(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="9:16">9:16 (Vertical Reels/TikTok)</option>
                    <option value="16:9">16:9 (Landscape Cinematic)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:5">4:5 (Instagram Portrait)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Duration</label>
                  <input 
                    type="text"
                    value={formItemDuration}
                    onChange={(e) => setFormItemDuration(e.target.value)}
                    placeholder="e.g. 30s"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Industry / Category</label>
                  <select
                    value={formItemCategory}
                    onChange={(e) => setFormItemCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    {COMMON_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Visual Style / Aesthetic</label>
                  <input 
                    type="text"
                    value={formItemStyle}
                    onChange={(e) => setFormItemStyle(e.target.value)}
                    placeholder="Photorealistic, Cinematic, 3D"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Target Language</label>
                  <input 
                    type="text"
                    value={formItemLanguage}
                    onChange={(e) => setFormItemLanguage(e.target.value)}
                    placeholder="Telugu, English, Hindi"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Tools Multi-Select */}
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">AI Tools Used in this Project</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COMMON_AI_TOOLS.map((t) => {
                    const isSelected = formItemTools.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          const next = isSelected ? formItemTools.filter(x => x !== t) : [...formItemTools, t];
                          setFormItemTools(next);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                          isSelected 
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold' 
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {t} {isSelected ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Creative Brief & Production Workflow</label>
                <textarea 
                  rows={3}
                  value={formItemDescription}
                  onChange={(e) => setFormItemDescription(e.target.value)}
                  placeholder="Describe the generation prompt, lighting simulation, and tool orchestration pipeline..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 leading-relaxed font-normal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="chk-featured"
                    checked={formItemFeatured}
                    onChange={(e) => setFormItemFeatured(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-emerald-500" 
                  />
                  <label htmlFor="chk-featured" className="text-xs text-zinc-300 cursor-pointer">
                    Highlight as Featured Project
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-zinc-300">Visibility:</label>
                  <select
                    value={formItemVisibility}
                    onChange={(e) => setFormItemVisibility(e.target.value as any)}
                    className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value="public">Public (Visible to Brands)</option>
                    <option value="private">Private (Owner Only)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setPortfolioModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold"
                >
                  {editingItem ? 'Save Changes' : 'Publish Project'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {itemDeletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#121215] border border-zinc-800 rounded-xl p-5 max-w-sm w-full space-y-4 text-center">
            <Trash2 className="w-8 h-8 text-rose-400 mx-auto" />
            <div>
              <h4 className="text-sm font-bold text-white">Delete Portfolio Project?</h4>
              <p className="text-xs text-zinc-400 mt-1">
                This project will be permanently removed from your portfolio and will no longer count as matching evidence.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setItemDeletingId(null)}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePortfolioItem(itemDeletingId)}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
