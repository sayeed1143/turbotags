import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { title, description, niche, platform } = req.body;

    if (!title || !description || !niche || !platform) {
        return res.status(400).json({ error: 'Missing required parameters (title, description, niche, platform)' });
    }

    // --- Common prompt for both Gemini and OpenRouter ---
    const prompt = `Generate 5-10 YouTube tags and 3-5 relevant hashtags for a ${platform} video.
    Details:
    Title: "${title}"
    Description: "${description}"
    Niche: "${niche}"
    Platform: "${platform}"

    Provide the output strictly as a JSON object with two keys: "tags" (a single comma-separated string) and "hashtags" (a single space-separated string, each starting with #). Do NOT include any other text, markdown, or formatting outside the JSON object.
    Example: {"tags": "gaming highlights, esports, twitch moments, best plays", "hashtags": "#gaming #esports #twitch #highlights"}`;

    let jsonResponse;
    let usedProvider = "Gemini";

    try {
        // --- Attempt with Gemini (Primary) ---
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            throw new Error("GEMINI_API_KEY is not set. Skipping Gemini.");
        }
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using the more stable model

        console.log("Attempting with Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        let jsonString = text.trim();
        // Robust JSON extraction for Gemini
        if (jsonString.startsWith('```json')) {
            jsonString = jsonString.substring(7);
            if (jsonString.endsWith('```')) jsonString = jsonString.substring(0, jsonString.length - 3);
        } else if (jsonString.startsWith('```')) {
            jsonString = jsonString.substring(3);
            if (jsonString.endsWith('```')) jsonString = jsonString.substring(0, jsonString.length - 3);
        }
        if (!jsonString.startsWith('{') || !jsonString.endsWith('}')) {
            const startIdx = jsonString.indexOf('{');
            const endIdx = jsonString.lastIndexOf('}');
            if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                jsonString = jsonString.substring(startIdx, endIdx + 1);
            } else {
                throw new Error("Gemini response did not contain a valid JSON object after initial cleanup: " + text);
            }
        }
        jsonResponse = JSON.parse(jsonString);

    } catch (geminiError) {
        console.error('Gemini error:', geminiError.message || geminiError);
        usedProvider = "OpenRouter";

        // --- Fallback to OpenRouter ---
        console.log("Falling back to OpenRouter...");
        const openRouterApiKey = process.env.OPENROUTER_API_KEY;
        if (!openRouterApiKey) {
            throw new Error("OPENROUTER_API_KEY is not set. Cannot use OpenRouter fallback.");
        }

        try {
            const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openRouterApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "model": "google/gemini-pro", // OpenRouter's specific model ID for Gemini Pro
                    "messages": [
                        { "role": "user", "content": prompt }
                    ],
                }),
            });

            if (!openRouterResponse.ok) {
                const errorData = await openRouterResponse.json();
                throw new Error(`OpenRouter API error: ${openRouterResponse.status} ${openRouterResponse.statusText} - ${JSON.stringify(errorData)}`);
            }

            const data = await openRouterResponse.json();
            const openRouterText = data.choices[0].message.content;

            // OpenRouter often returns clean JSON, but keep robust parsing just in case
            let jsonString = openRouterText.trim();
            if (jsonString.startsWith('```json')) {
                jsonString = jsonString.substring(7);
                if (jsonString.endsWith('```')) jsonString = jsonString.substring(0, jsonString.length - 3);
            } else if (jsonString.startsWith('```')) {
                jsonString = jsonString.substring(3);
                if (jsonString.endsWith('```')) jsonString = jsonString.substring(0, jsonString.length - 3);
            }
             if (!jsonString.startsWith('{') || !jsonString.endsWith('}')) {
                const startIdx = jsonString.indexOf('{');
                const endIdx = jsonString.lastIndexOf('}');
                if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                    jsonString = jsonString.substring(startIdx, endIdx + 1);
                } else {
                    throw new Error("OpenRouter response did not contain a valid JSON object after initial cleanup: " + openRouterText);
                }
            }
            jsonResponse = JSON.parse(jsonString);

        } catch (openRouterError) {
            console.error('OpenRouter fallback error:', openRouterError.message || openRouterError);
            return res.status(500).json({
                error: `Failed to generate tags using both Gemini and OpenRouter. Check Vercel logs for details.`,
                geminiDetails: geminiError.message || String(geminiError),
                openRouterDetails: openRouterError.message || String(openRouterError)
            });
        }
    }

    // Basic validation of the parsed JSON structure from either provider
    if (typeof jsonResponse.tags !== 'string' || typeof jsonResponse.hashtags !== 'string') {
        return res.status(500).json({
            error: `AI provider (${usedProvider}) returned JSON with incorrect structure.`,
            details: JSON.stringify(jsonResponse)
        });
    }

    res.status(200).json(jsonResponse);
}
