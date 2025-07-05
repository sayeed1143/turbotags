const PRIORITIZED_MODELS = [
  "deepseek/deepseek-chat-v3-0324:free",  // 685B MoE - Best quality (free)
  "deepseek-chat",                        // Fallback 1
  "openchat",                             // Fallback 2 (fastest)
  "qwen/qwen1.5-14b"                      // Fallback 3 (multilingual)
];

export default async (req, res) => {
  const { title, language = "en" } = req.body;
  
  // 1. Validate input
  if (!title) return res.status(400).json({ 
    tags: "video,content,trending",
    hashtags: "#video #content",
    error: "Title required" 
  });

  // 2. Dynamic model selection
  let models = [...PRIORITIZED_MODELS];
  if (language !== "en") models.unshift("qwen/qwen1.5-14b"); // Prioritize Qwen for non-English

  // 3. Try models sequentially
  for (const model of models) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://turbotags.vercel.app",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [{
            role: "user",
            content: `Generate 8 specific tags and 3 hashtags for "${title}"${language !== "en" ? " in " + language : ""}. Respond ONLY with JSON: {"tags":"tag1,tag2", "hashtags":"#tag1 #tag2"}`
          }],
          temperature: 0.7 // Balances creativity/relevance
        })
      });

      if (!response.ok) continue;
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      const jsonMatch = content.match(/\{.*\}/s);
      
      if (jsonMatch) return res.status(200).json(JSON.parse(jsonMatch[0]));
    } catch (error) {
      console.error(`Model ${model} failed:`, error.message);
    }
  }

  // 4. Final fallback
  return res.status(200).json({
    tags: "video,content,trending,creator",
    hashtags: "#viral #trending #content",
    warning: "All models unavailable - using fallback"
  });
}
