// generate-tags.js - Final Optimized Version
export default async (req, res) => {
  try {
    // 1. Try OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://turbotags.vercel.app",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-pro",
        messages: [{
          role: "user",
          content: `Generate tags for: "${req.body?.title || ''}"`
        }]
      })
    });

    // 2. Return AI-generated tags
    const { choices } = await response.json();
    return res.status(200).json({
      tags: choices[0].message.content,
      hashtags: "#generated"
    });

  } catch (error) {
    // 3. Minimal fallback (no hardcoded tags)
    return res.status(200).json({
      tags: "video,content",
      hashtags: "#video #content"
    });
  }
}
