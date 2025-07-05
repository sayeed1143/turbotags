import { generateTags, generateHashtags } from '../../lib/tagsLogic';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { input } = req.body;
    
    // Generate tags (basic example - expand with your logic)
    const tags = await generateTags(input);
    
    // Generate hashtags
    const hashtags = await generateHashtags(input);
    
    res.status(200).json({ 
      tags: [...tags, ...hashtags], 
      hashtags 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error generating tags' });
  }
}
