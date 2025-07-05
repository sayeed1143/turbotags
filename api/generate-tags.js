const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

export default async (req, res) => {
  const teluguFallback = {
    tags: "jabardasth,etv telugu,rashmi,maanas,krishna bhagvaan,kushboo",
    hashtags: "#Jabardasth #ETVTelugu #TeluguComedy"
  };

  console.log("Received title:", req.body.title); // Debug log

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
          content: `Generate EXACTLY 8 tags and 3 hashtags for this Telugu TV show: "${req.body.title}". 
                    Return as JSON: {"tags":"tag1,tag2,tag3", "hashtags":"#tag1 #tag2 #tag3"}`
        }]
      })
    });

    console.log("OpenRouter status:", response.status); // Debug log

    if (!response.ok) throw new Error("API failed");
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}') + 1;
    const generatedTags = JSON.parse(content.slice(jsonStart, jsonEnd));
    
    return res.status(200).json(generatedTags);

  } catch (error) {
    console.error("AI Failed - Using Fallback:", error);
    return res.status(200).json(teluguFallback);
  }
}
