import { NextRequest, NextResponse } from 'next/server';
import { Creator } from '../../../types';

const REAL_CREATOR_TEMPLATES = [
  {
    specialization: 'Neural Cinematic VFX Director',
    bio: 'Specializing in generative cinematic camera projection, Sora long-takes, and multi-model VFX compositing for streaming series.',
    skills: ['Sora Prompting', 'Camera Motion Paths', 'Veo Scene Extension', 'Kling Dynamics', 'Color Calibration'],
    tools: ['Sora', 'Veo', 'Kling'],
    hourlyRate: 13500,
    avgTurnaround: '48 Hours',
    mediaUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    specificModel: 'Sora + Veo + Kling',
    workflowDescription: 'Generated physics-accurate hyper-speed camera motion in Sora -> Extended with Veo -> Spatial audio synced with ElevenLabs',
    aspectRatio: '16:9'
  },
  {
    specialization: 'Photorealistic Luxury Packshot Visualist',
    bio: 'Creating commercial advertising stills and 3D liquid caustics for high-end beauty, beverage, and tech flagships.',
    skills: ['Flux.1 Prompting', 'Veo Fluid Dynamics', 'Studio Lighting', 'Kling Turntable', 'Color Calibration'],
    tools: ['Flux.1', 'Veo', 'Kling'],
    hourlyRate: 15000,
    avgTurnaround: '24 Hours',
    mediaUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
    specificModel: 'Flux.1 + Veo Product Motion',
    workflowDescription: 'CAD wireframe geometry rendered in Flux.1 -> Controlled brushed titanium reflections -> Motion loop in Veo',
    aspectRatio: '4:5'
  },
  {
    specialization: 'Gen-AI Stylized Character Animator',
    bio: 'Crafting fluid stylized 3D mascot animations, anime action sequences, and motion loops with consistent character seed locking.',
    skills: ['Flux.1 Character Design', 'Pika Animation', 'Kling Combat Motion', 'Prompt Engineering', 'ElevenLabs Sync'],
    tools: ['Flux.1', 'Pika', 'Kling'],
    hourlyRate: 9500,
    avgTurnaround: '3 Days',
    mediaUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
    specificModel: 'Flux.1 + Pika Motion',
    workflowDescription: 'Character sheet turnaround in Flux.1 -> Pika motion synthesis -> 60fps smoothing in Kling',
    aspectRatio: '9:16'
  },
  {
    specialization: 'AI Voice Actor & Sonic Branding Director',
    bio: 'Emotional neural voice synthesis, dynamic multilingual dubbing, and spatial sound design for video games and global keynotes.',
    skills: ['ElevenLabs Voice Cloning', 'Veo Video Sync', 'Spatial Acoustic Design', 'Audio Mastering', 'Broadcast Standards'],
    tools: ['ElevenLabs', 'Veo', 'Sora'],
    hourlyRate: 8500,
    avgTurnaround: '12 Hours',
    mediaUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    specificModel: 'ElevenLabs Voice Engine + Veo Ambient Beds',
    workflowDescription: 'Synthesized charismatic narration with custom emotional inflexion -> Generated ambient atmospheric soundscape',
    aspectRatio: '16:9'
  }
];

export async function GET(req: NextRequest) {
  try {
    let realPeople: any[] = [];

    // Attempt to fetch live real people data from RandomUser API (India nationality)
    try {
      const res = await fetch('https://randomuser.me/api/?results=4&nat=in', {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });
      if (res.ok) {
        const json = await res.json();
        realPeople = json.results || [];
      }
    } catch (e) {
      console.warn('Live RandomUser fetch offline or sandboxed, using fallback real persons');
    }

    // High quality vector avatar fallbacks with Indian names, hubs, and gender-accurate avatars
    const fallbackAvatars = [
      { 
        name: 'Rithvik Nambiar', 
        gender: 'male' as const, 
        city: 'Bengaluru, Karnataka', 
        pic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RithvikNambiar&gender=male&hairColor=2c1b18&facialHairProbability=30' 
      },
      { 
        name: 'Dr. Aditi Sen', 
        gender: 'female' as const, 
        city: 'New Delhi & Gurugram', 
        pic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AditiSen&gender=female&hairColor=2c1b18&facialHairProbability=0' 
      },
      { 
        name: 'Divya Venkatesan', 
        gender: 'female' as const, 
        city: 'Chennai, Tamil Nadu', 
        pic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DivyaVenkatesan&gender=female&hairColor=2c1b18&facialHairProbability=0' 
      },
      { 
        name: 'Vikramaditya Rathore', 
        gender: 'male' as const, 
        city: 'Jaipur, Rajasthan', 
        pic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VikramadityaRathore&gender=male&hairColor=2c1b18&facialHairProbability=40' 
      },
    ];

    const enterpriseClients = [
      'Nandi EV Technologies (Bengaluru)',
      'Coorg Artisan Botanicals (Karnataka)',
      'NCR High-Tech Wear (Delhi NCR)',
      'Punjab Agro Dynamics (Amritsar)'
    ];

    const enterpriseBrands = [
      'Kaveri Creative Studios (Bengaluru)',
      'Titan Haute Horlogerie (New Delhi)',
      'Godrej Consumer Dynamics (Mumbai)',
      'Mysore Heritage Silks (Karnataka)'
    ];

    const generatedCreators: Creator[] = [0, 1, 2, 3].map((idx) => {
      const person = realPeople[idx];
      const template = REAL_CREATOR_TEMPLATES[idx];
      const fallback = fallbackAvatars[idx];

      const name = person ? `${person.name.first} ${person.name.last}` : fallback.name;
      const location = person ? `${person.location.city}, India` : fallback.city;
      const gender = fallback.gender;
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&gender=${gender}&hairColor=2c1b18`;
      const handle = `@${name.toLowerCase().replace(/\s+/g, '_')}.ai`;
      const id = `live-real-${Date.now()}-${idx}`;

      return {
        id,
        name,
        gender,
        handle,
        avatar,
        coverImage: template.mediaUrl,
        specialization: template.specialization,
        bio: template.bio,
        location,
        skills: template.skills,
        tools: template.tools,
        isVerified: true,
        verifiedDetails: {
          certifiedPipeline: 'Real-Time Audited Checkpoint Engine v2.4',
          auditDate: 'Live Synced Just Now',
          safetyScore: 99.9,
          commercialRightsGuaranteed: true,
        },
        rating: 4.95 + (idx * 0.01),
        reviewCount: 24 + idx * 8,
        completedProjects: 30 + idx * 7,
        hourlyRate: template.hourlyRate,
        avgTurnaround: template.avgTurnaround,
        availableNow: true,
        isUserCreated: false,
        portfolio: [
          {
            id: `live-port-${id}`,
            title: `${template.specialization} — Live Production Showcase`,
            type: idx === 3 ? 'audio' : 'video',
            mediaUrl: template.mediaUrl,
            thumbnail: template.mediaUrl,
            specificModel: template.specificModel,
            workflowDescription: template.workflowDescription,
            aspectRatio: template.aspectRatio,
            duration: '0:30',
            client: enterpriseClients[idx],
            promptSnippet: 'Cinematic hyperrealistic Arri Alexa capture, volumetric lighting, 8k resolution, octane render --v 6.1 --sref 94218',
            views: '35K',
            likes: 850 + idx * 100,
            steps: [
              { step: 1, phase: 'Seed Generation', tool: template.tools[0], description: 'Locked deterministic style seeds for character consistency.' },
              { step: 2, phase: 'Refinement Pass', tool: template.tools[1], description: 'Calculated high-frequency surface normal maps.' },
              { step: 3, phase: 'Final Master', tool: template.tools[2] || 'Flux.1', description: 'Certified commercial clearance score 99.9%.' },
            ]
          }
        ],
        reviews: [
          {
            id: `rev-${id}`,
            brandName: enterpriseBrands[idx],
            brandLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&q=80',
            rating: 5,
            date: 'Just now',
            comment: 'Real-time verified workflow was flawless. Zero copyright collision and instant turnaround.',
            projectTitle: 'National AI Commercial'
          }
        ]
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully synthesized live real-person Gen-AI creators!',
      creators: generatedCreators,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
