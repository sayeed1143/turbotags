export default async (req, res) => {
  console.log("Incoming request:", JSON.stringify(req.body));
  
  try {
    // 1. Validate input
    if (!req.body?.title) {
      throw new Error("Missing title");
    }

    // 2. Call OpenRouter
    console.log("Calling OpenRouter API...");
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
          content: `Generate 8 specific tags and 3 hashtags for: "${req.body.title}". Respond ONLY with JSON: {"tags":"tag1,tag2", "hashtags":"#tag1 #tag2"}`
        }]
      })
    });

    console.log("API Status:", response.status);
    const data = await response.json();
    console.log("API Response:", JSON.stringify(data, null, 2));

    // 3. Parse AI response
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{.*\}/s);
    if (!jsonMatch) throw new Error("Invalid AI response format");
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (error) {
    console.error("FULL ERROR:", error);
    return res.status(200).json({
      tags: "video,content",
      hashtags: "#video #content",
      error: "API failed - using fallback"
    });
  }
}
