import fetch from 'node-fetch'; // Add this at the very top

export default async function handler(req, res) {
  // Required CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  try {
    console.log('Attempting OpenRouter API call...');
    
    // 1. Try OpenRouter API
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://turbotags.vercel.app",
        "X-Title": "TuroTags Generator",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-pro",
        messages: [{
          role: "user",
          content: `Generate tags for ${req.body.platform} video: "${req.body.title}" (Niche: ${req.body.niche}). Respond with JSON: { "tags": "tag1,tag2", "hashtags": "#tag1 #tag2" }`
        }]
      })
    });

    if (openRouterResponse.ok) {
      const data = await openRouterResponse.json();
      const generatedContent = JSON.parse(data.choices[0].message.content);
      return res.status(200).json(generatedContent);
    }

    // 2. Fallback to local JSON
    const fallbackTags = {
      politics: {
        youtube: {
          tags: "delhi government, pollution policy, akash banerjee",
          hashtags: "#DelhiPollution #GovtPolicy"
        }
      },
      default: {
        youtube: {
          tags: "video,content,creator",
          hashtags: "#video #content"
        }
      }
    };

    const tags = fallbackTags[req.body.niche]?.[req.body.platform] || fallbackTags.default[req.body.platform];
    return res.status(200).json(tags);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: "Failed to generate tags",
      details: error.message 
    });
  }
}
