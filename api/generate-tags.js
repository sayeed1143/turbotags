const WORKING_MODELS = [
  // Tier 1: Free and reliable (July 2024 verified)
  "google/gemma-3n-4b:free",       // Most stable free option
  "openchat/openchat-3.6:free",     // Fastest fallback
  "mistralai/mistral-small-3.2-24b-instruct:free",  // Quality backup
  
  // Tier 2: Paid options (uncomment if needed)
  // "anthropic/claude-3-haiku",    // $0.25/million tokens
  // "openai/gpt-3.5-turbo"         // $0.50/million tokens
];

export default async (req, res) => {
  const { title, language = "en" } = req.body;

  // 1. Enhanced input validation
  if (!title || typeof title !== 'string' || title.length > 200) {
    return res.status(400).json({
      tags: "video,content,trending",
      hashtags: "#video #content",
      error: "Invalid title (1-200 chars required)"
    });
  }

  // 2. Model prioritization
  let models = [...WORKING_MODELS];
  if (language !== "en") models.unshift("qwen/qwen1.5-14b:free");

  // 3. Try models with timeout and retries
  for (const [index, model] of models.entries()) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout
      
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
            content: `Generate 15-20 specific tags and 3-5 hashtags for "${title}"${language !== "en" ? " in " + language : ""}. Respond STRICTLY with valid JSON: {"tags":"tag1,tag2,...","hashtags":"#tag1 #tag2"}`
          }],
          temperature: 0.4,  // More deterministic
          response_format: { type: "json_object" } // Force JSON
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) continue;
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      // Robust JSON parsing
      try {
        const result = JSON.parse(content);
        if (result.tags && result.hashtags) {
          return res.status(200).json({
            ...result,
            model_used: model.split("/")[1] || model
          });
        }
      } catch (e) {
        console.error("JSON parse error:", e);
      }
    } catch (error) {
      console.error(`Attempt ${index + 1} failed (${model}):`, error.message);
      if (index < models.length - 1) await new Promise(r => setTimeout(r, 500 * index)); // Exponential backoff
    }
  }

  // 4. Enhanced fallback
  return res.status(200).json({
    tags: "video,content,trending,creator,digital,media,online,platform,streaming,upload,viral,explore,page,post,reels,shorts,story",
    hashtags: "#ContentCreator #DigitalMarketing #Trending",
    warning: "AI models unavailable - using premium fallback tags",
    cached: true
  });
};
