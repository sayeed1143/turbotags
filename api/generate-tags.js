export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  try {
    // 1. Try OpenRouter API first
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-pro', // Free tier available
        messages: [{
          role: 'user',
          content: `Generate tags and hashtags for a ${req.body.platform} video titled "${req.body.title}" (Niche: ${req.body.niche || 'general'}). 
                    Respond in JSON format: { "tags": "comma,separated,tags", "hashtags": "#space #separated #hashtags" }`
        }]
      })
    });

    if (openRouterResponse.ok) {
      const data = await openRouterResponse.json();
      try {
        // Parse the JSON response from OpenRouter
        const content = JSON.parse(data.choices[0].message.content);
        return res.status(200).json(content);
      } catch (e) {
        console.error('Failed to parse OpenRouter response:', e);
        // Continue to fallback
      }
    }

    // 2. Fallback to local JSON if OpenRouter fails
    const fallbackTags = {
      gaming: {
        youtube: {
          tags: 'gaming,gameplay,walkthrough,esports',
          hashtags: '#gaming #gamers #videogames'
        },
        // Add more niches/platforms as needed
      },
      tech: {
        youtube: {
          tags: 'tech,technology,gadget,review',
          hashtags: '#tech #technology #gadget'
        }
      },
      // Default fallback
      default: {
        youtube: {
          tags: 'video,content,creator',
          hashtags: '#video #content #creator'
        },
        instagram: {
          tags: 'photo,instagram,social',
          hashtags: '#photo #insta #social'
        },
        tiktok: {
          tags: 'tiktok,viral,trending',
          hashtags: '#tiktok #viral #fyp'
        }
      }
    };

    const tags = fallbackTags[req.body.niche]?.[req.body.platform] 
               || fallbackTags.default[req.body.platform];
    
    return res.status(200).json(tags);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate tags',
      details: error.message 
    });
  }
}
