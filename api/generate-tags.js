// Basic working version - deploy this first
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

export default async function handler(req, res) {
  try {
    if (!req.body.platform) {
      return res.status(400).json({ error: "Missing platform parameter" });
    }

    const fallbackTags = {
      youtube: { tags: "video,content,creator", hashtags: "#video #content" }
    };

    return res.status(200).json(fallbackTags[req.body.platform]);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: "Internal Error" });
  }
}
