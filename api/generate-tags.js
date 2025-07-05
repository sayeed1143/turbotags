const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

export default async (req, res) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-pro",
        messages: [{
          role: "user",
          content: `Generate 10 tags and 5 hashtags for this video: "${req.body.title}"`
        }]
      })
    });

    const data = await response.json();
    return res.status(200).json({
      tags: data.choices[0].message.content,
      hashtags: "#GeneratedFromAI"
    });
  } catch (error) {
    // Fallback for Telugu shows
    return res.status(200).json({
      tags: "jabardasth, etv telugu, rashmi, maanas, comedy",
      hashtags: "#Jabardasth #ETVTelugu"
    });
  }
}
