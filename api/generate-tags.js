import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Required CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  try {
    console.log('Attempting OpenRouter API call...'); // Debug log
    
    // 1. Try OpenRouter API first
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://turbotags.vercel.app", // Required
        "X-Title": "TuroTags Generator", // Required
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-pro",
        messages: [{
          role: "user",
          content: `Generate 10 specific tags and 5 hashtags for a ${req.body.platform} video titled: "${req.body.title}" (Niche: ${req.body.niche}). 
                    Format as JSON: {"tags":"tag1,tag2", "hashtags":"#tag1 #tag2"}`
        }]
      })
    });

    if (openRouterResponse.ok) {
      const data = await openRouterResponse.json();
      try {
        const content = JSON.parse(data.choices[0].message.content);
        return res.status(200).json(content);
      } catch (e) {
        console.log('OpenRouter response parse error:', e);
      }
    } else {
      console.log('OpenRouter API failed:', await openRouterResponse.text());
    }

    // 2. Enhanced Fallback
    const fallbackTags = {
      politics: {
        youtube: {
          tags: "delhi government, pollution policy, akash banerjee, environmental issues, indian politics",
          hashtags: "#DelhiPollution #GovtPolicy #AkashBanerjee"
        }
      },
      default: {
        youtube: {
          tags: "video,content,creator",
          hashtags: "#video #content #creator"
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
