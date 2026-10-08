export async function generateBriefWithGemini(prompt: string, apiKey: string) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Convert this idea into a structured Generative AI production brief in pure JSON without markdown tags:
Idea: "${prompt}"

Required JSON fields:
- title: string
- contentType: one of ("AI Commercial Video", "Photorealistic Product Imagery", "Social Media Motion", "Stylized Character Animation", "Audio & Sonic Branding")
- style: one of ("Cinematic Hyperrealism", "Minimalist Scandinavian & Macro", "Cyberpunk & Futuristic Streetwear", "High-Fashion Editorial", "Playful 3D Stop-Motion")
- aspectRatio: one of ("16:9", "9:16", "1:1", "4:5")
- commercialUse: one of ("Full Buyout", "Licensed")
- budget: string in Indian Rupees (e.g. ₹3,50,000 - ₹6,50,000)
- deadline: string (e.g. 3-5 Days)
- tools: array containing only ("Veo", "Kling", "Sora", "Flux.1", "ElevenLabs", "Pika")
- description: string
- deliverables: array of strings`
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Empty response from Gemini');
  }

  return JSON.parse(rawText);
}
