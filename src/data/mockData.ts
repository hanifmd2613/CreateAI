import { Creator, Brief, CampaignDeliverable, CreatorEngagement, PlatformAnalytics } from '../types';

export const MOCK_CREATORS: Creator[] = [
  {
    id: 'creator-1',
    name: 'Karthik Subramanian',
    gender: 'male',
    handle: '@karthik_director.ai',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KarthikSubramanian&gender=male&hairColor=000000&facialHairProbability=60&accessoriesProbability=20',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    specialization: 'AI Filmmaker & Commercial Director',
    bio: 'Pioneering narrative Gen-AI commercials and high-concept cinematic films. Winner of the 2024 Bengaluru AI Film Showcase Best Direction. Certified commercially-safe workflow pipeline with seed auditing.',
    location: 'Bengaluru, Karnataka',
    skills: ['Cinematic Prompting', 'Camera Motion Paths', 'Latent Motion Synthesis', 'Color Calibration', 'Audio Foley'],
    tools: ['Veo', 'Kling', 'Sora', 'ElevenLabs'],
    isVerified: true,
    verifiedDetails: {
      certifiedPipeline: 'V24 Neural Production Tier-1 (Audited Checkpoints)',
      auditDate: 'Oct 2024',
      safetyScore: 99.8,
      commercialRightsGuaranteed: true,
    },
    rating: 4.98,
    reviewCount: 46,
    completedProjects: 52,
    hourlyRate: 12500,
    minProjectFeeINR: 9500,
    avgTurnaround: '48 Hours',
    availableNow: true,
    supportedPlatforms: ['Instagram', 'YouTube', 'TikTok', 'Web'],
    usageTerms: {
      commercialUseAllowed: true,
      licensingType: 'Full Buyout',
      defaultDurationMonths: 12,
      territory: 'Worldwide',
      supportedPlatforms: ['Instagram', 'YouTube', 'TikTok', 'Digital Ad Networks'],
      paidAdvertisingAllowed: true,
      exclusivityOffered: true,
      modificationRightsAllowed: true,
      thirdPartyAssetClearance: true,
      aiDisclosureCompliance: true,
      creatorRestrictions: 'None. Complete commercial buyout with worldwide clearance.'
    },
    portfolio: [
      {
        id: 'port-101',
        title: 'Project Kaveri: Neon Cyber Drift',
        type: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Veo + Kling + ElevenLabs',
        workflowDescription: 'Generated high-contrast keyframes in Flux.1 -> Cinematic camera tracking in Veo -> High-speed drift physics in Kling -> Spatial sound via ElevenLabs',
        aspectRatio: '16:9',
        duration: '0:34',
        client: 'Nandi Electric Mobility (Bengaluru)',
        promptSnippet: 'Cinematic hyperrealistic dark Bengaluru rain highway, electric supercar drift, neon reflections on wet asphalt, anamorphic lens flare, 8k resolution, shot on Arri Alexa 65 --ar 16:9 --v 6.0',
        views: '128K',
        likes: 1420,
        steps: [
          { step: 1, phase: 'Keyframe Generation', tool: 'Flux.1', description: 'Generated 40 photorealistic camera angles using custom style reference seeds.' },
          { step: 2, phase: 'Camera Motion Path', tool: 'Veo', description: 'Generated continuous fluid camera sweeps and reflective rain highlights.' },
          { step: 3, phase: 'Motion Synthesis', tool: 'Kling', description: 'Simulated wheel dynamics, wet tire smoke, and acceleration motion.' },
          { step: 4, phase: 'Sonic Design', tool: 'ElevenLabs', description: 'Synthesized electric engine whines and realistic wet tire screech acoustics.' },
        ]
      },
      {
        id: 'port-102',
        title: 'Solitude in Orbit: Space Odyssey',
        type: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Sora + Veo Camera Tracking',
        workflowDescription: 'Generated long-take orbital sequence in Sora -> Extended with Veo for volumetric solar flare passes',
        aspectRatio: '16:9',
        duration: '0:48',
        client: 'Antrix Space Dynamics (Sriharikota)',
        promptSnippet: 'Slow sweeping orbital tracking shot of deep space station orbiting Saturn rings, golden hour solar reflection, dust particles, IMAX cinematic scale',
        views: '94K',
        likes: 980,
      },
      {
        id: 'port-103',
        title: 'Mysore Sandalwood & Jasmine: Liquid Bloom',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Flux.1 + Kling Video Loop',
        workflowDescription: 'Trained brand bottle weights in Flux.1 -> Looping fluid caustic animation generated via Kling',
        aspectRatio: '1:1',
        client: 'Mysore Heritage Botanicals',
        views: '45K',
        likes: 610
      }
    ],
    reviews: [
      {
        id: 'rev-1',
        brandName: 'Nandi Electric Mobility',
        brandLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=NandiEV',
        rating: 5,
        date: '2 days ago',
        comment: 'Karthik produced our Bengaluru EV teaser in under 72 hours. The Veo and Kling motion was buttery smooth and fully compliant with our legal brand guidelines.',
        projectTitle: 'Cyber Drift Teaser Video'
      }
    ]
  },
  {
    id: 'creator-2',
    name: 'Meera Krishnan',
    gender: 'female',
    handle: '@meera_couture.ai',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MeeraKrishnan&gender=female&hairColor=4a312c&facialHairProbability=0&accessoriesProbability=20',
    coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    specialization: 'High-Fashion Editorial & Avant-Garde',
    bio: 'Bridging heritage Indian handlooms, Kanjeevaram weaves, and digital futuristic garments. Former fashion creative director turned Generative AI visual artist for top Indian & international luxury brands.',
    location: 'Hyderabad, Telangana & Chennai',
    skills: ['Luxury Skincare', 'High-Fashion Motion', 'Fluid Dynamics', 'Macro Textiles', 'Flux.1 High-Res'],
    tools: ['Flux.1', 'Veo', 'Kling'],
    isVerified: true,
    verifiedDetails: {
      certifiedPipeline: 'Textile Surface Micro-Texture & Legal Buyout Audit',
      auditDate: 'Nov 2024',
      safetyScore: 99.9,
      commercialRightsGuaranteed: true,
    },
    rating: 4.99,
    reviewCount: 60,
    completedProjects: 65,
    hourlyRate: 15000,
    minProjectFeeINR: 10000,
    avgTurnaround: '24 Hours',
    availableNow: true,
    supportedPlatforms: ['Instagram', 'YouTube', 'Web'],
    usageTerms: {
      commercialUseAllowed: true,
      licensingType: 'Full Buyout',
      defaultDurationMonths: 12,
      territory: 'Worldwide',
      supportedPlatforms: ['Instagram', 'YouTube', 'Digital Ads'],
      paidAdvertisingAllowed: true,
      exclusivityOffered: true,
      modificationRightsAllowed: true,
      thirdPartyAssetClearance: true,
      aiDisclosureCompliance: true,
    },
    portfolio: [
      {
        id: 'port-201',
        title: 'Kanjeevaram Liquid Gold & Zari Couture',
        type: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Flux.1 + Veo Fluid Dynamics',
        workflowDescription: 'Synthesized molten gold micro-droplets flowing across pure mulberry silk zari threads with 9:16 vertical crop.',
        aspectRatio: '9:16',
        duration: '0:15',
        client: 'Mysore Silk Weavers Guild',
        views: '160K',
        likes: 2450
      },
      {
        id: 'port-202',
        title: 'Lotus Dew Drop: Ayurvedic Hydration Serum',
        type: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Flux.1 + Veo Macro Fluid Lighting',
        workflowDescription: 'Crystal clear water ripples caressing frosted amber dropper serum with pristine botanical lighting at 60fps.',
        aspectRatio: '9:16',
        duration: '0:15',
        client: 'Coorg Artisan Botanicals',
        views: '98K',
        likes: 1820
      }
    ],
    reviews: [
      {
        id: 'rev-2',
        brandName: 'Mysore Silk Weavers',
        brandLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=MysoreSilk',
        rating: 5,
        date: '1 week ago',
        comment: 'Meera captured our silk textures with astonishing fidelity. Her 9:16 vertical cuts drove 4.2x ROAS on Instagram ads.',
        projectTitle: 'Heritage Luxury Campaign'
      }
    ]
  },
  {
    id: 'creator-3',
    name: 'Rohan Sharma',
    gender: 'male',
    handle: '@rohan_visuals',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RohanSharma&gender=male&hairColor=2c1b18&facialHairProbability=30&accessoriesProbability=0',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    specialization: 'Photorealistic Product Visualist',
    bio: 'High-end commercial packshots, architectural interiors, and industrial product design visuals. Delivering pixel-perfect 8K imagery for national brand campaigns across North & South India.',
    location: 'New Delhi & Gurugram',
    skills: ['Flux.1 Prompting', 'Veo Product Motion', 'Kling Turntable', 'Studio Lighting', 'Color Grading'],
    tools: ['Flux.1', 'Veo', 'Kling'],
    isVerified: true,
    verifiedDetails: {
      certifiedPipeline: 'CAD Surface Integrity & Seed Manifest Protocol',
      auditDate: 'Oct 2024',
      safetyScore: 99.7,
      commercialRightsGuaranteed: true,
    },
    rating: 4.99,
    reviewCount: 78,
    completedProjects: 84,
    hourlyRate: 14000,
    minProjectFeeINR: 9000,
    avgTurnaround: '24 Hours',
    availableNow: true,
    supportedPlatforms: ['Instagram', 'Web'],
    // INTENTIONAL RIGHTS CONFLICT DEMO: Territory is India Only; no Worldwide rights
    usageTerms: {
      commercialUseAllowed: true,
      licensingType: 'Licensed Commercial',
      defaultDurationMonths: 6,
      territory: 'India Only',
      supportedPlatforms: ['Instagram', 'Digital Web'],
      paidAdvertisingAllowed: true,
      exclusivityOffered: false,
      modificationRightsAllowed: true,
      thirdPartyAssetClearance: true,
      aiDisclosureCompliance: true,
      creatorRestrictions: 'Licensed for Indian territory only. Global broadcast requires written extension.'
    },
    portfolio: [
      {
        id: 'port-301',
        title: 'Chronos Surya: Titanium Solar Chronograph',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Flux.1 + Kling Video Loop',
        workflowDescription: 'Reflective sapphire crystal and brushed titanium surfaces rendered in Flux.1.',
        aspectRatio: '1:1',
        client: 'Titan Haute Horlogerie (Delhi)',
        views: '76K',
        likes: 920
      }
    ],
    reviews: []
  },
  {
    id: 'creator-4',
    name: 'Aarav Kapoor',
    gender: 'male',
    handle: '@aarav_films',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AaravKapoor&gender=male&hairColor=2c1b18&facialHairProbability=40&accessoriesProbability=20',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    specialization: 'Cinematic Commercial Director',
    bio: 'Former Bollywood assistant director producing high-energy AI commercials, sports energy spots, and luxury automotive launches with certified camera motion control.',
    location: 'Mumbai, Maharashtra',
    skills: ['Veo Camera Rigging', 'Kling Speed Ramping', 'Commercial Storyboarding', 'Colorist Grading', 'Soundscapes'],
    tools: ['Veo', 'Kling', 'Sora', 'ElevenLabs'],
    isVerified: true,
    rating: 4.97,
    reviewCount: 49,
    completedProjects: 54,
    hourlyRate: 13000,
    minProjectFeeINR: 9800,
    avgTurnaround: '48 Hours',
    availableNow: true,
    supportedPlatforms: ['Instagram', 'YouTube', 'TikTok'],
    usageTerms: {
      commercialUseAllowed: true,
      licensingType: 'Full Buyout',
      defaultDurationMonths: 6,
      territory: 'India Only',
      supportedPlatforms: ['Instagram', 'YouTube'],
      paidAdvertisingAllowed: true,
      exclusivityOffered: true,
      modificationRightsAllowed: true,
      thirdPartyAssetClearance: true,
      aiDisclosureCompliance: true
    },
    portfolio: [
      {
        id: 'port-401',
        title: 'Pulse of Marine Drive: Monsoon Speed Run',
        type: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Veo + Kling High-Speed Motion',
        workflowDescription: 'High-speed camera tracking along wet Marine Drive promenades with synchronized vehicle reflections.',
        aspectRatio: '9:16',
        duration: '0:15',
        client: 'Redline India Energy',
        views: '110K',
        likes: 1980
      }
    ],
    reviews: []
  },
  {
    id: 'creator-5',
    name: 'Priya Venkatesh',
    gender: 'female',
    handle: '@priya_sonic.ai',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaVenkatesh&gender=female&hairColor=000000&facialHairProbability=0&accessoriesProbability=30',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    specialization: 'AI Voice Actor & Sonic Branding',
    bio: 'Multi-lingual voice synthesis across Tamil, Telugu, Hindi, Malayalam, and English. Crafting emotional audio beds, spatial audio foley, and brand acoustic logos.',
    location: 'Chennai, Tamil Nadu',
    skills: ['ElevenLabs Voice Cloning', 'Emotional Prosody Tuning', 'Acoustic Foley', 'Spatial Audio Beds', 'Localization'],
    tools: ['ElevenLabs', 'Veo', 'Sora'],
    isVerified: true,
    rating: 4.96,
    reviewCount: 33,
    completedProjects: 39,
    hourlyRate: 8500,
    minProjectFeeINR: 6500,
    avgTurnaround: '12 Hours',
    availableNow: true,
    supportedPlatforms: ['Instagram', 'YouTube', 'Podcast'],
    // INTENTIONAL PAID ADS CONFLICT DEMO: Paid Advertising Disallowed
    usageTerms: {
      commercialUseAllowed: true,
      licensingType: 'Licensed Commercial',
      defaultDurationMonths: 6,
      territory: 'India Only',
      supportedPlatforms: ['Organic Social', 'Podcast'],
      paidAdvertisingAllowed: false, // Disallowed!
      exclusivityOffered: false,
      modificationRightsAllowed: true,
      thirdPartyAssetClearance: true,
      aiDisclosureCompliance: true,
      creatorRestrictions: 'Voice likeness permitted for organic social posts only; paid whitelisting ads prohibited.'
    },
    portfolio: [
      {
        id: 'port-501',
        title: 'Voice of the Kaveri Delta: Multilingual Audio Doc',
        type: 'audio',
        mediaUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
        specificModel: 'ElevenLabs Sonic Engine',
        workflowDescription: 'Synthesized charismatic bilingual narration with localized Tamil and English prosody.',
        aspectRatio: '16:9',
        views: '54K',
        likes: 820
      }
    ],
    reviews: []
  },
  {
    id: 'creator-6',
    name: 'Ananya Nair',
    gender: 'female',
    handle: '@ananya_animates',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaNair&gender=female&hairColor=2c1b18&facialHairProbability=0&accessoriesProbability=40',
    coverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    specialization: 'Gen-AI Animator & Character Motion',
    bio: 'Crafting fluid stylized animation, beauty product visual loops, and commercial motion graphics using Kling, Sora, and Pika video generation models.',
    location: 'Kochi, Kerala & Bengaluru',
    skills: ['Character Consistency', 'Sora Directing', 'Kling Motion', 'Pika Animation', 'Fluid Product Loops'],
    tools: ['Flux.1', 'Kling', 'Pika', 'Veo'],
    isVerified: true,
    rating: 4.95,
    reviewCount: 38,
    completedProjects: 41,
    hourlyRate: 9800,
    minProjectFeeINR: 8500,
    avgTurnaround: '2 Days',
    availableNow: true,
    supportedPlatforms: ['Instagram', 'YouTube', 'TikTok'],
    usageTerms: {
      commercialUseAllowed: true,
      licensingType: 'Full Buyout',
      defaultDurationMonths: 6,
      territory: 'India Only',
      supportedPlatforms: ['Instagram', 'YouTube', 'Digital Ads'],
      paidAdvertisingAllowed: true,
      exclusivityOffered: true,
      modificationRightsAllowed: true,
      thirdPartyAssetClearance: true,
      aiDisclosureCompliance: true
    },
    portfolio: [
      {
        id: 'port-601',
        title: 'Whimsical Herbal Droplets of Wayanad',
        type: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Flux.1 + Pika Motion',
        workflowDescription: 'Organic botanical serum drops falling onto dewy leaves with tactile 9:16 vertical motion.',
        aspectRatio: '9:16',
        duration: '0:15',
        client: 'Sprout Wellness Media',
        views: '210K',
        likes: 3400
      }
    ],
    reviews: []
  },
  {
    id: 'creator-7',
    name: 'Kabir Malhotra',
    gender: 'male',
    handle: '@kabir_cyber',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KabirMalhotra&gender=male&hairColor=000000&facialHairProbability=50&accessoriesProbability=30',
    coverImage: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
    specialization: 'Sci-Fi Worldbuilder & Neural 3D',
    bio: 'Architecting complex sci-fi environments, futuristic metropolises, holographic UI, and product deconstruction animations using Veo, Kling, and Sora.',
    location: 'Chandigarh & New Delhi',
    skills: ['Sora Worldbuilding', 'Holographic VFX', 'Flux.1 Architecture', 'Kling Camera Roll', 'Unreal Engine Interop'],
    tools: ['Sora', 'Veo', 'Kling', 'Flux.1'],
    isVerified: true,
    rating: 4.94,
    reviewCount: 29,
    completedProjects: 34,
    hourlyRate: 11000,
    minProjectFeeINR: 9000,
    avgTurnaround: '3 Days',
    availableNow: true,
    supportedPlatforms: ['Instagram', 'YouTube'],
    usageTerms: {
      commercialUseAllowed: true,
      licensingType: 'Full Buyout',
      defaultDurationMonths: 6,
      territory: 'India Only',
      supportedPlatforms: ['Instagram', 'YouTube'],
      paidAdvertisingAllowed: true,
      exclusivityOffered: true,
      modificationRightsAllowed: true,
      thirdPartyAssetClearance: true,
      aiDisclosureCompliance: true
    },
    portfolio: [
      {
        id: 'port-701',
        title: 'Holographic Skin Bio-Scanner 2050',
        type: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Sora + Veo Camera Rig',
        workflowDescription: 'Futuristic dermal scanner analyzing facial hydration levels with luminous cybernetic UI.',
        aspectRatio: '9:16',
        duration: '0:15',
        views: '67K',
        likes: 990
      }
    ],
    reviews: []
  },
  {
    id: 'creator-8',
    name: 'Sneha Reddy',
    gender: 'female',
    handle: '@sneha_reddy.ai',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaReddy&gender=female&hairColor=000000&facialHairProbability=0&accessoriesProbability=0',
    coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
    specialization: 'Stylized 3D & Mascot Animation',
    bio: 'Cute 3D brand mascots, interactive character concepts, and cheerful animated micro-interactions for modern tech products and mobile apps.',
    location: 'Hyderabad, Telangana & Bengaluru',
    skills: ['Stylized 3D Rendering', 'Character Turnarounds', 'Flux.1 Prompting', 'Pika Animation', 'ElevenLabs Voices'],
    tools: ['Pika', 'Flux.1', 'Kling', 'ElevenLabs'],
    isVerified: false,
    rating: 4.88,
    reviewCount: 22,
    completedProjects: 26,
    hourlyRate: 7500,
    minProjectFeeINR: 6000,
    avgTurnaround: '24 Hours',
    availableNow: true,
    supportedPlatforms: ['Instagram'],
    // INTENTIONAL UNKNOWN RIGHTS DEMO: Missing advertising & territory specification
    usageTerms: {
      commercialUseAllowed: true,
      licensingType: 'Licensed Commercial',
      defaultDurationMonths: 3,
      territory: 'India Only',
      supportedPlatforms: [],
      paidAdvertisingAllowed: false,
      exclusivityOffered: false,
      modificationRightsAllowed: true,
      thirdPartyAssetClearance: false,
      aiDisclosureCompliance: true,
      creatorRestrictions: 'Standard freelance terms; formal ad whitelisting agreement pending.'
    },
    portfolio: [
      {
        id: 'port-801',
        title: 'Chhota Nandi: Interactive Brand Mascot',
        type: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Flux.1 + Pika Motion',
        workflowDescription: '3D animated mascot in 1:1 format.',
        aspectRatio: '1:1',
        duration: '0:12',
        views: '42K',
        likes: 670
      }
    ],
    reviews: []
  }
];

// Master Initial Briefs including the required Skincare Demo Campaign
export const INITIAL_BRIEFS: Brief[] = [
  {
    id: 'brief-skincare-demo',
    title: 'Ayurvedic Radiance Serum — 15s Vertical Video UGC Campaign',
    brandName: 'DermaGlow Organics & Coorg Botanicals',
    brandAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=DermaGlow',
    campaignObjective: 'Commission 5 specialized creators to produce 15-second vertical videos promoting our organic saffron & lotus hydration serum for high-converting Instagram ads.',
    productOrService: 'Ayurvedic Saffron & Lotus Bio-Hydration Serum (30ml Glass Dropper)',
    targetAudience: 'Skincare enthusiasts, Gen-Z and working professionals aged 21-35 in Indian metro cities.',
    industryNiche: 'Beauty, D2C Wellness & Ayurvedic Skincare',
    contentType: 'Short-form UGC & Commercial Video',
    style: 'Minimalist Scandinavian & Macro Fluid Dynamics',
    aspectRatio: '9:16',
    commercialUse: 'Full Buyout',
    budget: '₹50,000 (₹10,000 allocated per creator)',
    budgetMinINR: 40000,
    budgetMaxINR: 50000,
    deadline: '4 Days',
    description: 'We need 5 creators to produce 15-second vertical videos promoting our organic skincare product. Master cuts must feature macro fluid caustics, a 3-second hook, crisp packaging typography, and clean ambient lighting. Suitable for paid Instagram advertising in India for 6 months.',
    requiredTools: ['Flux.1', 'Veo', 'Kling'],
    requiredSkills: ['Macro Product Lighting', 'Vertical 9:16 Video Composition', 'Fluid Motion Dynamics', 'Color Grading'],
    targetPlatforms: ['Instagram', 'YouTube Shorts'],
    requiredCreatorsCount: 5,
    deliverables: [
      '15s Vertical Video Master (9:16, 1080x1920)',
      '3 High-Resolution Macro Packshots (4K)',
      'Deterministic Seed & Prompt Manifest Document',
      'Signed Commercial Usage Rights Agreement'
    ],
    deliverableSpecs: [
      {
        id: 'spec-skin-hero',
        title: '15s Vertical Hero Video (9:16)',
        format: 'MP4',
        aspectRatio: '9:16',
        width: 1080,
        height: 1920,
        targetDurationSeconds: 15,
        durationToleranceSeconds: 1.5,
        maxFileSizeBytes: 50 * 1024 * 1024, // 50MB
        requiredVariantsCount: 1,
        isStrict: true
      }
    ],
    usageRights: {
      purpose: 'Commercial Brand Campaign',
      commercialUse: 'Full Buyout',
      durationMonths: 6,
      territory: 'India Only',
      platforms: ['Instagram', 'YouTube'],
      paidAdvertisingRequired: true,
      exclusivityRequired: false,
      modificationRightsRequired: true,
      aiDisclosureRequired: true,
      customTerms: '6 months paid Instagram and YouTube ad whitelisting rights in India with derivative crop permissions.',
      confirmedByBrand: true,
      confirmedAt: '2026-10-24T10:00:00Z'
    },
    mandatoryCriteria: [
      'Vertical 9:16 Aspect Ratio capability',
      'Commercial usage & paid advertising whitelisting rights in India for 6 months',
      'Turnaround under 4 days',
      'Budget within ₹10,000 per creator allocation'
    ],
    preferredAttributes: [
      'Audited commercial pipeline with verified seed locks',
      'Prior beauty or skincare portfolio work samples',
      'Flux.1 and Veo tool proficiency'
    ],
    lifecycleStage: 'in_production',
    status: 'In Production',
    createdAt: 'Today, 10:00 AM',
    applicantsCount: 8,
    shortlistCreatorIds: ['creator-2', 'creator-6', 'creator-7', 'creator-1', 'creator-4'],
    selectedCreatorIds: ['creator-2', 'creator-6']
  },
  {
    id: 'brief-1',
    title: 'Next-Gen Electric Supercar 30s Reveal Spot',
    brandName: 'Nandi EV Technologies (Bengaluru)',
    brandAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=NandiEV',
    campaignObjective: 'Teaser campaign showcasing an electric supercar navigating nighttime Bengaluru highways.',
    productOrService: 'Nandi Hyperion EV Concept Car',
    targetAudience: 'Automotive and luxury technology buyers.',
    industryNiche: 'Automotive & Clean Tech',
    contentType: 'AI Commercial Video',
    style: 'Cinematic Hyperrealism',
    aspectRatio: '16:9',
    commercialUse: 'Full Buyout',
    budget: '₹5,20,000',
    budgetMinINR: 450000,
    budgetMaxINR: 520000,
    deadline: '5 Days',
    description: 'High-impact, adrenaline-fueled 30-second teaser showcasing electric supercar drifting through tech corridors and rain-slicked highway at night. Neon reflections, aerodynamic particle trails, and bespoke cinematic sound design.',
    requiredTools: ['Veo', 'Kling', 'ElevenLabs', 'Sora'],
    requiredSkills: ['Camera Motion Paths', 'Automotive Physics', 'Spatial Sound Foley'],
    targetPlatforms: ['YouTube', 'Instagram', 'Web'],
    requiredCreatorsCount: 1,
    deliverables: ['30s Master 4K Video (16:9)', '15s Vertical Cut for Reels (9:16)', 'Full Seed & Workflow Manifest'],
    deliverableSpecs: [
      {
        id: 'spec-car-1',
        title: '30s Master 4K Commercial (16:9)',
        format: 'MP4',
        aspectRatio: '16:9',
        width: 3840,
        height: 2160,
        targetDurationSeconds: 30,
        durationToleranceSeconds: 2.0,
        maxFileSizeBytes: 200 * 1024 * 1024,
        requiredVariantsCount: 1,
        isStrict: true
      }
    ],
    usageRights: {
      purpose: 'Commercial Brand Campaign',
      commercialUse: 'Full Buyout',
      durationMonths: 12,
      territory: 'Worldwide',
      platforms: ['YouTube', 'Instagram', 'Broadcast OTT'],
      paidAdvertisingRequired: true,
      exclusivityRequired: true,
      modificationRightsRequired: true,
      aiDisclosureRequired: true,
      confirmedByBrand: true,
    },
    mandatoryCriteria: ['Full Buyout with Worldwide clearance', '16:9 4K Master resolution'],
    preferredAttributes: ['Automotive portfolio evidence', 'Veo & Kling expertise'],
    lifecycleStage: 'shortlisted',
    status: 'In Review',
    createdAt: '2 hours ago',
    applicantsCount: 7,
    shortlistCreatorIds: ['creator-1', 'creator-4'],
    selectedCreatorIds: ['creator-1']
  },
  {
    id: 'brief-3',
    title: 'Carbon-Plate Athleisure Sneaker - Morphing Video Ad',
    brandName: 'NCR High-Tech Footwear (Delhi NCR)',
    brandAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=NCRFootwear',
    campaignObjective: 'Social media motion spot featuring high-tech sneakers deconstructing into physical streetwear.',
    productOrService: 'Carbon-Plate Marathon Stride Runner',
    targetAudience: 'Runners and urban fashion enthusiasts.',
    industryNiche: 'Athletic Footwear & Streetwear',
    contentType: 'Social Media Motion',
    style: 'Cyberpunk & Futuristic Streetwear',
    aspectRatio: '9:16',
    commercialUse: 'Licensed',
    budget: '₹3,50,000',
    budgetMinINR: 300000,
    budgetMaxINR: 350000,
    deadline: '4 Days',
    description: 'Dynamic Reels and YouTube Shorts campaign featuring carbon-plate sneaker deconstructing and morphing from digital wireframe particles into physical high-tech streetwear on a sprinter in New Delhi.',
    requiredTools: ['Sora', 'Kling', 'ElevenLabs'],
    requiredSkills: ['Wireframe Particle VFX', 'Motion Ramping', 'Cybernetic Sound'],
    targetPlatforms: ['Instagram', 'YouTube Shorts'],
    requiredCreatorsCount: 2,
    deliverables: ['3x 15s Shorts Variants (9:16)', 'Sound Design with Cybernetic Foley'],
    deliverableSpecs: [
      {
        id: 'spec-shoe-1',
        title: '15s Vertical Reel Cut',
        format: 'MP4',
        aspectRatio: '9:16',
        width: 1080,
        height: 1920,
        targetDurationSeconds: 15,
        durationToleranceSeconds: 1.0,
        maxFileSizeBytes: 60 * 1024 * 1024,
        requiredVariantsCount: 3,
        isStrict: true
      }
    ],
    usageRights: {
      purpose: 'Commercial Brand Campaign',
      commercialUse: 'Licensed Commercial',
      durationMonths: 6,
      territory: 'India Only',
      platforms: ['Instagram', 'YouTube'],
      paidAdvertisingRequired: true,
      exclusivityRequired: false,
      modificationRightsRequired: true,
      aiDisclosureRequired: true,
      confirmedByBrand: true,
    },
    mandatoryCriteria: ['9:16 Vertical format', '6 months commercial license'],
    preferredAttributes: ['Kling and Sora proficiency'],
    lifecycleStage: 'matching',
    status: 'Open',
    createdAt: '1 day ago',
    applicantsCount: 9,
    shortlistCreatorIds: [],
    selectedCreatorIds: []
  }
];

// Pre-seeded Deliverables for the Master Skincare Demo
export const INITIAL_DELIVERABLES: CampaignDeliverable[] = [
  {
    id: 'deliv-skin-01',
    campaignId: 'brief-skincare-demo',
    creatorId: 'creator-2', // Meera Krishnan
    specId: 'spec-skin-hero',
    title: '15s Vertical Hero Video (9:16) — Meera Cut',
    status: 'approved',
    currentVersionNumber: 2,
    versions: [
      {
        versionNumber: 1,
        fileUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
        fileName: 'DermaGlow_Hero_Meera_v1.mp4',
        fileSizeBytes: 24 * 1024 * 1024,
        fileType: 'video/mp4',
        dimensions: { width: 1080, height: 1920 },
        durationSeconds: 15.2,
        aspectRatioDetected: '9:16',
        submittedAt: 'Yesterday, 04:30 PM',
        submittedBy: 'Meera Krishnan',
        changelog: 'Initial v1 draft rendered via Flux.1 keyframe weights and Veo fluid caustics pass.',
        comments: [
          {
            id: 'comm-101',
            authorName: 'DermaGlow Creative Brand Lead',
            authorRole: 'brand',
            timestamp: 'Yesterday, 06:15 PM',
            timecodeSeconds: 4,
            text: '00:04 - The water splash droplet across the glass bottle is gorgeous, but the typography on the logo is slightly softened. Can we sharpen brand font clarity during the middle 3 seconds?',
            isRevisionRequest: true
          }
        ],
        validationRun: {
          id: 'val-run-001',
          testedAt: 'Yesterday, 04:31 PM',
          overallStatus: 'pass',
          checks: [
            { id: 'c1', name: 'File Format', category: 'format', expected: 'MP4', actual: 'MP4', passed: true, severity: 'strict', message: 'H.264 MP4 container verified.' },
            { id: 'c2', name: 'Aspect Ratio', category: 'aspect_ratio', expected: '9:16', actual: '9:16', passed: true, severity: 'strict', message: 'Vertical orientation 1080x1920.' },
            { id: 'c3', name: 'Duration', category: 'duration', expected: '15s (±1.5s)', actual: '15.2s', passed: true, severity: 'strict', message: 'Duration within threshold.' },
            { id: 'c4', name: 'File Size', category: 'file_size', expected: '< 50 MB', actual: '24.0 MB', passed: true, severity: 'warning', message: 'Payload size optimal.' },
          ],
          summary: 'Technical metadata passed all parameters. Creative feedback submitted.'
        }
      },
      {
        versionNumber: 2,
        fileUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
        fileName: 'DermaGlow_Hero_Meera_v2_FINAL.mp4',
        fileSizeBytes: 26 * 1024 * 1024,
        fileType: 'video/mp4',
        dimensions: { width: 1080, height: 1920 },
        durationSeconds: 15.0,
        aspectRatioDetected: '9:16',
        submittedAt: 'Today, 11:15 AM',
        submittedBy: 'Meera Krishnan',
        changelog: 'v2 Revision: Locked deterministic typography weights in Flux.1 and dialed down droplet blur by 25%. High-contrast label is now razor sharp.',
        comments: [
          {
            id: 'comm-102',
            authorName: 'DermaGlow Creative Brand Lead',
            authorRole: 'brand',
            timestamp: 'Today, 11:45 AM',
            text: 'Approved! The typography is pin-sharp and the saffron caustics are breathtaking. Perfect for our Instagram ad launch.',
            isRevisionRequest: false
          }
        ],
        validationRun: {
          id: 'val-run-002',
          testedAt: 'Today, 11:16 AM',
          overallStatus: 'pass',
          checks: [
            { id: 'c1', name: 'File Format', category: 'format', expected: 'MP4', actual: 'MP4', passed: true, severity: 'strict', message: 'Container matches MP4 specification.' },
            { id: 'c2', name: 'Aspect Ratio', category: 'aspect_ratio', expected: '9:16', actual: '9:16', passed: true, severity: 'strict', message: 'Aspect ratio conforms to 9:16 vertical standard.' },
            { id: 'c3', name: 'Resolution', category: 'dimensions', expected: '1080 × 1920 px', actual: '1080 × 1920 px', passed: true, severity: 'strict', message: 'Resolution meets 1080p requirement.' },
            { id: 'c4', name: 'Duration', category: 'duration', expected: '15s', actual: '15.0s', passed: true, severity: 'strict', message: 'Exact 15.0s run time achieved.' },
            { id: 'c5', name: 'File Size', category: 'file_size', expected: '< 50 MB', actual: '26.0 MB', passed: true, severity: 'warning', message: 'Asset size valid.' },
          ],
          summary: 'Compliant on all technical specifications. Deliverable formally approved.'
        }
      }
    ]
  },
  {
    id: 'deliv-skin-02',
    campaignId: 'brief-skincare-demo',
    creatorId: 'creator-6', // Ananya Nair
    specId: 'spec-skin-hero',
    title: '15s Vertical Hero Video (9:16) — Ananya Cut',
    status: 'under_review',
    currentVersionNumber: 1,
    versions: [
      {
        versionNumber: 1,
        fileUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
        fileName: 'DermaGlow_Ananya_v1_Rough.mp4',
        fileSizeBytes: 31 * 1024 * 1024,
        fileType: 'video/mp4',
        dimensions: { width: 1080, height: 1920 },
        durationSeconds: 15.4,
        aspectRatioDetected: '9:16',
        submittedAt: 'Today, 01:20 PM',
        submittedBy: 'Ananya Nair',
        changelog: 'Initial v1 delivery featuring tactile dewy droplets and botanical saffron blossom intro.',
        comments: [],
        validationRun: {
          id: 'val-run-003',
          testedAt: 'Today, 01:21 PM',
          overallStatus: 'pass',
          checks: [
            { id: 'c1', name: 'File Format', category: 'format', expected: 'MP4', actual: 'MP4', passed: true, severity: 'strict', message: 'MP4 format compliant.' },
            { id: 'c2', name: 'Aspect Ratio', category: 'aspect_ratio', expected: '9:16', actual: '9:16', passed: true, severity: 'strict', message: 'Correct 9:16 vertical ratio.' },
            { id: 'c3', name: 'Duration', category: 'duration', expected: '15s (±1.5s)', actual: '15.4s', passed: true, severity: 'strict', message: 'Duration within acceptable margin.' },
          ],
          summary: 'Passed technical criteria. Awaiting Brand Review.'
        }
      }
    ]
  }
];

// Initial Engagements for the Skincare Campaign
export const INITIAL_ENGAGEMENTS: CreatorEngagement[] = [
  {
    id: 'eng-1',
    campaignId: 'brief-skincare-demo',
    creatorId: 'creator-2',
    creator: MOCK_CREATORS[1],
    status: 'in_production',
    invitationSentAt: '2026-10-24T10:15:00Z',
    responseReceivedAt: '2026-10-24T10:25:00Z',
    agreedFeeINR: 10000,
    rightsConfirmed: true,
    rightsConfirmedAt: '2026-10-24T10:30:00Z',
    paymentStatus: 'Escrow Funded',
    notes: 'Agreed to 15s hero vertical reel with 6 months India paid advertising rights.'
  },
  {
    id: 'eng-2',
    campaignId: 'brief-skincare-demo',
    creatorId: 'creator-6',
    creator: MOCK_CREATORS[5],
    status: 'in_production',
    invitationSentAt: '2026-10-24T10:15:00Z',
    responseReceivedAt: '2026-10-24T10:40:00Z',
    agreedFeeINR: 8500,
    rightsConfirmed: true,
    rightsConfirmedAt: '2026-10-24T10:45:00Z',
    paymentStatus: 'Escrow Funded',
    notes: 'Producing dewy botanical variant.'
  }
];

export const INITIAL_ANALYTICS: PlatformAnalytics = {
  avgShortlistTimeHours: 1.4,
  matchAcceptanceRatePct: 92.5,
  creatorResponseRatePct: 88.0,
  timeToSelectionDays: 1.2,
  shortlistToEngagementPct: 84.6,
  campaignCompletionRatePct: 96.0,
  avgRevisionRounds: 1.2,
  deliveryValidationPassRatePct: 94.8,
  rightsConflictsPrevented: 18,
  totalCampaignsManaged: 42,
  totalCreatorsCommissioned: 128
};

export const TOOL_OPTIONS = [
  'All Tools',
  'Veo',
  'Kling',
  'Sora',
  'Flux.1',
  'ElevenLabs',
  'Pika'
];

export const CONTENT_TYPE_OPTIONS = [
  'All Types',
  'Video',
  'Image',
  'Audio'
];

export const SPECIALIZATION_OPTIONS = [
  'All Specializations',
  'AI Filmmaker & Commercial Director',
  'Gen-AI Animator & Character Motion',
  'Photorealistic Product Visualist',
  'AI Voice Actor & Sonic Branding',
  'Sci-Fi Worldbuilder & Neural 3D',
  'High-Fashion Editorial & Avant-Garde'
];
