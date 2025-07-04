const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

export default async (req, res) => {
  try {
    console.log("Incoming request:", JSON.stringify(req.body));
    
    // Debug env var
    console.log("OpenRouter key exists:", !!process.env.OPENROUTER_API_KEY);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://turbotags.vercel.app",
        "Content-Type": "application/json",
        "X-Title": "TuroTags Generator"
      },
      body: JSON.stringify({
        model: "google/gemini-pro",
        messages: [{
          role: "user",
          content: `Generate YouTube tags for: ${req.body.title || "Test"}`
        }]
      })
    });

    console.log("OpenRouter status:", response.status);
    const data = await response.json();
    console.log("OpenRouter response:", JSON.stringify(data, null, 2));
    
    return res.status(200).json({
      tags: data.choices[0].message.content,
      hashtags: "#generated"
    });

  } catch (error) {
    console.error("Full error:", error);
    return res.status(200).json({
      tags: "video,content,creator",
      hashtags: "#video #content",
      warning: "Using fallback"
    });
  }
}
