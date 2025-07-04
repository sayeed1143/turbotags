// api/generate-tags.js
export default async (req, res) => {
  try {
    return res.status(200).json({
      tags: "video,content,creator",
      hashtags: "#video #content"
    });
  } catch (error) {
    return res.status(500).json({ error: "Test error" });
  }
}
