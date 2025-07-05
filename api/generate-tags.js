import fetch from 'node-fetch';
import fallbackTags from './fallback-tags.json' assert { type: 'json' };

const WORKING_MODELS = [
  "google/gemma-3n-4b:free",
  "openchat/openchat-3.6:free",
  "mistralai/mistral-small-3.2-24b-instruct:free"
];

export default async (req, res) => {
  try {
    const { title, niche, platform = "youtube" } = req.body;

    // Validate input
    if (!title?.trim() || typeof title !== 'string' || title.length > 200) {
      return sendFallback(res, platform, niche, "Invalid title (1-200 chars required)");
    }

    // Generate based on platform
    let result;
    switch (platform) {
      case "youtube":
        result = await handleYouTube(title, niche);
        break;
      case "instagram":
        result = await handleInstagram(title, niche);
        break;
      case "tiktok":
        result = await handleTikTok(title, niche);
        break;
      default:
        return sendFallback(res, "youtube", niche, "Invalid platform");
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("Server error:", error);
    return sendFallback(res, req.body?.platform || "youtube", req.body?.niche, "System error");
  }
};

// Platform Handlers
async function handleYouTube(title, niche) {
  // Try AI first
  const aiResult = await tryAIModels(
    title, 
    niche, 
    "youtube", 
    `Generate 15-20 tags (comma-separated) and 10-15 hashtags (space-separated) for YouTube`
  );

  if (aiResult.success) {
    return {
      tags: validateTagCount(aiResult.tags.split(','),
      hashtags: validateTagCount(aiResult.hashtags.split(' '), 10, 15),
      model: aiResult.model
    };
  }

  // Fallback
  const fallback = fallbackTags.platforms.youtube[niche] || fallbackTags.platforms.youtube.tech;
  return {
    tags: selectTags(fallback.tags, 15, 20),
    hashtags: selectTags(fallback.hashtags, 10, 15),
    warning: "Used fallback tags"
  };
}

async function handleInstagram(title, niche) {
  // Try AI first
  const aiResult = await tryAIModels(
    title,
    niche,
    "instagram",
    `Generate 15-20 Instagram hashtags (space-separated)`
  );

  if (aiResult.success) {
    return {
      tags: "",
      hashtags: validateTagCount(aiResult.hashtags.split(' ')),
      model: aiResult.model
    };
  }

  // Fallback
  const fallback = fallbackTags.platforms.instagram[niche] || fallbackTags.platforms.instagram.tech;
  return {
    tags: "",
    hashtags: selectTags(fallback.hashtags, 15, 20),
    warning: "Used fallback hashtags"
  };
}

async function handleTikTok(title, niche) {
  // Try AI first
  const aiResult = await tryAIModels(
    title,
    niche,
    "tiktok",
    `Generate 15-20 TikTok hashtags (space-separated)`
  );

  if (aiResult.success) {
    return {
      tags: "",
      hashtags: validateTagCount(aiResult.hashtags.split(' ')),
      model: aiResult.model
    };
  }

  // Fallback
  const fallback = fallbackTags.platforms.tiktok[niche] || fallbackTags.platforms.tiktok.tech;
  return {
    tags: "",
    hashtags: selectTags(fallback.hashtags, 15, 20),
    warning: "Used fallback hashtags"
  };
}

// Helper Functions
async function tryAIModels(title, niche, platform, promptAddition) {
  const fullPrompt = `For "${title}" (${niche} content on ${platform}), ${promptAddition}. Respond ONLY with JSON: {"tags":"tag1,tag2,...","hashtags":"#tag1 #tag2"}`;

  for (const [index, model] of WORKING_MODELS.entries()) {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://turbotags.vercel.app",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: fullPrompt }],
          temperature: 0.4,
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });

      if (response.ok) {
        const data = await response.json();
        const result = JSON.parse(data.choices[0]?.message?.content || "{}");
        if (result.tags && result.hashtags) {
          return { success: true, ...result, model: model.split("/")[1] || model };
        }
      }
    } catch (error) {
      console.error(`Model ${model} failed:`, error.message);
      if (index < WORKING_MODELS.length - 1) await new Promise(r => setTimeout(r, 800 * (index + 1)));
    }
  }
  return { success: false };
}

function selectTags(tags, min, max) {
  const count = Math.min(tags.length, Math.floor(Math.random() * (max - min + 1)) + min);
  return [...tags]
    .sort(() => 0.5 - Math.random())
    .slice(0, count)
    .join(tags[0]?.startsWith("#") ? " " : ", ");
}

function validateTagCount(tags, min = 15, max = 20) {
  const validTags = tags.filter(t => t.trim());
  const count = Math.min(validTags.length, Math.floor(Math.random() * (max - min + 1)) + min);
  return validTags.slice(0, count).join(tags[0]?.startsWith("#") ? " " : ", ");
}

function sendFallback(res, platform, niche, error) {
  const response = {
    error,
    warning: "Using fallback tags"
  };

  if (platform === "youtube") {
    const fallback = fallbackTags.platforms.youtube[niche] || fallbackTags.platforms.youtube.tech;
    response.tags = selectTags(fallback.tags, 15, 20);
    response.hashtags = selectTags(fallback.hashtags, 10, 15);
  } else {
    const platformKey = platform === "instagram" ? "instagram" : "tiktok";
    const fallback = fallbackTags.platforms[platformKey][niche] || fallbackTags.platforms[platformKey].tech;
    response.tags = "";
    response.hashtags = selectTags(fallback.hashtags, 15, 20);
  }

  return res.status(400).json(response);
}
