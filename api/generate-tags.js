const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

export default async (req, res) => {
  try {
    console.log("Attempting OpenRouter call..."); // Debug log
    
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
          content: `Generate tags for YouTube video: "${req.body.title || 'Test'}"`
        }]
      })
    });

    const data = await response.json();
    return res.status(200).json({
      tags: data.choices[0].message.content,
      hashtags: "#generated"
    });
    
  } catch (error) {
    console.error("API Error:", error);
    return res.status(200).json({ // Fallback
      tags: "video,content,creator", 
      hashtags: "#video #content"
    });
  }
}
