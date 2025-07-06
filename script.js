const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const keywordInput = document.getElementById('keywordInput');
const nicheResult = document.getElementById('nicheResult');
const nicheSection = document.getElementById('nicheSection');
const tagsOutput = document.getElementById('tagsOutput');
const hashtagsOutput = document.getElementById('hashtagsOutput');

const niches = {
  travel: ["travel", "trip", "vacation", "tourism", "adventure", "explore", "destination", "journey", "guide", "holiday", "wanderlust", "travelvlog", "traveldiaries", "roadtrip", "getaway", "nature", "beach", "mountains", "backpacking", "itinerary", "scenery", "budgettravel", "travelgram"],
  tech: ["technology", "gadgets", "reviews", "smartphones", "apps", "howto", "technews", "innovation", "unboxing", "futuretech", "AI", "robotics", "wearables", "computing", "coding", "cybersecurity", "electronics", "5G", "cloud", "hardware", "software", "tutorials", "techworld"],
  fitness: ["fitness", "workout", "health", "gym", "exercise", "training", "fitlife", "yoga", "strength", "cardio", "motivation", "wellness", "fitfam", "running", "crossfit", "nutrition", "diet", "homeworkout", "bodybuilding", "HIIT", "weightloss", "active", "sports"],
  food: ["cooking", "recipes", "food", "kitchen", "baking", "meals", "homemade", "foodie", "dinner", "brunch", "desserts", "snacks", "easyrecipes", "tasty", "delicious", "vegan", "vegetarian", "healthyfood", "quickmeals", "comfortfood", "grilling", "mealprep", "sweets"],
  gaming: ["gaming", "gameplay", "walkthrough", "esports", "streaming", "reviews", "letsplay", "videogames", "gamers", "twitch", "competitive", "rpg", "fps", "openworld", "strategy", "adventure", "sandbox", "multiplayer", "gamerlife", "onlinegaming", "arcade", "console", "pcgaming"]
};

function generateTags() {
  const keyword = keywordInput.value.toLowerCase().trim();
  if (!keyword) return;

  let matchedNiche = Object.keys(niches).find(niche => keyword.includes(niche)) || "general";
  let tags = niches[matchedNiche] || ["youtube", "viral", "trending", "shorts", "content", "growth", "media", "social", "video", "engagement", "branding", "success", "creator", "platform", "likes", "views", "reach", "organic", "popular", "subscriber", "algorithm", "tips", "strategy"];

  nicheSection.classList.remove('hidden');
  nicheResult.textContent = matchedNiche.charAt(0).toUpperCase() + matchedNiche.slice(1);

  let selectedTags = tags.slice(0, 25).join(", ");
  let selectedHashtags = tags.slice(0, 20).map(tag => `#${tag}`).join(' ');

  tagsOutput.value = selectedTags;
  hashtagsOutput.value = selectedHashtags;
}

function copyText(id) {
  const el = document.getElementById(id);
  el.select();
  document.execCommand('copy');
}

function clearAll() {
  keywordInput.value = '';
  tagsOutput.value = '';
  hashtagsOutput.value = '';
  nicheSection.classList.add('hidden');
}

generateBtn.addEventListener('click', generateTags);
clearBtn.addEventListener('click', clearAll);
