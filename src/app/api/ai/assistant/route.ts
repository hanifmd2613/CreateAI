import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, geminiApiKey } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Valid query message is required' }, { status: 400 });
    }

    const lower = message.toLowerCase();

    // 1. If Gemini API Key is provided, call Google AI Studio Gemini 1.5 Flash
    if (geminiApiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
        const systemPrompt = `You are the official GenCraft System Assistant powered by Google Gemini. 
GenCraft is an enterprise marketplace connecting brands with specialized Generative AI creators in India and globally.
Features of GenCraft:
1. Creator Discovery: Search creators by name, field (Automotive, Fashion, 3D Mascots, Sonic, VFX), or models (Veo, Kling, Sora, Flux.1, ElevenLabs, Pika).
2. AI-Assisted Brief Builder: Post campaign briefs manually or use the AI Assist button to convert rough ideas into structured parameters (title, style, aspect ratio, tools, deliverables, budget in INR).
3. Direct Client ⇄ Employee Chat: Real-time messaging with creators, discussing rates, milestones, and scheduling.
4. Indian Rupee Escrow & Buyout: All payments are in INR (₹) held in escrow until seed manifests and 4K masters are delivered.
5. Email OTP Authentication: Candidates sign in/register with verified 6-digit email OTP and gender-matched 3D vector avatars.

Answer the user's question clearly, politely, and concisely using markdown bullet points where appropriate.`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemPrompt}\n\nUser Question: "${message}"\n\nAssistant Answer:` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600,
            }
          })
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return NextResponse.json({
              success: true,
              provider: 'gemini-live',
              reply: replyText
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini live call error, falling back to local knowledge engine:', geminiErr);
      }
    }

    // 2. Intelligent Built-in Gemini Knowledge Engine for GenCraft
    let reply = '';

    if (lower.includes('how to use') || lower.includes('website') || lower.includes('overview') || lower.includes('getting started')) {
      reply = `**Welcome to GenCraft! Here is how to navigate and use the platform:**

1. **Discover Creators**: Browse top vetted Gen-AI creators across India. Use the search bar to search by specific field (*Automotive, High-Fashion, 3D Mascots, Sound Design*) or filter by tools (*Veo, Kling, Sora, Flux.1, ElevenLabs, Pika*).
2. **Direct Chat**: Click the **Chat** button on any creator card to start real-time messaging, review portfolio workflows, and inquire about availability.
3. **Post a Campaign Brief**: Head to **Post a Brief** and use our **AI Assist** co-pilot. Just enter a rough idea (e.g., *"Luxury watch reveal"*) and click **Generate Structured Brief** to auto-fill camera paths, seeds, deliverables, and budget in Indian Rupees (₹).
4. **Escrow Protection**: Once hired, campaign funds are secured in milestone escrow until 4K deliverables and seed manifests are verified.`;
    } else if (lower.includes('brief') || lower.includes('post') || lower.includes('campaign') || lower.includes('assist')) {
      reply = `**How to Use the AI Brief Builder:**

• **Navigate**: Click **"Post a Brief"** in the top navigation bar.
• **AI Assist Co-Pilot**: In the top text box, type your raw creative concept (or pick one of our presets like *Electric Supercar Commercial* or *Luxury Skincare Packshot*).
• **Click "Generate Structured Brief"**: Within 1.5 seconds, the AI engine will auto-fill:
  - Enterprise Campaign Title
  - Content Format (16:9 Landscape, 9:16 Vertical, 1:1 Square)
  - Recommended AI Models (*Veo, Kling, Sora, Flux.1, ElevenLabs, Pika*)
  - Calibrated Budget in Indian Rupees (₹)
  - Commercial Deliverables (4K Master, High-Res Stills, Seed Lock File)
• **Publish**: Click **"Publish Campaign Brief"** to send it directly to matching creators!`;
    } else if (lower.includes('hire') || lower.includes('creator') || lower.includes('employee') || lower.includes('commission')) {
      reply = `**How to Hire an AI Creator:**

1. Go to **Discover Creators** and inspect verified creator profiles.
2. Check their **Verified AI Workflow** badge, past project ratings, and hourly rate in ₹.
3. Click **"Message"** to chat directly with the creator, or click **"Hire Creator"** to select a milestone package.
4. Funds are placed into **GenCraft Escrow (in ₹)** and released only after you review and approve the final master assets.`;
    } else if (lower.includes('tool') || lower.includes('model') || lower.includes('veo') || lower.includes('kling') || lower.includes('sora') || lower.includes('flux')) {
      reply = `**Supported Production AI Tools on GenCraft:**

• **Google Veo**: High-definition video generation with cinematic camera motion paths and liquid dynamics.
• **Kling**: Ultra-fluid physics, fast-paced vehicle drifts, and character action motion.
• **Sora**: Hyperrealistic long-take cinematography, complex lighting, and aerial sweeps.
• **Flux.1**: Pixel-perfect photorealistic product imagery, CAD accuracy, and micro-texturing.
• **ElevenLabs**: Human-grade multilingual Indian voiceovers (Tamil, Telugu, Hindi, Malayalam, English) and spatial sound FX.
• **Pika**: Stylized character animation, tactile stop-motion claymation, and playful micro-motion.`;
    } else if (lower.includes('escrow') || lower.includes('payment') || lower.includes('rupee') || lower.includes('inr') || lower.includes('money')) {
      reply = `**Indian Rupee (₹) Escrow & Commercial Protection:**

• All project quotes and transactions are processed in **Indian Rupees (INR)**.
• **Milestone Escrow**: Brand funds are held securely until the creator delivers keyframe passes and final 4K masters.
• **Seed Manifest Lock**: Creators submit exact style references (--sref) and seed records so you have full legal ownership and reproducibility.
• **Worldwide Commercial Buyout**: Every project includes complete corporate intellectual property buyout certificates.`;
    } else if (lower.includes('chat') || lower.includes('message')) {
      reply = `**How Direct Client ⇄ Creator Chat Works:**

• Click the **"Chat"** button on any creator card or from the top navigation.
• Chat directly with the creator to clarify creative references, turnarounds, or delivery specifications.
• Creators respond in real time with milestone estimates and availability!`;
    } else {
      reply = `**GenCraft Gemini System Assistant:**

I can assist you with everything on GenCraft:
• **Finding Talent**: Search creators by specialized field (Automotive, Fashion, Mascot 3D, Sonic) or AI tool (Veo, Kling, Sora, Flux.1, ElevenLabs, Pika).
• **AI Brief Builder**: Structure campaign prompts with one click in the brief builder.
• **Direct Messaging**: Connect directly with creator employees.
• **Payments & Escrow**: 100% transparent Indian Rupee (₹) milestone escrow.

Feel free to ask a specific question or test out our features!`;
    }

    return NextResponse.json({
      success: true,
      provider: 'gencraft-gemini-engine',
      reply: reply
    });

  } catch (err: any) {
    console.error('Error in assistant API:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
