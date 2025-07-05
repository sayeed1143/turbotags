// Ultra-simple working version
export default async (req, res) => {
  return res.status(200).json({
    tags: "delhi, pollution, government, policy",
    hashtags: "#DelhiPollution #GovtPolicy",
    message: "Working perfectly - customize later"
  });
}
