// Use dynamic import for Node.js compatibility
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

export default async function handler(req, res) {
  // Required CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  try {
    console.log('Request Body:', JSON.stringify(req.body)); // Debug input

    // 1. Validate request
    if (!req.body.title || !req.body.platform) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 2. Try OpenRouter API
    const prompt = `Generate 10 tags and 5 hashtags for a ${req.body.platform} video about "${req.body.title}" (Niche: ${req.body.niche || 'general'}). Return as JSON: {"tags":"comma,separated,tags", "hashtags":"#space #separated #hashtags"}`;

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
          content: prompt
        }]
      })
    });

    console.log('OpenRouter Status:', openRouterResponse.status); // Debug status

    if (openRouterResponse.ok) {
      const data = await openRouterResponse.json();
      const generatedContent = data.choices[0].message.content;
      
      try {
        // Extract JSON from response
        const jsonStart = generatedContent.indexOf('{');
        const jsonEnd = generatedContent.lastIndexOf('}') + 1;
        const jsonResponse = JSON.parse(generatedContent.substring(jsonStart, jsonEnd));
        
        return res.status(200).json(jsonResponse);
      } catch (e) {
        console.error('JSON Parse Error:', e);
        // Continue to fallback
      }
    }

    // 3. Enhanced Fallback
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
      error: "Internal Server Error",
      details: error.message 
    });
  }
}
