const WORKING_MODELS = [
    "google/gemma-3n-4b:free",
    "openchat/openchat-3.6:free",
    "mistralai/mistral-small-3.2-24b-instruct:free",
];

const NICHE_PROMPTS = {
    gaming: "Generate 15-20 specific gaming tags and 15-20 hashtags for",
    tech: "Generate 15-20 specific tech/electronics tags and 15-20 hashtags for",
    fitness: "Generate 15-20 specific fitness/workout tags and 15-20 hashtags for",
    beauty: "Generate 15-20 specific beauty/makeup tags and 15-20 hashtags for",
    cooking: "Generate 15-20 specific cooking/food tags and 15-20 hashtags for",
    travel: "Generate 15-20 specific travel/destination tags and 15-20 hashtags for",
    education: "Generate 15-20 specific education/learning tags and 15-20 hashtags for",
    vlog: "Generate 15-20 specific vlog/lifestyle tags and 15-20 hashtags for"
};

export default async (req, res) => {
    const { title, niche, platform, language = "en" } = req.body;

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

    // 3. Platform-specific generation
    const isYouTube = platform === 'youtube';
    const tagCount = isYouTube ? "15-20" : "0";
    const hashtagCount = "15-20";
    
    const nichePrompt = NICHE_PROMPTS[niche] || "Generate 15-20 specific tags and 15-20 hashtags for";

    // 4. Try models sequentially
    for (const [index, model] of models.entries()) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 4000);
            
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
                        content: `${nichePrompt} "${title}" (platform: ${platform})${language !== "en" ? " in " + language : ""}. ` +
                                 `Generate ${tagCount} tags and ${hashtagCount} hashtags. ` +
                                 `Respond STRICTLY with JSON: {"tags":"tag1,tag2,...","hashtags":"#tag1 #tag2"}`
                    }],
                    temperature: 0.4,
                    response_format: { type: "json_object" }
                }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) continue;
            
            const data = await response.json();
            const content = data.choices[0]?.message?.content;
            
            try {
                const result = JSON.parse(content);
                if (result.tags && result.hashtags) {
                    // Platform-specific formatting
                    if (!isYouTube) {
                        result.tags = ""; // Clear tags for non-YouTube platforms
                    }
                    return res.status(200).json(result);
                }
            } catch (e) {
                console.error("JSON parse error:", e);
            }
        } catch (error) {
            console.error(`Attempt ${index + 1} failed (${model}):`, error.message);
            if (index < models.length - 1) await new Promise(r => setTimeout(r, 500 * index));
        }
    }

    // 5. Enhanced fallback
    const fallbackTags = getFallbackTags(title, niche, platform);
    return res.status(200).json(fallbackTags);
};

function getFallbackTags(title, niche, platform) {
    const words = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const nicheTags = getNicheTags(niche);
    const platformTags = getPlatformTags(platform);
    
    const allTags = [...new Set([...words, ...nicheTags, ...platformTags])];
    const hashtags = allTags.map(tag => `#${tag.replace(/\s+/g, '')}`);

    return {
        tags: platform === 'youtube' ? allTags.slice(0, 20).join(', ') : "",
        hashtags: hashtags.slice(0, 20).join(' ')
    };
}

function getNicheTags(niche) {
    const tags = {
        gaming: ['gaming', 'gameplay', 'walkthrough', 'letsplay', 'pcgaming'],
        tech: ['technology', 'tech', 'gadget', 'review', 'unboxing'],
        fitness: ['fitness', 'workout', 'gym', 'exercise', 'training'],
        beauty: ['beauty', 'makeup', 'skincare', 'cosmetics', 'hairstyle'],
        cooking: ['cooking', 'food', 'recipe', 'meal', 'chef'],
        travel: ['travel', 'vacation', 'destination', 'tourism', 'adventure'],
        education: ['education', 'learn', 'tutorial', 'howto', 'study'],
        vlog: ['vlog', 'lifestyle', 'dayinlife', 'routine', 'daily']
    };
    return niche ? tags[niche] || [] : [];
}

function getPlatformTags(platform) {
    return {
        youtube: ['youtube', 'video', 'subscribe', 'youtuber', 'content'],
        instagram: ['instagram', 'insta', 'photo', 'reel', 'story'],
        tiktok: ['tiktok', 'fyp', 'viral', 'trending', 'foryou']
    }[platform];
}
