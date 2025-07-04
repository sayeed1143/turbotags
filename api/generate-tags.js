// api/generate-tags.js
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const fallbackTags = {
  youtube: {
    tags: "video,content,creator",
    hashtags: "#video #content"
  }
};

export default async (req, res) => {
  try {
    // 1. Try OpenRouter
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
          content: `Generate tags for ${req.body.platform} video: "${req.body.title}"`
        }]
      })
    });

    // 2. Process response
    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({
        tags: data.choices[0].message.content,
        hashtags: `#${req.body.platform}`
      });
    }

    // 3. Fallback
    return res.status(200).json(fallbackTags[req.body.platform || "youtube"]);

  } catch (error) {
    console.error(error);
    return res.status(200).json(fallbackTags.youtube); // Final fallback
  }
}
