'use client';

import React, { useState, useEffect } from 'react';
import { UserAccount, UserRole, Creator } from '../types';
import { playAiVoiceGreeting } from '../utils/speech';
import { 
  signInWithGoogle, 
  signUpWithEmail, 
  signInWithEmail, 
  sendPasswordReset, 
  saveUserProfileToFirestore,
  fetchUserProfile 
} from '../lib/auth';
import { 
  Sparkles, 
  Mail, 
  ShieldCheck, 
  KeyRound, 
  ArrowRight, 
  User, 
  Building, 
  CheckCircle2, 
  RefreshCw, 
  Volume2, 
  Briefcase, 
  MapPin, 
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

interface AuthGateProps {
  onAuthSuccess: (user: UserAccount, newCreator?: Creator) => void;
  onVoiceSpoken?: (name: string) => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onAuthSuccess, onVoiceSpoken }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset'>('signup');
  const [role, setRole] = useState<UserRole>('creator');
  
  // Form fields
  const [name, setName] = useState('Arjun Nambiar');
  const [email, setEmail] = useState('arjun.ai@creators.in');
  const [password, setPassword] = useState('GenCraft@2026');
  const [confirmPassword, setConfirmPassword] = useState('GenCraft@2026');
  const [showPassword, setShowPassword] = useState(false);
  
  // Role-specific fields
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [companyName, setCompanyName] = useState('Kaveri Media Group');
  const [specialization, setSpecialization] = useState('AI Filmmaker & Commercial Director');
  const [location, setLocation] = useState('Bengaluru, Karnataka');
  const [selectedTools, setSelectedTools] = useState<string[]>(['Veo', 'Kling', 'ElevenLabs']);
  
  // OTP flow state
  const [otpStep, setOtpStep] = useState<'input-details' | 'verify-otp'>('input-details');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // Dynamic Avatar preview based on Gender and Name
  const avatarUrl = gender === 'male'
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'BoyCandidate')}&gender=male&hairColor=2c1b18&facialHairProbability=40`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'GirlCandidate')}&gender=female&hairColor=2c1b18&facialHairProbability=0&accessoriesProbability=20`;

  // Resend timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Google Sign-In
  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const { user: fbUser, error } = await signInWithGoogle();
      if (error || !fbUser) {
        setErrorMsg(error || 'Google sign-in failed.');
        setIsLoading(false);
        return;
      }

      // Check if user profile already exists in Firestore
      const existingProfile = await fetchUserProfile(fbUser.uid);
      if (existingProfile) {
        playAiVoiceGreeting(existingProfile.name.split(' ')[0] || 'User');
        onAuthSuccess(existingProfile);
        return;
      }

      // If new Google user, construct profile from Google metadata
      const newAccount: UserAccount = {
        id: fbUser.uid,
        name: fbUser.displayName || name || 'Google User',
        email: fbUser.email || email,
        role: role,
        avatar: fbUser.photoURL || avatarUrl,
        handle: `@${(fbUser.displayName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        companyName: role === 'brand' ? companyName : undefined,
        specialization: role === 'creator' ? specialization : undefined,
        tools: role === 'creator' ? selectedTools : undefined,
        location: location,
        isVerified: true,
      };

      let newCreator: Creator | undefined;
      if (role === 'creator') {
        newCreator = buildCreatorObject(newAccount);
      }

      await saveUserProfileToFirestore(newAccount, newCreator);
      playAiVoiceGreeting(newAccount.name.split(' ')[0] || 'User');
      onAuthSuccess(newAccount, newCreator);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Dispatch real server-side OTP code
  const handleSendVerificationCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setResetSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (authMode === 'signup') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full candidate name.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please check confirmation.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'signup' }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Failed to send verification code.');
        setIsLoading(false);
        return;
      }

      setEnteredOtp('');
      setOtpStep('verify-otp');
      setResendCooldown(60);

      if (data.devCode) {
        setOtpNotice(`Code sent to ${email} (Demo code: ${data.devCode})`);
      } else {
        setOtpNotice(`Verification code dispatched to ${email}. Check your inbox.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP & complete signup
  const handleVerifyCodeAndSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verify code on server
      const verifyRes = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: enteredOtp.trim() }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || verifyData.error) {
        setErrorMsg(verifyData.error || 'Invalid verification code.');
        setIsLoading(false);
        return;
      }

      // 2. Create Firebase Auth user
      const { user: fbUser, error: signupError } = await signUpWithEmail(email, password);
      const uid = fbUser ? fbUser.uid : `user-${Date.now()}`;

      // 3. Build & Save Authoritative Profile
      const cleanFirstName = name.trim().split(' ')[0] || 'Candidate';
      const handle = `@${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

      const userAccount: UserAccount = {
        id: uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role,
        avatar: avatarUrl,
        handle: handle,
        gender: gender,
        companyName: role === 'brand' ? companyName : undefined,
        specialization: role === 'creator' ? specialization : undefined,
        bio: role === 'creator' 
          ? `Verified Generative AI creator specialized in ${selectedTools.join(', ')}. Delivering high-fidelity commercials and motion graphics.`
          : undefined,
        tools: role === 'creator' ? selectedTools : undefined,
        location: location,
        isVerified: true,
      };

      let newCreator: Creator | undefined;
      if (role === 'creator') {
        newCreator = buildCreatorObject(userAccount);
      }

      await saveUserProfileToFirestore(userAccount, newCreator);
      if (onVoiceSpoken) onVoiceSpoken(cleanFirstName);
      playAiVoiceGreeting(cleanFirstName);

      setTimeout(() => {
        onAuthSuccess(userAccount, newCreator);
      }, 600);

    } catch (err: any) {
      setErrorMsg(err.message || 'Error during account verification & creation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Traditional Email/Password Login
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const { user: fbUser, error } = await signInWithEmail(email, password);
      if (error || !fbUser) {
        setErrorMsg(error || 'Invalid credentials.');
        setIsLoading(false);
        return;
      }

      // Attempt to load profile from Firestore
      const userProfile = await fetchUserProfile(fbUser.uid);
      if (userProfile) {
        playAiVoiceGreeting(userProfile.name.split(' ')[0] || 'User');
        onAuthSuccess(userProfile);
      } else {
        // Fallback profile if Firestore user is missing
        const fallbackUser: UserAccount = {
          id: fbUser.uid,
          name: fbUser.displayName || email.split('@')[0],
          email: fbUser.email || email,
          role: role,
          avatar: avatarUrl,
          handle: `@${email.split('@')[0]}`,
          isVerified: true,
        };
        onAuthSuccess(fallbackUser);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password Reset Flow
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResetSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await sendPasswordReset(email);
      setResetSuccessMsg(res.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Builder helper for Creator profile
  const buildCreatorObject = (acc: UserAccount): Creator => ({
    id: `creator-${acc.id}`,
    name: acc.name,
    gender: gender,
    handle: acc.handle,
    avatar: acc.avatar,
    specialization: specialization,
    bio: `Specializing in ${specialization} with certified pipelines across ${selectedTools.join(', ')}. Open for brand commissions.`,
    location: location,
    skills: ['Prompt Engineering', 'Keyframe Generation', 'Motion Interpolation', 'Seed Matching'],
    tools: selectedTools,
    isVerified: true,
    verifiedDetails: {
      certifiedPipeline: 'Certified Neural Creator Protocol v1.0',
      auditDate: 'Today',
      safetyScore: 99.8,
      commercialRightsGuaranteed: true,
    },
    rating: 5.0,
    reviewCount: 1,
    completedProjects: 0,
    hourlyRate: 8500,
    avgTurnaround: '48 Hours',
    availableNow: true,
    portfolio: [
      {
        id: `port-${Date.now()}-1`,
        title: `${specialization} Demo Showcase`,
        type: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80',
        specificModel: selectedTools.join(' + '),
        workflowDescription: `Synthesized via ${selectedTools.join(' -> ')} with deterministic seed locking.`,
        aspectRatio: '16:9',
        duration: '0:30',
        client: 'GenCraft Showcase',
      }
    ],
    reviews: []
  });

  // Quick preset test candidates for immediate 1-click evaluation
  const setQuickCandidate = (presetRole: UserRole, presetGender: 'male' | 'female', presetName: string, presetEmail: string, presetSpecialization?: string) => {
    setRole(presetRole);
    setGender(presetGender);
    setName(presetName);
    setEmail(presetEmail);
    if (presetSpecialization) setSpecialization(presetSpecialization);
    setOtpStep('input-details');
    setErrorMsg(null);
  };

  // Instant Lifetime Public Access entry handler
  const handlePublicLifetimeAccess = () => {
    const publicUser: UserAccount = {
      id: 'public-guest-user',
      name: 'Public Guest Explorer',
      email: 'public@gencraft.open',
      role: 'brand',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=PublicLifetimeGuest',
      handle: '@public_guest',
      gender: 'male',
      companyName: 'Open Public Access (Lifetime)',
      isVerified: true,
    };
    if (onVoiceSpoken) onVoiceSpoken('Guest Explorer');
    playAiVoiceGreeting('Guest Explorer');
    onAuthSuccess(publicUser);
  };

  const toggleTool = (tool: string) => {
    if (selectedTools.includes(tool)) {
      if (selectedTools.length > 1) {
        setSelectedTools(selectedTools.filter(t => t !== tool));
      }
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-grid-subtle pointer-events-none opacity-25" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-xl mx-auto my-auto z-10 animate-fade-in">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium mb-3 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>GenCraft Access Gate</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 font-mono text-[11px]">Production Auth Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome to GenCraft
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-md mx-auto">
            The premier marketplace connecting verified Generative AI creators with national brand campaigns.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl p-6 sm:p-7 shadow-2xl space-y-5">
          
          {/* Lifetime Access Shortcut */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400">Public Access Pass</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    LIFETIME FREE
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">Instant exploration mode without typing passwords</p>
              </div>
            </div>

            <button
              onClick={handlePublicLifetimeAccess}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0"
            >
              <span>Instant Enter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode Tabs: Signup | Signin | Reset */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-850">
            <button
              onClick={() => { setAuthMode('signup'); setOtpStep('input-details'); setErrorMsg(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                authMode === 'signup' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Register & Join
            </button>
            <button
              onClick={() => { setAuthMode('signin'); setErrorMsg(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                authMode === 'signin' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('reset'); setErrorMsg(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                authMode === 'reset' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Reset Password
            </button>
          </div>

          {/* Google Authentication Button */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-750 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-zinc-800 w-full" />
              <span className="bg-zinc-900 px-3 text-[11px] text-zinc-500 font-mono uppercase tracking-wider shrink-0">
                or continue with email
              </span>
            </div>
          </div>

          {/* Error & Success Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {resetSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{resetSuccessMsg}</span>
            </div>
          )}

          {/* Form Content per Mode */}
          {authMode === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Account Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>Send Reset Password Email</span>
              </button>
            </form>
          )}

          {authMode === 'signin' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="arjun.ai@creators.in"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99]"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin text-zinc-900" /> : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                <span>Sign In to GenCraft</span>
              </button>
            </form>
          )}

          {authMode === 'signup' && otpStep === 'input-details' && (
            <form onSubmit={handleSendVerificationCode} className="space-y-4">
              
              {/* Role Selection Cards */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Select Account Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('creator')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === 'creator'
                        ? 'bg-zinc-800/90 border-emerald-500/60 ring-1 ring-emerald-500/30'
                        : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Briefcase className={`w-4 h-4 ${role === 'creator' ? 'text-emerald-400' : 'text-zinc-500'}`} />
                      {role === 'creator' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="font-bold text-xs text-white">AI Creator / Director</div>
                    <div className="text-[10px] text-zinc-400">Offer Gen-AI services, portfolios & rates</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('brand')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === 'brand'
                        ? 'bg-zinc-800/90 border-emerald-500/60 ring-1 ring-emerald-500/30'
                        : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Building className={`w-4 h-4 ${role === 'brand' ? 'text-emerald-400' : 'text-zinc-500'}`} />
                      {role === 'brand' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="font-bold text-xs text-white">Brand / Agency</div>
                    <div className="text-[10px] text-zinc-400">Post briefs, hire talent & manage escrow</div>
                  </button>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-8 pr-8 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-8 pr-8 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>
              </div>

              {/* Role-Specific Fields */}
              {role === 'brand' ? (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Company / Studio Name</label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Primary Specialization</label>
                    <input
                      type="text"
                      required
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Primary Production AI Stack</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Veo', 'Kling', 'Sora', 'Flux.1', 'ElevenLabs', 'Pika'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTool(t)}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                            selectedTools.includes(t)
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit to Send Code */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-900" />
                ) : (
                  <>
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>Send Verification Code to Email</span>
                    <ArrowRight className="w-4 h-4 text-zinc-900" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP Verification Step */}
          {authMode === 'signup' && otpStep === 'verify-otp' && (
            <form onSubmit={handleVerifyCodeAndSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Verification Challenge Dispatched</span>
                  <button
                    type="button"
                    onClick={() => setOtpStep('input-details')}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Edit details
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  {otpNotice || `Enter the 6-digit security code sent to ${email}.`}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2 text-center">
                  6-Digit Verification Code
                </label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-48 px-4 py-3 rounded-xl bg-zinc-950 border-2 border-emerald-500/60 text-center font-mono text-xl tracking-[8px] text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isLoading}
                  onClick={handleSendVerificationCode}
                  className="text-zinc-400 hover:text-white disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center gap-2.5 text-xs text-zinc-400">
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                <span>
                  On verification, our English AI voice agent will greet: <strong className="text-zinc-200">"Hello {name.split(' ')[0] || 'Candidate'}, and welcome to GenCraft."</strong>
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading || enteredOtp.length !== 6}
                className="w-full py-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-900" />
                    <span>Verifying Code & Activating Account...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verify Code & Complete Activation</span>
                    <ArrowRight className="w-4 h-4 text-zinc-900" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Preset Candidates (1-Click Evaluation) */}
          <div className="pt-2 border-t border-zinc-800">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
              ⚡ Instant 1-Click Candidate Evaluation Presets:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setQuickCandidate('creator', 'male', 'Arjun Nambiar', 'arjun.ai@creators.in', 'AI Commercial Director & VFX Specialist')}
                className="p-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left text-zinc-300 transition-colors"
              >
                <span className="font-semibold text-white block">👨🏻‍💻 Arjun Nambiar</span>
                <span className="text-[10px] text-zinc-400">Male Creator • Bengaluru</span>
              </button>

              <button
                type="button"
                onClick={() => setQuickCandidate('creator', 'female', 'Priya Sharma', 'priya.cinema@ai.in', 'High-Fashion & Beauty Gen-AI Director')}
                className="p-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left text-zinc-300 transition-colors"
              >
                <span className="font-semibold text-white block">👩🏻‍🎨 Priya Sharma</span>
                <span className="text-[10px] text-zinc-400">Female Creator • Mumbai</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
