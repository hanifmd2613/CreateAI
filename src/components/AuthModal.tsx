'use client';

import React, { useState } from 'react';
import { UserAccount, UserRole, Creator } from '../types';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  User, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  IndianRupee, 
  Mail, 
  Lock,
  Layers
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
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
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
  const [portfolioTitle, setPortfolioTitle] = useState('Kaveri Horizon: Cyberpunk Reveal');
  const [portfolioModel, setPortfolioModel] = useState('Flux.1 + Veo + Kling');
  const [portfolioWorkflow, setPortfolioWorkflow] = useState('Generated base keyframes in Flux.1 -> Animated with Veo -> High-speed camera sweep in Kling');
  const [requestVerification, setRequestVerification] = useState(true);

  if (!isOpen) return null;

  const toggleTool = (t: string) => {
    if (tools.includes(t)) {
      setTools(tools.filter(x => x !== t));
    } else {
      setTools([...tools, t]);
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

  // Handle Signup Submission
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      alert('Please fill out your name and email.');
      return;
    }

    const cleanHandle = handle.trim() ? (handle.startsWith('@') ? handle : `@${handle}`) : `@${name.toLowerCase().replace(/\s+/g, '_')}.ai`;

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name,
      email,
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
        skills: ['Prompt Engineering', 'LoRA Weights', 'Neural Interpolation', 'Latent Upscaling', 'Spatial Foley'],
        tools,
        isVerified: requestVerification,
        verifiedDetails: {
          certifiedPipeline: 'Certified User Creator Tier-1 Engine',
          auditDate: 'Account Created Live',
          safetyScore: 99.9,
          commercialRightsGuaranteed: true,
        },
        rating: 5.0,
        reviewCount: 1,
        completedProjects: 0,
        hourlyRate: Number(hourlyRate),
        avgTurnaround: '24-48 Hours',
        availableNow: true,
        isUserCreated: true,
        portfolio: [
          {
            id: `port-${newUser.id}-1`,
            title: portfolioTitle || 'Debut Generative Showcase',
            type: 'video',
            mediaUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80',
            thumbnail: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80',
            specificModel: portfolioModel,
            workflowDescription: portfolioWorkflow,
            aspectRatio: '16:9',
            duration: '0:30',
            client: 'Debut Portfolio Piece',
            promptSnippet: 'Cinematic hyperrealistic capture, 8k resolution, volumetric studio lighting',
            views: '1.2K',
            likes: 85,
            steps: [
              { step: 1, phase: 'Seed Generation', tool: tools[0] || 'Veo', description: 'Deterministic seed generation.' },
              { step: 2, phase: 'Refinement Pass', tool: tools[1] || 'Kling', description: 'Motion interpolation and upscaling.' },
            ]
          }
        ],
        reviews: []
      };
    }

    onLoginSuccess(newUser, newCreatorData);
    onClose();
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      alert('Please enter your email.');
      return;
    }

    const user: UserAccount = {
      id: `user-${Date.now()}`,
      name: loginEmail.split('@')[0],
      email: loginEmail,
      role: selectedRole,
      avatar: AVATAR_PRESETS[1],
      handle: `@${loginEmail.split('@')[0]}`,
      isVerified: true,
    };
    onLoginSuccess(user);
    onClose();
  };

  const handleModalMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div 
        onMouseMove={handleModalMouseMove}
        className="bg-zinc-900 rounded-2xl max-w-2xl w-full border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto section-glow"
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

        {/* Tab Controls: Signup vs Login */}
        <div className="px-6 pt-3 pb-2 bg-zinc-950/50 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAuthMode('signup')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                authMode === 'signup'
                  ? 'bg-white text-zinc-950 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => setAuthMode('login')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                authMode === 'login'
                  ? 'bg-white text-zinc-950 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Quick Demo Logins */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-zinc-500 text-[11px] font-mono">Demo:</span>
            <button
              onClick={() => handleQuickLogin('brand')}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-[11px] border border-zinc-700"
            >
              Kaveri Studios (Brand)
            </button>
            <button
              onClick={() => handleQuickLogin('creator')}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-[11px] border border-zinc-700"
            >
              Karthik (Creator)
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* SIGNUP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-5">
              
              {/* ROLE SELECTOR CARDS */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-2">
                  1. Select Account Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Creator Role Card */}
                  <div
                    onClick={() => setSelectedRole('creator')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      selectedRole === 'creator'
                        ? 'border-zinc-500 bg-zinc-800/90'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      {selectedRole === 'creator' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-zinc-950">
                          Selected
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-white text-xs">Gen-AI Creator</h4>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      Publish verified generative workflows (Veo, Kling, Sora, Flux.1, ElevenLabs, Pika) and receive commissions from enterprise brands.
                    </p>
                  </div>

                  {/* Brand Role Card */}
                  <div
                    onClick={() => setSelectedRole('brand')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      selectedRole === 'brand'
                        ? 'border-zinc-500 bg-zinc-800/90'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center font-bold">
                        <Briefcase className="w-3.5 h-3.5" />
                      </div>
                      {selectedRole === 'brand' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-zinc-950">
                          Selected
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-white text-xs">Brand / Enterprise Client</h4>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      Post campaign briefs, commission vetted AI filmmakers, manage escrow contracts, and secure 100% commercial buyouts.
                    </p>
                  </div>

                </div>
              </div>

              {/* Basic Identity Details */}
              <div className="space-y-3.5">
                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  2. Personal Identity & Details
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={selectedRole === 'creator' ? 'Ananya Nair' : 'Rohan Sharma'}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      {selectedRole === 'creator' ? 'Creator Handle' : 'Company Name'}
                    </label>
                    <input
                      type="text"
                      value={selectedRole === 'creator' ? handle : companyName}
                      onChange={(e) => selectedRole === 'creator' ? setHandle(e.target.value) : setCompanyName(e.target.value)}
                      placeholder={selectedRole === 'creator' ? '@ananya_neural.ai' : 'Kaveri Creative Studios'}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-600 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="creative@studio.com"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="New York, NY"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>

                {/* Real Person Avatar Selector */}
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1.5">
                    Profile Avatar
                  </label>
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {AVATAR_PRESETS.map((av, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedAvatar(av)}
                        className={`w-10 h-10 rounded-xl overflow-hidden cursor-pointer border-2 transition-all shrink-0 ${
                          selectedAvatar === av
                            ? 'border-white scale-105'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={av} alt="avatar option" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CREATOR-SPECIFIC PROFILE SETUP */}
              {selectedRole === 'creator' && (
                <div className="space-y-3.5 pt-3 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                      3. Creator Specialization & Stack
                    </label>
                    <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700 font-mono">
                      Live Studio Profile
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Primary AI Discipline
                      </label>
                      <select
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-600"
                      >
                        <option value="AI Filmmaker & Commercial Director">AI Filmmaker & Commercial Director</option>
                        <option value="Gen-AI Animator & Character Motion">Gen-AI Animator & Character Motion</option>
                        <option value="Photorealistic Product Visualist">Photorealistic Product Visualist</option>
                        <option value="AI Audio & Sonic Branding">AI Audio & Sonic Branding</option>
                        <option value="Sci-Fi Worldbuilder & Neural 3D">Sci-Fi Worldbuilder & Neural 3D</option>
                        <option value="High-Fashion Editorial Artist">High-Fashion Editorial Artist</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Hourly Rate (₹ / hr)
                      </label>
                      <div className="relative">
                        <IndianRupee className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                        <input
                          type="number"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(Number(e.target.value))}
                          placeholder="9500"
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-semibold focus:outline-none focus:border-zinc-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Tools Selection */}
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1.5">
                      Production Model Tools (Click to select)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Veo',
                        'Kling',
                        'Sora',
                        'Flux.1',
                        'ElevenLabs',
                        'Pika'
                      ].map((t) => {
                        const sel = tools.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleTool(t)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                              sel
                                ? 'bg-zinc-800 text-white border-zinc-600'
                                : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-white'
                            }`}
                          >
                            {sel && '✓ '}
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Creative Statement & Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-600"
                    />
                  </div>

                  {/* Debut Portfolio Item */}
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block">
                      Portfolio (Appears on your card)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1">Project Title</label>
                        <input
                          type="text"
                          value={portfolioTitle}
                          onChange={(e) => setPortfolioTitle(e.target.value)}
                          placeholder="e.g. Kaveri Horizon: Cyber Drift"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1">Model Pipeline</label>
                        <input
                          type="text"
                          value={portfolioModel}
                          onChange={(e) => setPortfolioModel(e.target.value)}
                          placeholder="Flux.1 + Veo + Kling"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">Workflow Step Description</label>
                      <input
                        type="text"
                        value={portfolioWorkflow}
                        onChange={(e) => setPortfolioWorkflow(e.target.value)}
                        placeholder="Keyframes in Flux.1 -> Animated in Veo -> Motion in Kling"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Request Verification Seal */}
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-zinc-300 text-xs">Audited Workflow Clearance Seal</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={requestVerification}
                      onChange={(e) => setRequestVerification(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-zinc-900 border-zinc-700 text-zinc-200"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>
                    {selectedRole === 'creator' ? 'Publish Creator Profile to Marketplace' : 'Create Enterprise Account'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </form>
          )}

          {/* SIGN IN (LOGIN) FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="kai@kaivance.ai or producer@apex.com"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-600"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded bg-zinc-800" />
                  <span>Remember session</span>
                </label>
                <span className="text-zinc-400 hover:text-white cursor-pointer">Forgot password?</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors"
              >
                Sign In to GenCraft
              </button>

              <div className="pt-3 border-t border-zinc-850 text-center">
                <p className="text-xs text-zinc-400">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="text-zinc-200 font-semibold hover:underline"
                  >
                    Register according to your role
                  </button>
                </p>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
