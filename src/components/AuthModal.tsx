'use client';

import React, { useState } from 'react';
import { UserAccount, UserRole, Creator } from '../types';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, sendPasswordReset, saveUserProfileToFirestore } from '../lib/auth';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  User, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Mail, 
  Lock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLoginSuccess: (user: UserAccount, newCreator?: Creator) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('signup');
  const [selectedRole, setSelectedRole] = useState<UserRole>('creator');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup fields
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [companyName, setCompanyName] = useState('');
  
  // Creator specific fields
  const [specialization, setSpecialization] = useState('AI Filmmaker & Commercial Director');
  const [bio, setBio] = useState('Specializing in cinematic commercials, neural camera paths, and custom prompt workflows for global brand campaigns.');
  const [hourlyRate, setHourlyRate] = useState(9500);
  const [location, setLocation] = useState('Mumbai, India');
  const [tools, setTools] = useState<string[]>(['Veo', 'Kling', 'Sora', 'Flux.1']);
  
  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleTool = (t: string) => {
    if (tools.includes(t)) {
      setTools(tools.filter(x => x !== t));
    } else {
      setTools([...tools, t]);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const { user: fbUser, error } = await signInWithGoogle();
      if (error || !fbUser) {
        setErrorMsg(error || 'Google sign-in failed.');
        setIsLoading(false);
        return;
      }

      const userAcc: UserAccount = {
        id: fbUser.uid,
        name: fbUser.displayName || name || 'Google User',
        email: fbUser.email || email,
        role: selectedRole,
        avatar: fbUser.photoURL || selectedAvatar,
        handle: `@${(fbUser.displayName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        companyName: selectedRole === 'brand' ? (companyName || 'Brand Studio') : undefined,
        specialization: selectedRole === 'creator' ? specialization : undefined,
        isVerified: true,
      };

      await saveUserProfileToFirestore(userAcc);
      onLoginSuccess(userAcc);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Auth Error');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Login Quick-links
  const handleQuickLogin = (role: UserRole) => {
    if (role === 'brand') {
      const brandUser: UserAccount = {
        id: 'user-brand-kaveri',
        name: 'Kaveri Creative Studios',
        email: 'campaigns@kaveristudios.in',
        role: 'brand',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
        handle: '@kaveri_studios',
        companyName: 'Kaveri Creative Studios (Bengaluru & Delhi)',
        isVerified: true,
      };
      onLoginSuccess(brandUser);
      onClose();
    } else {
      const creatorUser: UserAccount = {
        id: 'creator-1',
        name: 'Karthik Subramanian',
        email: 'karthik@karthiksubramanian.ai',
        role: 'creator',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        handle: '@karthik_director.ai',
        specialization: 'AI Filmmaker & Commercial Director',
        hourlyRate: 12500,
        location: 'Bengaluru, Karnataka',
        tools: ['Veo', 'Kling', 'Sora', 'Flux.1', 'ElevenLabs'],
        isVerified: true,
      };
      onLoginSuccess(creatorUser);
      onClose();
    }
  };

  // Handle Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const { user: fbUser, error } = await signInWithEmail(loginEmail, loginPassword);
      if (error || !fbUser) {
        setErrorMsg(error || 'Invalid credentials.');
        setIsLoading(false);
        return;
      }

      const userAcc: UserAccount = {
        id: fbUser.uid,
        name: fbUser.displayName || loginEmail.split('@')[0],
        email: fbUser.email || loginEmail,
        role: selectedRole,
        avatar: selectedAvatar,
        handle: `@${loginEmail.split('@')[0]}`,
        isVerified: true,
      };

      onLoginSuccess(userAcc);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Signup Submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const { user: fbUser, error } = await signUpWithEmail(email, password);
      const uid = fbUser ? fbUser.uid : `user-${Date.now()}`;

      const cleanHandle = handle.trim() ? (handle.startsWith('@') ? handle : `@${handle}`) : `@${name.toLowerCase().replace(/\s+/g, '_')}.ai`;

      const newUser: UserAccount = {
        id: uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: selectedRole,
        avatar: selectedAvatar,
        handle: cleanHandle,
        companyName: selectedRole === 'brand' ? (companyName || `${name} Studios`) : undefined,
        specialization: selectedRole === 'creator' ? specialization : undefined,
        bio: selectedRole === 'creator' ? bio : undefined,
        tools: selectedRole === 'creator' ? tools : undefined,
        hourlyRate: selectedRole === 'creator' ? Number(hourlyRate) : undefined,
        location,
        isVerified: true,
      };

      let newCreatorData: Creator | undefined = undefined;

      if (selectedRole === 'creator') {
        newCreatorData = {
          id: newUser.id,
          name: newUser.name,
          handle: newUser.handle,
          avatar: newUser.avatar,
          coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          specialization,
          bio,
          location,
          skills: ['Prompt Engineering', 'LoRA Weights', 'Neural Interpolation', 'Latent Upscaling'],
          tools,
          hourlyRate: Number(hourlyRate),
          isVerified: true,
          verifiedDetails: {
            certifiedPipeline: 'Certified GenCraft Pipeline v1.0',
            auditDate: 'Today',
            safetyScore: 99.8,
            commercialRightsGuaranteed: true,
          },
          rating: 5.0,
          reviewCount: 1,
          completedProjects: 1,
          avgTurnaround: '48 Hours',
          availableNow: true,
          portfolio: [],
          reviews: []
        };
      }

      await saveUserProfileToFirestore(newUser, newCreatorData);
      onLoginSuccess(newUser, newCreatorData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password reset submit
  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResetSuccessMsg(null);

    if (!loginEmail || !loginEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await sendPasswordReset(loginEmail);
      setResetSuccessMsg(res.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                GenCraft Account & Role
              </h3>
              <p className="text-xs text-zinc-400">
                Join or manage your marketplace account
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls: Signup vs Login vs Reset */}
        <div className="px-6 pt-3 pb-2 bg-zinc-950/50 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setAuthMode('signup'); setErrorMsg(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                authMode === 'signup'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Register Account
            </button>
            <button
              onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                authMode === 'login'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('reset'); setErrorMsg(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                authMode === 'reset'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Reset Password
            </button>
          </div>

          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Marketplace
          </span>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">

          {/* Google Quick Auth Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {resetSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{resetSuccessMsg}</span>
            </div>
          )}

          {/* Password Reset View */}
          {authMode === 'reset' && (
            <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Account Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-600"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>Send Reset Link</span>
              </button>
            </form>
          )}

          {/* Login Form */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="karthik@karthiksubramanian.ai"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>Sign In to GenCraft</span>
              </button>
            </form>
          )}

          {/* Signup Form */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              
              {/* Role Selection Cards */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Select Account Role</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('creator')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedRole === 'creator'
                        ? 'bg-zinc-900 border-white/40 ring-1 ring-white/20'
                        : 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      {selectedRole === 'creator' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="font-semibold text-xs text-white">AI Creator / Director</div>
                    <div className="text-[10px] text-zinc-400">Offer Gen-AI services, portfolios & rates</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('brand')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedRole === 'brand'
                        ? 'bg-zinc-900 border-white/40 ring-1 ring-white/20'
                        : 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <User className="w-4 h-4 text-blue-400" />
                      {selectedRole === 'brand' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <div className="font-semibold text-xs text-white">Brand / Client</div>
                    <div className="text-[10px] text-zinc-400">Post briefs & hire directors</div>
                  </button>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Subhash Kumar"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="subhash@creative.ai"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-600"
                />
              </div>

              {selectedRole === 'brand' ? (
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Apex Media Group"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Specialization</label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="AI Commercials & Hyperrealism"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Tools Used</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Veo', 'Kling', 'Sora', 'Flux.1', 'ElevenLabs', 'Pika'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTool(t)}
                          className={`px-2 py-1 rounded text-xs transition-colors ${
                            tools.includes(t)
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>Create GenCraft Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Quick Demo Logins */}
          <div className="pt-3 border-t border-zinc-850">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
              ⚡ Instant 1-Click Preset Logins:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('brand')}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left text-zinc-300 transition-colors"
              >
                <span className="font-semibold text-white block">🏢 Kaveri Studios</span>
                <span className="text-[10px] text-zinc-400">Brand Client Account</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('creator')}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left text-zinc-300 transition-colors"
              >
                <span className="font-semibold text-white block">🎬 Karthik Subramanian</span>
                <span className="text-[10px] text-zinc-400">Creator Account</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
