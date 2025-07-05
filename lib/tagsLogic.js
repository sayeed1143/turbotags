import axios from 'axios';
import cheerio from 'cheerio';

// Free API to consider:
// - YouTube IFrame API (no key needed for basic info)
// - RapidAPI's free tier for YouTube related APIs
// - Custom scraping (shown below)

export async function generateTags(input) {
  // Check if input is URL
  if (input.includes('youtube.com') || input.includes('youtu.be')) {
    return generateTagsFromVideo(input);
  } else {
    return generateTagsFromKeywords(input);
  }
}

async function generateTagsFromVideo(videoUrl) {
  try {
    // Fetch video page
    const response = await axios.get(videoUrl);
    const $ = cheerio.load(response.data);
    
    // Extract keywords from meta tags
    const keywordsMeta = $('meta[name="keywords"]').attr('content');
    const keywords = keywordsMeta ? keywordsMeta.split(',') : [];
    
    // Extract title words
    const title = $('title').text();
    const titleKeywords = title.split(/[\s,]+/).filter(word => word.length > 3);
    
    // Combine and deduplicate
    return [...new Set([...keywords, ...titleKeywords])].slice(0, 30);
  } catch (error) {
    console.error('Error scraping video:', error);
    return generateTagsFromKeywords(videoUrl); // Fallback
  }
}

async function generateTagsFromKeywords(keywords) {
  // Simple keyword expansion - you can enhance this
  const words = keywords.split(/[\s,]+/).filter(word => word.length > 0);
  const variations = words.flatMap(word => [
    word,
    `${word}s`,
    `${word}ing`,
    `best ${word}`,
    `how to ${word}`
  ]);
  
  return variations.slice(0, 30);
}

export async function generateHashtags(input) {
  const tags = await generateTags(input);
  return tags.map(tag => {
    // Convert to hashtag format
    const formatted = tag
      .replace(/\s+/g, '') // Remove spaces
      .replace(/[^a-zA-Z0-9]/g, ''); // Remove special chars
    return `#${formatted}`;
  }).slice(0, 15);
}
