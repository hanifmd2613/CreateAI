import { Creator, Brief } from '../types';

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
    avgTurnaround: '48 Hours',
    availableNow: true,
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
        steps: [
          { step: 1, phase: 'Base Generation', tool: 'Sora', description: 'Synthesized physics-consistent rotational gravity sequence with seamless camera movement.' },
          { step: 2, phase: 'Lighting Extension', tool: 'Veo', description: 'Calculated 3D volumetric cosmic dust lighting and dynamic planetary shadows.' },
          { step: 3, phase: 'Sound Bed', tool: 'ElevenLabs', description: 'Synthesized atmospheric low-frequency sub-space drone soundscapes.' },
        ]
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
        promptSnippet: 'Macro commercial photograph of amber crystal perfume bottle emerging from crystalline water splash, floating golden lotus petals, studio strobe lighting',
        views: '45K',
        likes: 610,
        steps: [
          { step: 1, phase: 'Bottle Generation', tool: 'Flux.1', description: 'Generated ultra-detailed refractive caustic patterns through glass with zero distortion.' },
          { step: 2, phase: 'Fluid Dynamics Loop', tool: 'Kling', description: 'Synthesized micro droplet splashes and water ripple caustics.' },
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
      },
      {
        id: 'rev-2',
        brandName: 'Mysore Heritage Botanicals',
        brandLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=MysoreBotanicals',
        rating: 5,
        date: '1 week ago',
        comment: 'Flawless workflow verification. The Flux.1 render perfectly preserved our luxury perfume bottle geometry without the usual AI artifacts.',
        projectTitle: 'Heritage Launch Imagery'
      }
    ]
  },
  {
    id: 'creator-2',
    name: 'Ananya Nair',
    gender: 'female',
    handle: '@ananya_animates',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaNair&gender=female&hairColor=2c1b18&facialHairProbability=0&accessoriesProbability=40',
    coverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    specialization: 'Gen-AI Animator & Character Motion',
    bio: 'Crafting fluid stylized animation, character performance, and commercial motion graphics using Kling, Sora, and Pika video generation models.',
    location: 'Kochi, Kerala',
    skills: ['Character Consistency', 'Sora Directing', 'Kling Motion', 'Pika Animation', 'ElevenLabs Sync'],
    tools: ['Kling', 'Sora', 'Pika', 'ElevenLabs'],
    isVerified: true,
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
        type: 'video',
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
        steps: [
          { step: 1, phase: 'Character Concept', tool: 'Flux.1', description: 'Generated consistent stylized warrior armor and weapon design.' },
          { step: 2, phase: 'Combat Choreography', tool: 'Kling', description: 'Choreographed high-frame-rate blade slashes and particle sparks.' },
          { step: 3, phase: 'Cinematic Camera', tool: 'Sora', description: 'Added sweeping 360-degree orbital rotation during finishing stance.' },
        ]
      },
      {
        id: 'port-202',
        title: 'Whimsical Clay Creatures of Wayanad',
        type: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Flux.1 + Pika Animation',
        workflowDescription: 'Stop-motion claymation character keyframes in Flux.1 -> Pika stepped animation curve for nostalgic tactile motion',
        aspectRatio: '9:16',
        duration: '0:15',
        client: 'Sprout Malayalam Media',
        promptSnippet: 'Aardman stop-motion clay animation of happy little fluffy blue monster baking cookies in tiny kitchen, warm cozy lighting, fingerprint textures on clay',
        views: '210K',
        likes: 3400,
        steps: [
          { step: 1, phase: 'Texture Sculpting', tool: 'Flux.1', description: 'Captured clay thumbprints, fuzzy wool surfaces, and handmade miniatures.' },
          { step: 2, phase: 'Stepped Motion', tool: 'Pika', description: 'Paced movement curve to emulate authentic 12fps stop-motion charm.' },
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-3',
        brandName: 'Cochin Interactive Games',
        brandLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=CochinGames',
        rating: 5,
        date: '3 days ago',
        comment: 'Ananya delivered extraordinary character consistency across 12 distinct scenes. Zero morphing or face jitter.',
        projectTitle: 'Championship Animated Opener'
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
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Flux.1 + Kling Video Loop',
        workflowDescription: 'CAD 3D model pass fed to Flux.1 -> Controlled brushed titanium textures -> 360-degree rotation in Kling',
        aspectRatio: '4:5',
        client: 'Titan Haute Horlogerie India',
        promptSnippet: 'Ultra-detailed macro product photo of luxury skeleton mechanical watch, titanium bezel, sapphire glass reflections, matte black carbon dial, dramatic rim light, 8k studio shot',
        views: '76K',
        likes: 1250,
        steps: [
          { step: 1, phase: 'Micro-Texture Pass', tool: 'Flux.1', description: 'Generated authentic chamfer reflections and internal gear jewel bearings.' },
          { step: 2, phase: 'Turntable Reveal', tool: 'Kling', description: 'Rendered seamless 360-degree rotational macro camera reveal.' },
        ]
      },
      {
        id: 'port-302',
        title: 'Teak Wood Minimalist Heritage Chair',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Flux.1 + Veo Lighting',
        workflowDescription: 'Architectural interior prompt in Flux.1 -> Calibrated Indian teak wood lighting and subtle breeze simulation in Veo',
        aspectRatio: '16:9',
        client: 'Jaipur Living Craft & Design (Rajasthan)',
        promptSnippet: 'Minimalist warm interior, curved teak wood designer armchair, warm morning sunlight streaming through sheer curtains, concrete floor, soft shadows, architectural digest magazine style',
        views: '52K',
        likes: 830,
        steps: [
          { step: 1, phase: 'Composition Design', tool: 'Flux.1', description: 'Balanced rule-of-thirds composition with subtle architectural shadow gradients.' },
          { step: 2, phase: 'Natural Light Motion', tool: 'Veo', description: 'Rendered morning sunlight angle transitions and realistic curtain motion.' },
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-4',
        brandName: 'Titan Haute Horlogerie India',
        brandLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=TitanIndia',
        rating: 5,
        date: '5 days ago',
        comment: 'The level of detail on the watch bezel was indistinguishable from an actual luxury commercial photoshoot. Rohan is a master.',
        projectTitle: 'Global Watch Catalog'
      }
    ]
  },
  {
    id: 'creator-4',
    name: 'Priya Venkatesh',
    gender: 'female',
    handle: '@priyasonic.ai',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaVenkatesh&gender=female&hairColor=000000&facialHairProbability=0&accessoriesProbability=30',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    specialization: 'AI Voice Actor & Sonic Branding',
    bio: 'Custom AI voice cloning, multilingual Indian voiceovers (Tamil, Telugu, Hindi, Malayalam, English), and adaptive brand soundscapes for immersive ad campaigns.',
    location: 'Chennai, Tamil Nadu',
    skills: ['ElevenLabs Voice Design', 'Multilingual Dubbing', 'Spatial Sound FX', 'Sonic Branding', 'Audio Mastering'],
    tools: ['ElevenLabs', 'Veo', 'Sora'],
    isVerified: true,
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
        type: 'audio',
        mediaUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
        specificModel: 'ElevenLabs Voice Engine + Veo Ambient FX',
        workflowDescription: 'Synthesized charismatic narration with custom emotional inflexion -> Generated ambient atmospheric chords synced with Veo footage',
        aspectRatio: '16:9',
        duration: '1:12',
        client: 'Godrej Consumer Dynamics (Mumbai)',
        promptSnippet: 'Sophisticated confident female voiceover with warm Indian accent, clear resonance, perfect cadence for luxury consumer brand commercial',
        views: '38K',
        likes: 540,
        steps: [
          { step: 1, phase: 'Voice Character Design', tool: 'ElevenLabs', description: 'Calibrated stability, clarity, and breath cadence for hyper-human realism.' },
          { step: 2, phase: 'Sound Bed Generation', tool: 'ElevenLabs', description: 'Generated warm sub-bass swells and organic analog synth textures.' },
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-5',
        brandName: 'Godrej Consumer Dynamics',
        brandLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=GodrejIndia',
        rating: 5,
        date: '1 week ago',
        comment: 'Turnaround was under 12 hours with 5 language localizations including Tamil, Hindi, and Telugu. The emotional cadence was astonishingly authentic.',
        projectTitle: 'National Campaign Audio'
      }
    ]
  },
  {
    id: 'creator-5',
    name: 'Kabir Malhotra',
    gender: 'male',
    handle: '@kabir_vfx.ai',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KabirMalhotra&gender=male&hairColor=000000&facialHairProbability=50&accessoriesProbability=30',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    specialization: 'Sci-Fi Worldbuilder & Neural 3D',
    bio: 'Specializing in hyper-complex environments, futuristic cityscapes, NeRF volumetric capture, and multi-model VFX compositing for cinema and streaming releases.',
    location: 'Chandigarh & New Delhi',
    skills: ['World Building', 'Veo Environments', 'Kling Aerials', 'Sora Cinematics', 'Camera Tracking'],
    tools: ['Veo', 'Kling', 'Sora', 'Pika'],
    isVerified: true,
    verifiedDetails: {
      certifiedPipeline: 'Volumetric Depth Consistency Protocol v2.5',
      auditDate: 'Aug 2024',
      safetyScore: 99.4,
      commercialRightsGuaranteed: true,
    },
    rating: 4.92,
    reviewCount: 29,
    completedProjects: 36,
    hourlyRate: 11500,
    avgTurnaround: '48 Hours',
    availableNow: false,
    portfolio: [
      {
        id: 'port-501',
        title: 'Indraprastha 2099: Cybernetic Capital Metropolis',
        type: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Flux.1 + Veo + Kling',
        workflowDescription: 'Matte architectural concept in Flux.1 -> Sweeping 3D drone acceleration in Veo -> Atmospheric particle smoke in Kling',
        aspectRatio: '16:9',
        duration: '0:28',
        client: 'Awadh Next-Gen Media (Lucknow & Delhi)',
        promptSnippet: 'Sweeping drone shot over futuristic multi-tiered Indian metropolis with sky bridges, holographic advertisements, ancient arches blended with cyber towers, volumetric fog',
        views: '115K',
        likes: 1890,
        steps: [
          { step: 1, phase: 'Matte Painting', tool: 'Flux.1', description: 'Generated ultra-detailed 16k matte paintings with architectural layering.' },
          { step: 2, phase: 'Camera Motion Path', tool: 'Veo', description: 'Simulated 3D drone acceleration along sky bridges with parallax depth.' },
          { step: 3, phase: 'Atmospheric Motion', tool: 'Kling', description: 'Added dense neon fog drift and vehicle traffic velocity.' },
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-6',
        brandName: 'Awadh Next-Gen Media',
        brandLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=AwadhMedia',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Kabir delivered cinematic VFX on an aggressive deadline. Incredible mastery over Kling and Veo visual environments.',
        projectTitle: 'Futuristic World Exploration'
      }
    ]
  },
  {
    id: 'creator-6',
    name: 'Meera Krishnan',
    gender: 'female',
    handle: '@meera_couture.art',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MeeraKrishnan&gender=female&hairColor=4a312c&facialHairProbability=0&accessoriesProbability=20',
    coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    specialization: 'High-Fashion Editorial & Avant-Garde',
    bio: 'Bridging heritage Indian handlooms, Kanjeevaram weaves, and digital futuristic garments. Former fashion creative director turned Generative AI visual artist.',
    location: 'Hyderabad, Telangana',
    skills: ['High Fashion Prompting', 'Textile Synthesis', 'Lighting Masterclass', 'Veo Fluid Motion', 'Flux Color Grading'],
    tools: ['Flux.1', 'Veo', 'Kling'],
    isVerified: true,
    verifiedDetails: {
      certifiedPipeline: 'Editorial Haute Couture Certified Dataset v1',
      auditDate: 'Oct 2024',
      safetyScore: 99.7,
      commercialRightsGuaranteed: true,
    },
    rating: 4.99,
    reviewCount: 52,
    completedProjects: 60,
    hourlyRate: 15000,
    avgTurnaround: '24 Hours',
    availableNow: true,
    portfolio: [
      {
        id: 'port-601',
        title: 'Kanjeevaram Liquid Gold & Zari Couture',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Flux.1 + Veo Motion Loop',
        workflowDescription: 'High fashion conceptualization in Flux.1 -> Micro zari thread simulation via Veo -> Color grading for print editorial',
        aspectRatio: '4:5',
        client: 'Kanchipuram & Varanasi Weavers Guild',
        promptSnippet: 'Editorial high fashion portrait of Indian model in flowing architectural liquid gold Kanjeevaram silk drape, warm dusk sunset, high contrast editorial lighting, Vogue India style',
        views: '92K',
        likes: 1670,
        steps: [
          { step: 1, phase: 'Silhouette Generation', tool: 'Flux.1', description: 'Sculpted dynamic flowing fabric drape and golden reflective zari embroidery.' },
          { step: 2, phase: 'Silk Flow Motion', tool: 'Veo', description: 'Enhanced silk weave threads and simulated wind dynamics.' },
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-7',
        brandName: 'Kanchipuram Heritage Silks',
        brandLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=KanchipuramSilks',
        rating: 5,
        date: '4 days ago',
        comment: 'Meera’s aesthetic finesse is unmatched. The textile realism made our luxury silk editorial campaign go viral across social media.',
        projectTitle: 'Heritage Handloom Digital Campaign'
      }
    ]
  },
  {
    id: 'creator-7',
    name: 'Aarav Kapoor',
    gender: 'male',
    handle: '@aarav_kapoor.ai',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AaravKapoor&gender=male&hairColor=2c1b18&facialHairProbability=40&accessoriesProbability=20',
    coverImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
    specialization: 'Cinematic Commercial Director',
    bio: 'Directing broadcast television and streaming video ad spots that blur the line between generative video and live action cinema. Trusted by national consumer brands.',
    location: 'Mumbai, Maharashtra',
    skills: ['Sora Video Directing', 'Veo Fluid Dynamics', 'Audio Synchronization', 'Brand Continuity', 'Kling Motion'],
    tools: ['Sora', 'Veo', 'ElevenLabs', 'Kling'],
    isVerified: true,
    verifiedDetails: {
      certifiedPipeline: 'Broadcasting Legal Clearance Protocol v2',
      auditDate: 'Sep 2024',
      safetyScore: 99.8,
      commercialRightsGuaranteed: true,
    },
    rating: 4.97,
    reviewCount: 44,
    completedProjects: 49,
    hourlyRate: 13500,
    avgTurnaround: '48 Hours',
    availableNow: true,
    portfolio: [
      {
        id: 'port-701',
        title: 'Himalayan Glacier Springs: Pure Mountain Energy',
        type: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Veo + Sora + ElevenLabs',
        workflowDescription: 'Super slow-motion liquid splash generated in Veo -> Sora orbital rotation -> ElevenLabs synchronized acoustic foley',
        aspectRatio: '16:9',
        duration: '0:30',
        client: 'Himalayan Pure Beverages (Dehradun)',
        promptSnippet: 'Super high-speed phantom flex camera shot of crystal Himalayan spring water splashing around frosted sleek can, ice shards floating, arctic blue lighting',
        views: '140K',
        likes: 2100,
        steps: [
          { step: 1, phase: 'Liquid Dynamics', tool: 'Veo', description: 'Simulated 1000fps ultra slow-motion droplet physics around the can.' },
          { step: 2, phase: 'Cinematic Camera', tool: 'Sora', description: 'Smooth 360-degree orbital rotation with zero focal distortion.' },
          { step: 3, phase: 'Crisp Foley Design', tool: 'ElevenLabs', description: 'Synthesized crisp ice crack and effervescent fizz sound elements.' },
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-8',
        brandName: 'Himalayan Pure Beverages',
        brandLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=HimalayanPure',
        rating: 5,
        date: '6 days ago',
        comment: 'Aarav delivered a broadcast-ready ad spot that aired during national sports streaming. Outstanding quality and speed.',
        projectTitle: 'Himalayan Spring Launch Ad'
      }
    ]
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
    avgTurnaround: '24 Hours',
    availableNow: true,
    portfolio: [
      {
        id: 'port-801',
        title: 'Chhota Nandi: Interactive Brand Mascot',
        type: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        specificModel: 'Flux.1 + Pika Motion',
        workflowDescription: '3D Pixar-style character turnaround in Flux.1 -> Keyframe animations in Pika -> Voice synthesized in ElevenLabs',
        aspectRatio: '1:1',
        duration: '0:12',
        client: 'Kaveri FinTech Labs (Bengaluru)',
        promptSnippet: 'Cute friendly pastel friendly mascot waving warmly, smooth 3d clay render, soft ambient lighting, octane render, clean studio background',
        views: '42K',
        likes: 670,
        steps: [
          { step: 1, phase: 'Character Sheet', tool: 'Flux.1', description: 'Generated multi-angle character turnaround sheets for consistency.' },
          { step: 2, phase: 'Micro-Animation', tool: 'Pika', description: 'Animated facial blinks, playful arm waves, and bouncy movements.' },
          { step: 3, phase: 'Chirp Voice FX', tool: 'ElevenLabs', description: 'Synthesized cheerful robotic vocal chirps and greeting sounds.' },
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-9',
        brandName: 'Kaveri FinTech Labs',
        brandLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=KaveriFintech',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Sneha designed our mobile mascot bot. User onboarding engagement jumped by 34% after implementing her animations!',
        projectTitle: 'App Mascot Onboarding'
      }
    ]
  }
];

export const INITIAL_BRIEFS: Brief[] = [
  {
    id: 'brief-1',
    title: 'Next-Gen Electric Supercar 30s Reveal Spot',
    brandName: 'Nandi EV Technologies (Bengaluru)',
    brandAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=NandiEV',
    contentType: 'AI Commercial Video',
    style: 'Cinematic Hyperrealism',
    aspectRatio: '16:9',
    commercialUse: 'Full Buyout',
    budget: '₹5,20,000',
    deadline: '5 Days',
    description: 'We need a high-impact, adrenaline-fueled 30-second teaser showcasing our new electric hypercar gliding through Bengaluru tech corridors and rain-slicked highway at night. Neon reflections, aerodynamic particle trails, and bespoke cinematic sound design required.',
    requiredTools: ['Veo', 'Kling', 'ElevenLabs', 'Sora'],
    deliverables: ['30s Master 4K Video (16:9)', '15s Vertical Cut for Reels (9:16)', '5 High-Res Keyframe Packshots', 'Full Seed & Workflow Manifest'],
    status: 'Open',
    createdAt: '2 hours ago',
    applicantsCount: 7
  },
  {
    id: 'brief-2',
    title: 'Ayurvedic Bio-Hydration Serum 3D Fluid Visuals',
    brandName: 'Coorg Artisan Botanicals (Karnataka)',
    brandAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=CoorgBotanicals',
    contentType: 'Photorealistic Product Imagery',
    style: 'Minimalist & Macro Fluid Dynamics',
    aspectRatio: '1:1',
    commercialUse: 'Full Buyout',
    budget: '₹3,10,000',
    deadline: '3 Days',
    description: 'Ultra-clean macro product shots and short looping animations of our amber glass dropper serum bottle surrounded by crystal water ripples, vetiver, and lotus petals. Zero distortion on brand typography.',
    requiredTools: ['Flux.1', 'Veo', 'Kling'],
    deliverables: ['8 Ultra-Res 8K Packshots', '2 Looping 10s Fluid Videos (1:1 & 9:16)', 'Custom Product LoRA weights'],
    status: 'Open',
    createdAt: '5 hours ago',
    applicantsCount: 12
  },
  {
    id: 'brief-3',
    title: 'Carbon-Plate Athleisure Sneaker - Morphing Video Ad',
    brandName: 'NCR High-Tech Footwear (Delhi NCR)',
    brandAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=NCRFootwear',
    contentType: 'Social Media Motion',
    style: 'Cyberpunk & Futuristic Streetwear',
    aspectRatio: '9:16',
    commercialUse: 'Licensed',
    budget: '₹3,50,000',
    deadline: '4 Days',
    description: 'Dynamic Reels and YouTube Shorts campaign featuring our carbon-plate marathon shoe deconstructing and morphing from digital wireframe particles into physical high-tech streetwear on a sprinter in New Delhi.',
    requiredTools: ['Sora', 'Kling', 'ElevenLabs'],
    deliverables: ['3x 15s Shorts Variants (9:16)', 'Sound Design with Cybernetic Foley', 'Certified IP Clearance Audit'],
    status: 'Open',
    createdAt: '1 day ago',
    applicantsCount: 9
  },
  {
    id: 'brief-4',
    title: 'Organic Farm Mascot Micro-Ad Campaign',
    brandName: 'Punjab Agro Organics (Amritsar & Chandigarh)',
    brandAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=PunjabAgro',
    contentType: 'Stylized Character Animation',
    style: 'Playful 3D Stop-Motion',
    aspectRatio: '9:16',
    commercialUse: 'Licensed',
    budget: '₹2,25,000',
    deadline: '1 Week',
    description: 'Heartwarming 3D stop-motion style animated videos of a cheerful farm mascot tending to golden wheat fields and organic dairy orchards in Punjab. Warm pastel colors and upbeat acoustic background music.',
    requiredTools: ['Pika', 'Flux.1', 'ElevenLabs'],
    deliverables: ['4x Short Looping Social Stories', 'Character Turnaround Sheets', 'Source Prompts & Seeds'],
    status: 'In Review',
    createdAt: '2 days ago',
    applicantsCount: 15
  }
];

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
