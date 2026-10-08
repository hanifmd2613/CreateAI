export async function generateBriefWithGroq(prompt: string, apiKey: string) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an elite Hollywood Generative AI Creative Director and Commercial Producer.
Convert the user's idea into a structured production brief in strict JSON format.
Return ONLY valid JSON matching this schema:
{
  "title": "string (Catchy enterprise campaign title)",
  "contentType": "string (one of: AI Commercial Video, Photorealistic Product Imagery, Social Media Motion, Stylized Character Animation, Audio & Sonic Branding)",
  "style": "string (one of: Cinematic Hyperrealism, Minimalist Scandinavian & Macro, Cyberpunk & Futuristic Streetwear, High-Fashion Editorial, Playful 3D Stop-Motion)",
  "aspectRatio": "string (one of: 16:9, 9:16, 1:1, 4:5)",
  "commercialUse": "string (one of: Full Buyout, Licensed)",
  "budget": "string in Indian Rupees (e.g. ₹3,50,000 - ₹6,50,000)",
  "deadline": "string (e.g. 3-5 Days)",
  "tools": ["array of AI tools chosen ONLY from: Veo, Kling, Sora, Flux.1, ElevenLabs, Pika"],
  "description": "string (detailed 3-sentence technical prompt direction and narrative arc)",
  "deliverables": ["array of 3-4 specific delivery assets e.g. Master 4K Video (16:9), 9:16 Vertical Cut, High-Res Packshots, Seed & Manifest Document"]
}`
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API returned HTTP ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from Groq');
  }

  return JSON.parse(content);
}
