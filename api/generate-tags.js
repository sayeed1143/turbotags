import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { title, description, niche, platform } = req.body;
    
    // Validate required fields explicitly as early as possible
    if (!title || !description || !niche || !platform) {
        return res.status(400).json({ error: 'Missing required parameters (title, description, niche, platform)' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        
        const prompt = `Generate 5-10 YouTube tags and 3-5 relevant hashtags for a ${platform} video.
        Details:
        Title: "${title}"
        Description: "${description}"
        Niche: "${niche}"
        Platform: "${platform}"
        
        Provide the output strictly as a JSON object with two keys: "tags" (a single comma-separated string) and "hashtags" (a single space-separated string, each starting with #). Do NOT include any other text, markdown, or formatting outside the JSON object.
        Example: {"tags": "gaming highlights, esports, twitch moments, best plays", "hashtags": "#gaming #esports #twitch #highlights"}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // --- More robust JSON extraction ---
        let jsonString = text.trim(); // Trim whitespace
        
        // Remove markdown code block if present (e.g., ```json ... ```)
        if (jsonString.startsWith('```json')) {
            jsonString = jsonString.substring(7); // Remove '```json'
            if (jsonString.endsWith('```')) {
                jsonString = jsonString.substring(0, jsonString.length - 3); // Remove trailing '```'
            }
        } else if (jsonString.startsWith('```')) { // Handle generic code block
            jsonString = jsonString.substring(3); // Remove '```'
            if (jsonString.endsWith('```')) {
                jsonString = jsonString.substring(0, jsonString.length - 3); // Remove trailing '```'
            }
        }
        
        // Ensure it starts and ends with a curly brace, if not, try to find the first/last
        // This is a last resort and still not perfect, as Gemini might not output a perfect JSON string
        if (!jsonString.startsWith('{') || !jsonString.endsWith('}')) {
             const startIdx = jsonString.indexOf('{');
             const endIdx = jsonString.lastIndexOf('}');
             if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                 jsonString = jsonString.substring(startIdx, endIdx + 1);
             } else {
                 // If we still can't find a valid JSON structure, throw an error
                 throw new Error("Gemini response did not contain a valid JSON object: " + text);
             }
        }

        const jsonResponse = JSON.parse(jsonString);

        // Basic validation of the parsed JSON structure
        if (typeof jsonResponse.tags !== 'string' || typeof jsonResponse.hashtags !== 'string') {
            throw new Error("Gemini response JSON had incorrect structure: " + JSON.stringify(jsonResponse));
        }

        res.status(200).json(jsonResponse);

    } catch (error) {
        console.error('Error in generate-tags.js:', error.message || error);
        // Provide more detail in the error response for debugging
        res.status(500).json({ 
            error: 'Failed to generate tags. Check Vercel logs for details.', 
            details: error.message 
        });
    }
}
