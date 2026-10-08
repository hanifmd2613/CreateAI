import { connectToDatabase } from '../lib/mongodb';
import { CreatorModel } from '../lib/models/Creator';
import { BriefModel } from '../lib/models/Brief';
import { MatchResultModel } from '../lib/models/MatchResult';
import { computeCreatorMatch } from '../lib/matching';

export const SEED_CREATORS = [
  {
    id: 'creator-1',
    name: 'Karthik Subramanian',
    gender: 'male' as const,
    handle: '@karthik_director.ai',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KarthikSubramanian&gender=male&hairColor=000000&facialHairProbability=60&accessoriesProbability=20',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    specialization: 'AI Filmmaker & Commercial Director',
    bio: 'Pioneering narrative Gen-AI commercials and high-concept cinematic films. Winner of the 2024 Bengaluru AI Film Showcase Best Direction. Certified commercially-safe workflow pipeline with seed auditing.',
    location: 'Bengaluru, Karnataka',
    skills: ['AI Filmmaking', 'Cinematic Prompting', 'Camera Motion Paths', 'Latent Motion Synthesis', 'Color Calibration', 'Audio Foley'],
    tools: ['Veo', 'Kling', 'Sora', 'ElevenLabs'],
    isVerified: true,
    verification: {
      certifiedPipeline: 'V24 Neural Production Tier-1 (Audited Checkpoints)',
      auditDate: 'Oct 2024',
      safetyScore: 99.8,
      commercialRightsGuaranteed: true,
      identityVerified: true,
      portfolioEvidenceVerified: true,
      toolEvidenceVerified: true,
      workflowEvidenceVerified: true,
      commercialUseDeclared: true,
      platformVerified: true,
    },
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
    avgTurnaround: '48 Hours',
    availableNow: true,
    portfolio: [
      {
        id: 'port-101',
        title: 'Project Kaveri: Neon Cyber Drift',
        type: 'video' as const,
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
        verificationStatus: 'Verified' as const,
        steps: [
          { step: 1, phase: 'Keyframe Generation', tool: 'Flux.1', description: 'Generated 40 photorealistic camera angles using custom style reference seeds.' },
          { step: 2, phase: 'Camera Motion Path', tool: 'Veo', description: 'Generated continuous fluid camera sweeps and reflective rain highlights.' },
          { step: 3, phase: 'Motion Synthesis', tool: 'Kling', description: 'Simulated wheel dynamics, wet tire smoke, and acceleration motion.' },
          { step: 4, phase: 'Sonic Design', tool: 'ElevenLabs', description: 'Synthesized electric engine whines and realistic wet tire screech acoustics.' },
        ]
      },
      {
        id: 'port-102',
        title: 'NovaPhone 9:16 Futuristic Launch Film Teaser',
        type: 'video' as const,
        mediaUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Veo + Kling Vertical Macro',
        workflowDescription: 'Futuristic smartphone glass refractions in Flux.1 -> Camera macro tracking in Veo -> Dynamic hologram assembly in Kling',
        aspectRatio: '9:16',
        duration: '0:30',
        client: 'NovaPhone Global',
        promptSnippet: 'Futuristic sleek holographic smartphone hovering in rainy neon glass environment, macro camera sweep, obsidian metallic reflections, 9:16 vertical 60fps',
        views: '95K',
        likes: 1850,
        verificationStatus: 'Verified' as const,
        steps: [
          { step: 1, phase: 'Macro Framing', tool: 'Veo', description: 'Rendered liquid metal glass reflections in vertical 9:16 format.' },
          { step: 2, phase: 'Holographic Assembly', tool: 'Kling', description: 'Generated 60fps particle hologram explosion and reassembly.' },
        ]
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
    name: 'Ananya Nair',
    gender: 'female' as const,
    handle: '@ananya_animates',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaNair&gender=female&hairColor=2c1b18&facialHairProbability=0&accessoriesProbability=40',
    coverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    specialization: 'Gen-AI Animator & Character Motion',
    bio: 'Crafting fluid stylized animation, character performance, and commercial motion graphics using Kling, Sora, and Pika video generation models.',
    location: 'Kochi, Kerala',
    skills: ['Character Consistency', 'Sora Directing', 'Kling Motion', 'Pika Animation', 'ElevenLabs Sync'],
    tools: ['Kling', 'Sora', 'Pika', 'ElevenLabs'],
    isVerified: true,
    verification: {
      certifiedPipeline: 'Consistent Character Seed Lock Protocol v3',
      auditDate: 'Sep 2024',
      safetyScore: 99.5,
      commercialRightsGuaranteed: true,
      identityVerified: true,
      portfolioEvidenceVerified: true,
      toolEvidenceVerified: true,
      workflowEvidenceVerified: true,
      commercialUseDeclared: true,
      platformVerified: true,
    },
    verifiedDetails: {
      certifiedPipeline: 'Consistent Character Seed Lock Protocol v3',
      auditDate: 'Sep 2024',
      safetyScore: 99.5,
      commercialRightsGuaranteed: true,
    },
    rating: 4.95,
    reviewCount: 38,
    completedProjects: 41,
    hourlyRate: 9800,
    avgTurnaround: '3 Days',
    availableNow: true,
    portfolio: [
      {
        id: 'port-201',
        title: 'Theyyam Cyber Warrior: Blade of Malabar',
        type: 'video' as const,
        mediaUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Kling + Sora Character Motion',
        workflowDescription: 'Keyframe character setup in Flux.1 -> High-speed combat choreographed in Kling -> Extended cinematic camera arc in Sora',
        aspectRatio: '16:9',
        duration: '0:22',
        client: 'Cochin Interactive Games (Kerala)',
        promptSnippet: 'Anime stylized warrior in glowing cyber armor slashing through rainfall with sword, violet sparks, dynamic camera roll, Studio Trigger animation style',
        views: '88K',
        likes: 1104,
        verificationStatus: 'Verified' as const,
        steps: [
          { step: 1, phase: 'Character Concept', tool: 'Flux.1', description: 'Generated consistent stylized warrior armor and weapon design.' },
          { step: 2, phase: 'Combat Choreography', tool: 'Kling', description: 'Choreographed high-frame-rate blade slashes and particle sparks.' },
        ]
      }
    ]
  },
  {
    id: 'creator-3',
    name: 'Rohan Sharma',
    gender: 'male' as const,
    handle: '@rohan_visuals',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RohanSharma&gender=male&hairColor=2c1b18&facialHairProbability=30&accessoriesProbability=0',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    specialization: 'Photorealistic Product Visualist',
    bio: 'High-end commercial packshots, smartphone product visualization, architectural interiors, and industrial product design visuals. Delivering pixel-perfect 8K imagery for national brand campaigns.',
    location: 'New Delhi & Gurugram',
    skills: ['Product Visualization', 'Flux.1 Prompting', 'Veo Product Motion', 'Kling Turntable', 'Studio Lighting', 'Color Grading'],
    tools: ['Flux.1', 'Veo', 'Kling'],
    isVerified: true,
    verification: {
      certifiedPipeline: 'Industrial CAD & Normal Map Verification v4',
      auditDate: 'Oct 2024',
      safetyScore: 99.9,
      commercialRightsGuaranteed: true,
      identityVerified: true,
      portfolioEvidenceVerified: true,
      toolEvidenceVerified: true,
      workflowEvidenceVerified: true,
      commercialUseDeclared: true,
      platformVerified: true,
    },
    verifiedDetails: {
      certifiedPipeline: 'Industrial CAD & Normal Map Verification v4',
      auditDate: 'Oct 2024',
      safetyScore: 99.9,
      commercialRightsGuaranteed: true,
    },
    rating: 4.99,
    reviewCount: 64,
    completedProjects: 78,
    hourlyRate: 14000,
    avgTurnaround: '24 Hours',
    availableNow: true,
    portfolio: [
      {
        id: 'port-301',
        title: 'Chronos Surya: Titanium Solar Chronograph',
        type: 'image' as const,
        mediaUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Flux.1 + Kling Video Loop',
        workflowDescription: 'CAD 3D model pass fed to Flux.1 -> Controlled brushed titanium textures -> 360-degree rotation in Kling',
        aspectRatio: '4:5',
        client: 'Titan Haute Horlogerie India',
        promptSnippet: 'Ultra-detailed macro product photo of luxury skeleton mechanical watch, titanium bezel, sapphire glass reflections, matte black carbon dial',
        views: '76K',
        likes: 1250,
        verificationStatus: 'Verified' as const,
        steps: [
          { step: 1, phase: 'Micro-Texture Pass', tool: 'Flux.1', description: 'Generated authentic chamfer reflections and internal gear bearings.' }
        ]
      }
    ]
  },
  {
    id: 'creator-4',
    name: 'Priya Venkatesh',
    gender: 'female' as const,
    handle: '@priyasonic.ai',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaVenkatesh&gender=female&hairColor=000000&facialHairProbability=0&accessoriesProbability=30',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    specialization: 'AI Voice Actor & Sonic Branding',
    bio: 'Custom AI voice cloning, multilingual voiceovers, and spatial sound design for video games, keynotes, and commercial releases.',
    location: 'Chennai, Tamil Nadu',
    skills: ['ElevenLabs Voice Design', 'Multilingual Dubbing', 'Spatial Sound FX', 'Sonic Branding', 'Audio Mastering'],
    tools: ['ElevenLabs', 'Veo', 'Sora'],
    isVerified: true,
    verification: {
      certifiedPipeline: 'Ethics & Consent AI Voice Cloning Seal v2',
      auditDate: 'Sep 2024',
      safetyScore: 100,
      identityVerified: true,
      portfolioEvidenceVerified: true,
      toolEvidenceVerified: true,
      workflowEvidenceVerified: true,
      commercialUseDeclared: true,
      platformVerified: true,
    },
    verifiedDetails: {
      certifiedPipeline: 'Ethics & Consent AI Voice Cloning Seal v2',
      auditDate: 'Sep 2024',
      safetyScore: 100,
      commercialRightsGuaranteed: true,
    },
    rating: 4.96,
    reviewCount: 31,
    completedProjects: 45,
    hourlyRate: 8500,
    avgTurnaround: '12 Hours',
    availableNow: true,
    portfolio: [
      {
        id: 'port-401',
        title: 'Kaveri Sonic Identity & Multilingual Voice Over',
        type: 'audio' as const,
        mediaUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
        specificModel: 'ElevenLabs Voice Engine + Veo Ambient FX',
        workflowDescription: 'Synthesized charismatic narration with custom emotional inflexion -> Generated ambient atmospheric chords',
        aspectRatio: '16:9',
        duration: '1:12',
        client: 'Godrej Consumer Dynamics',
        promptSnippet: 'Sophisticated confident female voiceover with warm Indian accent, clear resonance, perfect cadence for luxury commercial',
        views: '38K',
        likes: 540,
        verificationStatus: 'Verified' as const,
      }
    ]
  }
];

export const SEED_BRIEFS = [
  {
    id: 'brief-novaphone-demo',
    title: 'NovaPhone: Futuristic 30-Second Smartphone Launch Film',
    brandName: 'NovaPhone Global',
    brandAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=NovaPhone',
    contentType: 'AI Commercial Video',
    style: 'Cinematic Hyperrealism',
    aspectRatio: '9:16' as const,
    commercialUse: 'Full Buyout' as const,
    budget: '₹6,50,000',
    deadline: '3 Days',
    description: 'Create a futuristic 30-second smartphone launch film. Showcase holographic display assembly, liquid metal casing, micro-camera projection, and high-speed urban drift in rain-slicked city streets. Requires 9:16 vertical cut for Instagram Reels & YouTube Shorts with full commercial buyout.',
    requiredTools: ['Veo', 'Kling', 'ElevenLabs'],
    requiredSkills: ['AI Filmmaking', 'Product Visualization', 'Camera Motion Paths', 'Latent Motion Synthesis'],
    deliverables: [
      'Master 30-Second 4K Vertical Video (9:16 60fps)',
      '15-Second Teaser Cut for Instagram Reels & YouTube Shorts',
      '5 High-Res Keyframe Render Stills (8K)',
      'Deterministic Seed & Workflow Manifest Certificate'
    ],
    status: 'Open' as const,
    createdAt: new Date(),
    applicantsCount: 5,
  },
  {
    id: 'brief-2',
    title: 'Ayurvedic Bio-Hydration Serum 3D Fluid Visuals',
    brandName: 'Coorg Artisan Botanicals (Karnataka)',
    brandAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=CoorgBotanicals',
    contentType: 'Photorealistic Product Imagery',
    style: 'Minimalist Scandinavian & Macro',
    aspectRatio: '1:1' as const,
    commercialUse: 'Full Buyout' as const,
    budget: '₹3,10,000',
    deadline: '3 Days',
    description: 'Ultra-clean macro product shots and short looping animations of our amber glass dropper serum bottle surrounded by crystal water ripples, vetiver, and lotus petals. Zero distortion on brand typography.',
    requiredTools: ['Flux.1', 'Veo', 'Kling'],
    requiredSkills: ['Product Visualization', 'Studio Lighting', 'Fluid Dynamics'],
    deliverables: ['8 Ultra-Res 8K Packshots', '2 Looping 10s Fluid Videos (1:1 & 9:16)', 'Custom Product LoRA weights'],
    status: 'Open' as const,
    createdAt: new Date(),
    applicantsCount: 12
  }
];

export async function seedDatabase() {
  console.log('Connecting to database for seeding...');
  const conn = await connectToDatabase();
  
  if (!conn) {
    console.warn('Database connection unavailable. Seeding skipped; app will rely on runtime seed objects.');
    return;
  }

  try {
    // 1. Clear existing seed collections
    await CreatorModel.deleteMany({});
    await BriefModel.deleteMany({});
    await MatchResultModel.deleteMany({});

    console.log('Cleared existing collections.');

    // 2. Insert Creators
    const createdCreators = await CreatorModel.insertMany(SEED_CREATORS);
    console.log(`Successfully seeded ${createdCreators.length} Creators.`);

    // 3. Insert Briefs
    const createdBriefs = await BriefModel.insertMany(SEED_BRIEFS);
    console.log(`Successfully seeded ${createdBriefs.length} Briefs.`);

    // 4. Precompute & Insert Match Results for NovaPhone demo brief
    const demoBrief: any = createdBriefs[0];
    if (demoBrief) {
      const matchRecords = SEED_CREATORS.map(creator => {
        const match = computeCreatorMatch(demoBrief as any, creator as any);
        return {
          briefId: demoBrief.id,
          creatorId: creator.id,
          semanticScore: match.categories.semanticScore,
          skillScore: match.categories.skillScore,
          toolScore: match.categories.toolScore,
          contentTypeScore: match.categories.contentTypeScore,
          formatScore: match.categories.formatScore,
          commercialScore: match.categories.commercialScore,
          experienceScore: match.categories.experienceScore,
          finalScore: match.finalScore,
          reasons: match.reasons,
        };
      });

      await MatchResultModel.insertMany(matchRecords);
      console.log(`Precomputed ${matchRecords.length} MatchResult records for NovaPhone Demo Brief.`);
    }

    console.log('🎉 Database seeding completed cleanly!');
  } catch (err) {
    console.error('Error during database seed execution:', err);
  }
}

// Execute if run directly via CLI (tsx src/scripts/seed.ts)
if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
