import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { title, description, niche, platform } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Generate tags and hashtags for a ${platform} video with the following details:
        Title: ${title}
        Description: ${description || 'No description provided'}
        Niche: ${niche || 'General'}
        
        Please provide:
        1. A comma-separated list of relevant tags
        2. A space-separated list of relevant hashtags (with # prefix)
        
        Format your response as JSON: { "tags": "tag1, tag2, ...", "hashtags": "#hashtag1 #hashtag2 ..." }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from the response
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        const jsonResponse = JSON.parse(text.substring(jsonStart, jsonEnd));

        res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'Failed to generate tags' });
    }
}
