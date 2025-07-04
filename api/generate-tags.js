export default async function handler(req, res) {
  // 1. Try OpenRouter first
  const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemini-pro", // Free tier available
      messages: [{
        role: "user",
        content: `Generate tags and hashtags for a ${req.body.platform} video titled "${req.body.title}" (Niche: ${req.body.niche}). Respond in JSON format: { "tags": "comma,separated,tags", "hashtags": "#space #separated #hashtags" }`
      }]
    })
  });

  if (openRouterResponse.ok) {
    const data = await openRouterResponse.json();
    return res.status(200).json(JSON.parse(data.choices[0].message.content));
  }

  // 2. Fallback to local JSON
  const fallbackTags = require("./fallback-tags.json");
  return res.status(200).json(fallbackTags);
}
