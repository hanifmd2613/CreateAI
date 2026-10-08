export function generateBriefWithFallback(prompt: string) {
  const lower = prompt.toLowerCase();
  
  // Determine content type
  let contentType = 'AI Commercial Video';
  if (lower.includes('photo') || lower.includes('product') || lower.includes('bottle') || lower.includes('packshot') || lower.includes('image')) {
    contentType = 'Photorealistic Product Imagery';
  } else if (lower.includes('reel') || lower.includes('tiktok') || lower.includes('short') || lower.includes('social') || lower.includes('story')) {
    contentType = 'Social Media Motion';
  } else if (lower.includes('anime') || lower.includes('mascot') || lower.includes('cartoon') || lower.includes('character') || lower.includes('clay')) {
    contentType = 'Stylized Character Animation';
  } else if (lower.includes('voice') || lower.includes('audio') || lower.includes('sound') || lower.includes('music') || lower.includes('podcast')) {
    contentType = 'Audio & Sonic Branding';
  }

  // Determine style
  let style = 'Cinematic Hyperrealism';
  if (lower.includes('minimal') || lower.includes('clean') || lower.includes('scandi') || lower.includes('macro') || lower.includes('skin')) {
    style = 'Minimalist Scandinavian & Macro';
  } else if (lower.includes('cyber') || lower.includes('neon') || lower.includes('futur') || lower.includes('drift') || lower.includes('street')) {
    style = 'Cyberpunk & Futuristic Streetwear';
  } else if (lower.includes('fashion') || lower.includes('vogue') || lower.includes('model') || lower.includes('luxury') || lower.includes('couture')) {
    style = 'High-Fashion Editorial';
  } else if (lower.includes('playful') || lower.includes('clay') || lower.includes('cute') || lower.includes('3d') || lower.includes('toy')) {
    style = 'Playful 3D Stop-Motion';
  }

  // Determine aspect ratio
  let aspectRatio: '16:9' | '9:16' | '1:1' | '4:5' = '16:9';
  if (lower.includes('tiktok') || lower.includes('reel') || lower.includes('phone') || lower.includes('vertical') || lower.includes('story') || lower.includes('9:16')) {
    aspectRatio = '9:16';
  } else if (lower.includes('square') || lower.includes('feed') || lower.includes('1:1') || lower.includes('bottle')) {
    aspectRatio = '1:1';
  } else if (lower.includes('portrait') || lower.includes('fashion') || lower.includes('4:5')) {
    aspectRatio = '4:5';
  }

  // Determine tools - strictly from Veo, Kling, Sora, Flux.1, ElevenLabs, Pika
  const tools: string[] = [];
  if (contentType === 'AI Commercial Video') {
    tools.push('Veo', 'Kling', 'ElevenLabs');
  } else if (contentType === 'Photorealistic Product Imagery') {
    tools.push('Flux.1', 'Veo', 'Kling');
  } else if (contentType === 'Social Media Motion') {
    tools.push('Sora', 'Kling', 'Pika');
  } else if (contentType === 'Stylized Character Animation') {
    tools.push('Pika', 'Flux.1', 'ElevenLabs');
  } else {
    tools.push('ElevenLabs', 'Veo');
  }

  // Generate title
  const cleanPrompt = prompt.replace(/[^\w\s]/gi, '').trim();
  const words = cleanPrompt.split(' ').filter(w => w.length > 2);
  const topicWord = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Brand Creative';
  const title = `${topicWord} — High-Impact Gen-AI Campaign`;

  const description = `Dynamic ${style.toLowerCase()} production campaign based on creative prompt: "${prompt}". Calibrated with deterministic style seeds, 60 FPS motion interpolation, and photorealistic lighting passes. All assets certified for enterprise legal clearance.`;

  const deliverables = [
    aspectRatio === '16:9' ? 'Master 4K Video (16:9 Landscape)' : 'Master Vertical Video (9:16 60fps)',
    '5 High-Fidelity Keyframe Stills (8K Resolution)',
    'Deterministic Seed Lock & Node Manifest File',
    'Certified Worldwide Commercial Buyout Certificate'
  ];

  const budget = lower.includes('cheap') || lower.includes('quick') ? '₹1,50,000 - ₹2,80,000' : '₹3,50,000 - ₹7,00,000';
  const deadline = lower.includes('rush') || lower.includes('urgent') || lower.includes('asap') ? '48 Hours Express' : '3-5 Days';

  return {
    title,
    contentType,
    style,
    aspectRatio,
    commercialUse: 'Full Buyout' as const,
    budget,
    deadline,
    tools,
    description,
    deliverables,
  };
}
