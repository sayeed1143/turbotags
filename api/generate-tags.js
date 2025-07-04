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
        // Ensure this line is exactly as shown below:
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Generate 5-10 YouTube tags and 3-5 relevant hashtags for a ${platform} video.
        Details:
        Title: "${title}"
        Description: "${description}"
        Niche: "${niche}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Basic parsing (can be made more robust)
        const tagsMatch = text.match(/Tags:\s*([\s\S]*?)(?=(Hashtags:|$))/i);
        const hashtagsMatch = text.match(/Hashtags:\s*([\s\S]*)/i);

        let tags = [];
        let hashtags = [];

        if (tagsMatch && tagsMatch[1]) {
            tags = tagsMatch[1].split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }
        if (hashtagsMatch && hashtagsMatch[1]) {
            hashtags = hashtagsMatch[1].split(',').map(hashtag => hashtag.trim().replace(/^#/, '')).filter(hashtag => hashtag.length > 0);
        }

        return res.status(200).json({ tags, hashtags });

    } catch (error) {
        console.error('Error generating tags:', error);
        // Provide more detail in the error response for debugging
        return res.status(500).json({
            error: 'Failed to generate tags. Check Vercel logs for details.',
            details: error.toString() // Convert error object to string for display
        });
    }
}
