'use client';

import React, { useState, useEffect } from 'react';
import { UserAccount, UserRole, Creator } from '../types';
import { playAiVoiceGreeting } from '../utils/speech';
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
  Wand2,
  Lock,
  Radio
} from 'lucide-react';

interface AuthGateProps {
  onAuthSuccess: (user: UserAccount, newCreator?: Creator) => void;
  onVoiceSpoken?: (name: string) => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onAuthSuccess, onVoiceSpoken }) => {
  const [mode, setMode] = useState<'signin' | 'register'>('register');
  const [role, setRole] = useState<UserRole>('creator');
  
  // Form fields
  const [name, setName] = useState('Arjun Nambiar');
  const [email, setEmail] = useState('arjun.ai@creators.in');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [companyName, setCompanyName] = useState('Kaveri Media Group');
  const [specialization, setSpecialization] = useState('AI Filmmaker & Commercial Director');
  const [location, setLocation] = useState('Bengaluru, Karnataka');
  const [selectedTools, setSelectedTools] = useState<string[]>(['Veo', 'Kling', 'ElevenLabs']);
  
  // OTP flow state
  const [otpStep, setOtpStep] = useState<'input-details' | 'verify-otp'>('input-details');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

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

  // Generate 6-digit OTP and transition to OTP verification step
  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!name.trim()) {
      alert('Please enter your full candidate name.');
      return;
    }

    // Generate random 6-digit OTP
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setEnteredOtp('');
    setOtpError(null);
    setOtpStep('verify-otp');
    setResendCooldown(30);

    setOtpSentNotice(`Verification OTP dispatched to ${email}: ${randomOtp}`);
  };

  // Verify OTP and complete authentication
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpError(null);

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setOtpError('Invalid OTP. Please check the 6-digit code sent to your email.');
      return;
    }

    setIsVerifying(true);

    try {
      // 1. Play natural fluent AI Voice Greeting: "Hello [name], and welcome to CreateAI."
      const cleanFirstName = name.trim().split(' ')[0] || 'Candidate';
      if (onVoiceSpoken) {
        onVoiceSpoken(cleanFirstName);
      }
      playAiVoiceGreeting(cleanFirstName);

      // 2. Build User Account Object
      const userId = `user-${Date.now()}`;
      const handle = `@${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

      const userAccount: UserAccount = {
        id: userId,
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

      // 3. If registering as a creator, also create creator profile
      let newCreator: Creator | undefined = undefined;
      if (role === 'creator') {
        newCreator = {
          id: `creator-${Date.now()}`,
          name: name.trim(),
          gender: gender,
          handle: handle,
          avatar: avatarUrl,
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
              client: 'CreateAI Showcase'
            }
          ],
          reviews: []
        };
      }

      // Small pause to let user see successful confirmation state
      setTimeout(() => {
        onAuthSuccess(userAccount, newCreator);
      }, 700);

    } catch (err) {
      console.error('Error during OTP verification:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Quick preset test candidates for immediate 1-click evaluation
  const setQuickCandidate = (presetRole: UserRole, presetGender: 'male' | 'female', presetName: string, presetEmail: string, presetSpecialization?: string) => {
    setRole(presetRole);
    setGender(presetGender);
    setName(presetName);
    setEmail(presetEmail);
    if (presetSpecialization) setSpecialization(presetSpecialization);
    setOtpStep('input-details');
    setOtpSentNotice(null);
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
      {/* Subtle Grid & Gradient Ambient Background */}
      <div className="absolute inset-0 bg-grid-subtle pointer-events-none opacity-25" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-xl mx-auto my-auto z-10 animate-fade-in">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium mb-3 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CreateAI Access Gate</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 font-mono text-[11px]">Email OTP Verified</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome to CreateAI
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-md mx-auto">
            The premier marketplace connecting verified Generative AI creators with national brand campaigns.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl p-6 sm:p-7 shadow-2xl space-y-6">
          
          {/* Top Tabs: Sign In vs Register */}
          <div className="flex p-1 bg-zinc-950 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setOtpStep('input-details');
                setOtpSentNotice(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'register' 
                  ? 'bg-zinc-850 text-white shadow-sm border border-zinc-700/60' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Candidate Registration
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setOtpStep('input-details');
                setOtpSentNotice(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'signin' 
                  ? 'bg-zinc-850 text-white shadow-sm border border-zinc-700/60' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Registered Sign In
            </button>
          </div>

          {/* Role Choice */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-2">
              Select Your Role:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('creator')}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  role === 'creator'
                    ? 'bg-zinc-800/80 border-white/40 text-white ring-1 ring-white/20'
                    : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0 text-zinc-200">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">AI Creator / Employee</div>
                  <div className="text-[11px] text-zinc-400 leading-tight mt-0.5">Veo, Kling, Sora, Flux.1, ElevenLabs, Pika</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('brand')}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  role === 'brand'
                    ? 'bg-zinc-800/80 border-white/40 text-white ring-1 ring-white/20'
                    : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0 text-zinc-200">
                  <Building className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Brand / Client</div>
                  <div className="text-[11px] text-zinc-400 leading-tight mt-0.5">Post briefs, commission commercial talent</div>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 1: Input Candidate Details */}
          {otpStep === 'input-details' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              
              {/* Full Name & Avatar Preview */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                  Candidate Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Karthik Subramanian or Ananya Nair"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
                  />
                </div>
              </div>

              {/* Gender Avatar Selector */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                  Candidate Gender (Select Avatar Representation)
                </label>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-zinc-950 border border-zinc-850">
                  {/* Live Avatar Preview */}
                  <img
                    src={avatarUrl}
                    alt="Candidate Avatar Preview"
                    className="w-12 h-12 rounded-full border border-zinc-700 bg-zinc-900 object-cover shrink-0 shadow-sm"
                  />

                  <div className="flex-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-2 transition-all ${
                        gender === 'male'
                          ? 'bg-zinc-800 text-white border-zinc-600 shadow-sm'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      <span>Boy / Male Avatar</span>
                      {gender === 'male' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-2 transition-all ${
                        gender === 'female'
                          ? 'bg-zinc-800 text-white border-zinc-600 shadow-sm'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      <span>Girl / Female Avatar</span>
                      {gender === 'female' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                  Candidate Email (For OTP Verification)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@studio.in"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
                  />
                </div>
              </div>

              {/* Creator Specific Fields */}
              {role === 'creator' && mode === 'register' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                        Specialization Field
                      </label>
                      <select
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                      >
                        <option value="AI Filmmaker & Commercial Director">AI Filmmaker & Commercial Director</option>
                        <option value="Gen-AI Animator & Character Motion">Gen-AI Animator & Character Motion</option>
                        <option value="Photorealistic Product Visualist">Photorealistic Product Visualist</option>
                        <option value="AI Voice Actor & Sonic Branding">AI Voice Actor & Sonic Branding</option>
                        <option value="Sci-Fi Worldbuilder & Neural 3D">Sci-Fi Worldbuilder & Neural 3D</option>
                        <option value="High-Fashion Editorial & Avant-Garde">High-Fashion Editorial & Avant-Garde</option>
                        <option value="Stylized 3D & Mascot Animation">Stylized 3D & Mascot Animation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                        Location (Indian Hub)
                      </label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Bengaluru, Karnataka"
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Production Tools Checkboxes: Strictly Veo, Kling, Sora, Flux.1, ElevenLabs, Pika */}
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                      Production AI Tools Mastery (Choose all that apply):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Veo', 'Kling', 'Sora', 'Flux.1', 'ElevenLabs', 'Pika'].map((tool) => {
                        const isSelected = selectedTools.includes(tool);
                        return (
                          <button
                            key={tool}
                            type="button"
                            onClick={() => toggleTool(tool)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-zinc-800 text-white border-zinc-600 shadow-sm'
                                : 'bg-zinc-950 text-zinc-500 border-zinc-850 hover:border-zinc-700 hover:text-zinc-300'
                            }`}
                          >
                            <span>{tool}</span>
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Brand Specific Field */}
              {role === 'brand' && mode === 'register' && (
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                    Brand / Agency Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Kaveri Creative Studios"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button to Request OTP */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-semibold text-xs sm:text-sm bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center gap-2 transition-all shadow-lg shadow-white/5 active:scale-[0.99]"
                >
                  <Mail className="w-4 h-4 text-zinc-900" />
                  <span>Send 6-Digit Email Verification Code</span>
                  <ArrowRight className="w-4 h-4 text-zinc-900" />
                </button>
              </div>

            </form>
          )}

          {/* STEP 2: Verify 6-digit OTP */}
          {otpStep === 'verify-otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fade-in">
              
              {/* Simulated Live Dispatch Alert Banner */}
              {otpSentNotice && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold">{otpSentNotice}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-emerald-300/80 pt-1 border-t border-emerald-800/40">
                    <span>Simulated Inbox Delivery</span>
                    <button
                      type="button"
                      onClick={() => setEnteredOtp(generatedOtp)}
                      className="underline font-bold text-white hover:text-emerald-300"
                    >
                      Click here to auto-fill ({generatedOtp})
                    </button>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                    Enter 6-Digit Security OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => setOtpStep('input-details')}
                    className="text-xs text-zinc-400 hover:text-white underline"
                  >
                    Edit Email / Info
                  </button>
                </div>

                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 6-digit code"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-700 text-lg sm:text-xl font-mono text-center tracking-widest text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                  />
                </div>

                {otpError && (
                  <p className="text-xs text-red-400 mt-2 font-medium">
                    {otpError}
                  </p>
                )}
              </div>

              {/* Resend OTP Row */}
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Didn’t receive the code?</span>
                {resendCooldown > 0 ? (
                  <span className="text-zinc-500 font-mono">
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-white hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP Code</span>
                  </button>
                )}
              </div>

              {/* AI Voice Bot Notice Indicator */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center gap-2.5 text-xs text-zinc-400">
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                <span>
                  On verification, our English AI voice agent will greet: <strong className="text-zinc-200">"Hello {name.split(' ')[0] || 'Candidate'}, and welcome to CreateAI."</strong>
                </span>
              </div>

              {/* Verify & Enter Button */}
              <button
                type="submit"
                disabled={isVerifying || enteredOtp.length !== 6}
                className="w-full py-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99]"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-900" />
                    <span>Verifying OTP & Initializing AI Voice...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verify Email & Enter CreateAI</span>
                    <ArrowRight className="w-4 h-4 text-zinc-900" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* Quick Demo Candidate Profiles (1-Click Evaluation) */}
          <div className="pt-2 border-t border-zinc-800">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
              ⚡ Instant 1-Click Candidate Evaluation Presets:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setQuickCandidate('creator', 'male', 'Karthik Subramanian', 'karthik.subramanian@creators.in', 'AI Filmmaker & Commercial Director')}
                className="px-2.5 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-left text-[11px] text-zinc-300 transition-colors"
              >
                <div className="font-semibold text-white">👨 Karthik (Boy)</div>
                <div className="text-zinc-500 text-[10px]">AI Filmmaker (Veo/Kling)</div>
              </button>

              <button
                type="button"
                onClick={() => setQuickCandidate('creator', 'female', 'Ananya Nair', 'ananya.nair@creators.in', 'Gen-AI Animator & Character Motion')}
                className="px-2.5 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-left text-[11px] text-zinc-300 transition-colors"
              >
                <div className="font-semibold text-white">👩 Ananya (Girl)</div>
                <div className="text-zinc-500 text-[10px]">Gen-AI Animator (Sora/Kling)</div>
              </button>

              <button
                type="button"
                onClick={() => setQuickCandidate('brand', 'male', 'Rohan Mehra', 'rohan@kaveristudios.in')}
                className="px-2.5 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-left text-[11px] text-zinc-300 transition-colors"
              >
                <div className="font-semibold text-white">🏢 Kaveri Studios</div>
                <div className="text-zinc-500 text-[10px]">Brand Client</div>
              </button>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center mt-4 text-xs text-zinc-500 flex items-center justify-center gap-3 font-mono">
          <span>Enterprise 256-Bit SSL</span>
          <span>•</span>
          <span>Audited Seed Protocols</span>
          <span>•</span>
          <span>Indian Rupee Escrow</span>
        </div>

      </div>
    </div>
  );
};
